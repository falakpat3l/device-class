// Lets the website work offline after the first visit.
// The Android app does not use this file: it already has every file inside the APK.
//
// The page (index.html) is always fetched fresh when online, so changes reach people on their next visit.
// Fonts and icons are served from the saved copy. If you change one of them, raise VERSION.
var VERSION = "v1";
var CACHE = "device-class-" + VERSION;
var CORE = ["./", "index.html", "manifest.webmanifest", "icon.svg", "icon-192.png",
  "fonts/exo2_regular.woff2", "fonts/exo2_semibold.woff2", "fonts/exo2_bold.woff2"];

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

function save(req, res) {
  if (res.ok) {
    var copy = res.clone();
    caches.open(CACHE).then(function (c) { return c.put(req, copy); });
  }
  return res;
}

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;

  // The page: network first (skipping the browser's own short-term cache), the saved copy when offline.
  if (req.mode === "navigate") {
    e.respondWith(fetch(req.url, {cache: "no-cache"}).then(function (res) {
      // A redirected answer cannot be given to a page load, so ask again the normal way.
      return res.redirected ? fetch(req) : save(req, res);
    }).catch(function () {
      return caches.open(CACHE).then(function (c) {
        return c.match(req, {ignoreSearch: true}).then(function (hit) { return hit || c.match("./"); });
      });
    }));
    return;
  }

  // Fonts, icons and anything else: the saved copy first, the network on first use.
  e.respondWith(caches.open(CACHE).then(function (c) {
    return c.match(req).then(function (hit) {
      return hit || fetch(req).then(function (res) { return save(req, res); });
    });
  }));
});
