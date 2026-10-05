# Modal

A dialog over an `overlay` scrim, for confirmations and short forms.

- Title asks or states; the footer holds at most two buttons, primary last.
- Clicking the scrim calls `onClose`. The consumer handles focus trap and Escape (or uses a headless dialog primitive).
- `inline` renders it in flow (for docs and previews).
