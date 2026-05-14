import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET /api/regions - List all regions with cities
export async function GET() {
  try {
    const regions = await db.region.findMany({
      include: {
        cities: {
          include: {
            _count: { select: { competitions: true, schools: true } },
          },
          orderBy: { order: 'asc' },
        },
        _count: { select: { cities: true } },
      },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ data: regions })
  } catch (error) {
    console.error('Error fetching regions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch regions' },
      { status: 500 }
    )
  }
}
