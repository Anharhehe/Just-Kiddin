# Project Context

## What This Repo Is
This workspace contains a full-stack kids e-commerce project called Just Kidin'. The frontend is a Next.js App Router app with TypeScript, React 19, Tailwind CSS 4, and custom contexts/hooks for theme, audience selection, and favourites. The backend is an Express + TypeScript API with Prisma, PostgreSQL, Supabase integration, JWT auth, and a favourites feature.

## Current Status
The frontend is actively developed and already has many route pages, shared components, and product data files. The backend is also present and implemented, including auth, favourites, Prisma schema, and compiled `dist/` output. The old assumption that the server was empty is no longer true.

## Tech Stack

### Frontend
- Next.js 16.2.9 with the App Router
- React 19.2.4
- TypeScript 5
- Tailwind CSS 4 through `@tailwindcss/postcss`
- `lucide-react` and `react-icons` for icons
- Google Fonts through CSS and inline font styles

### Backend
- Express 4
- TypeScript 5
- Prisma 6 with PostgreSQL
- Supabase for server-side auth/integration work
- JWT, bcryptjs, cors, helmet, cookie-parser, morgan, zod

## Repo Layout
```
Sanan/
├── client/
│   └── my-app/
└── server/
```

## Frontend File Inventory

### Root Frontend Config
| File | What it does |
|---|---|
| [client/my-app/package.json](client/my-app/package.json) | Defines the Next.js app name, scripts, and frontend dependencies. |
| [client/my-app/package-lock.json](client/my-app/package-lock.json) | Locks the frontend dependency graph for reproducible installs. |
| [client/my-app/next.config.ts](client/my-app/next.config.ts) | Holds Next.js project configuration. |
| [client/my-app/tsconfig.json](client/my-app/tsconfig.json) | Configures TypeScript for the frontend project. |
| [client/my-app/eslint.config.mjs](client/my-app/eslint.config.mjs) | ESLint flat config for frontend linting. |
| [client/my-app/postcss.config.mjs](client/my-app/postcss.config.mjs) | Connects Tailwind/PostCSS to the Next.js build. |
| [client/my-app/next-env.d.ts](client/my-app/next-env.d.ts) | Auto-generated Next.js TypeScript type declarations. |
| [client/my-app/README.md](client/my-app/README.md) | Frontend project README and starter documentation. |
| [client/my-app/.gitignore](client/my-app/.gitignore) | Git ignore rules for frontend build and cache files. |
| [client/my-app/AGENTS.md](client/my-app/AGENTS.md) | Agent instructions for working in the frontend workspace. |
| [client/my-app/CLAUDE.md](client/my-app/CLAUDE.md) | Claude-specific instructions for the frontend workspace. |
| [client/my-app/Context.md](client/my-app/Context.md) | This project context file. |

### Frontend App Root
| File | What it does |
|---|---|
| [client/my-app/app/layout.tsx](client/my-app/app/layout.tsx) | Root layout that applies metadata, global CSS, theme/audience providers, and the persistent shell. |
| [client/my-app/app/page.tsx](client/my-app/app/page.tsx) | Home page that shows the audience hero first, then filters products after the user selects newborns or toddlers. |
| [client/my-app/app/globals.css](client/my-app/app/globals.css) | Global styles, CSS variables, theme tokens, and base typography rules. |

### Frontend Shared Shell and UI
| File | What it does |
|---|---|
| [client/my-app/app/components/LayoutShell.tsx](client/my-app/app/components/LayoutShell.tsx) | Wraps every page with the shared header, main content area, and footer. |
| [client/my-app/app/components/header/page.tsx](client/my-app/app/components/header/page.tsx) | Global header with logo, navigation, dropdowns, theme toggle, cart/search/user icons, and mobile menu. |
| [client/my-app/app/components/footer/page.tsx](client/my-app/app/components/footer/page.tsx) | Global footer with brand copy, links, social icons, and newsletter signup UI. |
| [client/my-app/app/components/hero/page.tsx](client/my-app/app/components/hero/page.tsx) | Landing hero used to ask the visitor to choose newborns or toddlers. |
| [client/my-app/app/components/ProductDetailPage.tsx](client/my-app/app/components/ProductDetailPage.tsx) | Reusable product-detail template used by every dynamic product `[id]` page. |

### Frontend Contexts and Hooks
| File | What it does |
|---|---|
| [client/my-app/app/context/ThemeContext.tsx](client/my-app/app/context/ThemeContext.tsx) | Stores dark/light mode state, syncs it to `localStorage`, and toggles the `dark` class on `<html>`. |
| [client/my-app/app/context/AudienceContext.tsx](client/my-app/app/context/AudienceContext.tsx) | Stores the selected audience (`newborns` or `toddlers`) in `localStorage`. |
| [client/my-app/app/hooks/useFavourites.ts](client/my-app/app/hooks/useFavourites.ts) | Fetches, adds, and removes favourites through the backend API and exposes the favourite ID set. |

