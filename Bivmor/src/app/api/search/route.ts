import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/search - Search across competitions and schools
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const cityId = searchParams.get('cityId')
    const categoryId = searchParams.get('categoryId')
    const levelId = searchParams.get('levelId')
    const type = searchParams.get('type') // competition | school
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const skip = (page - 1) * limit

    if (!q.trim()) {
      return NextResponse.json({
        data: { competitions: [], schools: [] },
        pagination: { page, limit, total: 0, totalPages: 0 },
      })
    }

    const competitionWhere: Record<string, unknown> = {
      isArchived: false,
      OR: [
        { title: { contains: q } },
        { shortDescription: { contains: q } },
        { fullDescription: { contains: q } },
      ],
    }
    if (cityId) competitionWhere.cityId = cityId
    if (categoryId) competitionWhere.categoryId = categoryId
    if (levelId) competitionWhere.levelId = levelId

    const schoolWhere: Record<string, unknown> = {
      isActive: true,
      OR: [
        { name: { contains: q } },
        { shortDescription: { contains: q } },
        { fullDescription: { contains: q } },
      ],
    }
    if (cityId) schoolWhere.cityId = cityId
    if (categoryId) schoolWhere.categoryId = categoryId
    if (levelId) schoolWhere.levelId = levelId

    let competitions: unknown[] = []
    let schools: unknown[] = []
    let totalCompetitions = 0
    let totalSchools = 0

    if (!type || type === 'competition') {
      const [results, count] = await Promise.all([
        db.competition.findMany({
          where: competitionWhere,
          include: {
            city: { include: { region: true } },
            school: true,
            category: true,
            level: true,
            tags: { include: { tag: true } },
          },
          orderBy: { createdAt: 'desc' },
          skip: type === 'competition' ? skip : 0,
          take: type === 'competition' ? limit : 5,
        }),
        db.competition.count({ where: competitionWhere }),
      ])
      competitions = results
      totalCompetitions = count
    }

    if (!type || type === 'school') {
      const [results, count] = await Promise.all([
        db.school.findMany({
          where: schoolWhere,
          include: {
            city: { include: { region: true } },
            category: true,
            level: true,
            _count: { select: { competitions: true } },
          },
          orderBy: { name: 'asc' },
          skip: type === 'school' ? skip : 0,
          take: type === 'school' ? limit : 5,
        }),
        db.school.count({ where: schoolWhere }),
      ])
      schools = results
      totalSchools = count
    }

    const total = totalCompetitions + totalSchools

    // Tag results with type indicator
    const taggedCompetitions = competitions.map((c: Record<string, unknown>) => ({
      ...c,
      resultType: 'competition',
    }))
    const taggedSchools = schools.map((s: Record<string, unknown>) => ({
      ...s,
      resultType: 'school',
    }))

    return NextResponse.json({
      data: {
        competitions: taggedCompetitions,
        schools: taggedSchools,
      },
      pagination: {
        page,
        limit,
        total,
        totalCompetitions,
        totalSchools,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error searching:', error)
    return NextResponse.json(
      { error: 'Failed to search' },
      { status: 500 }
    )
  }
}
