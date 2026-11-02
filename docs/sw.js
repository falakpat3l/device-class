// Lets the website work offline after the first visit.
// The Android app does not use this file: it already has every file inside the APK.
//
// The page (index.html), app.js and style.css are always fetched fresh when online, so changes reach people
// on their next visit. Fonts and icons are served from the saved copy. If you change one of them, raise VERSION.
//
// Security: only complete, plain answers from this site are saved (GET, status 200, not redirected),
// never an error page or an answer from another site.
var VERSION = "v2";
var CACHE = "device-class-" + VERSION;
var CORE = ["./", "index.html", "app.js", "style.css", "manifest.webmanifest", "icon.svg", "icon-192.png",
  "fonts/exo2_regular.woff2", "fonts/exo2_semibold.woff2", "fonts/exo2_bold.woff2"];
var FRESH = ["app.js", "style.css"];

function here(path) { return new URL(path, self.registration.scope).href; }

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE)
    .then(function (c) { return c.addAll(CORE); })
    .then(function () { return self.skipWaiting(); }));
});

// Remove this app's older caches. Other apps on the same site use their own names and are left alone.
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf("device-class-") === 0 && k !== CACHE; })
      .map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

function save(e, key, res) {
  if (res && res.status === 200 && res.type === "basic" && !res.redirected) {
    var copy = res.clone();
    e.waitUntil(caches.open(CACHE).then(function (c) { return c.put(key, copy); }).catch(function () { /* storage full */ }));
  }
  return res;
}

self.addEventListener("fetch", function (e) {
  var req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== self.location.origin) return;

  // The page: network first (skipping the browser's own short-term cache), the saved copy when offline.
  if (req.mode === "navigate") {
    e.respondWith(fetch(req.url, {cache: "no-cache", credentials: "same-origin"}).then(function (res) {
      // A redirected answer cannot be given to a page load, so ask again the normal way.
      return res.redirected ? fetch(req) : save(e, req, res);
    }).catch(function () {
      return caches.open(CACHE).then(function (c) {
        return c.match(req, {ignoreSearch: true}).then(function (hit) { return hit || c.match("./"); });
      }).then(function (hit) { return hit || Response.error(); });
    }));
    return;
  }

  // The page's script and styles: network first too, so they always match the page.
  if (FRESH.some(function (f) { return here(f) === url.origin + url.pathname; })) {
    e.respondWith(fetch(req.url, {cache: "no-cache", credentials: "same-origin"}).then(function (res) {
      return save(e, req, res);
    }).catch(function () {
      return caches.open(CACHE).then(function (c) { return c.match(req); }).then(function (hit) { return hit || Response.error(); });
    }));
    return;
  }

  // Fonts, icons and anything else: the saved copy first, the network on first use.
  e.respondWith(caches.open(CACHE).then(function (c) {
    return c.match(req).then(function (hit) {
      return hit || fetch(req).then(function (res) { return save(e, req, res); });
    });
  }));
});