### Frontend Data Files
| File | What it does |
|---|---|
| [client/my-app/app/data/products.ts](client/my-app/app/data/products.ts) | Small homepage product list used for audience-based filtering on the landing page. |
| [client/my-app/app/data/demo.ts](client/my-app/app/data/demo.ts) | Larger demo catalog that powers category lists and product detail pages. |
| [client/my-app/app/data/zimysonline_products.csv](client/my-app/app/data/zimysonline_products.csv) | Raw product CSV source data for the catalog. |

### Frontend Top-Level Pages
| File | What it does |
|---|---|
| [client/my-app/app/about/page.tsx](client/my-app/app/about/page.tsx) | Static About page that explains the brand story, values, process, and CTA. |
| [client/my-app/app/accessories/page.tsx](client/my-app/app/accessories/page.tsx) | Accessories landing page placeholder. |
| [client/my-app/app/admin/page.tsx](client/my-app/app/admin/page.tsx) | Admin page for dashboard-style backend/admin interactions. |
| [client/my-app/app/auth/page.tsx](client/my-app/app/auth/page.tsx) | Authentication page for login and signup flows. |
| [client/my-app/app/cart/page.tsx](client/my-app/app/cart/page.tsx) | Cart page placeholder for shopping cart flow. |
| [client/my-app/app/checkout/page.tsx](client/my-app/app/checkout/page.tsx) | Checkout page placeholder for order placement flow. |
| [client/my-app/app/contactus/page.tsx](client/my-app/app/contactus/page.tsx) | Contact page with form, branding visuals, map, and store contact details. |
| [client/my-app/app/favourites/page.tsx](client/my-app/app/favourites/page.tsx) | Favourites page that shows saved products from the backend. |
| [client/my-app/app/newborns/page.tsx](client/my-app/app/newborns/page.tsx) | Newborns landing page with gender/category navigation. |
| [client/my-app/app/profile/page.tsx](client/my-app/app/profile/page.tsx) | User profile page for viewing and updating account data. |
| [client/my-app/app/toddlers/page.tsx](client/my-app/app/toddlers/page.tsx) | Toddlers landing page with gender/category navigation. |

### Frontend Static Assets
| File | What it does |
|---|---|
| [client/my-app/public/1.png](client/my-app/public/1.png) | Static image asset used for storefront visuals. |
| [client/my-app/public/2.png](client/my-app/public/2.png) | Static image asset used for storefront visuals. |
| [client/my-app/public/3.png](client/my-app/public/3.png) | Static image asset used for storefront visuals. |
| [client/my-app/public/brand.jpeg](client/my-app/public/brand.jpeg) | Brand image asset. |
| [client/my-app/public/contactus.png](client/my-app/public/contactus.png) | Contact page artwork. |
| [client/my-app/public/demo.png](client/my-app/public/demo.png) | Main demo product image used throughout catalog pages. |
| [client/my-app/public/demo2.png](client/my-app/public/demo2.png) | Secondary demo product image. |
| [client/my-app/public/full_logo.png](client/my-app/public/full_logo.png) | Full logo image. |
| [client/my-app/public/logo.png](client/my-app/public/logo.png) | Compact logo image used in the header. |
| [client/my-app/public/favicon.ico](client/my-app/public/favicon.ico) | Browser favicon. |
| [client/my-app/public/file.svg](client/my-app/public/file.svg) | Default Next.js starter SVG asset. |
| [client/my-app/public/globe.svg](client/my-app/public/globe.svg) | Default Next.js starter SVG asset. |
| [client/my-app/public/next.svg](client/my-app/public/next.svg) | Default Next.js starter SVG asset. |
| [client/my-app/public/vercel.svg](client/my-app/public/vercel.svg) | Default Next.js starter SVG asset. |
| [client/my-app/public/window.svg](client/my-app/public/window.svg) | Default Next.js starter SVG asset. |

### Frontend Route Families
The app uses the Next.js App Router, so every route is a `page.tsx` file.

