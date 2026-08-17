# FanDrop Step 2 Database Roadmap

## Step 2 Objective

Turn the project from a product idea into a database-backed system design that is ready for application development.

## What Was Added

- a database-first architecture note
- an initial Supabase migration
- ownership and access control design
- a transactional update function for organizer actions

## Why This Is the Right Next Step

Your stated goal is not only to ship the side project, but also to learn and demonstrate strong database design.

Because of that, Step 2 should prioritize:

- data consistency
- authorization at the database layer
- schema quality
- future maintainability

before frontend scaffolding.

## Recommended Implementation Sequence

1. Create a Supabase project
2. Apply `supabase/migrations/20260625_000001_initial_schema.sql`
3. Test the tables and policies in Supabase SQL editor
4. Create seed data for 2 to 3 users and 5 to 10 events
5. Validate organizer update flow through `create_event_update(...)`
6. Only then initialize and connect the Next.js app

## SQL Behaviors To Test First

### Profile creation

- new auth user should create a profile row automatically

### Event creation

- authenticated user can create event with themselves as `created_by`
- invalid quantity values should fail

### Organizer update

- organizer can update their own event through `create_event_update(...)`
- non-owner should be rejected
- status and remaining quantity should stay in sync

### Subscription behavior

- user can subscribe once to the same event
- duplicate subscriptions should fail
- one user cannot delete another user's subscription

## Suggested Step 3

After this database step is verified, Step 3 should be:

> Initialize the Next.js app and build read-only views for the event list and event detail pages using the live database schema.
