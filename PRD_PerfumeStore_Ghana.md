# Technical PRD: LiquorShop Ghana → The Perfume Store Ghana
## Full-Stack Redesign Specification for LLM Implementation

**Document Version:** 1.0  
**Date:** February 2026  
**Scope:** Complete UI + Data Model + Content Transformation  
**Stack:** Next.js (App Router), TypeScript, Tailwind CSS  
**Approach:** Surgical find-and-replace on every affected file — no rewrites of working logic

---

## 0. GUIDING PRINCIPLES FOR THE IMPLEMENTING LLM

1. **Never rewrite what works.** Cart logic, checkout flow, payment integration (Paystack, MTN MoMo, Cash on Delivery), auth, and order management are untouched unless explicitly listed.
2. **Every mention of beer, wine, spirits, liquor, drinks, cider, cocktail, cellar, alcohol, or "18+" must be removed or replaced** with perfume-domain equivalents.
3. **The backend has no seeded product categories.** Categories exist only as UI navigation labels and filter values. The implementing LLM must update every place these labels appear — in nav components, filter sidebars, footer links, constants files, and seed/fixture data.
4. **Product variant logic changes from size/pack (Single Bottle, Pack, Crate) to fragrance size (30ml, 50ml, 100ml, 200ml).** All variant selector UI and any associated type definitions must reflect this.
5. **The 18+ age gate component must be completely deleted** — component file, any imports, and any usage.
6. **Design system:** Deep purple & gold luxury palette. All Tailwind color tokens must be replaced. Google Fonts: `Cormorant Garamond` (display) + `Jost` (body).
7. When in doubt about a string, ask: "Does this belong in a perfume store?" If not, change it.

---

## 1. DESIGN SYSTEM CHANGES

### 1.1 Color Palette — `tailwind.config.ts`

Replace the entire `theme.extend.colors` block with:

```ts
colors: {
  brand: {
    deep:    '#1a0a2e',   // primary dark background
    mid:     '#2d1554',   // secondary purple
    light:   '#4a2080',   // accent purple
    gold:    '#c9a84c',   // primary gold
    'gold-light': '#e8c97a',
    'gold-pale':  '#f5e6b8',
    cream:   '#fdf8f0',   // page background
    border:  'rgba(201,168,76,0.25)',
    muted:   '#8a7a9e',
    subtle:  '#c4b8d4',
  }
}
```

Remove any existing amber, orange, or yellow color tokens that were used for the liquor brand.

### 1.2 Typography — `app/layout.tsx` or global font config

Replace current font imports with:

```ts
import { Cormorant_Garamond, Jost } from 'next/font/google'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-display',
})

const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body',
})
```

Apply both variables to the root `<html>` element. Update `globals.css`:

```css
:root {
  --font-display: var(--font-cormorant);
  --font-body: var(--font-jost);
}

body {
  font-family: var(--font-body), sans-serif;
  background-color: #fdf8f0;
  color: #1a0a2e;
}

h1, h2, h3, .display {
  font-family: var(--font-display), serif;
}
```

### 1.3 Global CSS Tokens — `globals.css`

Add these CSS custom properties at `:root`:

```css
--purple-deep:  #1a0a2e;
--purple-mid:   #2d1554;
--purple-light: #4a2080;
--gold:         #c9a84c;
--gold-light:   #e8c97a;
--gold-pale:    #f5e6b8;
--cream:        #fdf8f0;
--border:       rgba(201,168,76,0.25);
--border-light: rgba(74,32,128,0.12);
--text-muted:   #8a7a9e;
--text-subtle:  #c4b8d4;
```

---

## 2. DATA MODEL CHANGES

### 2.1 Product Categories — `constants/categories.ts` (or equivalent)

**DELETE** the existing category array entirely. **REPLACE** with:

```ts
export const PRODUCT_CATEGORIES = [
  { slug: 'mens',       label: "Men's Fragrances",  tag: 'The After Dark' },
  { slug: 'womens',     label: "Women's Fragrances", tag: 'The Bloom'      },
  { slug: 'unisex',     label: 'Unisex & Niche',     tag: 'The Artisan'    },
  { slug: 'gift-sets',  label: 'Gift Sets',           tag: 'The Gift'       },
  { slug: 'body-mists', label: 'Body Mists',          tag: 'The Everyday'   },
  { slug: 'oud',        label: 'Oud Collection',      tag: 'The Heritage'   },
] as const

export type ProductCategory = typeof PRODUCT_CATEGORIES[number]['slug']
```

**DELETE** any array or enum containing: `beer`, `wine`, `spirits`, `soft-drinks`, `soft_drinks`, `bottled-water`, `energy-drink`, `tisit`, `crate`.

### 2.2 Product Variant / Size Options

Locate the file where variant types are defined (likely `types/product.ts` or `lib/types.ts`). Find the variant or pack type.

**DELETE:**
```ts
// Any of these or similar:
type PackType = 'single' | 'pack' | 'crate'
type SizeOption = 'Single Bottle' | 'Pack' | 'Crate'
```

**REPLACE WITH:**
```ts
export type FragranceSize = '30ml' | '50ml' | '100ml' | '200ml'

export type FragranceConcentration = 'EDT' | 'EDP' | 'Parfum' | 'Cologne' | 'Body Mist'

export type ScentFamily = 
  | 'Floral' 
  | 'Woody' 
  | 'Oriental' 
  | 'Fresh' 
  | 'Citrus' 
  | 'Aquatic' 
  | 'Gourmand' 
  | 'Chypre'
  | 'Fougère'

export interface ScentNotes {
  top:    string[]   // e.g. ['Bergamot', 'Lemon', 'Pink Pepper']
  heart:  string[]   // e.g. ['Rose', 'Jasmine', 'Iris']
  base:   string[]   // e.g. ['Sandalwood', 'Musk', 'Amber']
}

export interface ProductVariant {
  size:          FragranceSize
  price:         number
  originalPrice?: number
  inStock:       boolean
}
```