#### Newborns Route Family
| File pattern | What it does |
|---|---|
| [client/my-app/app/newborns/page.tsx](client/my-app/app/newborns/page.tsx) | Top-level newborns landing page. |
| [client/my-app/app/newborns/boys/bibs/page.tsx](client/my-app/app/newborns/boys/bibs/page.tsx) | Newborn boys bibs list page. |
| [client/my-app/app/newborns/boys/bibs/[id]/page.tsx](client/my-app/app/newborns/boys/bibs/[id]/page.tsx) | Newborn boys bib product detail page. |
| [client/my-app/app/newborns/boys/blankets/page.tsx](client/my-app/app/newborns/boys/blankets/page.tsx) | Newborn boys blankets list page. |
| [client/my-app/app/newborns/boys/blankets/[id]/page.tsx](client/my-app/app/newborns/boys/blankets/[id]/page.tsx) | Newborn boys blanket detail page. |
| [client/my-app/app/newborns/boys/bodysuits/page.tsx](client/my-app/app/newborns/boys/bodysuits/page.tsx) | Newborn boys bodysuits list page. |
| [client/my-app/app/newborns/boys/bodysuits/[id]/page.tsx](client/my-app/app/newborns/boys/bodysuits/[id]/page.tsx) | Newborn boys bodysuit detail page. |
| [client/my-app/app/newborns/boys/caps/page.tsx](client/my-app/app/newborns/boys/caps/page.tsx) | Newborn boys caps list page. |
| [client/my-app/app/newborns/boys/caps/[id]/page.tsx](client/my-app/app/newborns/boys/caps/[id]/page.tsx) | Newborn boys cap detail page. |
| [client/my-app/app/newborns/boys/footed-rompers/page.tsx](client/my-app/app/newborns/boys/footed-rompers/page.tsx) | Newborn boys footed rompers list page. |
| [client/my-app/app/newborns/boys/footed-rompers/[id]/page.tsx](client/my-app/app/newborns/boys/footed-rompers/[id]/page.tsx) | Newborn boys footed romper detail page. |
| [client/my-app/app/newborns/boys/headbands/page.tsx](client/my-app/app/newborns/boys/headbands/page.tsx) | Newborn boys headbands list page. |
| [client/my-app/app/newborns/boys/headbands/[id]/page.tsx](client/my-app/app/newborns/boys/headbands/[id]/page.tsx) | Newborn boys headband detail page. |
| [client/my-app/app/newborns/boys/jackets/page.tsx](client/my-app/app/newborns/boys/jackets/page.tsx) | Newborn boys jackets list page. |
| [client/my-app/app/newborns/boys/jackets/[id]/page.tsx](client/my-app/app/newborns/boys/jackets/[id]/page.tsx) | Newborn boys jacket detail page. |
| [client/my-app/app/newborns/boys/knit-sets/page.tsx](client/my-app/app/newborns/boys/knit-sets/page.tsx) | Newborn boys knit sets list page. |
| [client/my-app/app/newborns/boys/knit-sets/[id]/page.tsx](client/my-app/app/newborns/boys/knit-sets/[id]/page.tsx) | Newborn boys knit set detail page. |
| [client/my-app/app/newborns/boys/mittens/page.tsx](client/my-app/app/newborns/boys/mittens/page.tsx) | Newborn boys mittens list page. |
| [client/my-app/app/newborns/boys/mittens/[id]/page.tsx](client/my-app/app/newborns/boys/mittens/[id]/page.tsx) | Newborn boys mitten detail page. |
| [client/my-app/app/newborns/boys/receiving-blankets/page.tsx](client/my-app/app/newborns/boys/receiving-blankets/page.tsx) | Newborn boys receiving blankets list page. |
| [client/my-app/app/newborns/boys/receiving-blankets/[id]/page.tsx](client/my-app/app/newborns/boys/receiving-blankets/[id]/page.tsx) | Newborn boys receiving blanket detail page. |
| [client/my-app/app/newborns/boys/sleeping-bags/page.tsx](client/my-app/app/newborns/boys/sleeping-bags/page.tsx) | Newborn boys sleeping bags list page. |
| [client/my-app/app/newborns/boys/sleeping-bags/[id]/page.tsx](client/my-app/app/newborns/boys/sleeping-bags/[id]/page.tsx) | Newborn boys sleeping bag detail page. |
| [client/my-app/app/newborns/boys/sleepsuits/page.tsx](client/my-app/app/newborns/boys/sleepsuits/page.tsx) | Newborn boys sleepsuits list page. |
| [client/my-app/app/newborns/boys/sleepsuits/[id]/page.tsx](client/my-app/app/newborns/boys/sleepsuits/[id]/page.tsx) | Newborn boys sleepsuit detail page. |
| [client/my-app/app/newborns/boys/swaddles/page.tsx](client/my-app/app/newborns/boys/swaddles/page.tsx) | Newborn boys swaddles list page. |
| [client/my-app/app/newborns/boys/swaddles/[id]/page.tsx](client/my-app/app/newborns/boys/swaddles/[id]/page.tsx) | Newborn boys swaddle detail page. |
| [client/my-app/app/newborns/boys/thermal-sets/page.tsx](client/my-app/app/newborns/boys/thermal-sets/page.tsx) | Newborn boys thermal sets list page. |
| [client/my-app/app/newborns/boys/thermal-sets/[id]/page.tsx](client/my-app/app/newborns/boys/thermal-sets/[id]/page.tsx) | Newborn boys thermal set detail page. |
| [client/my-app/app/newborns/boys/zippers/page.tsx](client/my-app/app/newborns/boys/zippers/page.tsx) | Newborn boys zippers list page. |
| [client/my-app/app/newborns/boys/zippers/[id]/page.tsx](client/my-app/app/newborns/boys/zippers/[id]/page.tsx) | Newborn boys zipper detail page. |
| [client/my-app/app/newborns/girls/bibs/page.tsx](client/my-app/app/newborns/girls/bibs/page.tsx) | Newborn girls bibs list page. |
| [client/my-app/app/newborns/girls/bibs/[id]/page.tsx](client/my-app/app/newborns/girls/bibs/[id]/page.tsx) | Newborn girls bib product detail page. |
| [client/my-app/app/newborns/girls/blankets/page.tsx](client/my-app/app/newborns/girls/blankets/page.tsx) | Newborn girls blankets list page. |
| [client/my-app/app/newborns/girls/blankets/[id]/page.tsx](client/my-app/app/newborns/girls/blankets/[id]/page.tsx) | Newborn girls blanket detail page. |
| [client/my-app/app/newborns/girls/bodysuits/page.tsx](client/my-app/app/newborns/girls/bodysuits/page.tsx) | Newborn girls bodysuits list page. |
| [client/my-app/app/newborns/girls/bodysuits/[id]/page.tsx](client/my-app/app/newborns/girls/bodysuits/[id]/page.tsx) | Newborn girls bodysuit detail page. |
| [client/my-app/app/newborns/girls/caps/page.tsx](client/my-app/app/newborns/girls/caps/page.tsx) | Newborn girls caps list page. |
| [client/my-app/app/newborns/girls/caps/[id]/page.tsx](client/my-app/app/newborns/girls/caps/[id]/page.tsx) | Newborn girls cap detail page. |
| [client/my-app/app/newborns/girls/footed-rompers/page.tsx](client/my-app/app/newborns/girls/footed-rompers/page.tsx) | Newborn girls footed rompers list page. |
| [client/my-app/app/newborns/girls/footed-rompers/[id]/page.tsx](client/my-app/app/newborns/girls/footed-rompers/[id]/page.tsx) | Newborn girls footed romper detail page. |
| [client/my-app/app/newborns/girls/headbands/page.tsx](client/my-app/app/newborns/girls/headbands/page.tsx) | Newborn girls headbands list page. |
| [client/my-app/app/newborns/girls/headbands/[id]/page.tsx](client/my-app/app/newborns/girls/headbands/[id]/page.tsx) | Newborn girls headband detail page. |
| [client/my-app/app/newborns/girls/jackets/page.tsx](client/my-app/app/newborns/girls/jackets/page.tsx) | Newborn girls jackets list page. |
| [client/my-app/app/newborns/girls/jackets/[id]/page.tsx](client/my-app/app/newborns/girls/jackets/[id]/page.tsx) | Newborn girls jacket detail page. |
| [client/my-app/app/newborns/girls/knit-sets/page.tsx](client/my-app/app/newborns/girls/knit-sets/page.tsx) | Newborn girls knit sets list page. |
| [client/my-app/app/newborns/girls/knit-sets/[id]/page.tsx](client/my-app/app/newborns/girls/knit-sets/[id]/page.tsx) | Newborn girls knit set detail page. |
| [client/my-app/app/newborns/girls/mittens/page.tsx](client/my-app/app/newborns/girls/mittens/page.tsx) | Newborn girls mittens list page. |
| [client/my-app/app/newborns/girls/mittens/[id]/page.tsx](client/my-app/app/newborns/girls/mittens/[id]/page.tsx) | Newborn girls mitten detail page. |
| [client/my-app/app/newborns/girls/receiving-blankets/page.tsx](client/my-app/app/newborns/girls/receiving-blankets/page.tsx) | Newborn girls receiving blankets list page. |
| [client/my-app/app/newborns/girls/receiving-blankets/[id]/page.tsx](client/my-app/app/newborns/girls/receiving-blankets/[id]/page.tsx) | Newborn girls receiving blanket detail page. |
| [client/my-app/app/newborns/girls/sleeping-bags/page.tsx](client/my-app/app/newborns/girls/sleeping-bags/page.tsx) | Newborn girls sleeping bags list page. |
| [client/my-app/app/newborns/girls/sleeping-bags/[id]/page.tsx](client/my-app/app/newborns/girls/sleeping-bags/[id]/page.tsx) | Newborn girls sleeping bag detail page. |
| [client/my-app/app/newborns/girls/sleepsuits/page.tsx](client/my-app/app/newborns/girls/sleepsuits/page.tsx) | Newborn girls sleepsuits list page. |
| [client/my-app/app/newborns/girls/sleepsuits/[id]/page.tsx](client/my-app/app/newborns/girls/sleepsuits/[id]/page.tsx) | Newborn girls sleepsuit detail page. |
| [client/my-app/app/newborns/girls/swaddles/page.tsx](client/my-app/app/newborns/girls/swaddles/page.tsx) | Newborn girls swaddles list page. |
| [client/my-app/app/newborns/girls/swaddles/[id]/page.tsx](client/my-app/app/newborns/girls/swaddles/[id]/page.tsx) | Newborn girls swaddle detail page. |
| [client/my-app/app/newborns/girls/thermal-sets/page.tsx](client/my-app/app/newborns/girls/thermal-sets/page.tsx) | Newborn girls thermal sets list page. |
| [client/my-app/app/newborns/girls/thermal-sets/[id]/page.tsx](client/my-app/app/newborns/girls/thermal-sets/[id]/page.tsx) | Newborn girls thermal set detail page. |
| [client/my-app/app/newborns/girls/zippers/page.tsx](client/my-app/app/newborns/girls/zippers/page.tsx) | Newborn girls zippers list page. |
| [client/my-app/app/newborns/girls/zippers/[id]/page.tsx](client/my-app/app/newborns/girls/zippers/[id]/page.tsx) | Newborn girls zipper detail page. |

