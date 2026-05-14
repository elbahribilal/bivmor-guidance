# Task 1: Fix Accessibility Bugs in Dialogs

**Date:** 2025-03-04

## Summary
Fixed two critical accessibility bugs across CompetitionDetailDialog and SchoolDetailDialog, and audited all other dialogs in the project for similar issues.

## Bug 1: setState during render
- **CompetitionDetailDialog**: Moved `addViewed()` call from render body into a `useEffect` with proper dependencies `[competition, selectedCompetitionId, addViewed]`
- **SchoolDetailDialog**: Moved `addViewed()` call from render body into a `useEffect` with proper dependencies `[school, selectedSchoolId, addViewed]`
- Added `useEffect` import from React to both files

## Bug 2: Missing DialogTitle when loading
- **CompetitionDetailDialog**: Added `<DialogTitle className="sr-only">` right after `DialogDescription` that's always present, replaced the visible `DialogTitle` inside the conditional block with `<h2>` element
- **SchoolDetailDialog**: Same fix — added always-present sr-only `DialogTitle`, replaced visible `DialogTitle` with `<h2>`

## Other dialogs audited (no issues found)
- ReminderButton, ApplicationTrackerButton, ShareDialog, AdminDashboard dialogs — all have DialogTitle always present and no setState during render

## Verification
- `bun run lint` passed with no errors
- Dev server running normally
