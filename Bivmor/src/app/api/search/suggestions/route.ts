import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

const POPULAR_SEARCHES = [
  'مباراة الوظيف العمومي',
  'مباراة الطب',
  'منحة دراسية',
  'مباراة الهندسة',
  'مباراة التجارة',
]

// GET /api/search/suggestions - Get search autocomplete suggestions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''

    // When query is empty or less than 2 chars, return popular search terms
    if (q.trim().length < 2) {
      return NextResponse.json({
        suggestions: {
          competitions: [],
          schools: [],
        },
        popular: POPULAR_SEARCHES,
      })
    }

    const competitionWhere = {
      isArchived: false,
      OR: [
        { title: { contains: q } },
        { shortDescription: { contains: q } },
      ] as Array<{ title: { contains: string } } | { shortDescription: { contains: string } }>,
    }

    const schoolWhere = {
      isActive: true,
      OR: [
        { name: { contains: q } },
        { shortDescription: { contains: q } },
      ] as Array<{ name: { contains: string } } | { shortDescription: { contains: string } }>,
    }

    const [competitions, schools] = await Promise.all([
      db.competition.findMany({
        where: competitionWhere,
        select: {
          id: true,
          title: true,
          shortDescription: true,
          status: true,
          type: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      db.school.findMany({
        where: schoolWhere,
        select: {
          id: true,
          name: true,
          shortDescription: true,
          type: true,
        },
        orderBy: { name: 'asc' },
        take: 5,
      }),
    ])

    // Truncate shortDescription to 60 characters
    const truncate = (text: string | null, maxLen = 60) => {
      if (!text) return null
      return text.length > maxLen ? text.slice(0, maxLen) + '...' : text
    }

    const competitionSuggestions = competitions.map((c) => ({
      id: c.id,
      title: c.title,
      shortDescription: truncate(c.shortDescription),
      status: c.status,
      type: c.type,
    }))

    const schoolSuggestions = schools.map((s) => ({
      id: s.id,
      name: s.name,
      shortDescription: truncate(s.shortDescription),
      type: s.type,
    }))

    return NextResponse.json({
      suggestions: {
        competitions: competitionSuggestions,
        schools: schoolSuggestions,
      },
      popular: [],
    })
  } catch (error) {
    console.error('Error fetching suggestions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch suggestions' },
      { status: 500 }
    )
  }
}
