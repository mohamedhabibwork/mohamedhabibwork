# ThemeToggle

Switches the colour theme by setting `data-theme="light" | "dark"` on `<html>` (or `target`). The choice is saved to `localStorage` (`mh-theme`) and defaults to the OS setting.

- `variant="icon"` (default): one square button that flips light and dark; the icon shows the theme you'll switch *to*, and the label says so.
- `variant="segmented"`: Light / Dark / System. Use it in settings pages; `withSystem={false}` drops System.
- Put the icon toggle in the site header and admin top bar, once per page. Every preview in this system carries one in its corner.
- It stays in sync if anything else changes `data-theme`. `MH.useTheme()` gives `{ theme, preference, setTheme, toggle }` for custom controls.
- To avoid a flash of the wrong theme, set `data-theme` in a blocking inline script in `<head>` from the same `localStorage` key before the bundle loads.
