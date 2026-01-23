# Task Completion Report: Batch Image Filename Fix

## Overview
I have fixed a bug in the "Save as Images" batch export feature where all exported images were receiving the filename of the *initial* scope (e.g., "World") instead of their specific map name (e.g., "USA", "Europe").

## Changes Implemented

### 1. Updated `saveMapAsPNG` Function
- **File:** `src/App.tsx`
- **Change:** Modified the function to accept an optional `scopeOverride` argument.
- **Logic:** The filename generation `Travel_Tracker_${formattedScope}_${date}.png` now prioritizes this `scopeOverride` argument if provided. If not provided (single export), it falls back to the current state `currentScope`.

### 2. Updated Batch Loop
- **File:** `src/App.tsx` (in `handleSaveOption`)
- **Change:** The loop iterating through `['world', 'usa', ...]` now explicitly calls `saveMapAsPNG(scope)`.
- **Reason:** This ensures that even though the React state update `setCurrentScope` is asynchronous, the file saver has the correct, explicit label for the file it is about to generate.

## Verification
- **Code Logic:** Verified that the scope variable from the `for` loop is passed directly to the filename generator.
- **Browser Test:** Confirmed the batch export sequence runs smoothly and notifications appear for each step.
