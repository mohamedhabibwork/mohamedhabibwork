/** Google Analytics 4 events. No-ops when gtag isn't loaded (local dev, blockers). */

type Gtag = (
	command: "event",
	name: string,
	params?: Record<string, string | number>,
) => void;

/** GA4 `view_item` for a service or project detail page. */
export function trackView(kind: "service" | "project", slug: string, name: string, price?: { amount: number; currency: string }) {
	track("view_item", {
		item_id: slug,
		item_name: name.slice(0, 100),
		item_category: kind,
		...(price ? { value: price.amount, currency: price.currency } : {}),
	});
}

export function track(name: string, params?: Record<string, string | number>) {
	const gtag = (globalThis as { gtag?: Gtag }).gtag;
	if (typeof gtag === "function") gtag("event", name, params);
}

/** Owner-only pages; analytics is switched off there. */
const PRIVATE_PATHS = /^\/(admin|login)(\/|$)/;

/**
 * Inline script for the root head that loads Google Analytics 4 only on the canonical host (not
 * previews, workers.dev or localhost) and keeps it disabled on private pages, also across client-side
 * navigation (GA honours `window["ga-disable-<id>"]`). It also reports contact clicks:
 * `tel:` → `click_call`, WhatsApp → `click_whatsapp`, `mailto:` → `click_email`, `[data-track="book"]` → `begin_checkout`,
 * CV PDF links → `file_download`; uncaught errors are sent as `exception`.
 * Mark those as Key events in GA to count them as conversions.
 */
export function analyticsBootstrap(measurementId: string, canonicalHost: string) {
	const id = JSON.stringify(measurementId);
	const host = JSON.stringify(canonicalHost);
	return `(function(){if(location.hostname!==${host})return;var id=${id},off="ga-disable-"+id,priv=${PRIVATE_PATHS};
function sync(){window[off]=priv.test(location.pathname)}sync();
["pushState","replaceState"].forEach(function(m){var o=history[m];history[m]=function(){var r=o.apply(this,arguments);sync();return r}});addEventListener("popstate",sync);
window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments)};gtag("js",new Date());gtag("config",id);
var s=document.createElement("script");s.async=true;s.src="https://www.googletagmanager.com/gtag/js?id="+encodeURIComponent(id);document.head.appendChild(s);
document.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest("a[href]");if(!a)return;var h=a.getAttribute("href")||"",p={link_url:h,page_path:location.pathname};if(a.dataset.track==="book")gtag("event","begin_checkout",p);else if(h.indexOf("tel:")===0)gtag("event","click_call",p);else if(h.indexOf("https://wa.me/")===0)gtag("event","click_whatsapp",p);else if(h.indexOf("mailto:")===0)gtag("event","click_email",p);else if(h.indexOf("/api/cv/")===0&&h.indexOf("/pdf")>0)gtag("event","file_download",{file_name:h.split("/")[3],file_extension:"pdf",link_url:h,page_path:location.pathname})},{capture:true});
addEventListener("error",function(e){gtag("event","exception",{description:String(e.message||"error").slice(0,100),fatal:false,page_path:location.pathname})});
addEventListener("unhandledrejection",function(e){var r=e.reason;gtag("event","exception",{description:String(r&&r.message||r||"rejection").slice(0,100),fatal:false,page_path:location.pathname})})})();`;
}
