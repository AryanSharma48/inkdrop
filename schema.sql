CREATE TABLE IF NOT EXISTS pastes (
  id TEXT PRIMARY KEY,
  title TEXT,
  language TEXT,
  visibility TEXT NOT NULL,
  text TEXT NOT NULL,
  expiresAt INTEGER
);
