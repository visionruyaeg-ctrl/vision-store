/* =========================================================
   Vision / رؤية — shared site code
   - i18n (Arabic RTL default / English LTR)
   - catalogue data (data/products.json)
   - cart + wishlist (localStorage) and the drawer
   - header, search, mobile menu, bottom nav, toasts
   - product card component (swatches, best match, quick add)
   - WhatsApp order links
   - premium touches (loader, eye cursor …) behind FEATURES flags
   ========================================================= */
(() => {
  "use strict";

  /* ---------- feature flags (set to false to remove a touch) ---------- */
  const FEATURES = {
    loader: true,      // star-glint loading screen, first visit per session
    eyeCursor: true,   // cursor turns into the eye mark over product imagery (CSS, desktop only)
    eyeLens: true,     // eye-shaped zoom lens on the product page (desktop)
    nightSky: true,    // twinkling night-sky "See Beyond" section (home)
    pupil: true        // the star in the big eye mark follows the pointer like a pupil (home)
  };

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- storage (never throws) ---------- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode: keep in memory */ } }
  };

  /* ---------- i18n ---------- */
  let lang = store.get("vision.lang", "ar") === "en" ? "en" : "ar";
  function t(key, vars = {}) {
    let s = (window.I18N[lang] && window.I18N[lang][key]) ?? window.I18N.ar[key] ?? key;
    return s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ""));
  }
  const L = obj => (obj && (obj[lang] ?? obj.ar)) || "";
  function applyI18n(root = document) {
    $$("[data-i18n]", root).forEach(el => { el.textContent = t(el.dataset.i18n); });
    // data-i18n-attr="aria-label:a11y.cart;placeholder:search.placeholder"
    $$("[data-i18n-attr]", root).forEach(el => el.dataset.i18nAttr.split(";").forEach(pair => {
      const [attr, key] = pair.split(":"); if (attr && key) el.setAttribute(attr.trim(), t(key.trim()));
    }));
  }
  function setLang(next, silent) {
    lang = next;
    store.set("vision.lang", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    applyI18n();
    if (!silent) document.dispatchEvent(new CustomEvent("langchange"));
  }

  /* ---------- data ---------- */
  let dataPromise;
  const data = () => (dataPromise ||= fetch("data/products.json").then(r => {
    if (!r.ok) throw new Error("products.json " + r.status);
    return r.json();
  }));
  let DATA = null;

  const price = n => t("price", { n: Number(n).toLocaleString("en-US") });
  // price block: new price large, old price struck through in Stone, small gold-on-black discount badge
  const offPct = p => (p.compareAt > p.price ? Math.floor((p.compareAt - p.price) / p.compareAt * 100) : 0);
  const priceHTML = (p, cls = "") => `<span class="pr ${cls}"><b class="pr-now num">${price(p.price)}</b>${p.compareAt > p.price ? `<s class="pr-was num">${price(p.compareAt)}</s>` : ""}</span>`;
  const offBadge = p => (offPct(p) ? `<span class="off-badge">${t("off", { n: offPct(p) })}</span>` : "");
  const colorName = c => L(DATA.colors[c]);
  const product = id => DATA.products.find(p => p.id === id);

  /* products shown on the site: approved (not "review"), in a collection, and fan art only while store.showFanArt is on */
  const isLive = p => p.status !== "review" && !!p.collection && (DATA.store.showFanArt !== false || !p.fanArt);
  // display order: products.json "order" (strongest designs first, Identity last)
  const liveProducts = () => DATA.products.filter(isLive).sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  // colour variety for a grid in display order: each card takes its best colour unless one of the two cards
  // before it already shows that colour, then the next colour the design reads well on (p.colors is best-first)
  const varietyColors = list => {
    const out = new Map(), last = [];
    for (const p of list) {
      const c = p.colors.find(k => !last.includes(k)) || p.bestMatch;
      out.set(p.id, c); last.push(c); if (last.length > 2) last.shift();
    }
    return out;
  };

  /* responsive product image */
  // a product can override the default image sizes per view (e.g. One Piece: front / back / showcase)
  const imgSpec = (p, view) => (p.images && p.images[view]) || DATA.images[view];
  // "shared" views (the print close-up) are one picture for every colour: detail-<w>.webp
  // "model" = the lifestyle photo (assets/models/<file>.webp, -600 = phone size), the same for every colour
  function imgUrl(p, color, view, w, ext = "webp") {
    if (view === "model") return modelUrl(p.lifestyle, w);
    return imgSpec(p, view).shared ? `assets/products/${p.id}/${view}-${w}.${ext}` : `assets/products/${p.id}/${color}-${view}-${w}.${ext}`;
  }
  const modelUrl = (file, w) => `assets/models/${file}${w && w <= 600 ? "-600" : ""}.webp`;
  // model photos: WebP only (every current browser), 4:5
  // widths come from products.json images.model (the phone link only carries the 600 px files)
  function modelPicture(file, { sizes = "50vw", eager = false, alt = "" } = {}) {
    const ws = (DATA.images.model && DATA.images.model.widths) || [600, 1122];
    return `<picture><source type="image/webp" srcset="${ws.map(w => `${modelUrl(file, w)} ${w}w`).join(", ")}" sizes="${sizes}">` +
      `<img src="${modelUrl(file, 600)}" width="800" height="1000" alt="${alt}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"></picture>`;
  }
  const views = p => p.views || ["front", "detail"];
  const cardView = p => p.cardView || views(p)[0];
  // desktop: hovering a card shows the other side of the hoodie (back <-> front); phones keep one image (less data)
  // the other side of the hoodie (back <-> front): desktop = fades in on hover, phones = swipe the card sideways (loaded on first swipe)
  const altView = p => { const v = cardView(p) === "back" ? "front" : "back"; return views(p).includes(v) ? v : null; };
  const maxW = (p, view) => Math.max(...imgSpec(p, view).widths);
  function picture(p, color, view, { sizes = "(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw", eager = false, alt = "" } = {}) {
    if (view === "model") return modelPicture(p.lifestyle, { sizes, eager, alt });
    const spec = imgSpec(p, view);
    const srcset = spec.widths.map(w => `${imgUrl(p, color, view, w)} ${w}w`).join(", ");
    const [rw, rh] = spec.ratio.split("/").map(Number);
    return `<picture><source type="image/webp" srcset="${srcset}" sizes="${sizes}">` +
      `<img src="${imgUrl(p, color, view, spec.fallback, spec.fallbackExt || "jpg")}" width="${rw * 200}" height="${rh * 200}" alt="${alt}"` +
      ` ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"></picture>`;
  }

  /* ---------- icons: one set — Lucide (ISC licence), 24px grid, 1.5px stroke, round caps; no emoji anywhere ---------- */
  const lu = (body, cls = "") => `<svg class="lu${cls ? " " + cls : ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
  const ICON = {
    search: lu('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>'),
    heart: lu('<path class="fillable" d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>'),
    bag: lu('<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>'),
    home: lu('<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'),
    shop: lu('<path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>'),
    shirt: lu('<path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>'),
    menu: lu('<path d="M4 12h16"/><path d="M4 6h16"/><path d="M4 18h16"/>'),
    close: lu('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'),
    plus: lu('<path d="M5 12h14"/><path d="M12 5v14"/>'),
    minus: lu('<path d="M5 12h14"/>'),
    arrow: lu('<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>', "i-arrow"),
    chevronL: lu('<path d="m15 18-6-6 6-6"/>'),
    chevronR: lu('<path d="m9 18 6-6-6-6"/>'),
    whatsapp: lu('<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>'),
    instagram: lu('<rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><path d="M17.5 6.5h.01"/>'),
    tiktok: lu('<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>'),
    truck: lu('<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>'),
    ruler: lu('<path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2"/><path d="m11.5 9.5 2-2"/><path d="m8.5 6.5 2-2"/><path d="m17.5 15.5 2-2"/>'),
    cash: lu('<rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>'),
    swap: lu('<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>'),
    print: lu('<path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/>'),
    star: '<svg viewBox="0 0 60 100" aria-hidden="true"><path d="M30 0C32 38 38 46 60 50 38 54 32 62 30 100 28 62 22 54 0 50 22 46 28 38 30 0Z"/></svg>'   // brand star (identity element, not an icon)
  };

  /* ---------- toast ---------- */
  let toastTimer;
  function toast(msg) {
    const el = $("#toast"); if (!el) return;
    el.textContent = msg; el.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
  }
  // a short gold flash on the icon (no bounce)
  const bump = el => { if (!el || reduceMotion) return; el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); };

  /* ---------- open an external link (WhatsApp) in a new tab ---------- */
  function openExternal(url) {
    const a = Object.assign(document.createElement("a"), { href: url, target: "_blank", rel: "noopener" });
    document.body.appendChild(a); a.click(); a.remove();
  }
  function waLink(text) {
    const n = (DATA?.store.whatsapp || "").replace(/\D/g, "");
    return `https://wa.me/${n}?text=${encodeURIComponent(text)}`;
  }

  /* =========================================================
     Cart + wishlist
     ========================================================= */
  let cart = store.get("vision.cart", []).filter(i => i && i.id && i.size && i.color);
  let wish = store.get("vision.wish", []).filter(i => i && i.id);

  function saveCart() { store.set("vision.cart", cart); renderBadges(); renderDrawer(); }
  function saveWish() { store.set("vision.wish", wish); renderBadges(); renderDrawer(); syncHearts(); }

  function addToCart(id, color, size, qty = 1) {
    const p = product(id); if (!p) return;
    if (!size) { toast(t("toast.pickSize")); return false; }
    const key = `${id}|${color}|${size}`;
    const found = cart.find(i => i.key === key);
    if (found) found.qty = Math.min(20, found.qty + qty); else cart.push({ key, id, color, size, qty });
    saveCart();
    toast(t("toast.added", { name: L(p.name), color: colorName(color), size }));
    $$("[data-badge='cart']").forEach(b => bump(b.closest("button, a")));
    return true;
  }
  const inWish = id => wish.some(w => w.id === id);
  function toggleWish(id, color) {
    if (inWish(id)) { wish = wish.filter(w => w.id !== id); toast(t("toast.wishOff")); }
    else { wish.push({ id, color }); toast(t("toast.wishOn")); $$("[data-badge='wish']").forEach(b => bump(b.closest("button, a"))); }
    saveWish();
  }
  function syncHearts() {
    $$("[data-heart]").forEach(btn => {
      const p = product(btn.dataset.heart); if (!p) return;
      const on = inWish(p.id);
      btn.setAttribute("aria-pressed", on);
      btn.setAttribute("aria-label", t(on ? "a11y.removeWish" : "a11y.addWish", { name: L(p.name) }));
    });
  }
  function renderBadges() {
    const n = cart.reduce((s, i) => s + i.qty, 0);
    $$("[data-badge='cart']").forEach(b => { b.textContent = n; b.hidden = n === 0; });
    $$("[data-badge='wish']").forEach(b => { b.textContent = wish.length; b.hidden = wish.length === 0; });
  }

  /* =========================================================
     Site chrome: header, search, menu, drawer, bottom nav, footer
     (one template for every page)
     ========================================================= */
  const page = document.body.dataset.page || "home";
  const homeHref = page === "home" ? "#top" : "index.html";
  const sec = id => (page === "home" ? `#${id}` : `index.html#${id}`);

  function chrome() {
    $("#site-header").outerHTML = `
<a class="skip" href="#main" data-i18n="skip"></a>
<header class="header${page === "home" ? " is-over" : ""}" id="header">
  <p class="promo" id="promo"></p>
  <div class="wrap header-in">
    <button type="button" class="icon-btn menu-btn" id="menuBtn" aria-expanded="false" aria-controls="nav" data-i18n-attr="aria-label:a11y.menu"><span class="mb-open">${ICON.menu}</span><span class="mb-close">${ICON.close}</span></button>
    <a class="logo" href="${homeHref}" data-i18n-attr="aria-label:a11y.home">
      <img src="assets/brand/logo-stacked-ivory.svg" alt="" width="1148" height="603">
    </a>
    <nav class="nav" id="nav" aria-label="Main">
      <a href="shop.html" data-i18n="nav.shop"${page === "shop" ? ' aria-current="page"' : ""}></a>
      <a href="${sec("featured")}" data-i18n="nav.drop"></a>
      <a href="${sec("collections")}" data-i18n="nav.cols"></a>
      <a href="${sec("models")}" data-i18n="models.title"></a>
      <button type="button" class="lang-btn nav-lang" data-lang-toggle data-i18n="lang.short" data-i18n-attr="aria-label:a11y.lang"></button>
    </nav>
    <div class="actions">
      <form class="search" id="search" role="search" action="shop.html">
        <button type="button" class="icon-btn search-toggle" id="searchToggle" aria-expanded="false" aria-controls="searchInput" data-i18n-attr="aria-label:a11y.search">${ICON.search}</button>
        <input id="searchInput" name="q" type="search" autocomplete="off" data-i18n-attr="placeholder:search.placeholder;aria-label:a11y.search">
        <div class="search-results" id="searchResults" role="listbox" hidden></div>
      </form>
      <button type="button" class="lang-btn" id="langBtn" data-lang-toggle data-i18n="lang.short" data-i18n-attr="aria-label:a11y.lang"></button>
      <button type="button" class="icon-btn" data-open-drawer="wish" data-i18n-attr="aria-label:a11y.wishlist">${ICON.heart}<span class="badge" data-badge="wish" hidden></span></button>
      <button type="button" class="icon-btn" data-open-drawer="cart" data-i18n-attr="aria-label:a11y.cart">${ICON.bag}<span class="badge" data-badge="cart" hidden></span></button>
    </div>
  </div>
</header>`;

    $("#site-footer").outerHTML = `
<footer class="footer">
  <div class="wrap">
    <div class="f-grid">
      <div class="f-brand"><img src="assets/brand/logo-stacked-ivory.svg" alt="رؤية · VISION" width="1148" height="603" loading="lazy">
        <div class="social">
          <a class="icon-btn" id="igLink" href="#" target="_blank" rel="noopener" aria-label="Instagram">${ICON.instagram}</a>
          <a class="icon-btn" id="ttLink" href="#" target="_blank" rel="noopener" aria-label="TikTok">${ICON.tiktok}</a>
          <button type="button" class="icon-btn" id="waLinkFooter" aria-label="WhatsApp">${ICON.whatsapp}</button>
        </div>
      </div>
      <nav class="f-col f-links f-cols" aria-label="Collections">
        <h2 class="label" data-i18n="nav.cols"></h2>
        <div id="fCols"></div>
      </nav>
      <nav class="f-col f-links" aria-label="Footer">
        <h2 class="label" data-i18n="footer.links"></h2>
        <a href="shop.html" data-i18n="nav.shop"></a>
        <button type="button" class="link-btn" data-size-guide data-i18n="nav.sizes"></button>
        <a href="#" id="igText" target="_blank" rel="noopener" dir="ltr"></a>
      </nav>
    </div>
    <div class="f-bottom"><span data-i18n="footer.rights"></span><span class="lat see-beyond" dir="ltr">SEE BEYOND <i class="star-i"></i></span></div>
  </div>
</footer>

<button type="button" class="wa-float" id="waFloat" aria-label="WhatsApp">${ICON.whatsapp}</button>

<div class="scrim" id="scrim" hidden></div>
<aside class="drawer" id="drawer" aria-hidden="true" aria-labelledby="drawerTitle" role="dialog" aria-modal="true">
  <div class="drawer-head">
    <div class="tabs" role="tablist">
      <button type="button" role="tab" id="tabCart" aria-controls="paneCart" data-tab="cart"><span data-i18n="drawer.cart"></span> <i data-badge="cart" class="tab-n" hidden></i></button>
      <button type="button" role="tab" id="tabWish" aria-controls="paneWish" data-tab="wish"><span data-i18n="drawer.wish"></span> <i data-badge="wish" class="tab-n" hidden></i></button>
    </div>
    <h2 class="sr-only" id="drawerTitle" data-i18n="drawer.cart"></h2>
    <button type="button" class="icon-btn" id="drawerClose" data-i18n-attr="aria-label:a11y.close">${ICON.close}</button>
  </div>
  <section class="pane" id="paneCart" role="tabpanel" aria-labelledby="tabCart">
    <div class="pane-body" id="cartView"></div>
    <form class="pane-body checkout" id="checkout" hidden novalidate>
      <h3 class="co-title" data-i18n="co.title"></h3>
      <label for="coName" data-i18n="co.name"></label><input id="coName" name="name" autocomplete="name" required>
      <label for="coPhone" data-i18n="co.phone"></label><input id="coPhone" name="phone" type="tel" inputmode="tel" autocomplete="tel" required pattern="[0-9+ ]{10,15}">
      <label for="coGov" data-i18n="co.gov"></label><select id="coGov" name="gov" required></select>
      <label for="coAddr" data-i18n="co.address"></label><textarea id="coAddr" name="address" rows="2" autocomplete="street-address" required></textarea>
      <fieldset><legend data-i18n="co.pay"></legend>
        <label class="radio"><input type="radio" name="pay" value="cod" checked> <span data-i18n="co.cod"></span></label>
        <label class="radio"><input type="radio" name="pay" value="wallet"> <span data-i18n="co.wallet"></span></label>
      </fieldset>
      <p class="note" data-i18n="co.note"></p>
    </form>
    <div class="pane-body done" id="doneView" hidden>
      <img src="assets/brand/mark-eye-midnight.svg" alt="" width="64" height="78">
      <h3 data-i18n="co.doneTitle"></h3>
      <p data-i18n="co.doneText"></p>
      <button type="button" class="btn btn-dark" id="reopenWa">${ICON.whatsapp}<span data-i18n="co.reopen"></span></button>
      <button type="button" class="link-btn" id="copyOrder" data-i18n="co.copy"></button>
      <pre class="order-text" id="orderText"></pre>
    </div>
    <div class="pane-foot" id="cartFoot">
      <div class="total"><span data-i18n="cart.total"></span><b id="cartTotal"></b></div>
      <p class="note" data-i18n="cart.shipping"></p>
      <button type="button" class="btn btn-dark full" id="toCheckout"><span data-i18n="cart.checkout"></span>${ICON.arrow}</button>
      <button type="submit" form="checkout" class="btn btn-wa full" id="sendOrder" hidden>${ICON.whatsapp}<span data-i18n="co.send"></span></button>
      <button type="button" class="link-btn" id="backToCart" hidden data-i18n="co.back"></button>
    </div>
  </section>
  <section class="pane" id="paneWish" role="tabpanel" aria-labelledby="tabWish" hidden>
    <div class="pane-body" id="wishView"></div>
  </section>
</aside>

<dialog class="sheet" id="sizeGuide" aria-labelledby="sgTitle">
  <div class="sheet-head"><h2 id="sgTitle" data-i18n="sg.title"></h2><button type="button" class="icon-btn" data-close-dialog data-i18n-attr="aria-label:a11y.close">${ICON.close}</button></div>
  <div class="sg-table" id="sgTable"></div>
</dialog>

<div class="toast" id="toast" role="status" aria-live="polite"></div>`;
  }

  /* ---------- header behaviour ---------- */
  function bindHeader() {
    const header = $("#header");
    const onScroll = () => header.classList.toggle("is-scrolled", scrollY > 24);
    addEventListener("scroll", onScroll, { passive: true }); onScroll();

    // mobile menu: burger morphs into an X
    const nav = $("#nav"), menuBtn = $("#menuBtn");
    const setMenu = open => { nav.classList.toggle("open", open); menuBtn.setAttribute("aria-expanded", open); header.classList.toggle("menu-open", open); };
    menuBtn.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
    $$("a", nav).forEach(a => a.addEventListener("click", () => setMenu(false)));

    $$("[data-lang-toggle]").forEach(b => b.addEventListener("click", () => setLang(lang === "ar" ? "en" : "ar")));

    // search: icon expands into a field with live results
    const form = $("#search"), input = $("#searchInput"), toggle = $("#searchToggle"), results = $("#searchResults");
    const openSearch = open => {
      form.classList.toggle("open", open); toggle.setAttribute("aria-expanded", open);
      toggle.setAttribute("aria-label", t(open ? "a11y.closeSearch" : "a11y.search"));
      if (open) setTimeout(() => input.focus(), 60); else { results.hidden = true; }
    };
    toggle.addEventListener("click", () => openSearch(!form.classList.contains("open")));
    $$("[data-focus-search]").forEach(b => b.addEventListener("click", () => { scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }); openSearch(true); }));
    input.addEventListener("input", () => renderSearch(input.value));
    input.addEventListener("keydown", e => { if (e.key === "Escape") openSearch(false); });
    form.addEventListener("submit", e => { e.preventDefault(); const v = input.value.trim(); if (!v) { openSearch(false); return; } location.href = `shop.html#q=${encodeURIComponent(v)}`; if (page === "shop") location.reload(); });
    document.addEventListener("click", e => { if (!form.contains(e.target) && !e.target.closest("[data-focus-search]")) results.hidden = true; });

    $$("[data-open-drawer]").forEach(b => b.addEventListener("click", () => openDrawer(b.dataset.openDrawer)));
    $$("[data-size-guide]").forEach(b => b.addEventListener("click", openSizeGuide));
    $$("[data-close-dialog]").forEach(b => b.addEventListener("click", () => b.closest("dialog").close()));
    $("#sizeGuide").addEventListener("click", e => { if (e.target.id === "sizeGuide") e.target.close(); });

    // footer: real social links + WhatsApp notify
    const ig = DATA.store.instagram, tt = DATA.store.tiktok;
    $("#igLink").href = $("#igText").href = `https://instagram.com/${ig}`; $("#ttLink").href = `https://www.tiktok.com/@${tt}`; $("#igText").textContent = "@" + ig;
    const hello = () => openExternal(waLink(t("footer.notifyMsg")));
    $("#waLinkFooter").addEventListener("click", hello); $("#waFloat").addEventListener("click", hello);
    renderChromeText(); document.addEventListener("langchange", renderChromeText);
  }
  // offer bar (from store.pricing) + collection links in the footer
  function renderChromeText() {
    const pr = DATA.store.pricing || {}, off = pr.compareAt > pr.price ? Math.floor((pr.compareAt - pr.price) / pr.compareAt * 100) : 0;
    const promo = $("#promo"); promo.hidden = !off;
    if (off) promo.textContent = t("promo", { n: off, now: price(pr.price), was: price(pr.compareAt) });
    $("#fCols").innerHTML = DATA.collections.filter(c => DATA.products.some(p => p.collection === c.id && isLive(p)))
      .map(c => `<a href="shop.html#c=${c.id}">${L(c)}</a>`).join("");
  }

  function matches(p, q) {
    const hay = [p.id, p.name.ar, p.name.en, p.print.ar, p.print.en, ...p.colors.flatMap(c => [DATA.colors[c].ar, DATA.colors[c].en])].join(" ").toLowerCase();
    return q.toLowerCase().split(/\s+/).filter(Boolean).every(w => hay.includes(w));
  }
  function colorFromQuery(p, q) {
    const ql = q.toLowerCase();
    return p.colors.find(c => ql.includes(DATA.colors[c].ar) || ql.includes(DATA.colors[c].en.toLowerCase())) || p.bestMatch;
  }
  function renderSearch(q) {
    const box = $("#searchResults"); q = q.trim();
    if (!q) { box.hidden = true; return; }
    const hits = liveProducts().filter(p => matches(p, q));
    box.innerHTML = hits.length
      ? hits.map(p => { const c = colorFromQuery(p, q); return `<a role="option" href="product.html#id=${p.id}&color=${c}">${picture(p, c, cardView(p), { sizes: "56px" })}<span><b>${L(p.name)}</b><small>${colorName(c)} · ${price(p.price)}</small></span></a>`; }).join("") +
        `<a class="sr-all" href="shop.html#q=${encodeURIComponent(q)}">${t("search.all")} ${ICON.arrow}</a>`
      : `<p class="sr-none">${t("search.none", { q: q.replace(/</g, "&lt;") })}</p>`;
    box.hidden = false;
  }

  /* ---------- size guide ---------- */
  function renderSizeGuide() {
    const g = DATA.sizeGuide;
    $("#sgTable").innerHTML = `<table><thead><tr><th scope="col">${t("sg.size")}</th><th scope="col">${t("sg.chest")}</th><th scope="col">${t("sg.length")}</th><th scope="col">${t("sg.sleeve")}</th></tr></thead><tbody>` +
      g.rows.map(r => `<tr><th scope="row">${r.size}</th><td>${r.chest}</td><td>${r.length}</td><td>${r.sleeve}</td></tr>`).join("") +
      `</tbody></table><p class="note">${g.unit} · ${L(g.note)}</p>`;
  }
  function openSizeGuide() { renderSizeGuide(); $("#sizeGuide").showModal(); }

  /* ---------- drawer ---------- */
  let drawerTab = "cart", coStep = "cart", lastOrder = "", lastFocus = null;
  function openDrawer(tab = "cart") {
    lastFocus = document.activeElement;
    drawerTab = tab; if (coStep === "done") coStep = "cart";
    renderDrawer();
    $("#scrim").hidden = false;
    const d = $("#drawer"); d.classList.add("open"); d.setAttribute("aria-hidden", "false");
    document.body.classList.add("lock");
    setTimeout(() => $(`[data-tab="${tab}"]`).focus(), 50);
  }
  function closeDrawer() {
    const d = $("#drawer"); if (!d.classList.contains("open")) return;
    d.classList.remove("open"); d.setAttribute("aria-hidden", "true"); $("#scrim").hidden = true; document.body.classList.remove("lock");
    lastFocus?.focus?.();
  }
  function lineHTML(i) {
    const p = product(i.id); if (!p) return "";
    return `<li class="line">
      <a class="line-img" tabindex="-1" aria-hidden="true" href="product.html#id=${p.id}&color=${i.color}">${picture(p, i.color, cardView(p), { sizes: "72px" })}</a>
      <div class="line-info"><a href="product.html#id=${p.id}&color=${i.color}"><b>${L(p.name)}</b></a>
        <small>${t("cart.line", { color: colorName(i.color), size: i.size })}</small>
        <div class="qty sm"><button type="button" data-dec="${i.key}" aria-label="${t("cart.dec")}">${ICON.minus}</button><span>${i.qty}</span><button type="button" data-inc="${i.key}" aria-label="${t("cart.inc")}">${ICON.plus}</button></div>
      </div>
      <div class="line-end"><b class="num">${price(p.price * i.qty)}</b><button type="button" class="link-btn" data-rm="${i.key}">${t("cart.remove")}</button></div>
    </li>`;
  }
  function renderDrawer() {
    if (!DATA || !$("#drawer")) return;
    $$("[data-tab]").forEach(b => { const on = b.dataset.tab === drawerTab; b.setAttribute("aria-selected", on); b.tabIndex = on ? 0 : -1; });
    $("#paneCart").hidden = drawerTab !== "cart"; $("#paneWish").hidden = drawerTab !== "wish";
    $("#drawerTitle").textContent = t(drawerTab === "cart" ? "drawer.cart" : "drawer.wish");

    if (coStep !== "done" && !cart.length) coStep = "cart";
    $("#cartView").hidden = coStep !== "cart"; $("#checkout").hidden = coStep !== "checkout"; $("#doneView").hidden = coStep !== "done";
    $("#cartFoot").hidden = coStep === "done" || !cart.length;
    $("#toCheckout").hidden = coStep !== "cart"; $("#sendOrder").hidden = coStep !== "checkout"; $("#backToCart").hidden = coStep !== "checkout";

    $("#cartView").innerHTML = cart.length
      ? `<ul class="lines">${cart.map(lineHTML).join("")}</ul>`
      : `<div class="empty"><img src="assets/brand/mark-eye-midnight.svg" alt="" width="56" height="68"><p>${t("cart.empty")}</p><a class="btn btn-dark" href="shop.html">${t("cart.browse")}</a></div>`;
    $("#cartTotal").textContent = price(cart.reduce((s, i) => s + (product(i.id)?.price || 0) * i.qty, 0));

    $("#wishView").innerHTML = wish.length
      ? `<ul class="lines">${wish.map(w => { const p = product(w.id); if (!p) return ""; const c = w.color || p.bestMatch; return `<li class="line">
          <a class="line-img" tabindex="-1" aria-hidden="true" href="product.html#id=${p.id}&color=${c}">${picture(p, c, cardView(p), { sizes: "72px" })}</a>
          <div class="line-info"><a href="product.html#id=${p.id}&color=${c}"><b>${L(p.name)}</b></a><small>${colorName(c)} · ${price(p.price)}</small>
            <a class="link-btn" href="product.html#id=${p.id}&color=${c}">${t("wish.toCart")}</a></div>
          <div class="line-end"><button type="button" class="icon-btn heart" data-heart="${p.id}" aria-pressed="true">${ICON.heart}</button></div></li>`; }).join("")}</ul>`
      : `<div class="empty"><span class="empty-heart">${ICON.heart}</span><p>${t("wish.empty")}</p><a class="btn btn-dark" href="shop.html">${t("cart.browse")}</a></div>`;
    syncHearts();
  }
  function bindDrawer() {
    $("#drawerClose").addEventListener("click", closeDrawer);
    $("#scrim").addEventListener("click", closeDrawer);
    document.addEventListener("keydown", e => { if (e.key === "Escape") closeDrawer(); });
    $$("[data-tab]").forEach(b => {
      b.addEventListener("click", () => { drawerTab = b.dataset.tab; renderDrawer(); });
      b.addEventListener("keydown", e => { if (e.key === "ArrowLeft" || e.key === "ArrowRight") { drawerTab = drawerTab === "cart" ? "wish" : "cart"; renderDrawer(); $(`[data-tab="${drawerTab}"]`).focus(); } });
    });
    // keep focus inside the open drawer
    $("#drawer").addEventListener("keydown", e => {
      if (e.key !== "Tab") return;
      const f = $$("a[href], button:not([hidden]), input, select, textarea", $("#drawer")).filter(el => el.offsetParent !== null);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    });
    $("#drawer").addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      if (b.dataset.inc) { const i = cart.find(x => x.key === b.dataset.inc); i.qty = Math.min(20, i.qty + 1); saveCart(); }
      else if (b.dataset.dec) { const i = cart.find(x => x.key === b.dataset.dec); if (i.qty > 1) i.qty--; else cart = cart.filter(x => x !== i); saveCart(); }
      else if (b.dataset.rm) { cart = cart.filter(x => x.key !== b.dataset.rm); saveCart(); }
      else if (b.dataset.heart) { toggleWish(b.dataset.heart); }
    });
    $("#toCheckout").addEventListener("click", () => { coStep = "checkout"; renderDrawer(); $("#coName").focus(); });
    $("#backToCart").addEventListener("click", () => { coStep = "cart"; renderDrawer(); });
    $("#checkout").addEventListener("submit", e => {
      e.preventDefault();
      const f = e.target;
      if (!f.checkValidity()) { f.reportValidity(); return; }
      const v = Object.fromEntries(new FormData(f));
      const total = cart.reduce((s, i) => s + product(i.id).price * i.qty, 0);
      lastOrder = [t("wa.hello"),
        ...cart.map(i => t("wa.item", { name: L(product(i.id).name), color: colorName(i.color), size: i.size, qty: i.qty })),
        "", t("wa.total", { total: price(total) }), t("wa.name", { v: v.name }), t("wa.phone", { v: v.phone }),
        t("wa.gov", { v: v.gov }), t("wa.address", { v: v.address }), t("wa.pay", { v: t(v.pay === "cod" ? "co.cod" : "co.wallet") })].join("\n");
      openExternal(waLink(lastOrder));
      $("#orderText").textContent = lastOrder;
      cart = []; coStep = "done"; saveCart(); f.reset();
    });
    $("#reopenWa").addEventListener("click", () => openExternal(waLink(lastOrder)));
    $("#copyOrder").addEventListener("click", async e => {
      try { await navigator.clipboard.writeText(lastOrder); e.target.textContent = t("co.copied"); }
      catch { const r = document.createRange(); r.selectNodeContents($("#orderText")); getSelection().removeAllRanges(); getSelection().addRange(r); }
    });
    const govs = { ar: ["القاهرة","الجيزة","الإسكندرية","القليوبية","الشرقية","الدقهلية","الغربية","المنوفية","البحيرة","كفر الشيخ","دمياط","بورسعيد","الإسماعيلية","السويس","الفيوم","بني سويف","المنيا","أسيوط","سوهاج","قنا","الأقصر","أسوان","البحر الأحمر","مطروح","الوادي الجديد","شمال سيناء","جنوب سيناء"],
                   en: ["Cairo","Giza","Alexandria","Qalyubia","Sharqia","Dakahlia","Gharbia","Monufia","Beheira","Kafr El Sheikh","Damietta","Port Said","Ismailia","Suez","Faiyum","Beni Suef","Minya","Asyut","Sohag","Qena","Luxor","Aswan","Red Sea","Matrouh","New Valley","North Sinai","South Sinai"] };
    const fillGov = () => { const sel = $("#coGov"), cur = sel.selectedIndex; sel.innerHTML = `<option value="">${t("co.govPick")}</option>` + govs[lang].map(g => `<option>${g}</option>`).join(""); sel.selectedIndex = Math.max(0, cur); };
    fillGov(); document.addEventListener("langchange", fillGov);
  }

  /* =========================================================
     Product card (home + shop + related)
     ========================================================= */
  function swatchesHTML(p, active, name, compact) {
    // the "best match" tag only makes sense when there is a choice of colours (not on the small card dots)
    const best = c => !compact && p.colors.length > 1 && c === p.bestMatch;
    if (compact) return `<div class="swatches dots" role="radiogroup" aria-label="${t("pdp.color")}">` + p.colors.map(c =>
      `<button type="button" role="radio" class="swatch" style="--sw:${DATA.colors[c].hex}" data-color="${c}" aria-checked="${c === active}" aria-label="${t("a11y.color", { color: colorName(c) })}"></button>`).join("") + `</div>`;
    return `<div class="swatches${p.colors.length > 1 ? "" : " single"}" role="radiogroup" aria-label="${t("pdp.color")}">` + p.colors.map(c => `
      <span class="sw${best(c) ? " is-best" : ""}">
        <button type="button" role="radio" class="swatch" style="--sw:${DATA.colors[c].hex}" data-color="${c}" aria-checked="${c === active}" aria-label="${t("a11y.color", { color: colorName(c) })}${best(c) ? " — " + t("card.best") : ""}"${name ? ` name="${name}"` : ""}></button>
        ${best(c) ? `<small class="best-tag" title="${t("card.bestTitle")}">${t("card.best")}</small>` : ""}
      </span>`).join("") + (p.colors.length > 1 ? "" : `<span class="only-color">${t("card.only", { color: colorName(p.colors[0]) })}</span>`) + `</div>`;
  }
  function cardHTML(p, color = p.bestMatch) {
    if (!p.colors.includes(color)) color = p.bestMatch;
    const href = `product.html#id=${p.id}&color=${color}`;
    return `<article class="card reveal" data-id="${p.id}" data-color="${color}" data-view="${cardView(p)}">
      <div class="card-media">
        <a class="card-link" href="${href}" data-cursor="eye" aria-label="${L(p.name)} — ${colorName(color)}">
          <span class="layer is-on">${picture(p, color, cardView(p), { alt: `${L(p.name)} — ${colorName(color)}` })}</span>
        </a>
        ${altView(p) ? `<span class="card-alt" aria-hidden="true">${finePointer ? picture(p, color, altView(p)) : ""}</span>${finePointer ? "" : `<span class="card-flip-hint" aria-hidden="true"><i></i><i></i></span>`}` : ""}
        ${offBadge(p)}
        <button type="button" class="icon-btn heart" data-heart="${p.id}" aria-pressed="false">${ICON.heart}</button>
      </div>
      <div class="card-body">
        <p class="card-col">${L((DATA.collections.find(c => c.id === p.collection) || {}))}</p>
        <h3 class="card-name"><a href="${href}">${L(p.name)}</a></h3>
        ${priceHTML(p, "card-price")}
        ${swatchesHTML(p, color, null, true)}
      </div>
    </article>`;
  }
  // crossfade a new image layer in over the old one (same angle/scale, only the colour changes)
  function crossfade(host, html) {
    const layer = document.createElement("span"); layer.className = "layer"; layer.innerHTML = html;
    host.appendChild(layer);
    const img = $("img", layer);
    const show = () => { requestAnimationFrame(() => layer.classList.add("is-on")); setTimeout(() => $$(".layer", host).forEach(l => { if (l !== layer) l.remove(); }), reduceMotion ? 0 : 520); };
    if (img.complete) show(); else { img.addEventListener("load", show, { once: true }); img.addEventListener("error", show, { once: true }); }
  }
  function setCardColor(card, color) {
    const p = product(card.dataset.id); if (!p || card.dataset.color === color) return;
    card.dataset.color = color;
    const href = `product.html#id=${p.id}&color=${color}`;
    $$("a[href^='product.html']", card).forEach(a => a.href = href);
    const link = $(".card-link", card); link.setAttribute("aria-label", `${L(p.name)} — ${colorName(color)}`);
    crossfade(link, picture(p, color, cardView(p), { alt: `${L(p.name)} — ${colorName(color)}` }));
    const alt = $(".card-alt", card); if (alt) { if (finePointer) alt.innerHTML = picture(p, color, altView(p)); else { alt.innerHTML = ""; $(".card-media", card).classList.remove("show-alt"); } }
    $$(".swatch", card).forEach(s => s.setAttribute("aria-checked", s.dataset.color === color));
  }
  function bindCards(root) {
    // phones: swipe a card sideways to flip between back and front
    let sx = 0, sy = 0;
    root.addEventListener("touchstart", e => { const m = e.target.closest(".card-media"); if (!m) return; sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    root.addEventListener("touchend", e => {
      const m = e.target.closest(".card-media"); if (!m) return; const t0 = e.changedTouches[0]; const dx = t0.clientX - sx, dy = t0.clientY - sy;
      if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.4) return;
      const card = m.closest(".card"), p = product(card.dataset.id), alt = $(".card-alt", m); if (!p || !alt) return;
      if (!alt.innerHTML) alt.innerHTML = picture(p, card.dataset.color, altView(p), { sizes: "90vw" });
      m.classList.toggle("show-alt");
    }, { passive: true });
    root.addEventListener("click", e => {
      const card = e.target.closest(".card"); if (!card) return;
      const sw = e.target.closest(".swatch"); if (sw) { setCardColor(card, sw.dataset.color); return; }
      const heart = e.target.closest("[data-heart]"); if (heart) { toggleWish(card.dataset.id, card.dataset.color); bump(heart); return; }
    });
    // arrow keys move between swatches (radio group pattern)
    root.addEventListener("keydown", e => {
      const sw = e.target.closest(".swatch"); if (!sw || !["ArrowLeft", "ArrowRight"].includes(e.key)) return;
      const all = $$(".swatch", sw.closest(".swatches")); const i = all.indexOf(sw);
      const step = (e.key === "ArrowRight") === (lang === "en") ? 1 : -1;
      const next = all[(i + step + all.length) % all.length]; next.focus(); next.click(); e.preventDefault();
    });
  }

  /* =========================================================
     Scroll reveal + loader
     ========================================================= */
  /* Content is visible by default. The hidden "before" state only applies once html has
     .reveal-on (set here, after the observer exists). A scroll/resize fallback and a timeout
     reveal anything already on screen, so a failed animation can never hide content. */
  document.addEventListener("load", e => { if (e.target.tagName === "IMG") e.target.classList.add("ld"); }, true);
  const markLoaded = () => $$("img:not(.ld)").forEach(i => { if (i.complete) i.classList.add("ld"); });
  let io, fallbackBound = false;
  const showVisible = () => $$(".reveal:not(.in)").forEach(el => { const r = el.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) el.classList.add("in"); });
  function reveal(root = document) {
    if (reduceMotion || !("IntersectionObserver" in window)) { $$(".reveal", root).forEach(el => el.classList.add("in")); return; }
    try {
      io ||= new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }), { rootMargin: "0px 0px -8% 0px" });
      $$(".reveal:not(.in)", root).forEach(el => io.observe(el));
      document.documentElement.classList.add("reveal-on");
    } catch { $$(".reveal", root).forEach(el => el.classList.add("in")); return; }
    if (!fallbackBound) {
      fallbackBound = true;
      // at most one check per frame (phones fire many scroll events per frame)
      let queued = false;
      addEventListener("scroll", () => { if (queued) return; queued = true; requestAnimationFrame(() => { queued = false; showVisible(); }); }, { passive: true });
      addEventListener("resize", showVisible);
    }
    setTimeout(showVisible, 1200); markLoaded(); setTimeout(markLoaded, 3000);
  }
  function loader() {
    const el = $("#loader"); if (!el) return;
    // once per visit. Inside the shared phone link the browser blocks storage, so also remember it in window.name
    // (kept while moving between pages in the same tab) and skip it whenever we arrive from one of our own pages.
    let seen = false;
    try { seen = sessionStorage.getItem("vision.loaded") === "1"; sessionStorage.setItem("vision.loaded", "1"); } catch {}
    try { if (window.name.includes("vision.loaded")) seen = true; else window.name = (window.name ? window.name + " " : "") + "vision.loaded"; } catch {}
    try { if (document.referrer && new URL(document.referrer).origin === location.origin) seen = true; } catch {}
    if (!FEATURES.loader || seen || reduceMotion) { el.remove(); document.documentElement.classList.remove("is-loading"); return; }
    el.hidden = false;
    const done = () => { el.classList.add("out"); document.documentElement.classList.remove("is-loading"); setTimeout(() => el.remove(), 600); };
    // short and capped: never hold the page more than ~1.4s
    Promise.race([new Promise(r => addEventListener("load", r, { once: true })), new Promise(r => setTimeout(r, 1400))])
      .then(() => setTimeout(done, 650));
  }

  /* =========================================================
     Boot
     ========================================================= */
  document.documentElement.classList.add("js");
  if (FEATURES.eyeCursor) document.documentElement.classList.add("eye-cursor");
  setLang(lang, true);
  loader();
  chrome();
  applyI18n();

  data().then(d => {
    DATA = d;
    // one price for every hoodie, set in products.json → store.pricing (a product may still override with its own "price")
    const pr = d.store.pricing || {};
    d.products.forEach(p => { if (p.price == null) p.price = pr.price; if (p.compareAt == null && pr.compareAt > p.price) p.compareAt = pr.compareAt; });
    bindHeader(); bindDrawer();
    renderBadges(); renderDrawer();
    document.addEventListener("langchange", () => { renderBadges(); renderDrawer(); if ($("#sizeGuide").open) renderSizeGuide(); });
    document.dispatchEvent(new CustomEvent("vision:ready"));
  }).catch(err => {
    console.error(err);
    toast(lang === "ar" ? "تعذّر تحميل المنتجات — حدّث الصفحة." : "Couldn't load products — please refresh.");
  });

  // public API for page scripts
  window.Vision = {
    $, $$, t, L, ICON, FEATURES, reduceMotion, finePointer, store,
    get lang() { return lang; }, get data() { return DATA; },
    price, priceHTML, offBadge, offPct, colorName, product, picture, modelPicture, imgUrl, imgSpec, views, cardView, maxW, isLive, liveProducts, varietyColors, cardHTML, bindCards, swatchesHTML, crossfade,
    addToCart, toggleWish, syncHearts, inWish, waLink, openExternal, openSizeGuide, openDrawer, toast, bump, reveal, applyI18n
  };
})();
