import { useEffect, useState } from "react";
import { Alert, Button, Card } from "#/design-system/ui";
import {
	disablePushNotifications,
	enablePushNotifications,
	isFirebaseConfigured,
} from "#/lib/firebase";
import {
	getPushStatus,
	registerPushToken,
	sendTestPush,
	unregisterPushToken,
} from "#/server/fn/admin";

/** This browser's FCM token, so the card knows whether it is subscribed. Per-device convenience only. */
const STORAGE_KEY = "mh-push-token";

const readToken = () => {
	try {
		return localStorage.getItem(STORAGE_KEY);
	} catch {
		return null;
	}
};
const writeToken = (token: string | null) => {
	try {
		if (token) localStorage.setItem(STORAGE_KEY, token);
		else localStorage.removeItem(STORAGE_KEY);
	} catch {
		/* Storage blocked: the subscription still works, the card just won't remember it. */
	}
};

type Status = { configured: boolean; devices: number };
type Notice = { variant: "success" | "danger" | "info"; text: string } | null;

/** Dashboard card that subscribes this browser to new-message and payment alerts. */
export function AdminNotifications() {
	const [status, setStatus] = useState<Status | null>(null);
	const [token, setToken] = useState<string | null>(null);
	const [busy, setBusy] = useState<"enable" | "disable" | "test" | null>(null);
	const [notice, setNotice] = useState<Notice>(null);
	const [denied, setDenied] = useState(false);

	useEffect(() => {
		setToken(readToken());
		setDenied(
			typeof Notification !== "undefined" &&
				Notification.permission === "denied",
		);
		getPushStatus()
			.then(setStatus)
			.catch(() =>
				setNotice({
					variant: "danger",
					text: "Couldn't load notification status.",
				}),
			);
	}, []);

	async function enable() {
		setBusy("enable");
		setNotice(null);
		try {
			const t = await enablePushNotifications();
			if (!t) {
				const blocked =
					typeof Notification !== "undefined" &&
					Notification.permission === "denied";
				setDenied(blocked);
				setNotice({
					variant: "danger",
					text: blocked
						? "Notifications are blocked for this site in your browser settings."
						: "This browser doesn't support push notifications.",
				});
				return;
			}
			await registerPushToken({
				data: { token: t, userAgent: navigator.userAgent.slice(0, 400) },
			});
			writeToken(t);
			setToken(t);
			setStatus(await getPushStatus());
			setNotice({
				variant: "success",
				text: "Notifications enabled on this device.",
			});
		} catch {
			setNotice({
				variant: "danger",
				text: "Couldn't enable notifications. Try again.",
			});
		} finally {
			setBusy(null);
		}
	}

	async function disable() {
		if (!token) return;
		setBusy("disable");
		setNotice(null);
		try {
			await unregisterPushToken({ data: { token } });
			await disablePushNotifications().catch(() => undefined);
			writeToken(null);
			setToken(null);
			setStatus(await getPushStatus());
			setNotice({
				variant: "info",
				text: "Notifications turned off on this device.",
			});
		} catch {
			setNotice({
				variant: "danger",
				text: "Couldn't turn notifications off. Try again.",
			});
		} finally {
			setBusy(null);
		}
	}

	async function test() {
		setBusy("test");
		setNotice(null);
		try {
			const { sent } = await sendTestPush();
			setNotice(
				sent
					? {
							variant: "success",
							text: `Test sent to ${sent} device${sent === 1 ? "" : "s"}.`,
						}
					: {
							variant: "danger",
							text: "No device received it. Check the FIREBASE_SERVICE_ACCOUNT secret and the worker logs.",
						},
			);
		} catch {
			setNotice({
				variant: "danger",
				text: "Couldn't send the test notification.",
			});
		} finally {
			setBusy(null);
		}
	}

	const ready = isFirebaseConfigured && status?.configured;
	return (
		<Card title="Notifications">
			<p style={{ marginTop: 0 }}>
				Get a push notification on this device for new contact messages and
				completed payments.
			</p>
			{status && !status.configured && (
				<Alert variant="warning">
					Server isn't set up for push yet: add the FIREBASE_SERVICE_ACCOUNT
					secret.
				</Alert>
			)}
			{!isFirebaseConfigured && (
				<Alert variant="warning">
					Firebase web config (VITE_FIREBASE_*) is missing from this build.
				</Alert>
			)}
			{denied && !token && (
				<Alert variant="warning">
					Notifications are blocked for this site. Allow them in your browser's
					site settings, then try again.
				</Alert>
			)}
			{notice && (
				<Alert variant={notice.variant} onDismiss={() => setNotice(null)}>
					{notice.text}
				</Alert>
			)}
			<div
				style={{
					display: "flex",
					gap: 8,
					flexWrap: "wrap",
					alignItems: "center",
					marginTop: 12,
				}}
			>
				{token ? (
					<Button
						variant="outline"
						leadingIcon="bell"
						loading={busy === "disable"}
						disabled={busy !== null}
						onClick={disable}
					>
						Turn off on this device
					</Button>
				) : (
					<Button
						leadingIcon="bell"
						loading={busy === "enable"}
						disabled={!ready || busy !== null}
						onClick={enable}
					>
						Enable on this device
					</Button>
				)}
				<Button
					variant="ghost"
					loading={busy === "test"}
					disabled={!ready || !status?.devices || busy !== null}
					onClick={test}
				>
					Send test
				</Button>
				{status && (
					<small>
						{status.devices} device{status.devices === 1 ? "" : "s"} subscribed
					</small>
				)}
			</div>
		</Card>
	);
}
