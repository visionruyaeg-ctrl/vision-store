/* Product page: gallery (front / print close-up), colour crossfade, required size,
   add to cart, WhatsApp order, eye-lens zoom (desktop), pinch-zoom lightbox (touch). */
(() => {
  "use strict";
  // product.html#id=gon&color=white (the part after # never goes to the server: needed by the shared phone link);
  // older product.html?id=… links still work
  const params = new URLSearchParams(location.hash.length > 1 ? location.hash.slice(1) : location.search);
  // a related card on this page only changes the #part: load that product
  addEventListener("hashchange", () => { const n = new URLSearchParams(location.hash.slice(1)); if (n.get("id") && n.get("id") !== params.get("id")) location.reload(); });
  let P, color, size = null, qty = 1, view = null;   // null = open on the design's first view
  // view label keys; which views a design has comes from products.json ("views", default front + detail)
  const VIEW_KEY = { art: "pdp.art", front: "pdp.front", back: "pdp.back", detail: "pdp.detail", showcase: "pdp.showcase", model: "pdp.lifestyle" };

  function render() {
    const { $, data, t, L, price, colorName, picture, swatchesHTML, ICON, inWish, product, finePointer } = window.Vision;
    P = product(params.get("id"));
    if (!P) {
      $("#pdp").innerHTML = `<div class="empty"><p>${t("pdp.notFound")}</p><a class="btn btn-light" href="shop.html">${t("cart.browse")}</a></div>`;
      $(".related").hidden = true; return;
    }
    if (!color || !P.colors.includes(color)) color = P.colors.includes(params.get("color")) ? params.get("color") : P.bestMatch;
    document.title = t("meta.product", { name: L(P.name) });
    const col = data.collections.find(c => c.id === P.collection);
    if (col) document.body.dataset.mood = col.id;
    $("#crumbs").innerHTML = `<a href="index.html">${t("pdp.home")}</a><span aria-hidden="true">/</span><a href="shop.html">${t("nav.shop")}</a>` +
      (col ? `<span aria-hidden="true">/</span><a href="shop.html#c=${col.id}">${L(col)}</a>` : "") +
      `<span aria-hidden="true">/</span><span aria-current="page">${L(P.name)}</span>`;

    const VIEWS = window.Vision.views(P); if (!VIEWS.includes(view)) view = VIEWS[0];
    const alt = v => `${L(P.name)} — ${colorName(color)} — ${t(VIEW_KEY[v])}`;
    $("#pdp").innerHTML = `
      <div class="gallery">
        <div class="g-track" id="gTrack" dir="ltr" tabindex="0" aria-label="${L(P.name)}">
          ${VIEWS.map(v => `<figure class="g-slide g-${v}" data-view="${v}"><button type="button" class="g-zoom" data-cursor="eye" aria-label="${t("pdp.zoomHintTouch")} — ${t(VIEW_KEY[v])}"><span class="layer is-on">${picture(P, color, v, { sizes: "(min-width: 1024px) 52vw, 100vw", eager: v === VIEWS[0], alt: alt(v) })}</span></button></figure>`).join("")}
        </div>
        <div class="lens" id="lens" hidden aria-hidden="true"><i class="star-i"></i></div>
        <div class="g-views" role="tablist" aria-label="${t("pdp.print")}"${VIEWS.length > 1 ? "" : " hidden"}>
          ${VIEWS.map(v => `<button type="button" role="tab" class="g-thumb" data-goto="${v}" aria-selected="${v === view}"><span class="th-img"><span class="layer is-on">${picture(P, color, v, { sizes: "88px" })}</span></span><span>${t(VIEW_KEY[v])}</span></button>`).join("")}
        </div>
        <p class="hint">${t(finePointer ? "pdp.zoomHint" : "pdp.zoomHintTouch")}</p>
      </div>

      <div class="buy">
        <p class="eyebrow">${L(data.collections.find(c => c.id === P.collection) || {})}</p>
        <h1 class="h1 pdp-name">${L(P.name)}</h1>
        <div class="pdp-price">${window.Vision.priceHTML(P, "big")}${window.Vision.offBadge(P)}</div>
        <p class="pdp-desc">${L(P.description)}</p>
        <p class="pdp-print"><span class="label">${t("pdp.print")}</span> ${L(P.print)}</p>

        <div class="opt">
          <div class="opt-head"><span class="label">${t("pdp.color")}</span><b id="colorName">${colorName(color)}</b></div>
          ${swatchesHTML(P, color)}
          <details class="why"><summary>${t(P.colors.length > 1 ? "pdp.bestWhy" : "pdp.onlyWhy")}</summary><p>${P.colors.length > 1 ? t("card.best") + " — " + colorName(P.bestMatch) + ": " : ""}${P.bestReason ? L(P.bestReason) : t(P.colors.length > 1 ? "pdp.bestAuto" : "pdp.onlyAuto")}</p></details>
        </div>

        <div class="opt">
          <div class="opt-head"><span class="label" id="sizeLabel">${t("pdp.size")}</span><button type="button" class="link-btn" data-size-guide-local>${t("pdp.sizeGuide")}</button></div>
          <div class="sizes" role="radiogroup" aria-labelledby="sizeLabel" aria-describedby="sizeErr" id="sizes">
            ${data.sizes.map(s => `<button type="button" role="radio" class="size-chip lg" data-size="${s}" aria-checked="${s === size}">${s}</button>`).join("")}
          </div>
          <p class="field-err" id="sizeErr" role="alert" hidden>${t("pdp.sizeRequired")}</p>
        </div>

        <div class="buy-row">
          <div class="qty" aria-label="${t("pdp.qty")}"><button type="button" id="qMinus" aria-label="${t("cart.dec")}">${ICON.minus}</button><span class="num" id="qty" aria-live="polite">${qty}</span><button type="button" id="qPlus" aria-label="${t("cart.inc")}">${ICON.plus}</button></div>
          <button type="button" class="btn btn-light grow" id="addBtn">${ICON.bag}<span>${t("pdp.add")}</span></button>
          <button type="button" class="icon-btn heart boxed" data-heart="${P.id}" aria-pressed="${inWish(P.id)}">${ICON.heart}</button>
        </div>
        <button type="button" class="btn btn-wa full" id="waBtn">${ICON.whatsapp}<span>${t("pdp.wa")}</span></button>
        <ul class="pdp-info">
          <li>${ICON.truck}<span>${t("info.ship")}</span></li>
          <li>${ICON.swap}<span>${t("info.exchange")}</span></li>
          <li><button type="button" class="link-btn" data-size-guide-local>${ICON.ruler}<span>${t("pdp.sizeGuide")}</span></button></li>
        </ul>

        <div class="acc">
          <details open><summary>${t("pdp.printT")}</summary><p>${t("pdp.printD")}</p></details>
          <details><summary>${t("pdp.fabricT")}</summary><p>${t("pdp.fabricD")}</p></details>
          <details><summary>${t("pdp.careT")}</summary><p>${t("pdp.careD")}</p></details>
          <details><summary>${t("pdp.shipT")}</summary><p>${t("pdp.shipD")}</p></details>
        </div>
      </div>`;

    $("#bbName").textContent = L(P.name); $("#bbPrice").textContent = price(P.price);
    // related: the same collection (4 cards; topped up from the rest only when the collection is small)
    const others = window.Vision.liveProducts().filter(p => p.id !== P.id);
    const rel = [...others.filter(p => p.collection === P.collection), ...others.filter(p => p.collection !== P.collection)].slice(0, 4);
    $("#relGrid").innerHTML = rel.map(p => window.Vision.cardHTML(p)).join("");
    window.Vision.syncHearts(); window.Vision.reveal();
    bindGallery(); goto(view, true);
  }

  /* ---------- colour ---------- */
  function setColor(c) {
    const { $, $$, picture, colorName, L, t } = window.Vision;
    if (c === color) return; color = c;
    try { history.replaceState(null, "", `product.html#id=${P.id}&color=${c}`); } catch { /* blocked in some embedded viewers */ }
    $("#colorName").textContent = colorName(c);
    $$("#pdp .swatch").forEach(s => s.setAttribute("aria-checked", s.dataset.color === c));
    $$(".g-slide").forEach(sl => { const v = sl.dataset.view; if (v === "model") return; window.Vision.crossfade($(".g-zoom", sl), picture(P, c, v, { sizes: "(min-width: 1024px) 52vw, 100vw", alt: `${L(P.name)} — ${colorName(c)} — ${t(VIEW_KEY[v])}` })); });
    $$(".g-thumb").filter(th => th.dataset.goto !== "model").forEach(th => window.Vision.crossfade(th.querySelector(".th-img"), picture(P, c, th.dataset.goto, { sizes: "88px" })));
  }

  /* ---------- gallery: swipe on touch (scroll-snap), tabs on desktop ---------- */
  function goto(v, instant) {
    const { $, $$, reduceMotion } = window.Vision;
    view = v;
    const track = $("#gTrack"), slide = $(`.g-slide[data-view="${v}"]`);
    track.scrollTo({ left: slide.offsetLeft, behavior: instant || reduceMotion ? "auto" : "smooth" });
    $$(".g-thumb").forEach(b => b.setAttribute("aria-selected", b.dataset.goto === v));
  }
  function bindGallery() {
    const { $, $$, FEATURES, finePointer, imgUrl } = window.Vision;
    const track = $("#gTrack");
    $$(".g-thumb").forEach(b => b.addEventListener("click", () => goto(b.dataset.goto)));
    track.addEventListener("scroll", () => {
      const i = Math.round(track.scrollLeft / track.clientWidth) ;
      const v = [...track.children][i]?.dataset.view; if (v && v !== view) { view = v; $$(".g-thumb").forEach(b => b.setAttribute("aria-selected", b.dataset.goto === v)); }
    }, { passive: true });

    // surprise: eye-shaped zoom lens that follows the pointer (desktop)
    const lens = $("#lens");
    if (FEATURES.eyeLens && finePointer) {
      $$(".g-zoom").forEach(z => {
        z.addEventListener("pointerenter", () => { if (z.closest(".g-showcase")) return; lens.hidden = false; const v = z.closest(".g-slide").dataset.view; lens.style.backgroundImage = `url("${imgUrl(P, color, v, window.Vision.maxW(P, v))}")`; });
        z.addEventListener("pointerleave", () => { lens.hidden = true; });
        z.addEventListener("pointermove", e => {
          const r = z.getBoundingClientRect(), g = z.closest(".gallery").getBoundingClientRect();
          const x = e.clientX - r.left, y = e.clientY - r.top, zoom = 2.6;
          lens.style.left = `${e.clientX - g.left}px`; lens.style.top = `${e.clientY - g.top}px`;
          lens.style.backgroundSize = `${r.width * zoom}px ${r.height * zoom}px`;
          lens.style.backgroundPosition = `${-(x * zoom - lens.offsetWidth / 2)}px ${-(y * zoom - lens.offsetHeight / 2)}px`;
        });
      });
    }
    // tap / click → fullscreen pinch-zoom viewer
    $$(".g-zoom").forEach(z => z.addEventListener("click", () => openLightbox(z.closest(".g-slide").dataset.view)));
  }

  /* ---------- lightbox with pinch / drag / double-tap zoom ---------- */
  function openLightbox(v) {
    const { $, imgUrl, L, colorName } = window.Vision;
    const dlg = $("#lightbox"), img = $("#lbImg");
    img.src = imgUrl(P, color, v, window.Vision.maxW(P, v)); img.alt = `${L(P.name)} — ${colorName(color)}`;
    reset(); dlg.showModal();
  }
  let scale = 1, tx = 0, ty = 0; const pts = new Map(); let startDist = 0, startScale = 1, last = null, lastTap = 0;
  function apply() { document.getElementById("lbImg").style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`; }
  function reset() { scale = 1; tx = ty = 0; apply(); }
  function bindLightbox() {
    const stage = document.getElementById("lbStage"), dlg = document.getElementById("lightbox");
    document.getElementById("lbClose").addEventListener("click", () => dlg.close());
    dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });
    stage.addEventListener("pointerdown", e => {
      stage.setPointerCapture(e.pointerId); pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 2) { const [a, b] = [...pts.values()]; startDist = Math.hypot(a.x - b.x, a.y - b.y); startScale = scale; }
      last = { x: e.clientX, y: e.clientY };
      const now = Date.now(); if (now - lastTap < 300 && pts.size === 1) { scale = scale > 1 ? 1 : 2.5; if (scale === 1) tx = ty = 0; apply(); } lastTap = now;
    });
    stage.addEventListener("pointermove", e => {
      if (!pts.has(e.pointerId)) return; pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 2) { const [a, b] = [...pts.values()]; scale = Math.max(1, Math.min(4, startScale * Math.hypot(a.x - b.x, a.y - b.y) / startDist)); }
      else if (scale > 1 && last) { tx += e.clientX - last.x; ty += e.clientY - last.y; }
      last = { x: e.clientX, y: e.clientY }; apply();
    });
    const up = e => { pts.delete(e.pointerId); if (pts.size < 2) startDist = 0; if (scale === 1) { tx = ty = 0; apply(); } };
    stage.addEventListener("pointerup", up); stage.addEventListener("pointercancel", up);
    stage.addEventListener("wheel", e => { e.preventDefault(); scale = Math.max(1, Math.min(4, scale - e.deltaY * 0.002)); if (scale === 1) tx = ty = 0; apply(); }, { passive: false });
  }

  /* ---------- buying ---------- */
  function requireSize() {
    const { $ } = window.Vision;
    if (size) return true;
    $("#sizeErr").hidden = false;
    $("#sizes").scrollIntoView({ block: "center", behavior: window.Vision.reduceMotion ? "auto" : "smooth" });
    $("#sizes .size-chip").focus();
    return false;
  }
  function bindBuy() {
    const { $, $$, t, L, price, colorName, addToCart, toggleWish, openExternal, waLink, openSizeGuide, bump } = window.Vision;
    const root = $("#pdp");
    root.addEventListener("click", e => {
      const sw = e.target.closest(".swatch"); if (sw) { setColor(sw.dataset.color); return; }
      const sz = e.target.closest("#sizes .size-chip");
      if (sz) { size = sz.dataset.size; $$("#sizes .size-chip").forEach(b => b.setAttribute("aria-checked", b === sz)); $("#sizeErr").hidden = true; return; }
      if (e.target.closest("#qPlus")) { qty = Math.min(20, qty + 1); $("#qty").textContent = qty; return; }
      if (e.target.closest("#qMinus")) { qty = Math.max(1, qty - 1); $("#qty").textContent = qty; return; }
      if (e.target.closest("#addBtn")) { if (requireSize()) addToCart(P.id, color, size, qty); return; }
      if (e.target.closest("#waBtn")) {
        if (!requireSize()) return;
        const url = location.origin + location.pathname.replace(/[^/]*$/, "") + `product.html#id=${P.id}&color=${color}`;
        openExternal(waLink(t("wa.single", { name: L(P.name), color: colorName(color), size, qty, price: price(P.price * qty), url })));
        return;
      }
      const h = e.target.closest("[data-heart]"); if (h) { toggleWish(P.id, color); bump(h); return; }
      if (e.target.closest("[data-size-guide-local]")) openSizeGuide();
    });
    // arrow keys within the size / colour radio groups
    root.addEventListener("keydown", e => {
      const b = e.target.closest(".size-chip, .swatch"); if (!b || !["ArrowLeft", "ArrowRight"].includes(e.key)) return;
      const all = $$(b.classList.contains("swatch") ? "#pdp .swatch" : "#sizes .size-chip"); const i = all.indexOf(b);
      const step = (e.key === "ArrowRight") === (window.Vision.lang === "en") ? 1 : -1;
      const n = all[(i + step + all.length) % all.length]; n.focus(); n.click(); e.preventDefault();
    });
    $("#bbAdd").addEventListener("click", () => { if (requireSize()) addToCart(P.id, color, size, qty); });
  }
  // phones: the order bar stays fixed at the bottom (CSS shows it under 768px only)
  function observeBar() {}

  document.addEventListener("vision:ready", () => {
    const V = window.Vision;
    render(); if (!P) return;
    bindBuy(); bindLightbox(); observeBar();
    V.bindCards(V.$("#relGrid"));
    document.addEventListener("langchange", () => { render(); observeBar(); });
  });
})();
