import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/admin-system/auth/admin-guard';

// POST /api/competitions/auto-update-status (Admin only)
// Automatically updates competition statuses based on deadlines and dates
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await requireAdminAuth(request)
    if (!authResult.authorized) return authResult.response

    const now = new Date()
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    let updatedCount = 0

    // 1. Find OPEN competitions whose deadline has passed → set to EXPIRED
    const expiredCompetitions = await db.competition.findMany({
      where: {
        status: 'OPEN',
        deadline: {
          lt: now,
        },
      },
      select: { id: true },
    })

    if (expiredCompetitions.length > 0) {
      await db.competition.updateMany({
        where: {
          id: { in: expiredCompetitions.map(c => c.id) },
        },
        data: {
          status: 'EXPIRED',
        },
      })
      updatedCount += expiredCompetitions.length
    }

    // 2. Find OPEN competitions where registrationOpen is false → set to CLOSED
    const closedByRegistration = await db.competition.findMany({
      where: {
        status: 'OPEN',
        registrationOpen: false,
      },
      select: { id: true },
    })

    if (closedByRegistration.length > 0) {
      await db.competition.updateMany({
        where: {
          id: { in: closedByRegistration.map(c => c.id) },
        },
        data: {
          status: 'CLOSED',
        },
      })
      updatedCount += closedByRegistration.length
    }

    // 3. Find UPCOMING competitions whose startDate has passed and registration is open → set to OPEN
    const upcomingToOpen = await db.competition.findMany({
      where: {
        status: 'UPCOMING',
        startDate: {
          lte: now,
        },
        registrationOpen: true,
      },
      select: { id: true },
    })

    if (upcomingToOpen.length > 0) {
      await db.competition.updateMany({
        where: {
          id: { in: upcomingToOpen.map(c => c.id) },
        },
        data: {
          status: 'OPEN',
        },
      })
      updatedCount += upcomingToOpen.length
    }

    // 4. Find UPCOMING competitions whose deadline has passed → set to EXPIRED
    const upcomingExpired = await db.competition.findMany({
      where: {
        status: 'UPCOMING',
        deadline: {
          lt: now,
        },
      },
      select: { id: true },
    })

    if (upcomingExpired.length > 0) {
      await db.competition.updateMany({
        where: {
          id: { in: upcomingExpired.map(c => c.id) },
        },
        data: {
          status: 'EXPIRED',
        },
      })
      updatedCount += upcomingExpired.length
    }

    // 5. Find competitions closing soon (deadline within 7 days) - return list for reference
    // These stay OPEN but we return the count for the admin to know
    const closingSoonCompetitions = await db.competition.findMany({
      where: {
        status: 'OPEN',
        deadline: {
          gte: now,
          lte: sevenDaysFromNow,
        },
      },
      select: { id: true, title: true, deadline: true },
    })

    return NextResponse.json({
      success: true,
      updatedCount,
      details: {
        expiredFromOpen: expiredCompetitions.length,
        closedByRegistration: closedByRegistration.length,
        upcomingToOpen: upcomingToOpen.length,
        upcomingExpired: upcomingExpired.length,
        closingSoon: closingSoonCompetitions.length,
      },
      closingSoonCompetitions: closingSoonCompetitions.map(c => ({
        id: c.id,
        title: c.title,
        deadline: c.deadline,
      })),
    })
  } catch (error) {
    console.error('Error auto-updating competition statuses:', error)
    return NextResponse.json(
      { error: 'Failed to update competition statuses' },
      { status: 500 }
    )
  }
}
