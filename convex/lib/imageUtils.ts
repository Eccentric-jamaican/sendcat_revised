/**
 * Normalize eBay image URLs to request high-resolution versions.
 *
 * eBay uses several image URL formats:
 *
 * 1. Modern format with s-l size suffix:
 *    https://i.ebayimg.com/images/g/{hash}/s-l225.jpg
 *    https://i.ebayimg.com/thumbs/images/g/{hash}/s-l225.webp
 *
 * 2. Older format with $_XX suffix:
 *    https://i.ebayimg.com/00/s/{hash}/z/{hash}/$_12.JPG
 *    $_1 = tiny, $_12 = small, $_57 = medium, $_32 = large (1600px)
 *
 * 3. Query parameter based:
 *    https://i.ebayimg.com/images/g/{hash}/s-l500.jpg?w=225&h=225
 *
 * This function converts all formats to request the highest resolution available.
 */
export function normalizeEbayImageUrl(rawUrl?: string): string | undefined {
  if (!rawUrl) return rawUrl;

  try {
    const url = new URL(rawUrl);
    const hostname = url.hostname.toLowerCase();

    // Only transform ebayimg.com URLs
    if (!hostname.endsWith("ebayimg.com")) {
      return rawUrl;
    }

    let pathname = url.pathname;

    // Remove /thumbs/ from the path to get direct image path
    if (pathname.includes("/thumbs/")) {
      pathname = pathname.replace("/thumbs/", "/");
    }

    // Handle modern s-l{size} format - replace any size with 1600
    // Matches: s-l64, s-l225, s-l300, s-l500, s-l1200, etc.
    pathname = pathname.replace(/s-l\d+/gi, "s-l1600");

    // Handle older $_XX format - replace with $_32 (largest)
    // Matches: $_1, $_12, $_57, $_32, etc.
    pathname = pathname.replace(/\$_\d+/g, "$_32");

    url.pathname = pathname;

    // Remove size-limiting query parameters or set them to max
    if (url.searchParams.has("w")) {
      url.searchParams.delete("w");
    }
    if (url.searchParams.has("h")) {
      url.searchParams.delete("h");
    }
    // Remove other size-related params
    if (url.searchParams.has("sz")) {
      url.searchParams.delete("sz");
    }

    return url.toString();
  } catch {
    // If URL parsing fails, return original
    return rawUrl;
  }
}
