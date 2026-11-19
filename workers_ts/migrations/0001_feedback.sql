-- Separate preview database only. No production data migration is performed.
CREATE TABLE IF NOT EXISTS feedback_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL CHECK(kind IN ('feedback', 'accuracy_reports', 'votes')),
  report_id TEXT UNIQUE,
  payload TEXT NOT NULL CHECK(json_valid(payload)),
  timestamp TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS feedback_records_kind_id ON feedback_records(kind, id);
-- Only hashed rate-limit identifiers; expired counters are deleted on access.
CREATE TABLE IF NOT EXISTS feedback_limits (
  key TEXT PRIMARY KEY,
  hits INTEGER NOT NULL,
  expires INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS feedback_limits_expires ON feedback_limits(expires);
