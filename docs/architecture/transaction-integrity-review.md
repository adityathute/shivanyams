# Transaction integrity review

## Existing safeguards

The current backend already uses database transactions in several important workflows:

- Nested job-detail creation and update are wrapped with `transaction.atomic` in serializers.
- Comment creation and its post counter update run in one atomic block.
- Admin post review locks the post row with `select_for_update`, writes status history in the same transaction, and schedules newsletter delivery with `transaction.on_commit`.
- Published-post update emails are also scheduled with `transaction.on_commit`.

These patterns correctly separate database commit from external email side effects in the reviewed paths.

## Gaps to address

1. Newsletter subscription uses `update_or_create` but should keep the lookup/update and any related state changes inside an explicit transaction if the workflow grows.
2. Post/comment reports and save/reaction flows rely on database uniqueness plus `get_or_create`; callers should consistently handle concurrent uniqueness races where the API needs a deterministic response.
3. Visitor analytics updates visitor snapshots and inserts events. Their transaction boundary should be reviewed as one operation so a failed event insert cannot leave a partially updated visitor snapshot.
4. Denormalized counters must be updated with database-side `F()` expressions or locked rows; avoid read-modify-write arithmetic in Python.
5. Email, external Auth calls, and other network effects must not run while holding long database locks. Use `on_commit` for notifications that depend on successful persistence.

## Implementation policy

Use the smallest atomic boundary that covers all rows participating in one business invariant. Use `select_for_update` only where concurrent state transitions require serialization. Do not wrap read-only endpoints or slow network calls in long-running transactions.

No transaction behavior was changed in this review because complete write-path coverage and concurrency behavior require a coordinated service extraction. No tests or database operations were run.