#### Toddlers Route Family
| File pattern | What it does |
|---|---|
| [client/my-app/app/toddlers/page.tsx](client/my-app/app/toddlers/page.tsx) | Top-level toddlers landing page. |
| [client/my-app/app/toddlers/boys/co-ord-sets/page.tsx](client/my-app/app/toddlers/boys/co-ord-sets/page.tsx) | Toddler boys co-ord sets list page. |
| [client/my-app/app/toddlers/boys/co-ord-sets/[id]/page.tsx](client/my-app/app/toddlers/boys/co-ord-sets/[id]/page.tsx) | Toddler boys co-ord set detail page. |
| [client/my-app/app/toddlers/boys/full-sleeve-shirts/page.tsx](client/my-app/app/toddlers/boys/full-sleeve-shirts/page.tsx) | Toddler boys full-sleeve shirts list page. |
| [client/my-app/app/toddlers/boys/full-sleeve-shirts/[id]/page.tsx](client/my-app/app/toddlers/boys/full-sleeve-shirts/[id]/page.tsx) | Toddler boys full-sleeve shirt detail page. |
| [client/my-app/app/toddlers/boys/hoodies/page.tsx](client/my-app/app/toddlers/boys/hoodies/page.tsx) | Toddler boys hoodies list page. |
| [client/my-app/app/toddlers/boys/hoodies/[id]/page.tsx](client/my-app/app/toddlers/boys/hoodies/[id]/page.tsx) | Toddler boys hoodie detail page. |
| [client/my-app/app/toddlers/boys/jackets/page.tsx](client/my-app/app/toddlers/boys/jackets/page.tsx) | Toddler boys jackets list page. |
| [client/my-app/app/toddlers/boys/jackets/[id]/page.tsx](client/my-app/app/toddlers/boys/jackets/[id]/page.tsx) | Toddler boys jacket detail page. |
| [client/my-app/app/toddlers/boys/pants/page.tsx](client/my-app/app/toddlers/boys/pants/page.tsx) | Toddler boys pants list page. |
| [client/my-app/app/toddlers/boys/pants/[id]/page.tsx](client/my-app/app/toddlers/boys/pants/[id]/page.tsx) | Toddler boys pant detail page. |
| [client/my-app/app/toddlers/boys/puffer-jackets/page.tsx](client/my-app/app/toddlers/boys/puffer-jackets/page.tsx) | Toddler boys puffer jackets list page. |
| [client/my-app/app/toddlers/boys/puffer-jackets/[id]/page.tsx](client/my-app/app/toddlers/boys/puffer-jackets/[id]/page.tsx) | Toddler boys puffer jacket detail page. |
| [client/my-app/app/toddlers/boys/rompers/page.tsx](client/my-app/app/toddlers/boys/rompers/page.tsx) | Toddler boys rompers list page. |
| [client/my-app/app/toddlers/boys/rompers/[id]/page.tsx](client/my-app/app/toddlers/boys/rompers/[id]/page.tsx) | Toddler boys romper detail page. |
| [client/my-app/app/toddlers/boys/shirts/page.tsx](client/my-app/app/toddlers/boys/shirts/page.tsx) | Toddler boys shirts list page. |
| [client/my-app/app/toddlers/boys/shirts/[id]/page.tsx](client/my-app/app/toddlers/boys/shirts/[id]/page.tsx) | Toddler boys shirt detail page. |
| [client/my-app/app/toddlers/boys/socks/page.tsx](client/my-app/app/toddlers/boys/socks/page.tsx) | Toddler boys socks list page. |
| [client/my-app/app/toddlers/boys/socks/[id]/page.tsx](client/my-app/app/toddlers/boys/socks/[id]/page.tsx) | Toddler boys sock detail page. |
| [client/my-app/app/toddlers/boys/sweaters/page.tsx](client/my-app/app/toddlers/boys/sweaters/page.tsx) | Toddler boys sweaters list page. |
| [client/my-app/app/toddlers/boys/sweaters/[id]/page.tsx](client/my-app/app/toddlers/boys/sweaters/[id]/page.tsx) | Toddler boys sweater detail page. |
| [client/my-app/app/toddlers/boys/sweatshirts/page.tsx](client/my-app/app/toddlers/boys/sweatshirts/page.tsx) | Toddler boys sweatshirts list page. |
| [client/my-app/app/toddlers/boys/sweatshirts/[id]/page.tsx](client/my-app/app/toddlers/boys/sweatshirts/[id]/page.tsx) | Toddler boys sweatshirt detail page. |
| [client/my-app/app/toddlers/boys/thermals/page.tsx](client/my-app/app/toddlers/boys/thermals/page.tsx) | Toddler boys thermals list page. |
| [client/my-app/app/toddlers/boys/thermals/[id]/page.tsx](client/my-app/app/toddlers/boys/thermals/[id]/page.tsx) | Toddler boys thermal detail page. |
| [client/my-app/app/toddlers/boys/trousers/page.tsx](client/my-app/app/toddlers/boys/trousers/page.tsx) | Toddler boys trousers list page. |
| [client/my-app/app/toddlers/boys/trousers/[id]/page.tsx](client/my-app/app/toddlers/boys/trousers/[id]/page.tsx) | Toddler boys trouser detail page. |
| [client/my-app/app/toddlers/girls/co-ord-sets/page.tsx](client/my-app/app/toddlers/girls/co-ord-sets/page.tsx) | Toddler girls co-ord sets list page. |
| [client/my-app/app/toddlers/girls/co-ord-sets/[id]/page.tsx](client/my-app/app/toddlers/girls/co-ord-sets/[id]/page.tsx) | Toddler girls co-ord set detail page. |
| [client/my-app/app/toddlers/girls/full-sleeve-shirts/page.tsx](client/my-app/app/toddlers/girls/full-sleeve-shirts/page.tsx) | Toddler girls full-sleeve shirts list page. |
| [client/my-app/app/toddlers/girls/full-sleeve-shirts/[id]/page.tsx](client/my-app/app/toddlers/girls/full-sleeve-shirts/[id]/page.tsx) | Toddler girls full-sleeve shirt detail page. |
| [client/my-app/app/toddlers/girls/hoodies/page.tsx](client/my-app/app/toddlers/girls/hoodies/page.tsx) | Toddler girls hoodies list page. |
| [client/my-app/app/toddlers/girls/hoodies/[id]/page.tsx](client/my-app/app/toddlers/girls/hoodies/[id]/page.tsx) | Toddler girls hoodie detail page. |
| [client/my-app/app/toddlers/girls/jackets/page.tsx](client/my-app/app/toddlers/girls/jackets/page.tsx) | Toddler girls jackets list page. |
| [client/my-app/app/toddlers/girls/jackets/[id]/page.tsx](client/my-app/app/toddlers/girls/jackets/[id]/page.tsx) | Toddler girls jacket detail page. |
| [client/my-app/app/toddlers/girls/pants/page.tsx](client/my-app/app/toddlers/girls/pants/page.tsx) | Toddler girls pants list page. |
| [client/my-app/app/toddlers/girls/pants/[id]/page.tsx](client/my-app/app/toddlers/girls/pants/[id]/page.tsx) | Toddler girls pant detail page. |
| [client/my-app/app/toddlers/girls/puffer-jackets/page.tsx](client/my-app/app/toddlers/girls/puffer-jackets/page.tsx) | Toddler girls puffer jackets list page. |
| [client/my-app/app/toddlers/girls/puffer-jackets/[id]/page.tsx](client/my-app/app/toddlers/girls/puffer-jackets/[id]/page.tsx) | Toddler girls puffer jacket detail page. |
| [client/my-app/app/toddlers/girls/rompers/page.tsx](client/my-app/app/toddlers/girls/rompers/page.tsx) | Toddler girls rompers list page. |
| [client/my-app/app/toddlers/girls/rompers/[id]/page.tsx](client/my-app/app/toddlers/girls/rompers/[id]/page.tsx) | Toddler girls romper detail page. |
| [client/my-app/app/toddlers/girls/shirts/page.tsx](client/my-app/app/toddlers/girls/shirts/page.tsx) | Toddler girls shirts list page. |
| [client/my-app/app/toddlers/girls/shirts/[id]/page.tsx](client/my-app/app/toddlers/girls/shirts/[id]/page.tsx) | Toddler girls shirt detail page. |
| [client/my-app/app/toddlers/girls/socks/page.tsx](client/my-app/app/toddlers/girls/socks/page.tsx) | Toddler girls socks list page. |
| [client/my-app/app/toddlers/girls/socks/[id]/page.tsx](client/my-app/app/toddlers/girls/socks/[id]/page.tsx) | Toddler girls sock detail page. |
| [client/my-app/app/toddlers/girls/sweaters/page.tsx](client/my-app/app/toddlers/girls/sweaters/page.tsx) | Toddler girls sweaters list page. |
| [client/my-app/app/toddlers/girls/sweaters/[id]/page.tsx](client/my-app/app/toddlers/girls/sweaters/[id]/page.tsx) | Toddler girls sweater detail page. |
| [client/my-app/app/toddlers/girls/sweatshirts/page.tsx](client/my-app/app/toddlers/girls/sweatshirts/page.tsx) | Toddler girls sweatshirts list page. |
| [client/my-app/app/toddlers/girls/sweatshirts/[id]/page.tsx](client/my-app/app/toddlers/girls/sweatshirts/[id]/page.tsx) | Toddler girls sweatshirt detail page. |
| [client/my-app/app/toddlers/girls/thermals/page.tsx](client/my-app/app/toddlers/girls/thermals/page.tsx) | Toddler girls thermals list page. |
| [client/my-app/app/toddlers/girls/thermals/[id]/page.tsx](client/my-app/app/toddlers/girls/thermals/[id]/page.tsx) | Toddler girls thermal detail page. |
| [client/my-app/app/toddlers/girls/trousers/page.tsx](client/my-app/app/toddlers/girls/trousers/page.tsx) | Toddler girls trousers list page. |
| [client/my-app/app/toddlers/girls/trousers/[id]/page.tsx](client/my-app/app/toddlers/girls/trousers/[id]/page.tsx) | Toddler girls trouser detail page. |

