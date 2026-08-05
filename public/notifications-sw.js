/*
 * SkillSync notification worker.
 *
 * Display-only: it has NO fetch handler and NO caches, so it can never serve
 * stale HTML or assets. Its single job is to let the page call
 * registration.showNotification(), which is the ONLY way Android Chrome
 * displays a web notification (`new Notification()` throws there), and to
 * route notification taps back into the app.
 */

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = event.notification.data && event.notification.data.url;
  event.waitUntil(
    (async () => {
      const clientList = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      const scopeOrigin = new URL(self.registration.scope).origin;
      const url = target ? new URL(target, scopeOrigin).href : scopeOrigin;
      for (const client of clientList) {
        if (new URL(client.url).origin === scopeOrigin) {
          await client.focus();
          if (target && "navigate" in client) {
            try {
              await client.navigate(url);
            } catch {
              /* focus is enough */
            }
          }
          return;
        }
      }
      await self.clients.openWindow(url);
    })(),
  );
});
