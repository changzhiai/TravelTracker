# Task Completion Report: Image Filename Update

## Overview
I have updated the default filename format for exported image maps (PNGs) to be more descriptive and professional.

## Changes Implemented

### 1. Updated Filename Logic
- **File:** `src/App.tsx`, inside `saveMapAsPNG` function.
- **Old Format:** `${currentScope}_travel_map_${date}.png` (e.g., `usaParks_travel_map_2024-05-20.png`).
- **New Format:** `Travel_Tracker_${formattedScope}_${date}.png`
- **Mapping:**
  - `world` -> `World`
  - `usa` -> `USA`
  - `usaParks` -> `US_National_Parks`
  - `europe` -> `Europe`
  - `china` -> `China`
  - `india` -> `India`

### 2. Functional Impact
- When users export a single map or use the "Save as Images" batch function, the downloaded files will now be named clearly (e.g., `Travel_Tracker_USA_2024-05-20.png`) instead of using internal camelCase scope names.

## Verification
- **Code Logic:** Verified the mapping object correctly transforms internal scope keys to friendly filenames.
- **Stability:** Confirmed the application still builds and runs correctly via browser verification of the export UI flow.
