ALTER TABLE feedback ADD COLUMN archived_at TEXT;
ALTER TABLE feedback ADD COLUMN source_key TEXT;
CREATE UNIQUE INDEX feedback_source_key ON feedback(source_key);
CREATE UNIQUE INDEX feedback_record_identity ON feedback(kind, created_at, payload);
CREATE INDEX feedback_archive_id ON feedback(archived_at, id DESC);
-- Protect idempotency atomically, including concurrent imports and D1 batches.
CREATE TRIGGER feedback_report_conflict BEFORE INSERT ON feedback
WHEN NEW.report_id IS NOT NULL AND EXISTS (
  SELECT 1 FROM feedback WHERE report_id=NEW.report_id AND payload<>NEW.payload
)
BEGIN
  SELECT RAISE(ABORT, 'LONKLAR_REPORT_CONFLICT');
END;
