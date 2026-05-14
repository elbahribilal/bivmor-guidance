import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET /api/cities - List all cities with region info
export async function GET() {
  try {
    const cities = await db.city.findMany({
      include: {
        region: true,
        _count: { select: { competitions: true, schools: true } },
      },
      orderBy: [
        { region: { order: 'asc' } },
        { order: 'asc' },
      ],
    })

    return NextResponse.json({ data: cities })
  } catch (error) {
    console.error('Error fetching cities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cities' },
      { status: 500 }
    )
  }
}
