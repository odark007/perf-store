# Supabase Resource Naming Convention

## The rule

Every named Supabase resource in this project **must** end with `_perfume_store`.

This applies to all of the following resource types:

### Database tables

All tables must end with `_perfume_store`.

Examples:


- `sms_templates_perfume_store`
- `sms_logs_perfume_store`
- `email_templates_perfume_store`
- `email_logs_perfume_store`

### Storage buckets

All storage buckets must end with `_perfume_store`.

Examples:

- `student-documents_perfume_store`
- `profile-pics_perfume_store`
- `school-logos_perfume_store`

### Edge functions

All edge functions must end with `_perfume_store`.

Examples:

- `send-welcome-email_perfume_store`
- `process-payment_webhook_perfume_store`
- `generate-report_perfume_store`

## Never reference resources without `_perfume_store`

The application must never `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `JOIN` with, access, or
in any way interact with a resource that does **not** contain `_perfume_store` in its name.

The only exception is `auth.users`, which is accessed **exclusively** through the Supabase
Auth Admin API (`supabaseAdmin.auth.admin.listUsers`, `deleteUser`, etc.) — never via a
`from('auth.users')` query.

Before writing any migration, query, edge function, or storage rule, always confirm the
resource name contains `_perfume_store`.
