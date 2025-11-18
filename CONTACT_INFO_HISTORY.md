# Contact Info History

This repository now records an audit trail for changes to the singleton Contact Info document (`contactInfo` collection, fixed ID `primary`). Each create/update/reset action writes a snapshot entry to the `contactInfoHistory` collection.

## What Gets Stored
- action: create | update | reset
- contactInfoId: always `primary`
- payload: the raw request body submitted (fields changed)
- changedBy: email or uid of the authenticated user (falls back to `unknown`)
- snapshotAt: ISO timestamp (client side) plus Firestore server timestamps `createdAt` / `updatedAt`

## API Endpoints
- POST `/api/admin/contact-info` (upsert singleton + history entry)
- PUT `/api/admin/contact-info/:id` (updates singleton + history entry) — `:id` is ignored; always `primary`
- GET `/api/admin/contact-info/history` (returns all history entries, newest first)

You must have `canEditProfile` permission to access history.

## Typical Flow
1. Admin updates contact info via panel.
2. Backend upserts `contactInfo/primary` and immediately appends a history record.
3. Admin can retrieve the full change log to audit modifications.

## Testing
Use the script: `node backend/scripts/testContactInfoHistory.js` (requires `ADMIN_TOKEN`).

## Future Enhancements
- Prune old history entries (e.g., keep last 200).
- Diff generation (store only changed fields).
- Add revert endpoint using a selected history snapshot.
