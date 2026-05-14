import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/categories - List all categories with hierarchy
export async function GET() {
  try {
    // Get top-level categories (no parent)
    const categories = await db.category.findMany({
      where: { parentId: null },
      include: {
        children: {
          include: {
            _count: { select: { competitions: true, schools: true } },
          },
          orderBy: { order: 'asc' },
        },
        _count: { select: { competitions: true, schools: true } },
      },
      orderBy: { order: 'asc' },
    })

    // Also get all categories flat for simple usage
    const allCategories = await db.category.findMany({
      include: {
        _count: { select: { competitions: true, schools: true } },
      },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({
      data: categories,
      flat: allCategories,
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

// POST /api/categories - Create a new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, slug, nameAr, nameFr, icon, color, description, order, parentId } = body

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    const category = await db.category.create({
      data: {
        name,
        slug,
        nameAr,
        nameFr,
        icon,
        color,
        description,
        order: order || 0,
        parentId,
      },
    })

    return NextResponse.json({ data: category }, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}