### 2.3 Product Type Extension

In the main `Product` interface/type, **ADD** these fields:

```ts
export interface Product {
  // ...existing fields (id, name, images, slug, etc.)...
  
  // NEW perfume-specific fields:
  brand:           string              // e.g. 'Chanel', 'Dior', 'Tom Ford'
  concentration:   FragranceConcentration
  scentFamily:     ScentFamily
  scentNotes:      ScentNotes
  variants:        ProductVariant[]    // replaces old pack/size variants
  longevity?:      '2-4hrs' | '4-6hrs' | '6-8hrs' | '8+hrs'
  sillage?:        'Intimate' | 'Moderate' | 'Strong' | 'Massive'
  occasion?:       string[]           // e.g. ['Evening', 'Office', 'Casual']
  gender:          'mens' | 'womens' | 'unisex'
  
  // REMOVE these old fields if present:
  // packType, bottleSize, alcoholContent, vintage, brewery, winery
}
```

### 2.4 Database Seed / Fixture Data — `prisma/seed.ts` or `lib/seed.ts`

If a seed file exists, **DELETE** all liquor product entries. **ADD** sample fragrance products using the new schema. Minimum sample set:

| Name | Brand | Category | Concentration | Scent Family | Sizes |
|---|---|---|---|---|---|
| Sauvage | Dior | mens | EDT | Fresh | 60ml, 100ml, 200ml |
| La Nuit Trésor | Lancôme | womens | EDP | Oriental | 30ml, 50ml, 100ml |
| Baccarat Rouge 540 | MFK | unisex | EDP | Floral | 35ml, 70ml |
| Bleu de Chanel | Chanel | mens | EDP | Woody | 50ml, 100ml |
| Coco Mademoiselle | Chanel | womens | EDP | Chypre | 35ml, 50ml, 100ml |
| Black Opium | YSL | womens | EDP | Gourmand | 30ml, 50ml, 90ml |
| Oud Wood | Tom Ford | unisex | EDP | Woody | 50ml, 100ml |
| Acqua di Giò | Armani | mens | EDT | Aquatic | 40ml, 75ml, 100ml |

---

## 3. COMPONENT CHANGES

### 3.1 Navbar — `components/Navbar.tsx` (or `components/layout/Navbar.tsx`)

**Current state (visual evidence from all 3 PDFs):**
```
Logo: [L] LiquorShop Ghana
Nav links: All Products | Beer | Wine | Spirits | Soft Drinks
Icons: User | Cart
```

**Required changes:**

**A. Logo:**
- Change icon background from orange square to gold circle
- Change letter from `L` to `P`
- Change text from `LiquorShop` to `The Perfume Store`
- Keep subtitle `Ghana` with new styling
- Logo background: `linear-gradient(135deg, #c9a84c, #e8c97a)` circle, 40×40px
- Font: `Cormorant Garamond` for main text, `Jost` for subtitle

**B. Navigation Links — DELETE ALL CURRENT LINKS. REPLACE WITH:**
```tsx
const navLinks = [
  { href: '/shop',                 label: 'All Fragrances' },
  { href: '/shop?category=mens',   label: "Men's"          },
  { href: '/shop?category=womens', label: "Women's"        },
  { href: '/shop?category=unisex', label: 'Unisex & Niche' },
  { href: '/shop?category=gift-sets',  label: 'Gift Sets'  },
  { href: '/shop?category=body-mists', label: 'Body Mists' },
]
```

**C. Add Wishlist icon** between the Account and Cart icons:
```tsx
<WishlistIcon /> // Heart SVG, links to /wishlist
```

**D. Nav styling:**
```tsx
// Background: rgba(26,10,46,0.92) with backdrop-filter: blur(20px)
// Border-bottom: 1px solid rgba(201,168,76,0.25)
// Height: 72px
// Link color default: #c4b8d4
// Link color hover/active: #c9a84c
// Link font: Jost, 12px, letter-spacing: 0.15em, uppercase
```

**E. Active link detection:** Use `usePathname()` and `searchParams` to highlight the current category link with gold color.

---

### 3.2 Footer — `components/Footer.tsx` (or `components/layout/Footer.tsx`)

**Current state (visible across all 3 PDFs):**
```
Brand: LiquorShop, Ghana's premier online destination for premium wines, spirits, and craft beers. Delivering excellence since 2024.
18+ badge: "You must be of legal drinking age to purchase alcohol. Drink responsibly."
Shop column: All Products | Beer | Wine | Spirits | Soft Drinks
```

**Required changes:**

**A. Brand copy — REPLACE:**
```
Old: "Ghana's premier online destination for premium wines, spirits, and craft beers. Delivering excellence since 2024."
New: "Ghana's premier online destination for authentic luxury fragrances. Curating excellence since 2024."
```

**B. 18+ Age Gate Banner — DELETE ENTIRELY:**
- Remove the yellow/amber warning box with the shield icon
- Remove any component reference to age verification in the footer
- Remove any import of the age gate component

**C. Shop column links — DELETE ALL. REPLACE WITH:**
```tsx
const shopLinks = [
  { href: '/shop',                     label: 'All Fragrances' },
  { href: '/shop?category=mens',       label: "Men's Fragrances" },
  { href: '/shop?category=womens',     label: "Women's Fragrances" },
  { href: '/shop?category=unisex',     label: 'Unisex & Niche' },
  { href: '/shop?category=gift-sets',  label: 'Gift Sets' },
  { href: '/shop?category=body-mists', label: 'Body Mists' },
]
```

**D. Footer logo** — same changes as Navbar (P, circle, gold gradient, "The Perfume Store")

**E. Color scheme:**
```
Background: #0d0520
Top border: linear-gradient(to right, transparent, #c9a84c, transparent) — 1px height
Column title color: #c9a84c
Link color: #8a7a9e → hover: #c9a84c
Copyright: #4a3a5e
```

