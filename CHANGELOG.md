# CHANGELOG — Vision / رؤية website

Every change to the site is logged here: date, what changed, which files, and why. Newest entries on top.

---

## 2026-10-24 — Netlify publishes only the public site
- New `netlify.toml`: at deploy time Netlify copies an allow-list into `dist/` (index.html, shop.html, product.html, css, js, data, assets) and publishes only that folder. Everything internal stays in the repository and on the computer but is not on the website: all `_` files/folders (_admin, _uiux-audit, _overlap-test, _phone-frame, _phone-link, _previews, _screens-2026-10-24, _preview-new-look.jpg), serve.ps1, CHANGELOG.md, netlify.toml, .gitignore. Extra lock: `/_*`, `/serve.ps1`, `/CHANGELOG.md` answer 404.
- The admin page (placement editor that saves through the local tools server) is therefore not public at all.
- `dist/` added to `.gitignore`. Checked locally with the same command (Git Bash): 3,160 files published, 0 internal files, every referenced path matches its file name exactly (Linux is case-sensitive).

---

## 2026-10-24 — the site is on GitHub
- Private repository https://github.com/visionruyaeg-ctrl/vision-store, branch `main` (first commit `06ffa18`, 3,180 files, ~206 MB).
- Installed Git 2.55 and GitHub CLI 2.103 (winget, owner's request); the owner signed in with `gh auth login` in the browser (account visionruyaeg-ctrl). Commits use the account's private noreply e-mail.
- `.gitignore`: `.env`, `.env.*`, `*.pem`, `*.key`, `node_modules/`, system files. Checked before upload: no passwords, API keys or tokens in the code.

---

## 2026-10-24 — phone link updated to v6 (owner: "قلل الصور واظبط الموقع زي الأول لحد ما انقله")
- The link (https://claude.ai/artifact/E3Dt6Ee2zpyXoARoebMSGj) holds at most 511 files, so it gets a lighter copy: all 121 designs with their 3 strongest colours, 800 px WebP only, no print close-ups, model photos at 600 px, banners at 960 px. 435 files (was 314); the 221 old files were removed. The full site keeps all 5 colours and every size.
- New `tools/stage_phone.py` (replaces `stage-phone.ps1`) builds `E:\claude code\phone-build`; old build kept in the backup (`phone-build-v3.3`).
- Code (works the same on the full site): image widths for model photos (`images.model.widths`) and banners (`models.banners.<c>.widths`) come from products.json, and the `<img>` fallback can be WebP (`images.<view>.fallbackExt`).
- Checked before publishing on a local copy (port 5702): all 406 image URLs the pages can request exist, no console errors.

---

## 2026-10-24 — fix: the star in the eye on the first-visit loader
- Removing the About section's CSS also removed the `.eye-stack` rules that put the star on top of the eye, so the loader showed the star under the eye. Restored them next to the loader styles (`css/main.css` §22). Checked: star centred inside the eye, glint animation runs.

---

## 2026-10-24 — v6: premium redesign, light 4:5 mockups, 34 new designs, new model photos, five colours on every product (NOT published to the phone link)
Backup before the work: `E:\claude code\vision-site-backup-2026-10-24\` (+ `data/products.before-v6.json`, `stale-product-images\`, `removed-old-model-photos\`).

**Review (phase 0) — main problems found:** cart/wishlist showed a "front" image that most designs don't have (broken image) · the store WhatsApp number is empty, so every order button opens WhatsApp without a recipient · homepage too long (11 sections) with the products competing with brand blocks · dark-studio product photos made the grid heavy · header icons duplicated by a bottom bar on phones · small collection tiles · 3-column grid with a "quick add" button on every card.

**Mockups (HoodieMockup)** — `tools/light-lib.ps1` (new), `tools/build-products.ps1`
- The same studio hoodies, now on a very light Ivory studio (exact removal of the old dark background with the saved garment masks), 4:5 frame (masters 1536 × 1920).
- Print boxes unchanged in real size, converted to the 4:5 frame: front wide 34.53 / 34.5 / 30.94 / 10.6 %, front small 44.28 / 34.5 / 11.44 / 9.2 %, back 20.47 / 32 / 59.06 / 41.8 % (left / top / width / height). Contain fit, never stretched or cropped. (`references/hoodie-placement.png` still isn't in the folders; the measurements stay those taken from `One Piece 1.png`.)
- Black-only artwork now gets an Ivory version for dark hoodies (AHLAN, Musameh, Ogre, Void), like the light-only artwork already got a Midnight version for white.
- Every product is offered in all five colours (owner's rule); the best colour opens first, then the colours the print reads well on, then the rest.
- Placement overrides to match the model photos: Heliopolis and Aswan on the back.

**Designs** — `tools/add_designs_2026_10_24.py`, `tools/process_designs.py` (new modes keyall / blackall)
- 34 new designs (121 live): Anime 3 (King of Curses, Toji, Killua), Identity 1 (Visionary), Egyptian 16 (Scarab, Headphone Sphinx, Golden Pharaoh, Nefertiti, Aswan, Shay B'Laban, Shay?, Corniche Snacks, My Daily Dose, Fresh Every Morning, Patience St., Cinema Nile, Heliopolis, Nile United, The Long River, Luck Is Earned), Typography 4 (Ahlan, Slow Mornings, Sunset Runners, Limited), Mix 5 (Do Not Disturb — front text + back headphones, Late But Here, Lost Motivation, Golden Mecha, Rainy Detective), Movies 2 (Dark Knight, Joker KILL), Vintage 2 (Mixtape for the Road, Shot on Film), Girly 1 (Bubbles).
- Background removed: Headphone Sphinx, Rainy Detective, Shot on Film (white), The Long River (teal, also inside the letters), Limited (black card). The others were already transparent (trimmed only). Originals in `Vision/originals`, cut-outs in `Vision/processed`.
- Held: Gundam poster (NASA + Bandai logos). Skipped: a second copy of the corn design, the رؤية logo jpg. Three files in the collection folder were model photos (used as such).

**Order** — strongest first, never two of the same collection side by side (`spread()` in `make_catalogue.py`); first row: Eye of Horus, Gojo, Ahlan, Back to the Future. Identity last. (AN-07, MV-10, TY-02 are still not in the folders.)

**Model photos** — `tools/process_models.py` → `assets/models/` (WebP 1122 + 600 px, 4:5; banners 1920 × 1080 + 960, 16:9 made by extending the plain studio wall so no face or print is cut; no filters or retouching)
- Homepage grid (6): The Long River, Ahlan, Late But Here, Shay?, Do Not Disturb, Mixtape. Banners: Egyptian (Heliopolis), Typography (Ahlan), Mix (Late But Here), Vintage (Shot on Film). Lifestyle shot as the last gallery image on 19 product pages.
- Removed from the site (moved to the backup): lookbook/campaign/sets/about-crew photos and the old product model photos. The hero photo stays.

**Design system** — `css/main.css` §24c (dead sections removed), `index.html`, `js/app.js`, `js/home.js`, `js/shop.js`, `js/product.js`, `js/i18n.js`, `product.html`, `shop.html`
- Homepage order: offer bar «خصم 15% على كل الهوديز — 799 بدل 950» (from `store.pricing`) → hero → «الأكثر تميزًا» → collections (4:5 cards, gradient name, hover zoom 1.04 + gold line; rail on phones) → models → trust row (4 promises in gold-hairline circles) → footer. Removed: ticker, about, send your design, mugs & portraits, see beyond, how it works.
- Midnight / Charcoal alternating sections; product page on Ivory (price in Midnight there for legibility, gold badge); Outfit Bold uppercase + Cairo SemiBold; 15–16 px body; 96 / 64 px section spacing.
- Header transparent over the hero, Midnight + blur on scroll; logo centred on phones (menu + search | logo | wishlist + bag); bottom bar removed. Floating WhatsApp button (Charcoal, Ivory icon). Footer: logo, collection links, social icons, Stone hairline.
- Cards: 4 / 3 / 2 columns; collection · name · price · 12 px colour dots (tap = recolours the card); heart on hover (always on phones); no quick add. Product page: lifestyle shot last, 36 px swatches, size buttons, size-guide popup, fixed order bar on phones, shipping / exchange / size-guide lines, 4 related designs from the same collection.
- Motion: 20 px / 400 ms fade-up, Charcoal skeleton while images load, no bounce or shake.
- Fixed: cart and wishlist images use the printed side.

**Checks (phase 8):** 121 designs × 5 colours built (2,104 WebP + JPG fallbacks), 2,899 image references checked — 0 missing; homepage 73 images load; overlap test home / shop / Egyptian / Anime / 3 product pages × 6 widths × AR/EN — 0 issues (the fixed order bar on phones and the WhatsApp button are skipped like the old bottom bar: they are opaque overlays); no console errors; every icon is Lucide 1.5 px (20 px header / 18 px buttons); no emoji; no horizontal scroll at 360/380 px. Screenshots: `_screens-2026-10-24/` (desktop 1440 + phone 390, made with `_phone-frame.html` + headless Edge).

---

## 2026-10-21 — v5: new placement, brown, 67 new designs, strongest-first order, 799 price, model slots, Lucide + palette-only UI (NOT published to the phone link)
Backup before the work: `E:\claude code\vision-site-backup-2026-10-21\` (product images that are no longer used were moved to `…\stale-product-images\`, `data/products.before-catalogue.json` = the old catalogue).

**1. Hoodie placement** — `tools/build-products.ps1`
- Measured from the owner's reference (`references/hoodie-placement.png` was not in the folder; its boxes match `One Piece 1.png`, used for measurements only) and mapped onto our 3:4 studio photos by garment landmarks (neckline, pocket, hood tip, rib).
- Front wide logo: left 33.5 · top 34.5 · w 33 · h 10.6 % (≈ 26–28 cm on L, ends above the pocket). Front small/square logo: left 43.9 · top 34.5 · w 12.2 · h 9.2 % (max ≈ 10 cm, same top line). The box is chosen from the art's shape (aspect ≥ 1.6 = wide).
- Back: left 18.5 · top 32 · w 63 · h 41.8 % (≈ 32–35 cm wide, max ≈ 38–40 cm high, just under the hood). Art always "contain", centred, top-aligned — never stretched or cropped; ink follows the folds, no glow or shadow.
- Only printed sides are rendered: no front file → back only (no front/back switch on the card or product page); front + back → card shows the back, hover/swipe shows the front.

**2. Brown** — `#4A3428` «بني» added (studio photos `hoodie_brown_front/back.png` cut onto the dark studio). Colours: black `#202020`, white `#FFFFFF`, petrol `#185868`, burgundy «نبيتي» `#581820`, brown `#4A3428`. Brown uses the dark-fabric (ivory + gold) ink. Each design gets every colour it reads well on (contrast check).

**3. Designs** — `tools/process_designs.py`, `tools/designs-2026-10-21.json`, `tools/designs.json`
- 87 live designs (67 new). Originals copied to `E:\claude code\Vision\originals\`, cut-outs in `…\Vision\processed\` (+ `report.json`).
- New collections: «نوستالجيا / Nostalgia» and «بناتي / Girly» (folders existed in the owner's files).
- Held back (brand logos / third-party marks): Nike ×5, Supreme ×2, Tommy Hilfiger, Adidas, Balenciaga, Air Jordan, PlayStation, NASA ×2, IronGrind, Barça + Spotify, Al Ahly + Vodafone, one signed fan-art. Duplicates skipped (hisoka, astronaut, doom). AN-07, MV-10, TY-02 from the plan are not in the folders yet.

**4. Order** — `data/products.json` `"order"`, `js/app.js` (`liveProducts` sorted, `varietyColors`), `js/home.js`, `js/shop.js`
- Homepage grid «أقوى التصميمات» = first 12 designs (Identity excluded). Shop = one ranked grid in batches of 12 + collection shortcuts; Identity last (and on its own collection page). Neighbouring cards avoid repeating a colour.

**5. Price** — one place: `products.json → store.pricing { price: 799, compareAt: 950 }`. Cards + product page: 799 large, 950 struck through in Stone, badge «خصم 15%» gold on black (calculated, rounded down).

**6. Models** — lookbook rail + Midnight/Ivory sets removed from the homepage, model views removed from products and collection banners (hero + about photo kept). New `assets/models/` (see `README.txt`): `home-1…6` → «على الموديلز» grid, `banner-<collection>` → collection banner photo. Missing files show nothing.

**7. UI** — `css/main.css` §24b, `js/app.js`, `js/product.js`, `js/i18n.js`, all HTML
- Lucide icons everywhere (1.5px stroke, 20/22px), Lucide menu/close; no emoji.
- Colours limited to Midnight / Ivory / Desert Gold / Charcoal / Stone (old sand, bronze, red, green, sepia accents and mood colours remapped). Fonts: Cairo + Outfit only (Archivo removed).
- Cards: collection label above the name, more spacing, 4px corners, quiet 2% zoom, two per row on phones. Product page: 38px round swatches, larger size buttons, 56px order button, three icon lines (COD · DTF · 100% cotton milton).
- `tools/tools-server.ps1` admin rebuild now runs `tools/make_catalogue.py` (the old `update-catalogue.ps1` would undo the new order/pricing).
- Phones: colour + collection chips scroll sideways in one row. Menu item «Drop 01» → «المختارات / Top picks» (it opens the top-designs grid).

Checks: 933 WebP images converted (0 errors), 0 missing product images; overlap test home / shop / Anime / Nostalgia / Girly / 3 product pages × 6 widths × AR/EN → 120 runs, 0 issues; no horizontal scroll at 380px; model photo slots tested with temporary photos (shown when present, hidden when absent), then the test photos were removed. Not published to the phone link.

---

## 2026-10-13 — Homepage restored to the previous version (owner's request: "الرئيسية بس")
- `index.html` + `js/home.js` back to the 2026-10-09 (v3.3) homepage: campaign photo hero «لدينا رؤية / We have a VISION», Drop 01 grid, original section order, menu "Drop 01". Texts `drop.title`, `drop.text`, `nav.drop` restored in `js/i18n.js`.
- Everything else from 2026-10-12 stays: dark-studio product images, 3:4 frames, card hover/swipe, product page, admin page, print files.
- The new homepage (designs-first hero) is kept in `E:\claude code\vision-site-v4-homepage-2026-10-12\` if wanted later.
- Checked: page loads with no errors and no broken images (Drop 3 cards, 8 collection tiles, 7 lookbook photos). Not published to the phone link.

---

## 2026-10-12 — Designs first: new hero, unified dark mockups, exact print areas, auto front/back, admin + print files (v4, NOT published yet)

**Homepage (designs first, brand second)** — `index.html`, `js/home.js`, `css/main.css` §16d, `js/i18n.js`
- New hero "showcase": 5 featured hoodies (`"featured": true`: sukuna, gojo, spiderman, bttf, horus), BACK view, very large on a dark gradient, next designs peeking at the side; auto-rotates every 5 s (pauses on hover/touch/focus/off-screen, off for reduced motion), arrows + swipe, short headline "التصميم هو البطل. / Wear the art." + one "Shop the Drop" button. The logo is only in the header now.
- Order: hero → New Drops (6 latest designs, no identity basics) → Our picks (`"pick": true`; the title switches to **Best Sellers** automatically once products get `"bestSeller": true` — no fake best-seller claim) → collections → … → how it works → brand story + Midnight/Ivory sets at the bottom → trust.
- Menu "Drop 01" → "جديد / New". Hero preload of the old campaign photo removed.

**Mockups & print areas** — `tools/cutout-lib.ps1`, `tools/build-products.ps1` (v4), `tools/vision-lib.ps1`
- Real studio hoodies cut out of their light background and placed on a dark, softly-lit studio (#0D0D0E → #252526 spotlight + floor shadow): `Vision/bases-dark/`. The white hoodie can't be separated from the light wall, so it is made from the petrol photo (same pose, real folds) re-toned to white fabric.
- Canvas 768 × 1024 (3:4); masters 1536 × 2048; site WebP 480/800/1200 (quality .86), close-ups 600/1200.
- FRONT print area: left 30.2% · top 30.4% · width 40.2% · height 13.2% (owner's spec, centred chest).
- BACK print area: left 25% · top 38.5% · width 50% · height 41.5% — width as specified; top/height calibrated because on these photos the hood reaches 37.5% of the height (the spec's 25.8% top would print over the hood). Art "contain", centred, top-aligned.
- Print look: the ink follows the folds (a few px of displacement, fold shading) with cotton grain; inks keep their brightness on dark fabric (shading floor 0.9).
- Auto placement: two files → wordmark/badge front + illustration back; one file → horizontal (≥1.5:1) or front/badge/logo name = front only, otherwise back + Vision wordmark centred on the chest. Overrides in `tools/work/placement-overrides.json`.
- Product images: cards show the back; desktop hover → front; **phones: swipe the card sideways** (front loaded on first swipe, two dots show which side). Product page: Back · Front · Print close-up (3:4 crop of a 3000 px render), click = full-screen zoom; gallery sized to fit the screen height on desktop. Dark photo background `--mock: #121213`.
- `products.json`: all image ratios 3/4; `printAreas` (%, cm, file px, DPI); per product `placement`, `featured`, `pick`.

**Admin** — `vision-site/_admin.html` + `tools/admin.cmd` (computer only): every design with its automatic placement + reason, menu Front / Back / Both, "Save & rebuild" rebuilds that product's images (`tools-server.ps1` POST /__rebuild/<id>) and WebP. Tested end to end.

**Print files** — `tools/print-files.ps1` → `E:\claude code\print-files\<id>\front.png` (4250 × 1890) / `back.png` (5315 × 8270), transparent, 300 DPI, `spec.json` with placement, area %/cm, source px and upscale factor. (First run drew the art at the left edge — PowerShell `$W`/`$w` clash — regenerated centred.) Back files are upscaled ~1.6–2.1× from the ~4000 px designs.

**Not changed (needs the owner):** sizes stay **M–2XL** (the brief says S–XXL; earlier rule says M–2XL only) · fabric weight (g/m²) and a returns policy are not written anywhere — not invented · prices unchanged (800) · no products removed.

Checks: overlap test home / Anime / product × 6 widths × AR/EN → 0 issues. Previews: `_previews/`.

---

## 2026-10-09 (night) — Collection pages froze on the phone: fixes + phone link updated (v3.3)

**Reported:** opening a collection on the site froze/hung.
Measured on the computer: no slow JavaScript (0 long tasks), so the causes were things only phones/the shared link struggle with:

| Cause | Fix | File |
|---|---|---|
| Collection/product/search addresses used `?c=…`, `?id=…`, `?q=…`. On the shared phone link's host such an address redirected to a sign-in page (tested) → a page that never loads. | All site links now use `#c=…`, `#id=…&color=…`, `#q=…` (the part after # never goes to the server). Old `?…` and `#c-…` links still work. Moving between collections re-renders in place; a related product reloads the page. | `js/shop.js`, `js/product.js`, `js/app.js`, `js/home.js`, `index.html` |
| Vintage banner grain was an SVG turbulence filter + colour blending + a huge inset shadow — phones redraw that on every scroll frame. | Static 128 px grain tile (`assets/brand/grain.png`), vignette as a plain gradient, no blend mode. | `css/main.css` §16c |
| A blur layer behind the heart on every card (backdrop-filter × number of cards). | Solid background instead. Same for lookbook captions. | `css/main.css` |
| Blurred top bar / bottom bar / colour filters on banner images. | Phones (≤767 px or touch): solid bars, no image filters, lighter shadows. | `css/main.css` |
| Scroll-reveal re-measured cards on every scroll event. | At most once per frame. | `js/app.js` |
| Loading screen relied on browser storage, which the shared link blocks → shown on every home visit. | Also remembered in `window.name` / skipped when coming from our own pages. | `js/app.js` |

Checks: home, Vintage, Anime, a product page × 6 widths × AR/EN → 0 issues; link tests (new #, old ?, old #c-, search, overview) all open the right page.

**Phone link** (same address) updated: versions 5 + 6; 314 files (WebP 480/800, close-ups 600 for phones); removed the 84 files of hidden/changed products. Staging script: `tools/stage-phone.ps1`.

---

## 2026-10-09 (evening) — Real hoodie photos, print-ready designs, new display (v3.2)

**Source:** `Downloads\Vision` (copied unchanged to `Vision\folder-2026-10-09\`). New in the folder: real blank hoodie photos front + back in the 4 colours (`hoodie_<colour>_<front|back>.png`, 1920 px), and `كوليكشن\<collection>\` with the chosen designs as print-ready transparent PNGs (~2500–4000 px). The old raw files were moved by the owner to `Downloads\TShirt_Prints_PNG_300dpi\1`.

### Products now on the site (from `كوليكشن`)
- Identity (unchanged): core, eye, ruya.
- Anime: hisoka, guy, gojo, gon, sukuna, trio (Zoro/Zaraki/Guts), culling (back only; chest = Vision logo).
- Movies & Series: doom, bttf, noir, fightclub, spiderman (stamp back + badge chest).
- Egyptian: horus.
- Vintage: dove, peacock, bust, horse.
- **Hidden** (not in `كوليكشن`, kept in products.json with `"hiddenReason"`, nothing deleted): onepiece, elbaf, kurapika, metro, whynotme, atari, batman (+ paisley, moon, gta already hidden).
- New empty collection **Sports** (folder exists, empty → "coming soon"); Typography and Mix are now empty too.

### Display
- Every product rebuilt on the **real studio photos** (4:5 crop, x 10–90%) — no more generated hoodies. Masters 1600 px; site WebP 480/800/1200 + JPG.
- Placement: chest art 14% of body width on the wearer's left chest; **back art 60% of the back width** (top of the owner's 55–60% rule, more eye-catching), top edge 25% of collar-to-hem below the collar, never closer than 5% to the hem.
- New **print close-up** view (rendered at 3000 px, 4:5 crop around the artwork) → product page order: Back · Front · Print close-up (· On model).
- Cards show the back; **on desktop the front fades in on hover** (phones keep one image to save data).
- Product photo background `--mock` = #F5F4F2 (same as the studio photos, no visible frame).
- "Send your design" uses the real blank fronts. Lookbook + new campaign photo `cairo_hoodie_campaign_refined.png` (7 photos); captions of photos whose products are hidden made generic.
- Colour rule: readable ≥ 65% (was 70%) since the new art is print-ready with its own outlines. Manual: eye prefers black (as before); guy, gon, trio + black (designed on black); bttf, noir, fightclub, spiderman stamp = panels (all 4 colours).
- Files: `tools/build-products.ps1`, `tools/designs.json`, `tools/update-catalogue.ps1`, `data/products.json`, `js/app.js` (altView / card-alt), `css/main.css` (card-alt, --mock, sports mood, 8-column collections), `js/i18n.js`, `index.html`, `assets/products/*`, `assets/base/*`, `assets/photos/campaign-cairo-*`.
- Checks: overlap test home / shop / Anime / Sports / 2 product pages × 6 widths × AR/EN → 0 issues; no broken images.
- Phone link NOT updated yet.

---

## 2026-10-09 (later) — Tried the "UI UX Pro Max" skill (no site changes)
- Installed the skill files only (`ui-ux-pro-max` folder from github.com/nextlevelbuilder/ui-ux-pro-max-skill, 47 files, 3.2 MB) into `C:\Users\Gamal Nofal\.claude\skills\ui-ux-pro-max`. Its search script needs Python, which is not installed (the `python` on this PC is only the Microsoft Store shortcut); Python was NOT installed.
- Turned its main rules into a dev-only check page: `_uiux-audit.html` (contrast, tap-target size, text size, alt text, heading order, sideways scroll, zoom). Ran on home / shop / Anime page / one product page at 375 px (AR) and 1440 px (EN).
- Passed: every image has alt text, heading order correct, no sideways scroll, zoom allowed, 7 pages × checks.
- Found (not fixed yet, waiting for approval): bronze small text on ivory = 3.5:1 (step numbers 1/2/3, 01/02/03, collection labels on the shop) — rule asks 4.5:1; small Latin labels 10–11.8px (rule: ≥12px); on phone, colour dots 26–34px, language button 36px tall, breadcrumb links, filter chips 42px (rule: 44px); product-name links on cards 22px tall on desktop (rule: ≥24px).

---

## 2026-10-09 — Site synced to the project folder + one display style for every design (v3.1)

**Source of truth:** `C:\Users\Gamal Nofal\Downloads\Vision\` (the folder you keep up to date). Every file was compared by content (MD5), not only by name.
**Backup first:** `E:\claude code\vision-site-backup-2026-10-09\` (684 files). New source files copied unchanged to `Vision\new-2026-10-09\`.

### 1. Found in the folder but missing from the site → added
| File(s) | Design (id) | Collection |
|---|---|---|
| `وش1.png` + `1 ضهر.PNG` | The Culling Game — chest logo + back poster (`culling`) | Anime |
| `4 وش.PNG` + `4 ضهر.PNG` | One Piece — Elbaf — chest skull + back poster (`elbaf`) | Anime |
| `GON-RAGE-RED-VL.jpg.webp` | Hunter Rage (`gon`) | Anime |
| `8.PNG` | Eighth Gate (`guy`) | Anime |
| `3 وش.png` + `3 ضهر.png` | Spider-Man — chest badge + back stamp (`spiderman`) | Movies & Series |
| `13.PNG` | Doctor Doom (`doom`) | Movies & Series |
| `Geometric Eye of Horus Emblem.png` | Eye of Horus (`horus`) | Egyptian |
| `اقسمه نصين مصريات.png` | Atari — split in two as the file name says: chest line + back line (`atari`) | Egyptian |
| `تتحط مع النبذه التعرفيه للبرند تحت.png` | Not a design — photo placed with the brand intro (About section), as the file name says | Home |

### 2. Updated photos
| New file | Replaces | Where |
|---|---|---|
| `Vision Streetwear Duo in a Golden Studio.png` | `download (15).png` (older version of the same campaign photo, no longer in the folder) | Hero + lookbook "Campaign" |
| `Anime Graphic Hoodie Studio Portrait.png`, `Sunlit Cairo Stairwell Hoodie.png`, `Golden Hour Back to the Future Hoodie.png`, `125.png` | `Urban Vision Streetwear Duo.png` (no longer in the folder) | Lookbook (now 6 photos) + collection banners (Anime, Vintage, Movies, Typography lead with their model photo) + product pages ("On model") |
| `تتحط مع النبذه…png` | Eye print close-up | About section |
All as WebP (640 / 1024–1122) + one JPG fallback. Model photo files themselves are byte-identical to last time.

### 3. Removed because the source is no longer in the folder (kept in the backup)
- One Piece "Showcase" view (`طريقة عرض القطعه على الموقع.png`) — `assets/products/onepiece/black-showcase-*` (3 files).
- Old hero / campaign photo (`download (15).png`) — `assets/photos/hero-original.png`, `hero-original-*.webp`, `hero-duo-*` (6 files).
- Lookbook "Standing · full set" (`Urban Vision Streetwear Duo.png`) — `assets/photos/lookbook-stand-*` (3 files).
- Not on the site before, nothing to remove: `1.png` (model photo), the PDFs / xlsx, character sheets, the reference mock-ups.
- No product was removed: every product's source is still in the folder (two were only renamed: `f517e…png → .jpg`, `ZORO….jpg.webp → .jpg`, same content).

### 4. One display style = the One Piece product (`tools/build-bases.ps1`, `tools/backs-lib.ps1`, `tools/build-products.ps1`)
- **Same hoodie for everyone:** the two halves of `One Piece 1.png` with the print area replaced by the surrounding fabric → blank straight FRONT and BACK. White / petrol / burgundy are made from it by mapping its brightness to each colour (learnt from the plain colour photos). Old plain bases were slightly angled and on different greys — no longer used.
- **Same background:** the One Piece studio grey (220,220,220) on every image.
- **Same size / framing:** 4:5, hoodie in the same place.
- **Placement rules kept:** chest = small art straight (0°) on the wearer's left chest, 13.5% of body width (the designer's own chest art for Culling Game, Elbaf, Spider-Man, Atari and the identity designs; the small Vision logo otherwise). Back = large art centred, top edge 23.5% of collar-to-hem below the collar, 57.5% of body width, aspect kept.
- **Same card:** every card shows the back (where the design is); chest-only designs (Core, Metro, Why Not Me) show the front. Product pages: Front + Back (+ On model). The "Print" preview and "close-up" views are no longer shown (files kept, unused).
- One Piece keeps its original photos (it is the reference).
- "Send your design" blank hoodies now use the same new hoodie.
- Colour decisions for the new designs: elbaf black (black, white) · culling black (black, white, burgundy) · gon black (black, white) · guy white (white, black) · spiderman white (white, black) · doom white (white, black) · atari white only (navy/blue text disappears on dark colours) · **horus black (manual)**: legibility on black measured 67% (limit 70%) but the art is Vision's own ivory + gold on midnight, so black is offered and preferred. whynotme best changed to petrol (colour of its model photo).

### 5. Checks
`_overlap-test.html`: home, shop, 4 collection pages, 3 product pages × 6 widths × AR/EN. (The test now ignores captions scrolled out of view inside the lookbook strip — they are clipped, not visible.)

### 6. Phone link updated (on request)
- Same link: https://claude.ai/artifact/E3Dt6Ee2zpyXoARoebMSGj (versions 3 + 4, uploaded in 2 parts — max 255 files per upload).
- The link holds at most 511 files, so the phone copy uses WebP 480 + 800 for product photos (the phone copy of `products.json` lists only those two sizes; on the computer the site still has 1200 too). Staged in `E:\claude code\phone-build\`.
- Removed from the link: the 105 old files the site no longer uses (old mock-ups, close-ups, One Piece showcase, old hero/lookbook photos). Result: 343 files, verified against the list.
- Includes the fan-art designs and the 3 hidden designs stay hidden.

### Notes for the owner
- **Low quality (prints will be soft):** Spider-Man stamp 322×397 and badge 327×336, Culling Game chest logo 498×272, Elbaf poster 410×616, Atari (cut from a mock-up: back ≈282×414, chest ≈142×186), Gon 500×625, Guy 549×625, Doom 519×615 — plus the ones listed on 2026-10-08.
- New fan-art: Culling Game (Jujutsu Kaisen), Elbaf (One Piece), Gon (Hunter x Hunter), Guy (Naruto), Spider-Man, Doctor Doom.
- The generated blank hoodies are retouched from one photo: the white one shows slight fabric blotches up close. A real photo shoot of blank front/back hoodies would be better.

---

## 2026-10-08 — New designs, 2 new collections (Vintage, Mix), collection moods, speed (v3.0)

**Backup first:** full copy of the site before any change → `E:\claude code\vision-site-backup-2026-10-08\` (183 files).
Nothing was deleted. New source files copied (originals untouched) to `Vision\new-2026-10-08\`.

### 1. Designs → collections (`data/products.json`)
| Collection | Designs (id) |
|---|---|
| Identity (الهوية) | core, eye, ruya |
| Anime (أنمي) | onepiece, hisoka, kurapika, sukuna, gojo, trio |
| Movies & Series (أفلام ومسلسلات) | batman, noir, fightclub, bttf |
| Egyptian (مصريات) | metro |
| Typography (تايبوجرافي) | whynotme |
| **Vintage (فينتدج) — new** | dove, peacock, bust, horse |
| **Mix (ميكس) — new** | (empty — shows "coming soon") |
| **Not sure → hidden** (`status: "review"`, suggested Mix) | paisley, moon, gta |

- Every product: name AR/EN, collection, price 800, colours, best match, views, image paths (pattern in `"_images"`).
- `fanArt: true` marks designs that use characters/titles owned by others; `store.showFanArt: false` hides all of them at once.
- Hidden products (`status: "review"` or no collection) never appear in the shop, search, home or "related".

**Colour decisions (contrast of the artwork on each fabric; colours where < 70% of the design stays readable are dropped):**
core white (all 4) · eye black (all 4) · ruya white (all 4) · hisoka black (all 4) · kurapika white (white, black) · sukuna black (black, white, burgundy) · gojo black (black, burgundy) · trio white (white only) · batman black (black only) · noir black (all 4, poster panel) · fightclub black (all 4, poster panel) · bttf burgundy (all 4, colour of the model photo) · metro white (all 4) · whynotme white (all 4) · dove white (white only) · peacock white (white, black) · bust black (black, white, burgundy) · horse white (white only).

### 2. Product images — one fixed placement rule for all (`tools/build-products.ps1`, `tools/designs.json`, `tools/vision-lib.ps1`)
- One clean blank base per colour (`Vision/hoodie_<colour>_plain.png`).
- **Front:** small art on the wearer's left chest, **13.5% of the body width**, 0° rotation, same spot on every product (identity designs use their own chest mark; the new designs carry the small Vision logo on the chest; metro / Why Not Me are chest prints).
- **Back:** coded (centred, top edge 23.5% below the collar, 57.5% of the back width, aspect kept, never stretched/rotated) but **not rendered yet — there are no blank BACK hoodie photos**. Add `Vision/bases/hoodie_<colour>_back.png` ×4 + `back-geometry.json` and re-run the build.
- Until then each product shows **Print** (the artwork on the fabric colour, background removed — no white box) + **Front** (+ **On model** photo for kurapika, bttf, whynotme, bust, gta).
- Old core/eye/ruya/metro front images were replaced by the new chest-placement versions (old "detail" close-ups kept and still shown).

### 3. Collection pages + moods (`shop.html`, `js/shop.js`, `css/main.css` §16c, `js/i18n.js`)
- New collection page: `shop.html?c=<id>` with a banner (name, mood line, description, count, 3 designs) and accents. Old `shop.html#c-anime` links redirect there. Home tiles open it.
- Moods change accents only (banner background/texture, accent colour, card tag); layout, fonts and navigation are the same:
  Identity gold glow · Anime crimson + halftone dots · Movies black & white film strip · Egyptian sand/bronze geometric · Typography ruled lines · **Vintage warm faded tones, film grain, vignette, cream frames** · **Mix petrol/burgundy collage blocks, multi-colour outlines**.
- Shop overview shows 3 designs per collection + "View the collection (n)".
- Product page: breadcrumb includes the collection; page picks up its collection accent; "related" = same collection first, max 6.
- Products without a written "why this colour" get an automatic explanation (`pdp.bestAuto` / `pdp.onlyAuto`).

### 4. Speed
- All product images as WebP in 3 sizes (480 / 800 / 1200; model photos 640 / 1100) + one JPG fallback — 352 new files. Originals untouched.
- Hero: same original picture, now WebP 640/1122 (83 KB instead of 1.35 MB PNG; PNG kept as fallback) (`index.html`).
- Every image lazy-loads except the hero and the first banner card; every image has width/height (no layout jumps).
- Collection pages load 6 designs at a time (more load automatically as you scroll, or "Show more").
- Bug fixed: product page opened on the 2nd picture instead of the 1st (`js/product.js`).
- Home collections grid: 7 per row on desktop, 4 on tablet, 2 on phone.

### 5. Checks
`_overlap-test.html` (dev only): home, shop, 4 collection pages, 4 product pages × 360/390/768/1024/1440/1920 × AR/EN → **0 overlapping text, 0 sideways scroll, 0 broken images, 0 JS errors.**

### Notes for the owner
- **Low-quality sources** (will print soft): trio 500×625, hisoka 408×618, kurapika 476×601, gta 489×629, batman 493×632, fightclub 736×963. Every design is below print-ready (~3500 px wide for 30 cm at 300 dpi).
- **Fan art (IP risk):** One Piece, Hisoka, Kurapika, Sukuna, Gojo, trio, Batman, Fight Club, Back to the Future, GTA VI.
- Public phone link not republished (waiting for approval).

---

## 2026-10-02 (evening) — Fix round: overlapping text, missing collections, original hero image (v2.1)

### 1. Overlapping headings — actual causes and fixes
Measured, not guessed: a script collected the box of every line of text on every page and reported any two
text boxes that intersect (plus anything sticking out of the screen), at 360 / 390 / 768 / 1024 / 1440 / 1920 px,
in Arabic and English, with collapsible panels both closed and open.

| Cause found | Where | Fix | File |
|---|---|---|---|
| **Arabic headings used line-height 1.05–1.15**, but Cairo's glyphs (hamza, dots, descending tails) need a box ~1.87em tall. The letters spilled into the text above and below. | Hero «لدينا», all section titles (`.h1`/`.h2`), «شوف أبعد.», card names, Arabic h3 | Arabic headings now 1.45–1.55 line-height plus `padding-block` (~0.2em) so every glyph stays inside its own box. English (Archivo) keeps its tight look. | `css/main.css` (§2 Base, §3 Type, §6 Hero, §13) |
| **English hero headline sat directly under the رؤية/VISION sign that is printed inside the hero photo** — two VISION wordmarks stacked on desktop. | Hero, LTR, ≥768px | In LTR the headline is limited to the left half of the screen; the VISION logo wraps under "WE HAVE A". | `css/main.css` (§6) |
| **When "We have a" wrapped, the logo on line 2 rose into line 1** (row gap 0.05em). | Hero, EN, 360px | Row gap 0.24em. | `css/main.css` (§6) |
| **Card footer didn't wrap**: at tablet width the colour swatches + "Quick add" didn't fit, so the button covered the "Best match" label and pushed 30px past the screen edge. | Product cards, 768px | Card footer wraps onto two rows. | `css/main.css` (§9) |
| "Best match" label under the first swatch stuck out of the screen at 360/390px (English). | Shop cards | Label anchored to the card edge for the first swatch. | `css/main.css` (§9) |
| One Piece has 3 views; the view buttons didn't fit at 360/390px. | Product page | View buttons wrap. | `css/main.css` (§21) |
| "Coming soon" title touched the line under it. | Shop, empty collections | Title on its own line with spacing. | `css/main.css` (§16b) |
| Side text in the two new dark sections was dark grey on black (contrast ~1.5:1). | Collections, Mugs | Side text is light grey on dark sections, dark grey on ivory. | `css/main.css` (§8) |
| "Best match" label contrast 3.5:1. | Cards on ivory | Darker bronze `#765824` (7:1). | `css/main.css` (§9) |
| Decorative stars ran behind the small line under «شوف أبعد.». | See Beyond section | Dark halo behind the text block. | `css/main.css` (§13) |

**Result:** 0 overlapping text boxes and 0 elements outside the screen on Home, Shop and all 5 product pages, at all 6 widths, Arabic and English. Screenshots reviewed: every home section at 390px (AR + EN) and 1440px (AR + EN); hero at 360, 768, 1024, 1920; shop + product pages at 390 and 1440.

**Animations can no longer hide content:** the "hidden before it scrolls in" state only switches on after the page confirms the scroll observer works (`html.reveal-on`); a scroll/resize fallback and a 1.2s timer reveal anything already on screen. Without JS everything is visible. (`js/app.js` `reveal()`, `css/main.css` §23)

### 2. Missing designs and sections
**Why they were missing:** the new design files were never in the project folder — they were in `C:\Users\Gamal Nofal\Downloads\Vision\`. They are now copied into `E:\claude code\Vision\` (unchanged).

Every image / design file found and where it appears now:

| File | What it is | Where on the site |
|---|---|---|
| `Vision/One Piece 1.png` | Anime design — front (One Piece logo) + back (Luffy Gear 5) on a black hoodie | **Anime** collection → product "One Piece — Luffy": Front and Back views (split from this image, not edited), shop + home collections tile |
| `Vision/مترو 1.png` | Egyptian design — «ميترو» in square geometric Arabic on a black hoodie | **Egyptian** collection → product "Metro": print lifted off the photo and DTF-printed on the 4 base hoodies |
| `Vision/طريقة عرض القطعه على الموقع.png` | Presentation board (hanging front/back + details) for One Piece | One Piece product page → "Showcase" view (shown whole, not cropped) |
| `Vision/hoodie_black_plain.png`, `hoodie_white_plain.png`, `hoodie_petrol_plain.png`, `hoodie_burgundy_plain.png` | Base hoodies | Base for every printed design (Identity + Metro), and shown **plain** in the new **Send your design** section |
| `Vision/download (15).png` | Campaign photo (logo backdrop) | Hero (restored original, see §3) and lookbook slide 3 |
| `Vision/Urban Vision Streetwear Duo.png` | Standing duo | Lookbook slide 2 |
| `Vision/ChatGPT Image Oct 1, 2026, 02_47_22 AM.png` | Split Midnight / Ivory sets | Lookbook slide 1 + Midnight / Ivory banners |
| `Vision/1.jpg`, `رؤية-[Recovered].jpg`, `رؤ1ية-[Recovered].jpg`, `Ruya Vision - Brand Guidelines.pdf` | Logos / guidelines | Source of the SVG logo (from the PDF) used everywhere |
| `Vision/Character Sheet_ The Girl.png`, `Urban Vision Character Sheet.png`, `ChatGPT … 02_49_12 AM.png`, `ChatGPT … 02_49_54 AM.png` | Model character sheets | Not used: they're reference sheets of many small shots, too low-res per crop |
| `Vision/Vision Winter Drop_ See Different (2).png`, `Vision Winter Drop_ Streetwear in Shadow.png` | Website reference mock-ups (UI baked in) | Not used (references, not photos) |
| `Vision/Ruya Vision - Behance PNGs.zip`, `Vision - دراسة جدوى v2.pdf`, `الوان الملابس الاساسية.txt` | Guidelines pages, feasibility study, colour list | Content source only |

**Not found anywhere on this computer** (searched E:\, Desktop, Documents, Downloads, OneDrive): design files for **Movies & Series**, **Typography**, and any **mug / portrait** photos. Those sections are live but show an honest "coming soon" panel / icon cards until files arrive.

**New sections**
- **Collections** (home strip + 5 sections on the shop page, deep links `shop.html#c-identity` … `#c-typography`): Identity / الهوية (3 designs), Anime / أنمي (1), Movies & Series / أفلام ومسلسلات (coming soon), Egyptian / مصريات (1), Typography / تايبوجرافي (coming soon).
- **Send your design** (home): plain base hoodie in the 4 colours, size required, WhatsApp message pre-filled with colour + size; price "confirmed after review" (no price was invented).
- **Mugs & portraits** (home): two cards (11 oz sublimation mug from the guidelines, printed portrait), WhatsApp order buttons.
- Files: `index.html`, `shop.html`, `js/home.js`, `js/shop.js`, `js/product.js` (views per design: front / back / detail / showcase), `js/app.js` (per-design image sizes, single-colour designs), `js/i18n.js`, `data/products.json` (`collections`, `collection` on every design, new designs `onepiece`, `metro`), `css/main.css` §16b, new assets in `assets/products/onepiece`, `assets/products/metro`, `assets/base`.

**Colour decisions (new designs)**
| Design | Default colour | Reason |
|---|---|---|
| Metro | **White** | Contrast scores black 14.2 / **white 17.6** / petrol 6.6 / burgundy 10.9 — midnight ink on white reads clearest. (Your original mock-up is on black; override in `products.json` if you prefer.) |
| One Piece | **Black only** | Only a photo on a black hoodie exists; the print file itself is needed to produce other colours. Shown as "Black only" with the reason on the product page. |

### 3. Front (hero) image restored
- The original front image — used in v1 and in the approved theme preview — is `Vision/download (15).png`. It is now served **byte-for-byte unchanged** as `assets/photos/hero-original.png` (SHA-256 identical to the source; no resize, no re-compression).
- Restored with the same display values it had (`.hero-media` width 58%, `object-position: center 22%`). The swap to the standing-duo photo made in v2 (not logged at the time — logged now) is reverted, and the lookbook order is back to: split sets → standing duo → campaign.
- Files: `index.html`, `css/main.css` §6, `js/i18n.js` (lookbook captions).

### 4. Phone link
- Republished the full site (home, shop, product pages, all images) to the same link: https://claude.ai/artifact/E3Dt6Ee2zpyXoARoebMSGj. A tiny launcher page (`_phone-link.html`) opens `home.html`; it is only used for the link, not by the site itself.

---

## 2026-10-02 — Premium upgrade (v2)

### 0. Audit of the previous version (all fixed in this pass)
| # | Problem found | Fix |
|---|---|---|
| 1 | The eye mark (`assets/eye.png`) was a raster crop that **cut off the sides of the O**. All logos were blurry PNGs cut from 1254px JPGs. | Extracted the original vector logo from the brand-guidelines PDF and rebuilt every logo as **SVG** with padded viewBoxes (`assets/brand/`). Nothing in the layout clips them (no `overflow:hidden` on logo containers). |
| 2 | Content hidden with `[hidden]` was still visible (CSS `display` overrode it). | Global `[hidden]{display:none!important}`. |
| 3 | Toast left a visible sliver at the bottom of the screen. | Toast uses opacity + transform and no pointer events while hidden. |
| 4 | Footer social links pointed to `#` (dead). Account icon in the reference look did nothing. | Instagram/TikTok link to `@ruya.vision`, WhatsApp opens a chat. Account icon removed (there are no accounts). |
| 5 | Sizes S and XXL offered; size was preselected, so it was never really chosen. | Sizes are **M, L, XL, 2XL** only, everywhere. A size must be chosen before Add to cart / WhatsApp. |
| 6 | Price shown as 700 (launch) in some places and 800 in others. | One price: **800 EGP** (`data/products.json`). |
| 7 | Checkout said "your order arrived" although nothing was sent anywhere. | Checkout now opens WhatsApp with the full order pre-filled and says plainly that the customer must send it. |
| 8 | "Notify me" form pretended to save the phone number (it saved nothing). | Replaced with a WhatsApp button that pre-fills the request. |
| 9 | Lookbook used blurry crops from the character sheets. | Removed; only full-resolution photos are used. |
| 10 | Scroll-reveal content stayed invisible if JS failed. | Hidden state only applies when JS is running (`.js .reveal`). |
| 11 | Mixed Arabic/English strings rendered in the wrong order (e.g. “Midnight وIvory”, English lines quoting «شوف أبعد.»). | Reworded the Arabic; Arabic quotes inside English are wrapped in Unicode bidi isolates. |
| 12 | Duplicate/unused files: old `app.js`, `style.css`, `preview-theme.html`, `share-preview.html`, 24 old raster assets. | Deleted (none were referenced by the live pages). |

### 1. Logo (brand rule: always the logo file, never retyped)
- **Added** `assets/brand/logo-stacked.svg`, `logo-ar.svg`, `logo-latin.svg`, `mark-eye.svg`, `mark-hamza.svg` (ink = `currentColor`, star = Desert Gold), plus `-ivory` / `-midnight` colour variants for `<img>` use, `mark-eye-o-ivory.svg` + `mark-eye-star.svg` (eye split so the star can animate), `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`, `cursor-eye.svg`.
- **Why:** the O / eye was clipped and every logo was a blurry raster. Source: the vector paths inside `Vision/Ruya Vision - Brand Guidelines.pdf` (page 1), smoothed into curves. Verified fully visible with safe padding at 16px (favicon) up to 2000px renders.

### 2. Typography
- Cairo (Arabic) + Outfit (Latin) kept as text faces. **Added Archivo** (variable width, used condensed at 68–72% width, 800 weight) for Latin display headlines only. Arabic headlines use Cairo 900 with tight leading.
- Fluid type scale with `clamp()` (`--fs-hero`, `--fs-h1`, `--fs-h2`, `--fs-h3`, `--fs-body`), letter-spaced uppercase labels.
- Files: `css/main.css`, font `<link>` in all pages.

### 3. Hero tagline
- Main line is now **“We have a [VISION logo]” / «لدينا [شعار رؤية]»**. The logo is inline SVG so it can animate: text rises in → logo wipes in to complete the sentence → the gold star glints, then blinks like an eye every ~8 s.
- «شوف أبعد. / See Beyond.» moved lower as the secondary line (night-sky section).
- Files: `index.html`, `css/main.css`, `js/i18n.js`.

### 4. Products, images and DTF look
- **New catalogue**: `data/products.json` — 3 designs from the brand identity, each in 4 hoodie colours, one product per design. Edit names, prices, colours, best match, sizes and the size guide there.
- **Designs (placeholders until real artwork):** Core Logo (stacked logo, centre chest), The Eye (eye mark + «شوف أبعد.»), Ru'ya (Arabic wordmark across the chest + small VISION). All taken from the guidelines.
- **DTF print rendering** (not embroidery): flat ink at 96% opacity on the fabric surface; fabric folds slightly bend and shade the print; cotton grain shows through; sharp edges; no stitches, no raised or 3D effect. Ink is ivory on dark hoodies and midnight on white so it stays legible.
- **Images:** WebP in 480/800/1200 (front) and 600/1200 (print close-up) with JPG fallbacks, `srcset`/`sizes`, lazy loading below the fold, fixed aspect ratios (no stretching or layout shift). Product photos all share the same angle, scale, print position and grey background. Total for every size and colour: ~2.3 MB, and each visitor only downloads what their screen needs.
- Files: `assets/products/{core,eye,ruya}/…`, `assets/photos/…`.

### 5.5 Colour decisions (best match = default colour everywhere)
Each artwork was measured against the actual fabric colour of each hoodie mockup (WCAG contrast ratio of every ink pixel). Score = average contrast × share of the artwork that stays legible (≥ 3:1).

| Design | Default colour | Score (black / white / petrol / burgundy) | Reason |
|---|---|---|---|
| Core Logo | **White** | 14.1 / **15.7** / 6.8 / 11.0 | Midnight ink on white gives the clearest read; only the small gold stars lose contrast (5% of the artwork). |
| The Eye | **Black** | **13.3** / 12.3 / 6.4 / 10.2 | The big gold star is 16% of the artwork and fades on white; on black the eye and the star are both fully legible. |
| Ru'ya | **White** | 14.2 / **15.7** / 6.9 / 11.0 | The large Arabic wordmark reads strongest as midnight ink on white. |

To override: change `bestMatch` (and the order of `colors`) for that design in `data/products.json`.

### 5.5 Sizes
- M, L, XL, 2XL only (selectors, quick add, size guide). Size is required; chosen size and colour appear in the cart and in the WhatsApp message.
- Size guide measurements are **approximate** (chest 60–69 cm, length 72–78 cm, sleeve 61–64 cm) and labelled as such until the supplier's spec arrives.

### 6. Icons
- One outline icon set (1.5px stroke, round caps) for search, heart, bag, home, shop, close, plus, minus, arrow, WhatsApp, Instagram, TikTok.
- Every icon does something: search expands into a field with live results; heart toggles the wishlist (fills gold); bag opens the cart; burger morphs into an X; language button switches AR/EN. Hover, pressed (scale) and focus (gold ring) states on all of them; cart and heart bounce when something is added.
- Cart and wishlist persist in `localStorage` with live counter badges (header, bottom nav, drawer tabs).
- WhatsApp order button opens WhatsApp with design name, colour, size, quantity, price and the product link.

### 7. Layouts
- **Mobile (≤767px):** bottom navigation (Home, Shop, Search, Wishlist, Cart), swipeable product rail and gallery, sticky Add-to-cart bar on product pages, 44px+ tap targets, full-width search under the header, no horizontal scroll.
- **Tablet (768–1023px):** 3-column grid, burger menu, single-column product page.
- **Desktop (1024px+):** wide editorial grid, hover zoom on cards, sticky gallery, eye-lens zoom, more breathing room; 1440px+ widens the container.
- Arabic RTL and English LTR on every layout (direction-aware gradients, arrows, drawer, marquee).

### 8. Code
- New structure: `index.html`, `shop.html`, `product.html`, `css/main.css`, `js/app.js` (shared), `js/home.js`, `js/shop.js`, `js/product.js`, `js/i18n.js`, `data/products.json`.
- Header, footer, drawer, bottom nav and size guide come from one template in `js/app.js`, so there's one place to edit.
- Semantic landmarks, one `h1` per page, skip link, `aria-label` on every icon button, radio-group semantics + arrow keys for swatches and sizes, focus trap in the drawer, `prefers-reduced-motion` respected (all motion off, content visible).
- `serve.ps1`: added `.json`, `.webp`, `.md` types. `.claude/launch.json`: preview port moved to 5700 (5500 is reserved by Windows on this machine).

### 9. Premium touches — keep or remove
Each one has a switch in `FEATURES` at the top of `js/app.js` (set to `false` to remove).

| Touch | What it does | Flag |
|---|---|---|
| Star-glint loader | First visit per session only: the eye mark appears and its star glints, then fades out. Capped at about 1.4 s and skipped with reduced motion. | `loader` |
| Eye cursor | Over product imagery the cursor becomes the VISION eye mark (desktop, CSS only, zero JS cost). | `eyeCursor` |
| Eye-lens zoom | On the product page an eye-shaped (oval, gold-rimmed) lens follows the pointer and shows the print at 2.6×, so customers can inspect the DTF detail. Touch screens get a fullscreen pinch / double-tap zoom instead. | `eyeLens` |
| Night-sky «شوف أبعد.» | The secondary tagline sits on a sky of four-point brand stars that twinkle and drift slowly while scrolling. | `nightSky` |
| Watching eye | In the About section the star inside the big eye follows the pointer like a pupil. | `pupil` |

### Tested (2026-10-02)
- Home, shop, product (3 designs) and unknown-product pages in Arabic and English. No console errors, no missing images, no horizontal scroll at 390, 634, 800, 1280 and 1440px.
- Colour swatches crossfade on cards and the product page (URL updates); quick add requires a size; Add to cart and WhatsApp are blocked until a size is chosen; cart quantity +/−/remove; wishlist toggle; badges; drawer tabs; checkout builds the WhatsApp message with colour and size; size-guide dialog; lightbox; eye lens; search live results + shop search; colour filter; language switch keeps the chosen size.
- Not measured: Lighthouse (it needs Node.js, which isn't installed and wasn't installed per the no-installs rule). Steps taken for performance: WebP + responsive sizes, hero image preloaded with `fetchpriority="high"`, lazy loading, no frameworks or libraries, deferred scripts, animations on transform/opacity only.

---

## 2026-10-01 — Theme preview (v1.1)
- Added `preview-theme.html` (dark cinematic look) and published a shareable copy. Fixed the logo placement on the hoodie mockups (centred chest). *Superseded by v2 and removed.*

## 2026-10-01 — First version (v1)
- Built the first one-page site from the brand guidelines and feasibility study: hero, hoodie configurator, collection, about, lookbook, order steps, cart and checkout drawer. Files: `index.html`, `style.css`, `app.js`, `assets/`. *Replaced by v2.*
