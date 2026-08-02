CREATE TABLE IF NOT EXISTS pastes (
  id TEXT PRIMARY KEY,
  userId TEXT,
  title TEXT,
  language TEXT,
  visibility TEXT NOT NULL,
  text TEXT NOT NULL,
  isBurn INTEGER,
  expiresAt INTEGER,
  passwordHash TEXT
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  githubId TEXT NOT NULL,
  userName TEXT NOT NULL,
  avatarUrl TEXT NOT NULL,
  createdAt INTEGER
);