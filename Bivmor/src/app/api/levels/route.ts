import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET /api/levels - List all levels
export async function GET() {
  try {
    const levels = await db.level.findMany({
      include: {
        _count: { select: { competitions: true, schools: true } },
      },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ data: levels })
  } catch (error) {
    console.error('Error fetching levels:', error)
    return NextResponse.json(
      { error: 'Failed to fetch levels' },
      { status: 500 }
    )
  }
}
