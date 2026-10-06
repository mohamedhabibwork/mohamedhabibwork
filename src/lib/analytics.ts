/** Google Analytics 4 events. No-ops when gtag isn't loaded (local dev, blockers). */

type Gtag = (
	command: "event",
	name: string,
	params?: Record<string, string | number>,
) => void;

export function track(name: string, params?: Record<string, string | number>) {
	const gtag = (globalThis as { gtag?: Gtag }).gtag;
	if (typeof gtag === "function") gtag("event", name, params);
}

/**
 * Inline script for the root head: one delegated click listener that reports contact actions.
 * `tel:` → `click_call`, WhatsApp → `click_whatsapp`, `mailto:` → `click_email`,
 * `[data-track="book"]` → `begin_checkout`. Mark these as Key events in GA to count them as conversions.
 */
export const contactClickTracking = `document.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest("a[href]");if(!a||typeof gtag!=="function")return;var h=a.getAttribute("href")||"",p={link_url:h,page_path:location.pathname};if(a.dataset.track==="book")gtag("event","begin_checkout",p);else if(h.indexOf("tel:")===0)gtag("event","click_call",p);else if(h.indexOf("https://wa.me/")===0)gtag("event","click_whatsapp",p);else if(h.indexOf("mailto:")===0)gtag("event","click_email",p);},{capture:true});`;
