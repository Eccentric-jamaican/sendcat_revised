"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { ebayFetch, ebayFetchJson, getEbayAppAccessToken } from "../lib/ebayClient";

const EBAY_GUEST_ORDER_SCOPE = "https://api.ebay.com/oauth/api_scope/buy.guest.order";

export const createOrder = action({
  args: {
    marketplaceId: v.optional(v.string()), // default "EBAY_US"
    // Recommended by eBay for fraud prevention / payment attempt correlation.
    deviceId: v.optional(v.string()),
    contactEmail: v.string(),
    lineItems: v.array(
      v.object({
        itemId: v.string(), // RESTful item id, e.g. v1|123|0
        quantity: v.number(),
      }),
    ),
    shippingAddress: v.object({
      addressLine1: v.string(),
      addressLine2: v.optional(v.string()),
      city: v.string(),
      stateOrProvince: v.optional(v.string()),
      postalCode: v.optional(v.string()),
      country: v.string(), // ISO 2-letter
      phoneNumber: v.string(),
      recipient: v.object({
        firstName: v.string(),
        lastName: v.string(),
      }),
    }),
  },
  returns: v.object({
    checkoutSessionId: v.string(),
    // Used by the "Checkout with eBay" widget integration.
    securitySignature: v.optional(v.string()),
    // Minimal info helpful for UI previews/debugging.
    pricingSummary: v.optional(
      v.object({
        total: v.optional(v.object({ value: v.optional(v.string()), currency: v.optional(v.string()) })),
      }),
    ),
  }),
  handler: async (ctx, args) => {
    // Security: require SendCat auth for creating checkout sessions to reduce abuse.
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.subject) {
      throw new Error("Sign in required to start checkout");
    }

    const marketplaceId = (args.marketplaceId ?? "EBAY_US").toUpperCase();
    const accessToken = await getEbayAppAccessToken({ scope: EBAY_GUEST_ORDER_SCOPE });

    const payload = {
      contactEmail: args.contactEmail,
      lineItemInputs: args.lineItems.map((li) => ({
        itemId: li.itemId,
        quantity: Math.max(1, Math.floor(li.quantity)),
      })),
      shippingAddress: args.shippingAddress,
    };

    const headers: Record<string, string> = {};
    if (args.deviceId?.trim()) {
      // eBay expects `deviceId=<value>` in this header.
      headers["X-EBAY-C-ENDUSERCTX"] = `deviceId=${args.deviceId.trim()}`;
    }

    // initiateGuestCheckoutSession
    // POST https://apix.ebay.com/buy/order/v2/guest_checkout_session/initiate
    const res = await ebayFetch({
      baseUrl: "https://apix.ebay.com",
      path: "/buy/order/v2/guest_checkout_session/initiate",
      method: "POST",
      accessToken,
      marketplaceId,
      headers,
      body: payload,
      timeoutMs: 15_000,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`eBay initiate guest checkout failed (${res.status}): ${text}`);
    }

    const securitySignature = res.headers.get("X-EBAY-SECURITY-SIGNATURE") ?? undefined;
    const data = (await res.json()) as { checkoutSessionId?: string; pricingSummary?: unknown };
    const checkoutSessionId = data.checkoutSessionId;
    if (!checkoutSessionId) throw new Error("eBay returned no checkoutSessionId");

    // Return only minimal fields. The full response can contain shipping + pricing details.
    const pricingSummary = (data.pricingSummary as any) ?? undefined;
    const total = pricingSummary?.total;

    return {
      checkoutSessionId,
      securitySignature,
      pricingSummary:
        total && typeof total === "object"
          ? {
              total: {
                value: typeof total.value === "string" ? total.value : undefined,
                currency: typeof total.currency === "string" ? total.currency : undefined,
              },
            }
          : undefined,
    };
  },
});

export const fetchOrder = action({
  args: {
    purchaseOrderId: v.string(),
    marketplaceId: v.optional(v.string()), // should match session marketplace
    deviceId: v.optional(v.string()),
  },
  returns: v.object({
    purchaseOrderId: v.string(),
    purchaseOrderStatus: v.optional(v.string()),
    purchaseOrderPaymentStatus: v.optional(v.string()),
    total: v.optional(v.object({ value: v.optional(v.string()), currency: v.optional(v.string()) })),
    lineItems: v.optional(v.array(v.object({ itemId: v.optional(v.string()), title: v.optional(v.string()) }))),
  }),
  handler: async (ctx, args) => {
    // Security: order details can contain shipping/payment metadata; require SendCat auth.
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.subject) {
      throw new Error("Sign in required to view order details");
    }

    const accessToken = await getEbayAppAccessToken({ scope: EBAY_GUEST_ORDER_SCOPE });
    const headers: Record<string, string> = {};
    const marketplaceId = args.marketplaceId ? args.marketplaceId.toUpperCase() : undefined;
    if (args.deviceId?.trim()) {
      headers["X-EBAY-C-ENDUSERCTX"] = `deviceId=${args.deviceId.trim()}`;
    }

    // getGuestPurchaseOrder
    // GET https://api.ebay.com/buy/order/v2/guest_purchase_order/{purchaseOrderId}
    const data = await ebayFetchJson<any>({
      baseUrl: "https://api.ebay.com",
      path: `/buy/order/v2/guest_purchase_order/${encodeURIComponent(args.purchaseOrderId)}`,
      method: "GET",
      accessToken,
      marketplaceId,
      headers,
      timeoutMs: 12_000,
    });

    const pricingSummary = data?.pricingSummary ?? undefined;
    const total = pricingSummary?.total ?? undefined;
    const lineItemsRaw = Array.isArray(data?.lineItems) ? data.lineItems : undefined;

    return {
      purchaseOrderId: String(data?.purchaseOrderId ?? args.purchaseOrderId),
      purchaseOrderStatus: typeof data?.purchaseOrderStatus === "string" ? data.purchaseOrderStatus : undefined,
      purchaseOrderPaymentStatus:
        typeof data?.purchaseOrderPaymentStatus === "string" ? data.purchaseOrderPaymentStatus : undefined,
      total:
        total && typeof total === "object"
          ? {
              value: typeof total.value === "string" ? total.value : undefined,
              currency: typeof total.currency === "string" ? total.currency : undefined,
            }
          : undefined,
      lineItems: lineItemsRaw
        ? lineItemsRaw.map((li: any) => ({
            itemId: typeof li?.itemId === "string" ? li.itemId : undefined,
            title: typeof li?.title === "string" ? li.title : undefined,
          }))
        : undefined,
    };
  },
});