### Frontend Pattern Notes
- `app/components/*/page.tsx` is a non-standard component convention, but these files are imported as modules rather than used as route pages.
- The home page uses `AudienceContext` to decide whether to show the selector hero or a filtered product grid.
- `ThemeContext` and `AudienceContext` both persist state in `localStorage`.
- `useFavourites` talks to the backend using `NEXT_PUBLIC_API_BASE_URL` and falls back to `http://localhost:5000`.
- `ProductDetailPage` is the shared product page template for the dynamic `[id]` routes.

## Backend File Inventory

### Root Backend Config
| File | What it does |
|---|---|
| [server/package.json](server/package.json) | Backend package manifest, scripts, and dependencies. |
| [server/package-lock.json](server/package-lock.json) | Locks backend dependencies for repeatable installs. |
| [server/tsconfig.json](server/tsconfig.json) | TypeScript compiler settings for the backend. |
| [server/.env](server/.env) | Runtime environment variables for the API. |

### Prisma Files
| File | What it does |
|---|---|
| [server/prisma/schema.prisma](server/prisma/schema.prisma) | Prisma schema for the database models and datasource config. |
| [server/prisma/migrations/migration_lock.toml](server/prisma/migrations/migration_lock.toml) | Prisma migration lock file. |
| [server/prisma/migrations/20260712124414_init/migration.sql](server/prisma/migrations/20260712124414_init/migration.sql) | Initial database migration. |
| [server/prisma/migrations/20260720143947_add_favourites/migration.sql](server/prisma/migrations/20260720143947_add_favourites/migration.sql) | Migration that adds the favourites table and related constraints. |

