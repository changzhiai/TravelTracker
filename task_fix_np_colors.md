# Task Completion Report: Fix US National Parks Color in Export

## Overview
The user reported that US National Parks appeared black when saved/exported. This was caused by the export logic not selecting the specific SVG elements used for national parks (`.park-path`), causing them to lose their CSS-defined colors during the export process (which relies on inlining computed styles).

## Changes Implemented

### 1. Updated `generateMapImage` in `src/App.tsx`
- **Logic Change:** Expanded the `querySelectorAll` target to include both `.country-path` and `.park-path`.
  - Old: `svgNode.querySelectorAll('.country-path')`
  - New: `svgNode.querySelectorAll('.country-path, .park-path')`
- **Style Fallback:** Added explicit fallback handling for `.park-path` elements in case computed styles are missing (though computed styles should now correctly work).
  - If a `.park-path` is found and has no computed fill, it defaults to a light gray/white style similar to unvisited countries, preventing the "black blob" effect.

## Verification
- **Code Analysis:** Confirmed that `generateMapImage` now iterates over park elements. The `window.getComputedStyle(originalPath).fill` will now be correctly read from the live DOM (where parks are green) and inlined into the cloned SVG as a specific hex code.
- **Browser/App Stability:** Verified that the application builds and runs correctly, and that export functions (like Save as CSV) continue to operate without regression.
