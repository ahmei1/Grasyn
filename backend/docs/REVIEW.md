# Backend review — 2026-09-08

The implementation is a useful modular MVP. This review inspected all backend feature services, controllers, DTOs, shared infrastructure, Prisma schema/migration, seed, and startup/container configuration. It is not a guarantee that the application has no bugs or a production security certification.

## Corrected issues

| Before | After | Why it matters |
| --- | --- | --- |
| Project/task handlers validated one query against two independent DTOs | One query DTO inherits pagination | Filters and page parameters work together with strict whitelisting |
| Project status was any string | Enum validation | Invalid input returns 400 instead of a Prisma/server error |
| Blank names/titles/comments passed length validation before trimming | Trim before validating | Whitespace-only content is rejected |
| Optional update descriptions accepted null, then called `.trim()` | Reject null for nonnullable fields; preserve nullable dates/assignee | Invalid input no longer triggers 500 |
| Arbitrary timezone strings accepted | IANA timezone validation | Profile timezone can be used by date formatting |
| PATCH could set ARCHIVED without archive permission or archivedAt | Same permission check for archive/restore; synchronized timestamp | Consistent permissions and archived listings |
| Project date ranges unchecked | Validate new and retained start/due dates together | Partial updates cannot set the end before the start |
| Refresh deleted old token before replacement creation | Conditional consumption and replacement in one transaction | Concurrent reuse loses with 401; failure rolls back consumption |
| Access cookie always lasted 15 minutes | Lifetime follows JWT configuration | Custom token lifetime behaves consistently |
| Startup accepted invalid secret/lifetime/security settings | Validate configuration before boot | Fail early with a concrete configuration error |
| Authentication swallowed database failures as 401 | Only JWT failures map to authentication errors | Database outages don't appear to be expired sessions |
| Parsed non-string cookies could reach token hashing | Read only string cookie values | Malformed cookies behave as missing credentials |
| Resource writes and events could commit separately | Project/task/comment writes and their events share transactions; workspace writes and audit events do too | Failed side effects do not leave partially successful writes |
| Moving a task only changed its own integer | Serialize board writes using a project row lock; shift and normalize sibling positions | Same-column and cross-column moves maintain ordering; status PATCH appends to destination |
| Removed workspace members remained assigned/on projects | Remove project memberships and clear task assignments atomically | No stale active assignments for removed members |
| Unique/not-found/foreign-key database errors became 500; project member code caught every error as duplicate | Map known Prisma failures; rethrow unexpected errors | More accurate HTTP errors |
| CORS alone was relied on for browser origin restrictions | Reject unsafe-method requests bearing an untrusted Origin | Adds explicit browser mutation origin checking |
| Seed erased all data without opt-in | Require `ALLOW_DESTRUCTIVE_SEED=true`; block production | Accidental seed invocation does not wipe data |
| Docker build context included local files | Add `.dockerignore` | Secrets and local node_modules are excluded |
| Tests skipped real middleware and mostly covered helpers | Share application setup with integration tests; cover real workflows | Tests exercise cookies, validation, guards, database writes, and errors |

No schema changes or migrations were needed. Existing frontend edits were not modified.

## Verification

- 29 unit tests passed (originally 7).
- 3 PostgreSQL integration tests passed, with multiple assertions covering auth, workspace/project/task/comment operations, combined filters/pagination, cross-workspace access denial, input rejection, archiving, Kanban moves, rollback after an injected activity error, invitations, notification creation, membership cleanup, logout, concurrent refresh reuse, and origin rejection.
- TypeScript/Nest production build passed.
- ESLint passed without errors or warnings.
- Prisma schema validation passed. Prisma 6 warns that the package.json seed configuration will need migration when upgrading to Prisma 7; no major-version upgrade was performed.

Database tests required execution outside the tool sandbox to reach local PostgreSQL. Tests used unique temporary accounts and cleaned up their rows. The seed was not run and existing application data was not reset.

## Remaining design limits and follow-up work

1. **Email identity is not verified.** Registration does not prove mailbox ownership. Invites check the account email, so don't treat invitations as production-grade identity proof until email verification is implemented. There is no email delivery, password reset, or ownership transfer endpoint.
2. **Workspace-wide collaboration is the current policy.** Every member can read/edit all projects and tasks in that workspace; project membership is organizational metadata, not a privacy boundary. Admins can manage other admins. Owners cannot leave or be demoted. Members may remove themselves. Decide explicitly before introducing private projects or stricter role hierarchy.
3. **Revocation has limits.** Logout revokes the refresh token and clears browser cookies, but a copied access JWT remains valid until expiry. Refresh rotation has no session-family reuse detection. Expired refresh tokens and invites need periodic cleanup. The frontend should coordinate simultaneous refresh requests; only one use of a refresh token succeeds.
4. **Concurrency has limits.** Board mutation ordering and refresh consumption are serialized/tested. Membership checks generally occur before write transactions: an in-flight request can finish while membership is being revoked. Concurrent project date updates do not use optimistic version checks. Harden these if strict revocation/parallel editing guarantees become requirements.
5. **Database invariants partly live in services.** Task/comment workspaceId and Project.ownerId aren't fully enforced by relational foreign keys. Direct database writes can introduce inconsistencies. A future migration can add composite relations after checking existing data. A removed member can remain the historical project owner; workspace owners/admins still control archiving.
6. **Pagination/scaling is incomplete.** Comments and member lists are unpaginated. Page/count reads use PostgreSQL's default transaction isolation and can differ during concurrent writes. Kanban reordering updates siblings individually and is intended for modest MVP boards; larger boards need a more efficient ranking strategy. Reordering also updates sibling timestamps.
7. **Archive semantics are limited.** Archiving affects project listings; it does not make projects read-only or hide their tasks from workspace task/dashboard views. Existing inconsistent archived rows are not backfilled by this code change.
8. **Deployment needs its own validation.** No container build, load test, dependency vulnerability audit, backup/restore test, or production rollout was performed. Health reports process liveness, not database readiness. Rate limits use local process memory; multi-instance deployments need shared storage and correctly configured proxy handling. Secure cookies require HTTPS and the current SameSite policy assumes frontend/API share a site.
9. **API documentation can grow.** Swagger exposes routes and input DTOs, but response schemas/examples and explicit cookie-auth documentation remain incomplete. Activity/audit storage is not a tamper-proof compliance log. There is no audit-list endpoint or realtime push.
