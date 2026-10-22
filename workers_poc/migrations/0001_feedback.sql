CREATE TABLE feedback (
  id INTEGER PRIMARY KEY,
  kind TEXT NOT NULL CHECK(kind IN ('feedback', 'accuracy_reports', 'votes')),
  report_id TEXT UNIQUE,
  payload TEXT NOT NULL CHECK(json_valid(payload)),
  created_at TEXT NOT NULL
);
CREATE INDEX feedback_kind_created ON feedback(kind, created_at DESC);
CREATE TABLE rate_limits (key TEXT PRIMARY KEY, bucket INTEGER NOT NULL, count INTEGER NOT NULL);
CREATE INDEX rate_limits_bucket ON rate_limits(bucket);
CREATE TABLE exchange_cache (id INTEGER PRIMARY KEY CHECK(id=1), payload TEXT NOT NULL, expires INTEGER NOT NULL);