### Backend Source Entry Files
| File | What it does |
|---|---|
| [server/src/app.ts](server/src/app.ts) | Builds the Express app, applies middleware, mounts API routes, and attaches error handlers. |
| [server/src/server.ts](server/src/server.ts) | Starts the API server by calling `app.listen()` on the configured port. |

### Backend Config and Utilities
| File | What it does |
|---|---|
| [server/src/config/env.ts](server/src/config/env.ts) | Loads and validates environment variables into a typed `env` object. |
| [server/src/utils/async-handler.ts](server/src/utils/async-handler.ts) | Wraps async route handlers so promise failures reach Express error middleware. |

### Backend Lib Files
| File | What it does |
|---|---|
| [server/src/lib/prisma.ts](server/src/lib/prisma.ts) | Exports a Prisma client instance for database access. |
| [server/src/lib/supabase.ts](server/src/lib/supabase.ts) | Exports a server-side Supabase client for integration/auth work. |

### Backend Middleware
| File | What it does |
|---|---|
| [server/src/middleware/auth.middleware.ts](server/src/middleware/auth.middleware.ts) | Protects routes by validating JWTs and attaching the authenticated user to the request. |
| [server/src/middleware/error.middleware.ts](server/src/middleware/error.middleware.ts) | Handles 404 and generic server errors. |