**F. Company name in copyright:**
```
Old: "© 2026 LiquorShop. All rights reserved."
New: "© 2026 The Perfume Store Ghana. All rights reserved."
```

**G. Contact email — UPDATE:**
```
Old: admin@liquorshop.gh
New: hello@theperfumestore.gh
```

---

### 3.3 Age Gate Component — COMPLETE DELETION

Locate the age gate/age verification component. It likely lives at one of:
- `components/AgeGate.tsx`
- `components/AgeVerification.tsx`
- `components/modals/AgeModal.tsx`
- `components/ui/AgePopup.tsx`

**Actions:**
1. Delete the component file entirely.
2. Search the entire codebase for any import of this component: `import.*AgeGate`, `import.*AgeVerification`, `import.*AgeModal` — delete all import lines.
3. Remove any JSX usage: `<AgeGate />`, `<AgeVerification />` — delete these lines.
4. Search `localStorage` or `sessionStorage` for any keys like `ageVerified`, `isAdult`, `ageGateShown` — remove the logic that reads/writes these.
5. Remove any related Zustand/Context state: `isAgeVerified`, `setAgeVerified`.

---

### 3.4 Homepage — `app/page.tsx` + `app/(home)/page.tsx`

#### 3.4.1 Hero Section

**Current:** "Premium Drinks, Delivered to Your Door" — two buttons: Shop Now, Learn More

**Replace hero copy:**
```
Eyebrow:   "New Collection 2026"
H1 line 1: "Your Signature"
H1 italic: "Scent,"
H1 line 3: "Delivered."
Subtitle:  "Discover Ghana's finest curated selection of luxury fragrances — from iconic houses to rare niche perfumers. Authentic. Sealed. Delivered to your door."
CTA 1:     "Explore Fragrances" → href="/shop"
CTA 2:     "Our Story"         → href="/about"
```

**Hero stats strip (ADD — currently shows as bottom overlay on hero):**
```tsx
const heroStats = [
  { number: '200+', label: 'Fragrances'  },
  { number: '50+',  label: 'Brands'      },
  { number: '100%', label: 'Authentic'   },
]
```

**Hero background:** `linear-gradient(135deg, #1a0a2e 0%, #2d1554 50%, #1e0a35 100%)`
Remove any bottle-of-alcohol imagery. Replace with abstract perfume bottle visual (CSS-only or a perfume bottle SVG).

#### 3.4.2 Category Tiles Section

**Current:** 3 tiles — "Beers & Ciders (The After Work)", "Spirits & Mixers (The Nightcap)", "Wines & Champagne (The Celebration)"

**DELETE all 3 tiles. REPLACE WITH these 3:**

```tsx
const categoryTiles = [
  {
    tag:   'The After Dark',
    title: "Men's Fragrances",
    desc:  'Woody, Aquatic, Spicy & Oriental',
    href:  '/shop?category=mens',
    gradient: 'linear-gradient(135deg, #0f0a1e 0%, #1a0a35 40%, #2d1050 100%)',
  },
  {
    tag:   'The Bloom',
    title: "Women's Fragrances",
    desc:  'Floral, Fruity, Powdery & Chypre',
    href:  '/shop?category=womens',
    gradient: 'linear-gradient(135deg, #2d0a1e 0%, #500a30 40%, #7a1045 100%)',
  },
  {
    tag:   'The Artisan',
    title: 'Niche & Unisex',
    desc:  'Rare, Artistic & Boundary-Defying',
    href:  '/shop?category=unisex',
    gradient: 'linear-gradient(135deg, #0a1a1e 0%, #0a2535 40%, #0d3550 100%)',
  },
]
```

Each tile: full height (420px), hover reveals description text and arrow icon, overlay gradient darkens from bottom.

#### 3.4.3 "Featured Selections" Section

**Keep** the section structure. **Change:**
- Section eyebrow: keep "TOP SHELF" label (appropriate for perfume)
- Section title: "Featured Selections" → keep
- "View All Specials →" link → keep, points to `/shop?featured=true`
- Product cards use new perfume product schema (brand, scent tags, size selector)

#### 3.4.4 "The LiquorShop Promise" Section → "The Perfume Store Promise"

**DELETE current promise pillars. REPLACE WITH:**

```tsx
const promisePillars = [
  {
    icon: 'shield',
    title: '100% Authentic',
    text:  'Sourced directly from authorised distributors. Every bottle is sealed, original, and guaranteed genuine.',
  },
  {
    icon: 'box',
    title: 'Gift-Ready Packaging',
    text:  'Every order arrives in our signature luxury gift box. Perfect for birthdays, anniversaries & corporate gifting.',
  },
  {
    icon: 'check-circle',
    title: 'GPS Precision Delivery',
    text:  'Our riders use Ghana Post GPS to find your door, anywhere in Greater Accra and beyond.',
  },
  {
    icon: 'clock',
    title: 'Same-Day Delivery',
    text:  'Order before 2 PM and receive your fragrance the same evening in Accra.',
  },
  {
    icon: 'message-circle',
    title: 'Expert Scent Advice',
    text:  'Not sure what to choose? Chat with our fragrance specialists for personalised recommendations.',
  },
  {
    icon: 'refresh',
    title: 'Easy Returns',
    text:  'Received a sealed but incorrect item? We\'ll sort it with no questions asked.',
  },
]
```

**DELETE:**
- "Chilled on Arrival" pillar — drinks-specific, irrelevant
- Any pillar referencing temperature, refrigeration, or alcohol

#### 3.4.5 Flash Sale / Promo Banner

**Keep** the promo banner structure. Update copy only:
```
Badge:    "Limited Time Offer"
Title:    "Flash Sale — Up to 30% Off"  (italic "30% Off")
Subtitle: "Selected designer fragrances. While stocks last."
CTA:      "Shop the Sale" → href="/shop?sale=true"
```

