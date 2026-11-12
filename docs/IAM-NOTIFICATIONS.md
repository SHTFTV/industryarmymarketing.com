# IAM owner notification trigger

Producer: the existing sole IAM workflow runs `scripts/iam/notifications.py` after its execution reporter, including publishing failure and attention-hold outcomes. It does not run a second publisher. Durable public-safe journal: `operations/iam/notifications.json`, schemaVersion 1, `events` array.

The configured owner Codex heartbeat reads the journal directly. Its target/routing configuration and private report references stay with the owner and are never committed here. No email destination, webhook, new credential or unrelated recipient is inferred. This local/app relay is not claimed to be an independent cloud sender.

Event fields: `eventId` (stable), `kind`, `lifecycle`, `siteDomain`, optional `articleSlug`, `articleUrl`, `status`, `summary`, `nextAction`, timestamps, sanitized `proof`, `deliveryStatus`, `deliveryAttempts`, `deliveryReceipt`. Kinds: publication_verified, publishing_failure, publishing_blocked, approval_required, spacing_hold. Old verified rows need all actual production/render/media checks. Existing publication notices are marked reconciled; this is not a newly published article or a claim that an earlier notice was sent.

Deduplication binds publication events to their canonical URL and blocker/hold notices to their exact identity. Unchanged notices keep their event ID and delivery state. A resolved unpublished hold is superseded, never announced as still blocked. Unrelated successes never remove unresolved item notices.

Queueing and cross-chat acceptance are not delivery. Keep events queued until an actual user-facing scheduled Codex report contains the same event ID. An IAM owner then records an observed_user_report receipt in `operations/iam/notification-deliveries.json`: `{receipts:[{eventId,kind:"observed_user_report",reportDigest:"SHA256 of the independently observed private report",deliveredAt:"actual ISO time"}]}`. No private thread/message identifiers or full report text appear in this public repository. Only an opaque digest and delivery timestamp are retained. The reconciler consumes that receipt idempotently. Failed reader/delivery attempts stay retryable with their event ID; a local file or a bot's invented acknowledgement must never create a delivery receipt.

Public journal redactions: no secrets, auth headers, private chat IDs, raw model drafts/prompts, source HTML, contact data or detailed access-review text. Notifications expose public article links plus categorical status/reason and concrete safe next actions. Detailed diagnostics stay in the approved owner channels.
