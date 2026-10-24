/* Home page (v6, 2026-10-24): featured designs, collections, models grid. */
(() => {
  "use strict";
  const V = () => window.Vision;

  /* ---------- featured: the first designs in display order (each on a varied colour) ---------- */
  const TOP_N = 8;
  function renderFeatured() {
    const { $, cardHTML, syncHearts, reveal } = V();
    const grid = $("#dropGrid");
    const keep = new Map([...grid.querySelectorAll(".card")].map(c => [c.dataset.id, c.dataset.color]));
    const top = V().liveProducts().filter(p => p.collection !== "identity").slice(0, TOP_N), mix = V().varietyColors(top);
    grid.innerHTML = top.map(p => cardHTML(p, keep.get(p.id) || mix.get(p.id))).join("");
    syncHearts(); reveal(grid);
  }

  /* ---------- collections: 4:5 cards — a model photo when the collection has one, else its first design ---------- */
  function renderCollections() {
    const { $, data, t, L, picture, liveProducts, cardView, modelPicture } = V();
    const banners = (data.models && data.models.banners) || {};
    $("#colGrid").innerHTML = data.collections.map(c => {
      const items = liveProducts().filter(p => p.collection === c.id); if (!items.length) return "";
      const first = items[0], b = banners[c.id];
      const img = b ? modelPicture(b.photo, { sizes: "(min-width: 1024px) 19vw, (min-width: 640px) 30vw, 62vw" })
        : picture(first, first.bestMatch, cardView(first), { sizes: "(min-width: 1024px) 19vw, (min-width: 640px) 30vw, 62vw" });
      return `<a class="col-card reveal${b ? " is-photo" : ""}" href="shop.html#c=${c.id}">
        <span class="cc-img">${img}</span>
        <span class="cc-meta"><b>${L(c)}</b><small class="num">${t("col.count", { n: items.length })}</small></span>
      </a>`;
    }).join("");
    V().reveal($("#colGrid"));
  }

  /* ---------- models grid: products.json → models.home (each photo opens the design it shows) ---------- */
  function renderModels() {
    const { $, data, L, product, modelPicture, reveal } = V();
    const list = ((data.models && data.models.home) || []).filter(m => product(m.product));
    const sec = $("#models"); if (!list.length) { sec.hidden = true; return; }
    $("#mdGrid").innerHTML = list.map(m => { const p = product(m.product);
      return `<a class="md-item reveal" href="product.html#id=${p.id}">${modelPicture(m.file, { sizes: "(min-width: 1024px) 31vw, 48vw", alt: L(p.name) })}<span class="md-cap">${L(p.name)}</span></a>`; }).join("");
    sec.hidden = false; reveal(sec);
  }

  document.addEventListener("vision:ready", () => {
    renderFeatured(); renderCollections(); renderModels();
    V().bindCards(V().$("#dropGrid"));
    V().reveal();
    document.addEventListener("langchange", () => { renderFeatured(); renderCollections(); renderModels(); });
  });
})();
