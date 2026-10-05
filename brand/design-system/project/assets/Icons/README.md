# Icons

68 stroke icons, 24×24, 1.75 stroke, round caps. Each file has one ink: **#8a8f7f** (mid grey, readable on both the carbon and bone grounds of these tiles). In product code don't use these files as `<img>`. Use the `Icon` component, which draws the same paths in `currentColor`. To swap in your own artwork, replace a file here and point the components at it with `MH.configure({ iconUrl: name => url })`; they render it as a mask, so it still takes the text colour.
