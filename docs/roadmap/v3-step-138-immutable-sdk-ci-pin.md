# Step 138 — Immutable SDK CI pin

Updated Portal CI to checkout the SDK from the V3 branch's exact immutable commit SHA rather than the older unrelated commit. CI continues to build and pack all SDK packages before installing and building the Portal.

The Portal CI pin is refreshed to the permission-aware SDK source commit. A later SDK-only documentation/test commit does not change the built package code; the pin remains the exact source revision used for the Portal artifact.
