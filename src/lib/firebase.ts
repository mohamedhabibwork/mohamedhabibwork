import {
	type FirebaseApp,
	type FirebaseOptions,
	getApps,
	initializeApp,
} from "firebase/app";
import { SITE_URL } from "#/lib/seo";

/** Owner-only pages; analytics stays off there (same rule as GA in analytics.ts). */
const PRIVATE_PATHS = /^\/(admin|login)(\/|$)/;

const env = import.meta.env;

const config: FirebaseOptions = {
	apiKey: env.VITE_FIREBASE_API_KEY,
	authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
	projectId: env.VITE_FIREBASE_PROJECT_ID,
	storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
	appId: env.VITE_FIREBASE_APP_ID,
	measurementId: env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const isFirebaseConfigured = Boolean(
	config.apiKey && config.projectId && config.appId,
);

/** Shared Firebase app (browser only). Returns null when the env config is missing. */
export function getFirebaseApp(): FirebaseApp | null {
	if (typeof window === "undefined" || !isFirebaseConfigured) return null;
	return getApps()[0] ?? initializeApp(config);
}

/**
 * Asks for notification permission and returns this browser's FCM registration token, or null when
 * push isn't supported, isn't configured, or the visitor declines. Send the token to the server to target it.
 */
export async function enablePushNotifications(): Promise<string | null> {
	const vapidKey = env.VITE_FIREBASE_VAPID_KEY;
	const app = getFirebaseApp();
	if (
		!app ||
		!vapidKey ||
		!("serviceWorker" in navigator) ||
		!("Notification" in window)
	)
		return null;
	try {
		const { getMessaging, getToken, isSupported } = await import(
			"firebase/messaging"
		);
		if (!(await isSupported())) return null;
		if ((await Notification.requestPermission()) !== "granted") return null;
		const swUrl = `/firebase-messaging-sw.js?config=${encodeURIComponent(JSON.stringify(config))}`;
		const serviceWorkerRegistration = await navigator.serviceWorker.register(
			swUrl,
			{
				scope: "/firebase-cloud-messaging-push-scope",
			},
		);
		return await getToken(getMessaging(app), {
			vapidKey,
			serviceWorkerRegistration,
		});
	} catch (error) {
		console.warn("Push notifications could not be enabled", error);
		return null;
	}
}

/** Revokes this browser's FCM token so it stops receiving pushes. */
export async function disablePushNotifications(): Promise<void> {
	const app = getFirebaseApp();
	if (!app) return;
	const { deleteToken, getMessaging, isSupported } = await import(
		"firebase/messaging"
	);
	if (await isSupported()) await deleteToken(getMessaging(app));
}

/**
 * Shows foreground pushes as system notifications too (FCM only auto-displays them in the background),
 * reusing the messaging service worker so clicks behave the same. Returns an unsubscribe function.
 */
export async function showForegroundPushes(): Promise<() => void> {
	return onForegroundMessage(async ({ data }) => {
		const reg = await navigator.serviceWorker.getRegistration(
			"/firebase-cloud-messaging-push-scope",
		);
		if (!reg || !data?.title) return;
		await reg.showNotification(data.title, {
			body: data.body ?? "",
			icon: "/icon-192.png",
			data: { url: data.url ?? "/admin" },
		});
	});
}

/** Notifications that arrive while the page is open (the service worker handles background ones). */
export async function onForegroundMessage(
	handler: (payload: import("firebase/messaging").MessagePayload) => void,
): Promise<() => void> {
	const app = getFirebaseApp();
	if (!app) return () => {};
	const { getMessaging, isSupported, onMessage } = await import(
		"firebase/messaging"
	);
	if (!(await isSupported())) return () => {};
	return onMessage(getMessaging(app), handler);
}

/**
 * Starts Firebase Analytics on the canonical host only (not previews, workers.dev or localhost),
 * skipping private pages. The SDK is loaded lazily so it stays out of the main bundle and SSR.
 */
export async function initFirebaseAnalytics(): Promise<void> {
	if (typeof window === "undefined" || !config.measurementId) return;
	if (
		location.hostname !== new URL(SITE_URL).hostname ||
		PRIVATE_PATHS.test(location.pathname)
	)
		return;
	const app = getFirebaseApp();
	if (!app) return;
	try {
		const { getAnalytics, isSupported } = await import("firebase/analytics");
		if (await isSupported()) getAnalytics(app);
	} catch (error) {
		console.warn("Firebase Analytics failed to start", error);
	}
}
