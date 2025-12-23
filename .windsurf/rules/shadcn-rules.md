---
trigger: always_on
description: Apply when adding UI components
---
For this  project we are using shadcn ui for our UI components. please follow this guideline on where to use each component based on what the user wants added in the frontend.

For a frontend ecommerce site, most of shadcn’s primitives are useful, but these are the most relevant ones to cover navigation, product discovery, product display, cart/checkout, and account flows.

## Navigation and layout

- Navigation Menu (main site nav with categories like Men, Women, Electronics).
- Sidebar (filters or account dashboard navigation).
- Breadcrumb (category paths like Home / Electronics / Laptops).
- Sheet (mobile slide-in menu or cart drawer).
- Drawer (alternative to Sheet for cart, filters, mobile nav).
- Separator (section dividers in menus, sidebars, and footers).
- Scroll Area (scrollable filter lists, long descriptions, or reviews).
- Resizable (admin tools, split views for dashboards if you build internal tools too).

## Product discovery and filtering

- Input (search bar and quick filters).
- Combobox (searchable dropdown for categories, brands, or shipping locations).
- Command (command palette–style search or “quick find product” UX).
- Select (sort by price, category selectors, size selectors).
- Checkbox (multi-select filters like brands, features).
- Radio Group (single-choice options such as color or size when one must be selected).
- Slider (price range filter or rating range).[1]
- Switch (toggles like “In stock only” or “On sale only”).[1]
- Pagination (product listing pages navigation).[1]
- Tabs (switch between product info, reviews, Q&A, shipping info).[1]

## Product presentation and merchandising

- Card (product cards in grid/list views).  
- Carousel (product image gallery, homepage hero sliders).
- Aspect Ratio (ensure consistent product image sizes in grids).
- Avatar (brand avatars, seller avatars in marketplaces).
- Badge (labels like “New”, “Sale”, “Best Seller”).
- Tooltip (tooltips on icons for wishlist, compare, info).
- Hover Card (quick view or mini product preview on hover).
- Skeleton (loading state for product cards and details pages).
- Progress (e.g., checkout progress or “uploading file” for custom products).
- Spinner (general loading states).
- Typography (consistent headings, body text, prices, etc.).

## Cart, checkout, and forms

- Button (primary/secondary actions like Add to Cart, Checkout, Buy Now).
- Button Group (grouped actions, e.g., Add to Cart + Wishlist + Compare).
- Form (validation + integration with form libs for checkout, sign-up, address forms).
- Field (form field wrappers for consistent layout and error states).
- Input Group (inputs with icons, add-on text, or inline buttons, e.g., coupon code).
- Label (accessible labels for all form fields).
- Textarea (special instructions to seller, gift notes).
- Native Select (where basic native select is preferred, e.g., country list on mobile).
- Date Picker (delivery date selection, booking-style flows).
- Input OTP (2FA for payments or account security).
- Checkbox (terms and conditions, newsletter opt-in at checkout).
- Alert (inline form errors like “Card declined” or “Out of stock”).
- Alert Dialog (confirm destructive or critical actions like cancel order, remove address).

## Overlays, modals, and feedback

- Dialog (quick view product modal, size guide, policies, login/register modals).
- Drawer (cart drawer, mobile filters, or account shortcuts).
- Popover (size chart popover, mini-cart popover on hover/click).
- Dropdown Menu (user account menu, language, currency selectors).
- Context Menu (right-click actions in admin/product-management tools).
- Toast (global notifications like “Added to cart” or “Saved to wishlist”).
- Sonner (alternative/extended toast system for notifications).
- Empty (nice states for “No products found”, “No orders yet”, “Empty wishlist”).

## Tables, data, and analytics

- Data Table (order history, admin product lists, customer lists).
- Table (simpler tabular views like pricing breakdowns, size charts).
- Chart (dashboards for sales analytics, conversions, traffic if you build admin tooling).

## Misc and utility components

- Accordion (FAQs, shipping questions, policy sections).
- Collapsible (hidden sections in product detail or filters).
- Sidebar (account dashboard, admin dashboard navigation).
- Kbd (shortcut hints in power-user views like admin panels).
- Menubar (desktop-like nav in internal tools, not essential for customer-facing ecommerce).
- Spinner (general async loading visual).
- Item (generic list-type component where needed).

If you want, the next step can be mapping these to specific pages (home, PLP, PDP, cart, checkout, account) and designing a minimal but clean ecommerce UI kit from this subset.

(https://ui.shadcn.com/docs/components)