# FanDrop Step 1 Foundation Plan

## 1. Product Goal

FanDrop is a real-time fan giveaway management platform.

The MVP goal is:

> Let giveaway organizers update real-time status quickly, and let followers see the latest event information without repeatedly checking social media.

## 2. MVP Scope

### In Scope

- Google login
- Create giveaway event
- Event list page
- Event detail page
- Follow / unfollow event
- Organizer status updates
- Real-time event synchronization

### Out of Scope

- Native app
- AI FAQ
- Chatroom
- Queue system
- Map navigation
- Social posting automation
- LINE / Telegram / Discord notifications

## 3. Technical Decision

### Recommended Stack

- Frontend: Next.js
- Styling: Tailwind CSS
- Backend: Supabase
- Database: PostgreSQL (via Supabase)
- Authentication: Supabase Auth with Google login
- Real-time sync: Supabase Realtime
- Hosting: Vercel + Supabase

### Why This Stack

- Faster MVP delivery
- Built-in auth and database
- Real-time support without custom socket server
- Easy deployment and scaling for early validation

## 4. Core User Flows

### Organizer Flow

1. Login with Google
2. Create a giveaway event
3. Publish event information
4. Update status during the event
5. Mark event as ended or out of stock

### Follower Flow

1. Login with Google
2. Browse event list
3. Open event detail page
4. Follow event
5. Receive real-time updates on the page

## 5. Core Entities

### users

- id
- name
- email
- avatar_url
- created_at

### events

- id
- title
- idol
- description
- image_url
- location_text
- event_date
- status
- quantity
- remaining_quantity
- created_by
- created_at
- updated_at

### event_updates

- id
- event_id
- type
- message
- location_text
- remaining_quantity
- created_by
- created_at

### subscriptions

- id
- user_id
- event_id
- created_at

## 6. Suggested Event Statuses

- draft
- upcoming
- live
- low_stock
- moved
- ended

## 7. Suggested Update Types

- started
- quantity_changed
- location_changed
- low_stock
- ended

## 8. Page Sitemap

### Public / Shared Pages

- `/`
  - Event list
  - Search and basic filters
- `/events/[id]`
  - Event detail
  - Real-time updates

### Logged-in Pages

- `/events/new`
  - Create new event
- `/my/events`
  - Organizer event management
- `/my/follows`
  - Followed events list

## 9. Page Requirements

### `/`

Show:

- Event title
- Idol / artist name
- Current status
- Event date
- Current location
- Remaining quantity

Actions:

- Open event detail
- Login

### `/events/[id]`

Show:

- Event main info
- Current status
- Last updated time
- Current location
- Remaining quantity
- Update timeline

Actions:

- Follow / unfollow
- If owner: add status update

### `/events/new`

Fields:

- Title
- Idol
- Description
- Image
- Event date
- Location
- Quantity

### `/my/events`

Show:

- Events created by current user
- Current status per event
- Quick access to edit or update

### `/my/follows`

Show:

- Followed events
- Latest status
- Last updated time

## 10. MVP Data Rules

- One event belongs to one organizer
- One user can follow many events
- One event can have many followers
- One event can have many updates
- `remaining_quantity` cannot be larger than `quantity`
- When organizer posts an update, the main `events` table should also be updated if status, location, or quantity changes

## 11. Realtime Design

### Real-time Targets

- Event detail page
- Event list page
- Followed events page

### Sync Behavior

When organizer creates a new update:

1. Insert one record into `event_updates`
2. Update the related row in `events`
3. Broadcast changes through Supabase Realtime
4. Refresh subscribed client state

## 12. Access Control

### Organizer Permissions

- Can create event
- Can update only their own events
- Can create updates only for their own events

### Follower Permissions

- Can view public events
- Can follow / unfollow events after login

## 13. Success Criteria for Step 1

Step 1 is complete when the team has:

- Confirmed the MVP scope
- Confirmed the technical stack
- Confirmed the core database schema
- Confirmed the page sitemap
- Confirmed the event status model

## 14. Next Step After This

After Step 1, Step 2 should be:

> Initialize the Next.js project and connect Supabase auth, database, and environment configuration.
