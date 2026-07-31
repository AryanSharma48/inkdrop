<h1 align="center">
  <img src="./frontend/public/logo.png" alt="InkDrop Logo" width="50" align="center" /> InkDrop
</h1>

A modern, serverless Pastebin platform built for developers to create, store, and share text snippets using unique URLs.

## Project Vision

InkDrop is a lightweight text-sharing platform similar to Pastebin or GitHub Gist. It allows users to quickly share source code, configuration files, error logs, JSON, SQL queries, Markdown, plain text, and API responses without creating an account.

Every uploaded snippet receives a unique URL that can be shared with anyone.

## Features

### Current (MVP)
- **Paste Management:** Create, view, and delete pastes. Includes raw paste view and copy functionality.
- **Paste Options:** Set title, language selection, visibility (public/unlisted), and expiration (never, 1 hour, 1 day, 1 week).
- **Display:** Syntax highlighting, line numbers, and a responsive layout.

### Planned Features
- Burn After Reading
- Password Protected Pastes
- Markdown Preview
- Authentication and Dashboard
- Public REST API and Rate Limiting
- Analytics and Monitoring

## Technology Stack

### Frontend
- **Framework:** React with Vite
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **Components:** shadcn/ui
- **Routing:** React Router

### Backend
- **Runtime:** Cloudflare Workers
- **Framework:** Hono
- **Language:** TypeScript
- **Validation:** Zod

### Database & Storage
- **Database:** Cloudflare D1 (Stores pastes and metadata)
- **Cache:** Cloudflare KV (Stores frequently accessed pastes and cached metadata)

## Architecture Overview

InkDrop utilizes a modern serverless architecture hosted on Cloudflare. The React frontend communicates via HTTP REST requests to the Hono API running on Cloudflare Workers. 

To ensure low latency and high performance, the backend leverages Cloudflare KV to cache frequent requests, reducing the load on the Cloudflare D1 SQL database.

## Frontend UI

The frontend is a strictly brutalist, "Government Website" themed React application. 
- Features stark, flat colors (solid blue, dark grey, black) with strict zero border-radius elements.
- Built using Vite, React, and Tailwind CSS v4.
- Syntax highlighting is handled cleanly on the client-side using `react-syntax-highlighter` mapping to the backend's saved language tokens.

## System Workflow 

### Creating a Paste
1. User submits paste content via the Frontend.
2. Backend validates input and generates a unique ID using NanoID.
3. The new paste is stored in Cloudflare D1.
4. The paste data is cached in Cloudflare KV for quick subsequent access.
5. A shareable URL is returned to the user.

### Viewing a Paste
1. User visits the unique paste URL.
2. Backend checks Cloudflare KV cache for the paste.
3. If not found in cache, it falls back to querying Cloudflare D1.
4. If expired, the paste is deleted and an expiration message is returned.
5. If valid, the result is cached and returned to the user.

## Local Development Setup

### Prerequisites
- Node.js
- npm
- Cloudflare Wrangler CLI

### Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/AryanSharma48/inkdrop.git
   cd inkdrop
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```
   This will start the Wrangler local development server.

4. Build the project:
   ```bash
   npm run build
   ```

## Project Structure

```text
inkdrop/
├── frontend/        # React application source code
├── backend/         # Hono API source code
├── docs/            # Project documentation and PRD
├── schema.sql       # Database schema definition
├── wrangler.toml    # Cloudflare Workers configuration
└── package.json     # Project dependencies and scripts
```

## Database Schema

The initial database schema consists of a `pastes` table tracking the snippet details, language, visibility, and expiration.

```sql
CREATE TABLE IF NOT EXISTS pastes (
  id TEXT PRIMARY KEY,
  title TEXT,
  language TEXT,
  visibility TEXT NOT NULL,
  text TEXT NOT NULL,
  expiresAt INTEGER
);
```

## License
ISC