### Backend Controllers
| File | What it does |
|---|---|
| [server/src/controllers/auth.controller.ts](server/src/controllers/auth.controller.ts) | Implements register, login, profile, logout, and Google auth-related actions. |
| [server/src/controllers/favourites.controller.ts](server/src/controllers/favourites.controller.ts) | Implements favourites CRUD behavior. |

### Backend Routes
| File | What it does |
|---|---|
| [server/src/routes/index.ts](server/src/routes/index.ts) | Main router that connects the API sub-routes. |
| [server/src/routes/auth.routes.ts](server/src/routes/auth.routes.ts) | Auth endpoint definitions. |
| [server/src/routes/favourites.routes.ts](server/src/routes/favourites.routes.ts) | Favourites endpoint definitions. |

### Backend Build Output
| File or folder | What it does |
|---|---|
| [server/dist/](server/dist) | Compiled JavaScript output generated by the TypeScript build. |
| [server/dist/app.js](server/dist/app.js) | Compiled version of `src/app.ts`. |
| [server/dist/server.js](server/dist/server.js) | Compiled version of `src/server.ts`. |
| [server/dist/config/env.js](server/dist/config/env.js) | Compiled environment config. |
| [server/dist/controllers/auth.controller.js](server/dist/controllers/auth.controller.js) | Compiled auth controller. |
| [server/dist/controllers/favourites.controller.js](server/dist/controllers/favourites.controller.js) | Compiled favourites controller. |
| [server/dist/lib/prisma.js](server/dist/lib/prisma.js) | Compiled Prisma client wrapper. |
| [server/dist/lib/supabase.js](server/dist/lib/supabase.js) | Compiled Supabase client wrapper. |
| [server/dist/middleware/auth.middleware.js](server/dist/middleware/auth.middleware.js) | Compiled auth middleware. |
| [server/dist/middleware/error.middleware.js](server/dist/middleware/error.middleware.js) | Compiled error middleware. |
| [server/dist/routes/index.js](server/dist/routes/index.js) | Compiled router entry point. |
| [server/dist/routes/auth.routes.js](server/dist/routes/auth.routes.js) | Compiled auth routes. |
| [server/dist/routes/favourites.routes.js](server/dist/routes/favourites.routes.js) | Compiled favourites routes. |
| [server/dist/utils/async-handler.js](server/dist/utils/async-handler.js) | Compiled async handler helper. |

