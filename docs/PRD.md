# InkDrop

> A modern, serverless Pastebin platform built for developers to create, store, and share text snippets using unique URLs.

---

# Project Vision

InkDrop is a lightweight text-sharing platform similar to Pastebin or GitHub Gist.

The goal is to allow users to quickly share:

- Source code
- Configuration files
- Error logs
- JSON
- SQL Queries
- Markdown
- Plain text
- API responses

without creating an account.

Every uploaded snippet receives a unique URL that can be shared with anyone.

Example:

```
https://inkdrop.dev/p/Ab3XkL
```

Anyone with the URL can instantly access the paste.

---

# Core Philosophy

The project should feel like a real SaaS product rather than a college CRUD application.

Focus on:

- Clean architecture
- Modular code
- Scalable APIs
- Production-ready folder structure
- Strong typing
- Good error handling
- Extensibility

The project should demonstrate backend engineering skills rather than just frontend design.

---

# User Workflow

## Creating a Paste

User visits InkDrop

↓

Types or pastes text

↓

Chooses options

- Language
- Visibility
- Expiration
- Burn After Reading (optional)

↓

Clicks Create

↓

Backend validates request

↓

Unique ID is generated

↓

Paste is stored

↓

Shareable URL is returned

↓

User shares URL

---

## Viewing a Paste

User opens URL

↓

Backend receives ID

↓

Checks cache

↓

If not found

↓

Checks database

↓

If paste exists

↓

Checks expiration

↓

Returns paste

↓

Frontend displays syntax-highlighted content

---

# Features

## Version 1 (MVP)

### Explore Page

- Browse Recent Public Pastes
- Search Public Pastes

### Paste Management

- Create Paste
- View Paste
- Delete Paste
- Raw Paste View
- Copy Button

### Paste Options

- Title
- Language Selection
- Public
- Unlisted
- Expiration

Supported Expiration:

- Never
- 1 Hour
- 1 Day
- 1 Week

### Display

- Syntax Highlighting
- Line Numbers
- Responsive Layout

---

## Version 2

- Burn After Reading
- Password Protected Pastes
- QR Code Sharing
- Markdown Preview
- Duplicate Paste

---

## Version 3

Authentication

- GitHub Login

Dashboard

- My Pastes
- Search
- Tags
- Delete
- Edit

---

## Version 4

Production Features

- Analytics
- Rate Limiting
- API Keys
- Public REST API
- Monitoring
- Logging
- Metrics
- Cache Optimization

---

# High-Level Architecture

```
                User
                  │
                  ▼
             React Frontend
                  │
          HTTP REST Requests
                  │
                  ▼
          Hono API (Workers)
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
 Cloudflare KV        Cloudflare D1
    (Cache)            (Database)
```

---

# System Workflow

## Create Paste

```
User

↓

Frontend

↓

POST /paste

↓

Validate Input

↓

Generate Unique ID

↓

Store in D1

↓

Cache in KV

↓

Return URL
```

---

## View Paste

```
User

↓

GET /paste/:id

↓

Check KV

↓

Found?

↓

Yes → Return

↓

No

↓

Check D1

↓

Found?

↓

No → 404

↓

Yes

↓

Expired?

↓

Yes

↓

Delete

↓

Return Expired

↓

No

↓

Cache Result

↓

Return Paste
```

---

# Technology Stack

## Frontend

Framework

- React

Bundler

- Vite

Language

- TypeScript

Styling

- TailwindCSS

Component Library

- shadcn/ui

Routing

- React Router

HTTP Client

- Native Fetch API

Syntax Highlighting

- react-syntax-highlighter

Icons

- Lucide React

Notifications

- Sonner

---

## Backend

Runtime

- Cloudflare Workers

Framework

- Hono

Language

- TypeScript

Validation

- Zod

Unique IDs

- NanoID

Environment Variables

- Wrangler Secrets

---

## Database

Cloudflare D1

Stores

- Pastes
- Metadata

---

## Cache

Cloudflare KV

Stores

- Frequently accessed pastes
- Cached metadata

Purpose

Reduce database reads.

---

## Deployment

Frontend

Vercel

Backend

Cloudflare Workers

Database

Cloudflare D1

Cache

Cloudflare KV

---

# API Design

## POST

```
POST /api/pastes
```

Creates a new paste.

---

## GET

```
GET /api/pastes/:id
```

Returns a paste.

---

## RAW

```
GET /api/raw/:id
```

Returns plain text.

---

## DELETE

```
DELETE /api/pastes/:id
```

Deletes a paste.

---

# Database Design (Initial)

## Paste

Fields

- id
- title
- content
- language
- visibility
- expiresAt
- burnAfterRead
- createdAt

No user accounts in MVP.

---

# Folder Structure

```
inkdrop/

├── frontend/
│
│   ├── src/
│   │
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── lib/
│   ├── services/
│   ├── types/
│   └── utils/
│
├── backend/
│
│   ├── src/
│   │
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── db/
│   ├── utils/
│   ├── types/
│   └── index.ts
│
├── README.md
│
└── docs/
```

---

# Development Principles

- Keep functions small.
- Separate business logic from route handlers.
- Never access the database directly from routes.
- Use service layers.
- Validate every request.
- Use proper HTTP status codes.
- Handle all possible errors.
- Keep the code modular.
- Prefer composition over large files.

---

# Future Scalability

Future improvements should be easy to integrate.

Examples

Authentication

```
Users

↓

Pastes

↓

Dashboard
```

Analytics

```
Paste

↓

Views

↓

Statistics
```

Search

```
Pastes

↓

Index

↓

Search Engine
```

API Keys

```
Developer

↓

API Key

↓

Rate Limits

↓

REST API
```

---

# Learning Goals

This project is intended to demonstrate:

- REST API Design
- Backend Architecture
- Cloudflare Workers
- Serverless Development
- Database Design
- Caching Strategies
- Input Validation
- Error Handling
- TypeScript
- Scalable Folder Structure
- Production-grade Code Organization
- Modern Full Stack Development

---

# Success Criteria

By the end of this project, InkDrop should feel like a real-world backend application rather than a simple CRUD project.

The codebase should be clean, modular, scalable, and production-ready, serving as a strong portfolio project demonstrating backend engineering principles.