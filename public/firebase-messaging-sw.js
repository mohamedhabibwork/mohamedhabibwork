/* Firebase Cloud Messaging service worker: shows push notifications while the site is in the background.
 * The public web config arrives as the `config` query param (see src/lib/firebase.ts), so nothing is hardcoded here. */
importScripts("https://www.gstatic.com/firebasejs/13.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/13.0.0/firebase-messaging-compat.js");

const config = JSON.parse(new URL(self.location.href).searchParams.get("config") || "null");

if (config?.apiKey) {
	firebase.initializeApp(config);
	firebase.messaging().onBackgroundMessage((payload) => {
		// Payloads with a `notification` block are displayed by the SDK; data-only ones are shown here.
		if (payload.notification) return;
		const { title = "Mohamed Habib", body = "", url = "/" } = payload.data || {};
		self.registration.showNotification(title, { body, icon: "/icon-192.png", data: { url } });
	});
}

self.addEventListener("notificationclick", (event) => {
	event.notification.close();
	const target = event.notification.data?.url || event.notification.data?.FCM_MSG?.notification?.click_action || "/";
	// Only open pages on this site.
	const url = new URL(target, self.location.origin);
	event.waitUntil(clients.openWindow(url.origin === self.location.origin ? url.href : "/"));
});