Remove "UPTO 80% OFF" — replace with "Up to 30% Off" (a more credible luxury number).

#### 3.4.6 "Explore Our Collection" Section

Keep structure. Products shown must be fragrance products, not drink products. Use the same product card component updated in Section 3.5.

#### 3.4.7 "Planning a Wedding or Party?" → Corporate Gifting

**Update copy:**
```
Old: "Planning a Wedding or Party? Let us handle the bar..."
New: "Planning a Wedding or Corporate Event? Let us handle the gifting. We offer bespoke gift sets, personalised labelling, and professional fragrance curation for weddings, anniversaries, and corporate occasions."
CTA: "Get a Bulk Quote" → href="/corporate" (keep same)
```

#### 3.4.8 "The Cellar Journal" Blog → "The Scent Journal"

**Find and replace everywhere:**
```
"The Cellar Journal"  →  "The Scent Journal"
"Cellar Journal"      →  "Scent Journal"
"cellar-journal"      →  "scent-journal"  (for slugs/routes)
```

Update blog section subtitle:
```
Old: (not visible)
New: "Culture, recipes, and guides."  → keep this line, it works
```

---

### 3.5 Product Card Component — `components/ProductCard.tsx`

**Current state (visible in shop page PDF):**
- Shows: category badge (WINE, BEER, etc.), product name, price, quantity input, Add to Cart
- Dropdown for size shows "Single Bottle – GH₵X.XX"
- No wishlist button visible in card

**Required changes:**

**A. Category badge** — driven by `product.category`. Since categories are now slugs from Section 2.1, display the label:
```tsx
// Old
<span className="badge">{product.category.toUpperCase()}</span>  // e.g. "WINE"

// New
<span className="badge">{getCategoryLabel(product.category)}</span>
// getCategoryLabel maps slug → label, e.g. 'mens' → "Men's"
// Also show concentration: "Men's · EDP"
```

**B. Size/variant dropdown** — currently shows "Single Bottle – GH₵X.XX":
```tsx
// Old: "Single Bottle – GH₵37.00"
// New: Size selector with fragrance ml options

// Replace dropdown with pill-style size selector:
<div className="size-selector">
  {product.variants.map(v => (
    <button
      key={v.size}
      className={`size-pill ${selectedSize === v.size ? 'active' : ''}`}
      onClick={() => setSelectedSize(v.size)}
    >
      {v.size}
    </button>
  ))}
</div>

// Size pill styling:
// Default: border: 1px solid rgba(74,32,128,0.2), color: muted
// Active:  border-color: #c9a84c, color: #c9a84c
```

**C. ADD Wishlist button** — appears on hover, top-right of product image:
```tsx
<button
  className="wishlist-btn"
  aria-label="Add to wishlist"
  onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id) }}
>
  <HeartIcon filled={isWishlisted} />
</button>
```

**D. ADD scent tags** below brand name:
```tsx
<div className="scent-tags">
  {product.scentNotes.top.slice(0,3).map(note => (
    <span key={note} className="scent-tag">{note}</span>
  ))}
</div>
```

**E. Brand name display** — ADD brand below product name:
```tsx
<p className="product-brand">{product.brand}</p>  // e.g. "Dior"
```

**F. Quick Add button** — slides up from bottom on hover:
```tsx
<button className="quick-add-btn">Quick Add to Cart</button>
// Background: #1a0a2e, color: #c9a84c
// Transforms: translateY(100%) → translateY(0) on parent hover
```

---

### 3.6 Shop Page — `app/shop/page.tsx` + Sidebar Filter Component

This is the most complex UI change. The current shop page has a left sidebar with filters for: Categories, Price Range, Brands, Type (Single/Pack/Crate), Special Offers Only.

#### 3.6.1 Filter Sidebar — `components/ShopSidebar.tsx` (or inline)

**CURRENT FILTER STRUCTURE (from PDF analysis):**
```
[x] Categories         ← collapsible
    ○ Beer (checkbox)
    ○ Bottled Water
    ○ Energy Drink
    ○ Soft Drinks
    ○ Spirits
    ○ Tisit
    ○ Wine

[x] Price Range (GH₵)  ← collapsible
    [Min] — [Max]
    [Apply]

[x] Brands             ← collapsible (empty/no brands shown)

[x] Type               ← collapsible
    ○ Single
    ○ Pack
    ○ Crate

[ ] Special Offers Only ← toggle
```

**REQUIRED — DELETE ALL CURRENT FILTER OPTIONS. REPLACE WITH:**

