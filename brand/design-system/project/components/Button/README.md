# Button

The action trigger, in LEAP's five variants and three sizes, restyled for MH: lime primary, square-cut 4px corners.

- One `primary` per view. `secondary` for the next most likely action, `outline` for neutral ones, `ghost` inside dense toolbars, `danger` only for destructive confirmation.
- `loading` swaps the leading icon for a spinner and sets `aria-busy`; the label stays so width doesn't jump.
- Labels: sentence case, verb first ("Deploy to staging"), no trailing punctuation.
- Consumer provides: the label, an optional icon name, and the handler.
