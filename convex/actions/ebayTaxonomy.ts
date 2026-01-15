"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";
import { getEbayAppAccessToken } from "../lib/ebayClient";

type CategoryNode = {
  category: { categoryId: string; categoryName: string };
  childCategoryTreeNodes?: CategoryNode[];
};

type FlattenedCategory = {
  categoryId: string;
  name: string;
  parentCategoryId?: string;
  level: number;
};

function flattenTree(
  node: CategoryNode,
  out: FlattenedCategory[],
  parentCategoryId: string | undefined,
  level: number,
  maxLevel: number,
) {
  if (level > maxLevel) return;
  out.push({
    categoryId: node.category.categoryId,
    name: node.category.categoryName,
    parentCategoryId,
    level,
  });
  if (level === maxLevel) return;
  for (const child of node.childCategoryTreeNodes ?? []) {
    flattenTree(child, out, node.category.categoryId, level + 1, maxLevel);
  }
}

export const refreshEbayCategories = action({
  args: {
    marketplaceId: v.optional(v.string()), // default "EBAY_US"
  },
  returns: v.object({
    marketplaceId: v.string(),
    categoryTreeId: v.string(),
    count: v.number(),
    fetchedAt: v.number(),
  }),
  handler: async (ctx, args) => {
    const marketplaceId = (args.marketplaceId ?? "EBAY_US").toUpperCase();

    // Use same public OAuth scope as Browse. If eBay requires an additional scope
    // for taxonomy, this call will return 403 and we can update scopes accordingly.
    const accessToken = await getEbayAppAccessToken();

    // 1) Get default category tree ID.
    const treeIdRes = await fetch(
      `https://api.ebay.com/commerce/taxonomy/v1/get_default_category_tree_id?marketplace_id=${encodeURIComponent(
        marketplaceId,
      )}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );
    if (!treeIdRes.ok) {
      const text = await treeIdRes.text().catch(() => "");
      throw new Error(`Taxonomy tree id failed (${treeIdRes.status}): ${text}`);
    }
    const treeIdJson = (await treeIdRes.json()) as { categoryTreeId?: string };
    const categoryTreeId = treeIdJson.categoryTreeId;
    if (!categoryTreeId) throw new Error("Taxonomy returned no categoryTreeId");

    // 2) Fetch full category tree (root + descendants).
    const treeRes = await fetch(
      `https://api.ebay.com/commerce/taxonomy/v1/category_tree/${encodeURIComponent(categoryTreeId)}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );
    if (!treeRes.ok) {
      const text = await treeRes.text().catch(() => "");
      throw new Error(`Taxonomy category tree failed (${treeRes.status}): ${text}`);
    }
    const treeJson = (await treeRes.json()) as { rootCategoryNode?: CategoryNode };
    const root = treeJson.rootCategoryNode;
    if (!root) throw new Error("Taxonomy returned no rootCategoryNode");

    const flattened: FlattenedCategory[] = [];
    // Cache only top levels to stay within Convex argument limits.
    // Level 0 = root, Level 1 = top categories, Level 2 = common subcategories.
    flattenTree(root, flattened, undefined, 0, 2);

    // Safety cap: Convex mutation args max array length is 8192.
    if (flattened.length > 8000) {
      flattened.length = 8000;
    }

    const fetchedAt = Date.now();
    await ctx.runMutation(api.mutations.ebayTaxonomy.upsertTaxonomyCache, {
      marketplaceId,
      categoryTreeId,
      categories: flattened,
      fetchedAt,
    });

    return { marketplaceId, categoryTreeId, count: flattened.length, fetchedAt };
  },
});