## How The Pieces Fit Together
### Frontend flow
1. `app/layout.tsx` boots the app with theme and audience providers.
2. `LayoutShell.tsx` keeps the header and footer visible across routes.
3. `page.tsx` uses audience selection to branch into either the hero or the filtered home grid.
4. Category pages render product lists from `app/data/demo.ts`.
5. Dynamic `[id]` routes reuse `ProductDetailPage.tsx`.
6. Favourites and auth-related pages talk to the backend API.

### Backend flow
1. `server.ts` starts the Express server.
2. `app.ts` wires middleware, `/api` routes, and global error handling.
3. `routes/index.ts` dispatches to auth and favourites subroutes.
4. Controllers use Prisma, Supabase, JWT, and Zod to implement behavior.
5. `dist/` is the compiled runtime output created by `tsc`.

## Important Project Notes
- The frontend uses the App Router only; there is no `pages/` directory.
- The audience selection is stored locally and is used to shape the home page experience.
- The favourites flow is backed by the Express API and assumes authentication through cookies or bearer tokens.
- The backend already has a database schema and migrations, so it is not an empty placeholder anymore.
- The product catalog uses a mixture of static assets, demo data, and a CSV source file.

## Progress Log
| Step | Status | Notes |
|---|---|---|
| Next.js client scaffold | Done | Frontend app created and configured. |
| Shared layout/shell | Done | Header, footer, and global layout are wired up. |
| Theme and audience state | Done | Both contexts persist to `localStorage`. |
| Product data layer | Done | CSV, demo data, and homepage product data are present. |
| Category and detail routes | Done | Newborn and toddler route families exist for boys and girls. |
| Favourites integration | Done | Frontend hook and backend API are connected. |
| Auth/profile/admin flows | Done | Frontend pages and backend support are both present. |
| Backend API scaffold | Done | Express, Prisma, Supabase, middleware, and routes are implemented. |
| Server build output | Done | `dist/` is checked in as compiled output. |

## Category Reference
### Newborns
- Bodysuits
- Sleepsuits
- Swaddles
- Blankets
- Mittens
- Caps
- Zippers
- Footed Rompers
- Knit Sets
- Thermal Sets
- Jackets
- Bibs
- Headbands
- Sleeping Bags
- Receiving Blankets

### Toddlers
- Hoodies
- Sweatshirts
- Co-ord Sets
- Rompers
- Jackets
- Sweaters
- Pants
- Full Sleeve Shirts
- Socks
- Trousers
- Thermals
- Shirts
- Puffer Jackets
