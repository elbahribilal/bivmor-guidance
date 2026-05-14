# Task 10-c: Competition Status Auto-Update System

## Summary
Added a comprehensive competition status auto-update system to the Moroccan educational platform.

## Changes Made

### 1. Auto-Update Status API (`/api/competitions/auto-update-status/route.ts`)
- Created POST endpoint that automatically updates competition statuses based on deadlines and dates
- Updates OPEN competitions with past deadlines → EXPIRED
- Updates OPEN competitions with registrationOpen=false → CLOSED
- Updates UPCOMING competitions with past startDate and open registration → OPEN
- Updates UPCOMING competitions with past deadlines → EXPIRED
- Returns count of updated competitions plus closing soon count
- Returns details breakdown for each type of update

### 2. Competitions GET API Enhancement (`/api/competitions/route.ts`)
- Added lightweight status auto-check before returning results
- Checks OPEN/UPCOMING competitions for deadline/date changes inline
- Updates status in database if needed, then reflects changes in response
- Ensures UI always shows current statuses without requiring separate cron job

### 3. StatusBadge Component (`/components/shared/StatusBadge.tsx`)
- Added `closingSoon` optional prop to `StatusBadge`
- When `closingSoon=true` and `status='OPEN'`, displays "⚡ يغلق قريباً" badge
- Amber/yellow color scheme with pulse animation for closing soon indicator
- Existing status badges remain unchanged when closingSoon is false

### 4. CompetitionCard Enhancement (`/components/competitions/CompetitionCard.tsx`)
- Added `isClosingSoon` memo that checks if deadline is within 7 days and status is OPEN
- Passes `closingSoon={isClosingSoon}` prop to StatusBadge
- Adds amber ring with `closing-soon-ring` CSS animation when closing soon
- Subtle pulse animation on card border for closing soon competitions

### 5. CompetitionDetailDialog Enhancement (`/components/competitions/CompetitionDetailDialog.tsx`)
- Added `getDaysRemaining()` helper to calculate days until deadline
- Added `isClosingSoon` flag (warning or urgent urgency level)
- Added amber gradient warning banner at top of dialog when deadline is within 7 days
- Banner includes Arabic text: "⚡ آخر أجل خلال X أيام! سارع بالتسجيل"
- AlertCircle icon with pulse animation in the banner

### 6. AdminDashboard Enhancement (`/components/admin/AdminDashboard.tsx`)
- Added "تحديث حالات المباريات" (Update Competition Statuses) button in competitions tab
- Button calls the auto-update-status API when clicked
- Shows toast with count of updated competitions
- Amber-themed outline button with RefreshCw icon
- Refreshes competition data after update

### 7. API Method (`/lib/api.ts`)
- Added `autoUpdateStatus()` method to `competitionsApi`
- Returns success status, updatedCount, and details breakdown
- Uses POST method to call `/competitions/auto-update-status`

### 8. CSS Animation (`/globals.css`)
- Added `closing-soon-ring` CSS class with `closing-soon-ring-pulse` keyframe animation
- Subtle amber ring pulse effect (box-shadow based) for closing soon cards

## Lint Status
All modified files pass lint with zero errors. Pre-existing errors in QuickStatsBar.tsx and StatsView.tsx are unrelated.

## Testing
- Dev server compiles successfully
- API endpoint tested via dev server logs (competitions API returns 200)