```tsx
// ── FILTER GROUP 1: Category ──────────────────────────────
const categoryFilters = [
  { slug: 'mens',       label: "Men's Fragrances" },
  { slug: 'womens',     label: "Women's Fragrances" },
  { slug: 'unisex',     label: 'Unisex & Niche' },
  { slug: 'gift-sets',  label: 'Gift Sets' },
  { slug: 'body-mists', label: 'Body Mists' },
  { slug: 'oud',        label: 'Oud Collection' },
]
// Rendered as: checkbox list with product counts e.g. "Men's Fragrances (24)"
// Query param: ?category=mens (single) or ?category=mens,womens (multi)

// ── FILTER GROUP 2: Price Range ───────────────────────────
// Keep existing price range UI (Min/Max inputs + Apply button)
// No functional change needed — just reskin with new palette
// Label: "Price Range (GH₵)"

// ── FILTER GROUP 3: Brands ────────────────────────────────
// Keep collapsible section. Populate dynamically from products:
const brandFilters = [
  'Chanel', 'Dior', 'Versace', 'Armani', 
  'Tom Ford', 'YSL', 'Lancôme', 'MFK', 
  'Creed', 'Jo Malone', 'Paco Rabanne',
  // ...dynamic from DB
]
// Rendered as: checkbox list, same UI as categories
// Query param: ?brand=Chanel,Dior

// ── FILTER GROUP 4: Size ──────────────────────────────────
// REPLACES "Type" (Single/Pack/Crate) entirely
const sizeFilters = [
  { value: '30ml',  label: '30ml'  },
  { value: '50ml',  label: '50ml'  },
  { value: '100ml', label: '100ml' },
  { value: '200ml', label: '200ml' },
]
// Rendered as: pill buttons (not checkboxes), multi-select
// Query param: ?size=50ml,100ml

// ── FILTER GROUP 5: Concentration ─────────────────────────
// NEW — does not exist in current codebase, must be added
const concentrationFilters = [
  { value: 'EDT',        label: 'EDT' },
  { value: 'EDP',        label: 'EDP' },
  { value: 'Parfum',     label: 'Parfum' },
  { value: 'Cologne',    label: 'Cologne' },
  { value: 'Body Mist',  label: 'Body Mist' },
]
// Rendered as: pill buttons, multi-select
// Query param: ?concentration=EDP,EDT

// ── FILTER GROUP 6: Scent Family ──────────────────────────
// NEW — does not exist in current codebase, must be added
const scentFamilyFilters = [
  { value: 'Floral',    label: 'Floral'    },
  { value: 'Woody',     label: 'Woody'     },
  { value: 'Oriental',  label: 'Oriental'  },
  { value: 'Fresh',     label: 'Fresh'     },
  { value: 'Citrus',    label: 'Citrus'    },
  { value: 'Aquatic',   label: 'Aquatic'   },
  { value: 'Gourmand',  label: 'Gourmand'  },
  { value: 'Chypre',    label: 'Chypre'    },
]
// Rendered as: pill buttons, multi-select
// Query param: ?scentFamily=Floral,Woody

// ── FILTER GROUP 7: Special Offers ────────────────────────
// Keep existing toggle. No change needed except reskin.
// Query param: ?sale=true
```

#### 3.6.2 Filter Query Parameter Handling

The shop page must read and apply these URL params:
```ts
const params = {
  category:      searchParams.get('category'),       // comma-separated slugs
  brand:         searchParams.get('brand'),           // comma-separated names
  size:          searchParams.get('size'),            // comma-separated ml values
  concentration: searchParams.get('concentration'),   // comma-separated values
  scentFamily:   searchParams.get('scentFamily'),     // comma-separated values
  minPrice:      searchParams.get('minPrice'),        // number string
  maxPrice:      searchParams.get('maxPrice'),        // number string
  sale:          searchParams.get('sale'),            // 'true' | null
  sort:          searchParams.get('sort'),            // see below
}
```

#### 3.6.3 Sort Options

**Current:** "Newest Arrivals" dropdown (single observed option).

**REPLACE dropdown options with:**
```tsx
const sortOptions = [
  { value: 'newest',     label: 'Newest Arrivals' },
  { value: 'price-asc',  label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'popular',    label: 'Most Popular' },
  { value: 'name-asc',   label: 'Name: A–Z' },
]
```

#### 3.6.4 Results Count Label

```
Old: "Showing 7 results"
New: "Showing {n} fragrance{n !== 1 ? 's' : ''}"
```

---

### 3.7 Individual Product Page — `app/products/[slug]/page.tsx`

**Current state (from PDF):**
```
Breadcrumb:  "← Back to Wine"
Category:    "WINE"
Name:        "Apple cider"
Badges:      "Limited Time Offer: 17% OFF"
Price:       GH₵37.00  → GH₵30.71 (strike + discounted)
In Stock:    "✓ In Stock"
Size/Pack:   "Select Size / Pack" label, "Single Bottle GH₵37.00" button
Qty:         −  1  + 
CTA:         "Add to Cart" button (orange/amber)
Description: "No description available for this product."
"You Might Also Like" section (4 cards)
"Customer Reviews" section with review form
```

**Required changes:**

#### 3.7.1 Breadcrumb

```tsx
// Old: "← Back to Wine"
// New: dynamically built from category:
`← Back to ${getCategoryLabel(product.category)}`
// e.g. "← Back to Men's Fragrances"
// href: /shop?category={product.category}
```

#### 3.7.2 Category Badge

```tsx
// Old: "WINE" (plain text, small gray label)
// New: Show both category AND concentration
<span className="cat-tag">{getCategoryLabel(product.category)}</span>
<span className="conc-tag">{product.concentration}</span>  // "EDP", "EDT", etc.
```

#### 3.7.3 Discount Badge

```tsx
// Old: "Limited Time Offer: 17% OFF"  (red pill)
// New: Same style, same calculation, just ensure label reads:
"Limited Time Offer: {discountPercent}% OFF"
// Color: background #c9a84c, color #1a0a2e (gold on deep purple — not red)
```

#### 3.7.4 Size Selector — CORE CHANGE

**Current (from PDF):**
```
Label: "Select Size / Pack"
One button visible: "Single Bottle  GH₵37.00"
```

**Replace with fragrance size selector:**

```tsx
// New label:
<label>Select Size</label>

// New selector — pill buttons for each variant:
<div className="size-options">
  {product.variants.map((variant) => (
    <button
      key={variant.size}
      onClick={() => setSelectedVariant(variant)}
      className={`size-pill ${selectedVariant?.size === variant.size ? 'active' : ''}`}
      disabled={!variant.inStock}
    >
      <span className="size-ml">{variant.size}</span>
      <span className="size-price">GH₵{variant.price.toFixed(2)}</span>
    </button>
  ))}
</div>

// Pill styling:
// Default:  border: 1px solid rgba(74,32,128,0.25), background: white
// Active:   border: 2px solid #c9a84c, background: rgba(201,168,76,0.08)
// Disabled: opacity 0.4, cursor: not-allowed
// Size text: Cormorant Garamond 16px
// Price text: Jost 11px, color: muted, below size text
```

