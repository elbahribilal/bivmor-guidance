import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET /api/dashboard/stats - Get dashboard statistics
export async function GET() {
  try {
    const [
      totalCompetitions,
      openCompetitions,
      closedCompetitions,
      expiredCompetitions,
      upcomingCompetitions,
      totalSchools,
      totalCategories,
      totalCities,
      recentCompetitions,
    ] = await Promise.all([
      db.competition.count(),
      db.competition.count({ where: { status: 'OPEN' } }),
      db.competition.count({ where: { status: 'CLOSED' } }),
      db.competition.count({ where: { status: 'EXPIRED' } }),
      db.competition.count({ where: { status: 'UPCOMING' } }),
      db.school.count({ where: { isActive: true } }),
      db.category.count(),
      db.city.count(),
      db.competition.findMany({
        where: { isArchived: false },
        include: {
          city: true,
          school: true,
          category: true,
          level: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ])

    return NextResponse.json({
      data: {
        totalCompetitions,
        openCompetitions,
        closedCompetitions,
        expiredCompetitions,
        upcomingCompetitions,
        totalSchools,
        totalCategories,
        totalCities,
        recentCompetitions,
      },
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}
