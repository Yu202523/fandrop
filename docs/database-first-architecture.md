# FanDrop Database-First Architecture

## Goal

This project should treat the database as a core product asset, not just a storage layer.

For FanDrop, the database should demonstrate:

- strong relational modeling
- reliable data integrity
- clear ownership and access control
- transactional updates for real-time event state
- good foundations for analytics and future expansion

## Why Database-First

The product's most important promise is trust in live information.

Users need to believe:

- the event status is current
- the remaining quantity is valid
- the location is the latest known location
- only the organizer can change organizer-owned data

That makes the database design part of the product experience.

## Recommended Supabase Data Model

Use Supabase Auth for identity, then keep app-level profile data in `public.profiles`.

Core tables:

- `profiles`
- `events`
- `event_updates`
- `event_subscriptions`

This is better than a standalone `users` table because:

- auth identity stays aligned with Supabase conventions
- RLS becomes simpler
- future OAuth providers stay easy to add

## Design Principles

### 1. Keep current state and history separate

`events` stores the current canonical event state.

`event_updates` stores the immutable history of what happened.

Why:

- event list pages need fast access to current status
- detail pages need a timeline of changes
- analytics later can use the historical log

### 2. Enforce ownership in the database

The frontend should not be trusted to decide who can edit an event.

Ownership rules should live in RLS policies and database functions.

### 3. Protect business invariants with constraints

Important rules should not rely only on application code.

Examples:

- `remaining_quantity >= 0`
- `remaining_quantity <= quantity`
- subscriptions must be unique per user and event

### 4. Use a transaction for event updates

When an organizer posts an update, two things must happen together:

1. insert into `event_updates`
2. update the current state in `events`

If only one succeeds, the product becomes inconsistent.

This should be implemented with one database function.

## Schema Decisions

### `profiles`

Purpose:

- app-facing user profile
- display name
- avatar

Important choice:

- primary key matches `auth.users.id`

### `events`

Purpose:

- current giveaway state
- optimized for list and detail page rendering

Important columns:

- `status`
- `location_text`
- `quantity`
- `remaining_quantity`
- `created_by`
- `last_updated_at`

Important choice:

- keep `status` and `remaining_quantity` directly on the event row for fast reads

### `event_updates`

Purpose:

- append-only event history
- timeline source
- audit trail

Important columns:

- `type`
- `message`
- `status`
- `location_text`
- `remaining_quantity`
- `created_by`

Important choice:

- snapshot relevant values into the update record so old updates keep their meaning

### `event_subscriptions`

Purpose:

- track who follows which event

Important choice:

- unique `(user_id, event_id)` constraint

## Reliability Features to Highlight

### Check Constraints

Use database constraints to prevent invalid states:

- non-negative quantities
- remaining quantity cannot exceed total quantity
- `title` and `idol` cannot be empty strings

### Foreign Keys

Use foreign keys with deliberate delete behavior:

- deleting an event deletes its updates and subscriptions
- deleting a user should not silently erase event history

### Indexes

Prioritize these query patterns:

- browse recent events
- fetch updates for one event
- fetch subscriptions for one user
- fetch events owned by one organizer

### Triggers

Use triggers for:

- `updated_at` maintenance
- auto-creating a profile row when a new auth user is created

### RLS Policies

Use row-level security to enforce:

- public read access for public-facing event pages
- authenticated-only writes
- organizer-only event mutation
- self-only subscription management

## Suggested Write Path

Do not let the client directly update event state and event history separately.

Instead:

1. client calls one RPC or one server action
2. database function validates ownership and values
3. database function inserts into `event_updates`
4. database function updates `events`
5. transaction commits

This is the strongest MVP story if your goal is to showcase database thinking.

## What To Show in Portfolio or Interviews

If you want the database to be a key highlight, emphasize:

- normalized relational schema
- current-state table plus append-only history table
- transactional consistency for real-time updates
- RLS-based authorization
- constraints and indexes based on real product behavior
- Supabase Auth integration with application profiles

## Recommended Next Build Order

1. Finalize SQL schema and policies
2. Create Supabase project and apply migration
3. Test inserts and policy behavior in SQL editor
4. Initialize Next.js app
5. Connect typed database client
6. Build event list and event detail reads first
7. Build organizer update flow through a server-side mutation path
