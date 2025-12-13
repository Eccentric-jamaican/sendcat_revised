/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actions_search from "../actions/search.js";
import type * as lib_ebayBrowse from "../lib/ebayBrowse.js";
import type * as mutations_events from "../mutations/events.js";
import type * as mutations_items from "../mutations/items.js";
import type * as mutations_searchCache from "../mutations/searchCache.js";
import type * as queries_items from "../queries/items.js";
import type * as queries_searchCache from "../queries/searchCache.js";
import type * as queries_trending from "../queries/trending.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "actions/search": typeof actions_search;
  "lib/ebayBrowse": typeof lib_ebayBrowse;
  "mutations/events": typeof mutations_events;
  "mutations/items": typeof mutations_items;
  "mutations/searchCache": typeof mutations_searchCache;
  "queries/items": typeof queries_items;
  "queries/searchCache": typeof queries_searchCache;
  "queries/trending": typeof queries_trending;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
