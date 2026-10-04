export function getYandexMetrikaScript(counterId: number) {
  if (!Number.isSafeInteger(counterId) || counterId <= 0) {
    throw new RangeError("Yandex Metrika counter ID must be a positive safe integer.");
  }

  return `
    (function (w, d) {
      var id = ${counterId};
      if (w.__oknoshieldMetrika && w.__oknoshieldMetrika.counterId === id) return;

      var src = "https://mc.yandex.ru/metrika/tag.js?id=" + id;
      w.ym = w.ym || function () { (w.ym.a = w.ym.a || []).push(arguments); };
      w.ym.l = w.ym.l || Date.now();
      w.__oknoshieldMetrika = {
        counterId: id,
        lastTrackedPath: w.location.pathname.replace(/\\/+$/, "") || "/",
        lastTrackedUrl: w.location.href
      };

      w.ym(id, "init", {
        ssr: true,
        webvisor: true,
        clickmap: true,
        ecommerce: "dataLayer",
        referrer: d.referrer,
        url: w.location.href,
        accurateTrackBounce: true,
        trackLinks: true
      });

      function load() {
        if (d.getElementById("oknoshield-yandex-metrika-script")) return;
        for (var i = 0; i < d.scripts.length; i++) {
          if (d.scripts[i].src === src) return;
        }
        var script = d.createElement("script");
        script.id = "oknoshield-yandex-metrika-script";
        script.async = true;
        script.src = src;
        d.head.appendChild(script);
      }

      function schedule() {
        if (typeof w.requestIdleCallback === "function") {
          w.requestIdleCallback(load, { timeout: 2000 });
        } else {
          w.setTimeout(load, 0);
        }
      }

      // Init and goals queue immediately; the library waits for page resources and idle time.
      if (d.readyState === "complete") schedule();
      else w.addEventListener("load", schedule, { once: true });
    })(window, document);
  `;
}
