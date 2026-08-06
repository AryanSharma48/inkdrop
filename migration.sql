-- Rename the existing users table
ALTER TABLE users RENAME TO users_old;

-- Create the new users table with polymorphic provider columns
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  providerId TEXT NOT NULL,
  userName TEXT NOT NULL,
  avatarUrl TEXT NOT NULL,
  createdAt INTEGER,
  UNIQUE(provider, providerId)
);

-- Copy existing users to the new table, setting provider to 'github' and providerId to their githubId
INSERT INTO users (id, provider, providerId, userName, avatarUrl, createdAt)
SELECT id, 'github', githubId, userName, avatarUrl, createdAt FROM users_old;

-- Drop the old users table
DROP TABLE users_old;
