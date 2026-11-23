# Analytics metrics, privacy and retention

## Metric definitions (v1)

- **Website page view:** one accepted `WebsiteView` event with a unique `event_id` when supplied. Repeated submissions with the same UUID are ignored.
- **Unique website visitor:** one pseudonymous `WebsiteVisitor` identity over the retained history; it is not a person count.
- **Post view:** one accepted `PostView` event. The denormalized post view counter increments only for accepted events.
- **Unique post visitor:** one pseudonymous visitor key per post, not a cross-site person identity.
- **Engagement:** likes, dislikes, comments, shares, saves and subscriptions are separate event/counter families and must not be added together as unique people.
- **Date ranges:** API `from` and `to` values are inclusive calendar dates in the Portal timezone; maximum range is 366 calendar days.

## Privacy controls

New view events store SHA-256 pseudonyms for account and browser-generated visitor IDs. New website-view events do not store IP addresses or names. Referrers are reduced to scheme and host; query strings and paths are discarded. Old records may still contain fields collected under the previous behavior until the retention command anonymizes them.

## Retention policy

Default policy: anonymize identity fields on analytics events and visitor records after 30 days; delete raw website/post view events after 730 days. Run:

```powershell
python manage.py expire_analytics --dry-run
python manage.py expire_analytics
```

Schedule the command daily using the deployment scheduler. Confirm dry-run counts, backups and the approved retention policy before first production execution. The command does not delete business content or editorial records.