Price displayed in hero area should update when a different size is selected.

#### 3.7.5 ADD Wishlist Button

Next to the "Add to Cart" button, add:
```tsx
<button className="wishlist-btn-outline" onClick={() => toggleWishlist(product.id)}>
  <HeartIcon />
  {isWishlisted ? 'Saved' : 'Save'}
</button>
// Style: outlined button matching Add to Cart height, gold border, gold text
```

#### 3.7.6 ADD Scent Notes Section — NEW UI BLOCK

Insert between size selector and Product Description. This block does NOT exist in the current codebase — add it:

```tsx
{product.scentNotes && (
  <div className="scent-notes-section">
    <h3 className="scent-notes-title">Scent Notes</h3>
    <div className="notes-pyramid">
      {/* Top Notes */}
      <div className="notes-tier notes-top">
        <span className="tier-label">Top Notes</span>
        <div className="notes-list">
          {product.scentNotes.top.map(note => (
            <span key={note} className="note-chip">{note}</span>
          ))}
        </div>
      </div>
      {/* Heart Notes */}
      <div className="notes-tier notes-heart">
        <span className="tier-label">Heart Notes</span>
        <div className="notes-list">
          {product.scentNotes.heart.map(note => (
            <span key={note} className="note-chip">{note}</span>
          ))}
        </div>
      </div>
      {/* Base Notes */}
      <div className="notes-tier notes-base">
        <span className="tier-label">Base Notes</span>
        <div className="notes-list">
          {product.scentNotes.base.map(note => (
            <span key={note} className="note-chip">{note}</span>
          ))}
        </div>
      </div>
    </div>
  </div>
)}

// Styling:
// Wrapper: border-top: 1px solid rgba(74,32,128,0.12), padding-top: 1.5rem
// Title: Cormorant Garamond 1.2rem, color: #1a0a2e
// Tier label: Jost 9px uppercase letter-spacing 0.2em, color: #c9a84c
// Note chip: border: 1px solid rgba(74,32,128,0.2), 
//            color: #4a2080, padding: 4px 12px, font-size: 12px
// notes-top chips: slightly lighter border (first impression notes)
// notes-base chips: slightly darker/bolder (lasting impression)
```

#### 3.7.7 ADD Fragrance Details Row — NEW UI BLOCK

Insert below Scent Notes, above Product Description:

```tsx
<div className="fragrance-details-row">
  {product.concentration && (
    <div className="detail-chip">
      <span className="detail-label">Concentration</span>
      <span className="detail-value">{product.concentration}</span>
    </div>
  )}
  {product.longevity && (
    <div className="detail-chip">
      <span className="detail-label">Longevity</span>
      <span className="detail-value">{product.longevity}</span>
    </div>
  )}
  {product.sillage && (
    <div className="detail-chip">
      <span className="detail-label">Sillage</span>
      <span className="detail-value">{product.sillage}</span>
    </div>
  )}
  {product.scentFamily && (
    <div className="detail-chip">
      <span className="detail-label">Scent Family</span>
      <span className="detail-value">{product.scentFamily}</span>
    </div>
  )}
</div>

// detail-chip: border: 1px solid rgba(74,32,128,0.12), padding: 10px 16px
// detail-label: Jost 9px uppercase, color: muted
// detail-value: Jost 13px, color: #1a0a2e, font-weight: 500
// Row: display grid, grid-template-columns: repeat(4, 1fr), gap: 0.75rem
```

#### 3.7.8 "You Might Also Like" Section

Keep the structure. Change the recommendation logic:
```
Old: Related products (likely by same category, e.g. other wines)
New: Related products by scentFamily first, then category
     Label stays "You Might Also Like"
```

Ensure product cards in this section use the updated ProductCard component (Section 3.5).

#### 3.7.9 CTA Button Styling

```
Old: Orange/amber "Add to Cart" button
New: 
  Primary CTA: background: linear-gradient(135deg, #c9a84c, #e8c97a)
               color: #1a0a2e
               font-family: Jost
               letter-spacing: 0.18em
               text-transform: uppercase
               font-size: 12px
               font-weight: 600
  
  Cart icon: keep cart SVG icon before text
```

---

## 4. PAGE-LEVEL CONTENT CHANGES

### 4.1 Site Metadata — `app/layout.tsx`

```tsx
// Old
<title>LiquorShop Ghana</title>
<meta name="description" content="Ghana's premier online destination for premium wines, spirits, and craft beers." />

// New
<title>The Perfume Store Ghana — Luxury Fragrances</title>
<meta name="description" content="Ghana's premier online destination for authentic luxury fragrances. Shop Chanel, Dior, Tom Ford & more. Delivered to your door." />
<meta property="og:title" content="The Perfume Store Ghana" />
<meta property="og:description" content="Authentic luxury fragrances delivered to your door in Ghana." />
```

### 4.2 Favicon / App Icon

Replace the current `L` icon with a `P` or perfume bottle SVG favicon.
File: `app/favicon.ico` or `public/favicon.ico`

### 4.3 About Page — `app/about/page.tsx` (if exists)

Search for and replace all instances of:
- "wines, spirits, and beers" → "luxury fragrances"
- "LiquorShop" → "The Perfume Store"
- "drink" / "drinks" → "fragrance" / "fragrances"
- "bottle of wine/beer/spirits" → "bottle of fragrance"
- Any mention of "cellar", "brewery", "winery", "distillery" → remove or replace with "perfumery", "fragrance house"

### 4.4 Blog / Articles — `app/blog/page.tsx` (if exists)

- Section title: "The Cellar Journal" → "The Scent Journal"
- Route: `/blog` can stay as `/blog` or be renamed `/scent-journal`
- If route is renamed, add redirect: `{ source: '/blog', destination: '/scent-journal', permanent: true }`

---

## 5. BACKEND / API CHANGES

### 5.1 Product Filtering API — `app/api/products/route.ts` (or equivalent)

