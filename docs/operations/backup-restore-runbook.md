# Database backup and restore runbook

## Backup requirements

- Use a dedicated least-privilege PostgreSQL backup account.
- Create a consistent custom-format dump before deployments and at the organization's approved recurring interval.
- Encrypt backups before off-site transfer; keep encryption keys outside the backup storage account.
- Keep daily/weekly/monthly generations under a documented retention policy. Restrict access and log downloads/deletions.
- Back up uploaded media separately; database dumps do not contain media file bytes.

## Example operator workflow

```bash
pg_dump --format=custom --no-owner --no-acl "$DATABASE_URL" --file="portal-$(date -u +%Y%m%dT%H%M%SZ).dump"
gpg --symmetric --cipher-algo AES256 --output portal-backup.dump.gpg portal-backup.dump
# Transfer the encrypted dump and media backup to the approved off-site store.
```

Do not put database URLs, passwords or encryption keys in shell history or source control. Prefer secret-manager injection and a restricted temporary directory.

## Restore drill

1. Restore into an isolated, access-restricted PostgreSQL instance, never directly over production.
2. Verify the dump checksum and decrypt using the controlled key-recovery procedure.
3. Restore with `pg_restore --no-owner --no-acl --dbname="$RESTORE_DATABASE_URL" portal-backup.dump`.
4. Run Django migration-state checks and application smoke tests against the isolated restore.
5. Verify media object counts and representative files separately.
6. Record RPO/RTO achieved, failures, approver and remediation; securely remove temporary plaintext files.

A backup is not considered verified until a restore drill succeeds. This repository does not schedule backups or perform off-site transfers automatically.
