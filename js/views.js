(() => {
  const article = document.querySelector("[data-view-counter]");
  if (!article) return;
  const slug = article.getAttribute("data-slug");
  if (!slug) return;

  const KEY = "agaphos_views_v1";
  let store = {};
  try {
    store = JSON.parse(localStorage.getItem(KEY) || "{}") || {};
  } catch {
    store = {};
  }

  const sessionKey = `agaphos_viewed_${slug}`;
  if (!sessionStorage.getItem(sessionKey)) {
    store[slug] = (Number(store[slug]) || 0) + 1;
    try {
      localStorage.setItem(KEY, JSON.stringify(store));
      sessionStorage.setItem(sessionKey, "1");
    } catch {
      /* ignore quota */
    }
  }

  const n = Number(store[slug]) || 1;
  const el = article.querySelector("[data-views-display]");
  if (el) {
    el.textContent = `Lectures (cet appareil) : ${n}`;
  }
})();