The product listing endpoint must accept and filter on the new query parameters. Add these filter handlers:

```ts
// Add to existing filter logic:

if (searchParams.get('concentration')) {
  const concentrations = searchParams.get('concentration')!.split(',')
  query.where.concentration = { in: concentrations }
}

if (searchParams.get('scentFamily')) {
  const families = searchParams.get('scentFamily')!.split(',')
  query.where.scentFamily = { in: families }
}

if (searchParams.get('size')) {
  const sizes = searchParams.get('size')!.split(',')
  query.where.variants = {
    some: { size: { in: sizes } }
  }
}

if (searchParams.get('brand')) {
  const brands = searchParams.get('brand')!.split(',')
  query.where.brand = { in: brands }
}
```

**REMOVE** any filter handling for:
- `packType` / `pack_type`
- `alcoholContent` / `alcohol_content`
- `vintage`
- Category values: `beer`, `wine`, `spirits`, `soft-drinks`, `bottled-water`

### 5.2 Database Schema — `prisma/schema.prisma` (if using Prisma)

**ADD to Product model:**
```prisma
model Product {
  // existing fields...
  brand           String?
  concentration   String?          // 'EDT' | 'EDP' | 'Parfum' | 'Cologne' | 'Body Mist'
  scentFamily     String?
  scentNotesTop   String[]         // array of note names
  scentNotesHeart String[]
  scentNotesBase  String[]
  longevity       String?
  sillage         String?
  occasion        String[]
  gender          String?          // 'mens' | 'womens' | 'unisex'
}
```

**REMOVE from Product model (if present):**
```prisma
// DELETE these fields:
alcoholContent  Float?
vintage         Int?
brewery         String?
winery          String?
packType        String?   // was 'single' | 'pack' | 'crate'
```

**UPDATE ProductVariant model:**
```prisma
model ProductVariant {
  id          String  @id @default(cuid())
  productId   String
  size        String  // '30ml' | '50ml' | '100ml' | '200ml'  (was 'Single Bottle' | 'Pack' | 'Crate')
  price       Float
  originalPrice Float?
  inStock     Boolean @default(true)
  // existing relations...
}
```

Run migration after schema changes:
```bash
npx prisma migrate dev --name "fragrance-product-schema"
npx prisma generate
```

---

## 6. ADMIN PANEL CHANGES

The PDFs show an "Admin" link in the footer. Assuming a standard admin dashboard exists at `/admin`.

### 6.1 Product Create/Edit Form — `app/admin/products/[id]/page.tsx`

**ADD these form fields:**

```tsx
// Brand input (text field)
<FormField name="brand" label="Brand" placeholder="e.g. Chanel, Dior, Tom Ford" />

// Concentration select
<FormSelect 
  name="concentration" 
  label="Concentration"
  options={['EDT', 'EDP', 'Parfum', 'Cologne', 'Body Mist']}
/>

// Scent Family select
<FormSelect
  name="scentFamily"
  label="Scent Family"
  options={['Floral','Woody','Oriental','Fresh','Citrus','Aquatic','Gourmand','Chypre','Fougère']}
/>

// Gender select
<FormSelect
  name="gender"
  label="Gender Category"
  options={[
    { value: 'mens',   label: "Men's" },
    { value: 'womens', label: "Women's" },
    { value: 'unisex', label: 'Unisex' },
  ]}
/>

// Scent Notes — Top, Heart, Base (tag inputs or comma-separated text)
<FormTagInput name="scentNotesTop"   label="Top Notes"   placeholder="Bergamot, Lemon..." />
<FormTagInput name="scentNotesHeart" label="Heart Notes"  placeholder="Rose, Jasmine..." />
<FormTagInput name="scentNotesBase"  label="Base Notes"   placeholder="Sandalwood, Musk..." />

// Longevity select (optional)
<FormSelect
  name="longevity"
  label="Longevity"
  required={false}
  options={['2-4hrs', '4-6hrs', '6-8hrs', '8+hrs']}
/>

// Sillage select (optional)
<FormSelect
  name="sillage"
  label="Sillage / Projection"
  required={false}
  options={['Intimate', 'Moderate', 'Strong', 'Massive']}
/>
```

**UPDATE Variant section of admin form:**
```tsx
// Old variant UI: "Single Bottle | Pack | Crate" tabs or dropdowns
// New variant UI: Size-based entries

// For each size variant, admin can add:
{variants.map((v, i) => (
  <div key={i} className="variant-row">
    <FormSelect
      name={`variants.${i}.size`}
      label="Size"
      options={['30ml', '50ml', '100ml', '200ml']}
    />
    <FormField name={`variants.${i}.price`}         label="Price (GH₵)"    type="number" />
    <FormField name={`variants.${i}.originalPrice`} label="Original Price" type="number" required={false} />
    <FormCheckbox name={`variants.${i}.inStock`}    label="In Stock" defaultChecked={true} />
  </div>
))}
<button type="button" onClick={addVariant}>+ Add Size</button>
```

**REMOVE from admin product form:**
- Pack type selector (Single/Pack/Crate)
- Alcohol content field
- Vintage/year field
- Brewery/winery field

### 6.2 Category Management in Admin

If admin has a categories management section, update category list to match Section 2.1. The six new categories should appear in any category dropdown/select within admin.

---

## 7. SEARCH & SEO

### 7.1 Search Index / Full-text Search

If the platform uses a search index (Algolia, Meilisearch, Typesense, or built-in), update the indexed fields:

**ADD to search index:**
- `brand`
- `concentration`
- `scentFamily`
- `scentNotesTop`, `scentNotesHeart`, `scentNotesBase` (searchable note names)

**REMOVE from search index:**
- `packType`
- `alcoholContent`
- `vintage`

### 7.2 Search Placeholder Text

```
Old: "Search for wines, beers, spirits..."
New: "Search fragrances, brands, notes..."
```

