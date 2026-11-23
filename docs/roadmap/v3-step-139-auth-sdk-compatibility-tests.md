# Step 139 — Auth and SDK compatibility tests

Added an Auth backend test asserting that the profile contract exposes assigned permission codes, and an SDK package test covering permission helper allow/deny behavior and missing-user behavior. Existing SDK Auth client tests already cover cookie credentials, CSRF headers, response envelopes, refresh behavior and token mode.

The tests were authored but not executed in this delivery. Run Auth tests and SDK package tests in CI before release.
