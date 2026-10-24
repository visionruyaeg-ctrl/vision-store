/* Shop page.
   - shop.html            : every design in display order (strongest first, Identity last), in batches
   - shop.html#c=vintage  : one collection page with its own banner + mood accents (CSS [data-mood]),
                            designs load in batches of 6 as you scroll (or "show more")
   - shop.html#q=…        : search results; a colour word ("أبيض", "black") shows every design on that colour */
(() => {
  "use strict";
  const params = new URLSearchParams(location.search);
  const hashQ = new URLSearchParams(location.hash.slice(1)).get("q");   // shop.html#q=… (older ?q= still works)
  const q = (hashQ || params.get("q") || "").trim();
  const BATCH = 12;         // cards per batch (collection pages and the all-products grid)
  let colorView = "best";   // "best" = each design on its best-match colour
  // collection from shop.html#c=anime (preferred: the part after # never goes to the server, which the shared
  // phone link needs), or the older shop.html?c=anime / shop.html#c-anime links
  const hashCol = () => (location.hash.match(/^#c[=-]([\w-]+)$/) || [])[1] || "";
  let colId = hashCol() || params.get("c") || "";
  let shown = BATCH, moreIO = null;

  const matches = (p, data) => {
    if (!q) return true;
    const c = data.collections.find(x => x.id === p.collection) || {};
    const hay = [p.id, p.name.ar, p.name.en, p.print.ar, p.print.en, c.ar, c.en, ...p.colors.flatMap(k => [data.colors[k].ar, data.colors[k].en])].join(" ").toLowerCase();
    return q.toLowerCase().split(/\s+/).every(w => hay.includes(w));
  };

  let mix = new Map();      // colour variety for the current list (see Vision.varietyColors)
  function cards(items) {
    const { cardHTML } = window.Vision;
    return items.map(p => cardHTML(p, colorView !== "best" && p.colors.includes(colorView) ? colorView : mix.get(p.id) || p.bestMatch)).join("");
  }
  const soonHTML = c => {
    const { t, L, ICON } = window.Vision;
    return `<div class="soon"><img src="assets/brand/mark-eye-midnight.svg" alt="" width="40" height="49" loading="lazy">
      <div><b>${t("col.soonTitle")}</b><p>${t("col.soonText")}</p></div>
      <button type="button" class="btn btn-dark" data-soon="${L(c)}">${ICON.whatsapp}<span>${t("col.soonBtn")}</span></button></div>`;
  };

  /* ---------- header: the plain shop title, or the collection banner ---------- */
  function renderHead(col, items) {
    const { $, data, t, L, picture } = window.Vision;
    const head = $("#shopHead");
    if (!col) {
      document.body.removeAttribute("data-mood");
      head.className = "page-head";
      head.innerHTML = `<div class="wrap"><p class="eyebrow lat">WINTER 2026 · ${data.collections.length} COLLECTIONS</p>
        <h1 class="h1">${t("shop.title")}</h1><p class="muted">${t("shop.count", { n: window.Vision.liveProducts().length, c: data.collections.length })}</p></div>`;
      return;
    }
    document.body.dataset.mood = col.id;
    // a 16:9 model banner (products.json models.banners) when the collection has one; otherwise just the title
    const bn = (data.models && data.models.banners || {})[col.id];
    head.className = "col-banner" + (bn ? " has-photo" : "");
    head.innerHTML = `${bn ? `<picture class="cb-photo" aria-hidden="true"><img src="assets/models/${bn.file}-960.webp" srcset="${(bn.widths || [960, 1920]).map(w => `assets/models/${bn.file}${w === 1920 ? "" : "-" + w}.webp ${w}w`).join(", ")}" sizes="100vw" width="1920" height="1080" alt="" fetchpriority="high"></picture>` : ""}
      <div class="wrap cb-in">
        <div class="cb-text">
          <a class="cb-back" href="shop.html">${t("col.all")}</a>
          <p class="eyebrow lat">COLLECTION · ${col.en.toUpperCase()}</p>
          <h1 class="h1 cb-title">${L(col)}</h1>
          <p class="muted">${L(col.text)} · <b class="num">${items.length ? t("col.count", { n: items.length }) : t("col.count0")}</b></p>
        </div>
      </div>`;
  }
  /* ---------- body ---------- */
  function render() {
    const { $, data, t, L, colorName, syncHearts, reveal, applyI18n } = window.Vision;
    const live = window.Vision.liveProducts();
    const col = data.collections.find(c => c.id === colId) || null;
    const list = live.filter(p => matches(p, data) && (!col || p.collection === col.id));
    mix = window.Vision.varietyColors(list);
    document.title = col ? t("meta.col", { name: L(col) }) : t("meta.shop");
    renderHead(col, list);
    $("#queryBar").hidden = !q;
    $("#queryText").textContent = t("shop.results", { q });
    moreIO?.disconnect();

    if (col) {
      // one collection: render the first batch, more as the sentinel scrolls into view
      $("#shopSections").innerHTML = list.length
        ? `<section class="shop-col" aria-label="${L(col)}"><div class="grid cards" id="colGrid">${cards(list.slice(0, shown))}</div>
           <div class="more-row"${list.length > shown ? "" : " hidden"} id="moreRow"><button type="button" class="btn btn-line" id="moreBtn">${t("col.more", { n: list.length - Math.min(shown, list.length) })}</button></div></section>`
        : `<section class="shop-col">${soonHTML(col)}</section>`;
      bindMore(list);
    } else if (!q) {
      // all products: one ranked grid (strongest designs first, Identity last), collection shortcuts on top
      $("#shopSections").innerHTML = `<nav class="col-chips" aria-label="${t("col.title")}">${data.collections.filter(c => live.some(p => p.collection === c.id))
          .map(c => `<a class="chip" href="shop.html#c=${c.id}">${L(c)} <small class="num">${live.filter(p => p.collection === c.id).length}</small></a>`).join("")}</nav>
        <section class="shop-col" aria-label="${t("shop.title")}"><div class="grid cards" id="colGrid">${cards(list.slice(0, shown))}</div>
        <div class="more-row"${list.length > shown ? "" : " hidden"} id="moreRow"><button type="button" class="btn btn-line" id="moreBtn">${t("col.more", { n: list.length - Math.min(shown, list.length) })}</button></div></section>`;
      bindMore(list);
    } else {
      $("#shopSections").innerHTML = data.collections.map(c => {
        const items = list.filter(p => p.collection === c.id);
        if (!items.length) return "";                             // search results: only collections with hits
        const body = `<div class="grid cards">${cards(items)}</div>`;
        return `<section class="shop-col" id="c-${c.id}" data-mood="${c.id}" aria-labelledby="h-${c.id}">
          <header class="col-head"><div><p class="eyebrow lat">${c.en.toUpperCase()}</p><h2 class="h2" id="h-${c.id}">${L(c)}</h2></div>
            <p class="col-desc">${L(c.text)} · <b>${items.length ? t("col.count", { n: items.length }) : t("col.count0")}</b></p></header>
          ${body}
          </section>`;
      }).join("");
    }
    $("#shopEmpty").hidden = list.length > 0 || (col && !q);

    const chips = [["best", t("shop.colorAll"), null], ...Object.keys(data.colors).map(c => [c, colorName(c), data.colors[c].hex])];
    $("#colorFilter").innerHTML = chips.map(([v, label, hex]) =>
      `<button type="button" role="radio" class="chip" data-cv="${v}" aria-checked="${v === colorView}">${hex ? `<i class="dot" style="--sw:${hex}"></i>` : `<i class="star-i"></i>`}${label}</button>`).join("");
    applyI18n($("#main"));
    syncHearts(); reveal($("#shopSections"));
  }

  /* ---------- batches: append the next 6 cards (never re-render the ones already there) ---------- */
  function bindMore(list) {
    const { $, t, syncHearts, reveal } = window.Vision;
    const row = $("#moreRow"); if (!row) return;
    const next = () => {
      if (shown >= list.length) return;
      const from = shown; shown = Math.min(list.length, shown + BATCH);
      $("#colGrid").insertAdjacentHTML("beforeend", cards(list.slice(from, shown)));
      syncHearts(); reveal($("#colGrid"));
      row.hidden = shown >= list.length;
      $("#moreBtn").textContent = t("col.more", { n: list.length - shown });
      if (row.hidden) moreIO?.disconnect();
    };
    $("#moreBtn").addEventListener("click", next);
    if ("IntersectionObserver" in window) {
      moreIO = new IntersectionObserver(es => { if (es[0].isIntersecting) next(); }, { rootMargin: "600px 0px" });
      moreIO.observe(row);
    }
  }

  document.addEventListener("vision:ready", () => {
    const { $, bindCards, data, t, openExternal, waLink } = window.Vision;
    if (colId && !data.collections.some(c => c.id === colId)) colId = "";
    // moving between collections only changes the #part: re-render in place, no page load
    addEventListener("hashchange", () => {
      if (/^#q=/.test(location.hash)) { location.reload(); return; }   // a new search: start fresh
      const next = hashCol(); if (next === colId || (next && !data.collections.some(c => c.id === next))) return;
      colId = next; shown = BATCH; render(); scrollTo({ top: 0, behavior: "auto" });
    });
    // searching for a colour ("أبيض", "black"…) opens every design on that colour
    const ql = q.toLowerCase();
    const qc = Object.keys(data.colors).find(c => ql.includes(data.colors[c].ar) || ql.includes(data.colors[c].en.toLowerCase()));
    if (qc) colorView = qc;
    render();
    bindCards($("#shopSections"));
    $("#shopSections").addEventListener("click", e => { const b = e.target.closest("[data-soon]"); if (b) openExternal(waLink(t("col.soonMsg", { name: b.dataset.soon }))); });
    $("#colorFilter").addEventListener("click", e => { const b = e.target.closest("[data-cv]"); if (!b) return; colorView = b.dataset.cv; render(); });
    document.addEventListener("langchange", render);
  });
})();