---

## 8. STRING REPLACEMENTS — GLOBAL FIND & REPLACE

Run these replacements across the **entire codebase** (all `.ts`, `.tsx`, `.js`, `.jsx`, `.json`, `.md` files):

| Find | Replace | Notes |
|---|---|---|
| `LiquorShop` | `The Perfume Store` | All occurrences |
| `LiquorShop Ghana` | `The Perfume Store Ghana` | All occurrences |
| `liquorshop` | `theperfumestore` | lowercase slug variant |
| `liquorshop.gh` | `theperfumestore.gh` | email domain |
| `admin@liquorshop.gh` | `hello@theperfumestore.gh` | contact email |
| `The Cellar Journal` | `The Scent Journal` | blog section |
| `Cellar Journal` | `Scent Journal` | partial mention |
| `cellar-journal` | `scent-journal` | URL slugs |
| `cellarJournal` | `scentJournal` | camelCase vars |
| `Premium Drinks` | `Luxury Fragrances` | hero/meta copy |
| `Delivered to Your Door` | `Delivered to Your Door` | keep (still valid) |
| `wines, spirits, and craft beers` | `luxury fragrances` | tagline |
| `wines, spirits` | `fragrances` | partial |
| `Delivering excellence` | `Curating excellence` | tagline |
| `All Products` | `All Fragrances` | nav/footer link labels |
| `legal drinking age` | *(delete whole sentence)* | age gate text |
| `Drink responsibly` | *(delete whole sentence)* | age gate text |
| `18+` | *(delete — context-dependent)* | any age restriction UI |
| `18 Only` | *(delete)* | age gate label |
| `chilled on arrival` | `sealed on arrival` | promise pillar |
| `Chilled on Arrival` | `Sealed & Secure` | promise pillar title |
| `Single Bottle` | `50ml` | variant label default |
| `Pack` | *(remove from variant options)* | variant type |
| `Crate` | *(remove from variant options)* | variant type |
| `Select Size / Pack` | `Select Size` | product page label |
| `Ghana's premier online destination for premium wines` | `Ghana's premier online destination for authentic luxury fragrances` | about/footer text |

---

## 9. FILE DELETION CHECKLIST

The following files or code blocks should be fully deleted:

| File / Code | Reason |
|---|---|
| `components/AgeGate.tsx` (or equiv.) | Age gate removed |
| `components/AgeVerification.tsx` (or equiv.) | Age gate removed |
| Any `ageGate`-related Zustand store slice | Age gate state |
| Any `age-gate` API route | Age gate backend |
| `localStorage.setItem('ageVerified', ...)` usages | Age gate persistence |
| Old category constants with beer/wine/spirits | Replaced in Section 2.1 |
| Seed data with liquor products | Replaced in Section 2.2 |

---

## 10. IMPLEMENTATION ORDER FOR LLM

Execute changes in this sequence to avoid broken states:

```
Step 1:  Update tailwind.config.ts (colors)                     [Section 1.1]
Step 2:  Update app/layout.tsx (fonts, metadata)                [Section 1.2, 4.1]
Step 3:  Update globals.css (CSS variables)                     [Section 1.3]
Step 4:  Update constants/categories.ts                         [Section 2.1]
Step 5:  Update lib/types.ts (Product + Variant types)          [Section 2.2, 2.3]
Step 6:  Update prisma/schema.prisma + run migration            [Section 5.2]
Step 7:  Update seed file                                       [Section 2.4]
Step 8:  DELETE AgeGate component + all references              [Section 3.3]
Step 9:  Update Navbar component                                [Section 3.1]
Step 10: Update Footer component                                [Section 3.2]
Step 11: Update Homepage (app/page.tsx)                         [Section 3.4]
Step 12: Update ProductCard component                           [Section 3.5]
Step 13: Update Shop page + ShopSidebar                         [Section 3.6]
Step 14: Update Individual Product page                         [Section 3.7]
Step 15: Update Admin product form                              [Section 6.1]
Step 16: Update products API route                              [Section 5.1]
Step 17: Run global string replacements                         [Section 8]
Step 18: Delete deprecated files                                [Section 9]
Step 19: Update favicon/icons                                   [Section 4.2]
Step 20: Test all routes: /, /shop, /products/[slug], /admin    [Verification]
```

---

## 11. VERIFICATION CHECKLIST

After implementation, verify:

- [ ] No page contains the word "beer", "wine", "spirits", "liquor", "alcohol", "drinks" (except in payment context like "Cash on Delivery")
- [ ] Age gate does not appear anywhere — not on load, not in footer
- [ ] Nav shows: All Fragrances | Men's | Women's | Unisex & Niche | Gift Sets | Body Mists
- [ ] Footer shop column shows same 6 links as nav
- [ ] Footer copyright reads "The Perfume Store Ghana"
- [ ] Footer has NO 18+ warning box
- [ ] Product page size selector shows ml values (30ml / 50ml / 100ml / 200ml)
- [ ] Product page shows scent notes (Top / Heart / Base) section
- [ ] Product page shows concentration badge (EDP / EDT / etc.)
- [ ] Shop sidebar shows: Category, Price Range, Brands, Size, Concentration, Scent Family, Special Offers
- [ ] Shop sidebar does NOT show: Beer, Wine, Spirits, Soft Drinks, Bottled Water, Single/Pack/Crate
- [ ] Homepage hero has no drink references
- [ ] Homepage category tiles are Men's / Women's / Niche & Unisex
- [ ] "The Cellar Journal" appears nowhere — replaced by "The Scent Journal"
- [ ] Logo reads "The Perfume Store" everywhere
- [ ] Admin product form has brand, concentration, scent notes, size variants fields
- [ ] Tailwind build uses purple/gold palette, not amber/orange
- [ ] `npx tsc --noEmit` passes with no type errors
- [ ] `npx prisma validate` passes
```
