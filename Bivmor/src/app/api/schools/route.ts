import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/admin-system/auth/admin-guard';

function slugify(text: string): string 
  return text {
    .toLowerCase()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// GET /api/schools - List schools with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cityId = searchParams.get('cityId')
    const categoryId = searchParams.get('categoryId')
    const levelId = searchParams.get('levelId')
    const type = searchParams.get('type')
    const search = searchParams.get('search')
    const isFeatured = searchParams.get('isFeatured')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')

    const skip = (page - 1) * limit

    const where: Record<string, unknown> = { isActive: true }

    if (cityId) where.cityId = cityId
    if (categoryId) where.categoryId = categoryId
    if (levelId) where.levelId = levelId
    if (type) where.type = type
    if (isFeatured === 'true') where.isFeatured = true
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { shortDescription: { contains: search } },
      ]
    }

    const [schools, total] = await Promise.all([
      db.school.findMany({
        where,
        include: {
          city: { include: { region: true } },
          category: true,
          level: true,
          _count: { select: { competitions: true } },
        },
        orderBy: [
          { isFeatured: 'desc' },
          { name: 'asc' },
        ],
        skip,
        take: limit,
      }),
      db.school.count({ where }),
    ])

    return NextResponse.json({
      data: schools,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching schools:', error)
    return NextResponse.json(
      { error: 'Failed to fetch schools' },
      { status: 500 }
    )
  }
}

// POST /api/schools - Create a new school (Admin only)
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await requireAdminAuth(request)
    if (!authResult.authorized) return authResult.response

    const body = await request.json()
    const {
      name,
      slug: customSlug,
      shortDescription,
      fullDescription,
      logo,
      coverImage,
      website,
      email,
      phone,
      address,
      cityId,
      categoryId,
      levelId,
      isFeatured,
      isActive,
      type,
      seoTitle,
      seoDescription,
    } = body

    if (!name || !cityId) {
      return NextResponse.json(
        { error: 'Name and cityId are required' },
        { status: 400 }
      )
    }

    const slug = customSlug || slugify(name)

    const school = await db.school.create({
      data: {
        name,
        slug,
        shortDescription,
        fullDescription,
        logo,
        coverImage,
        website,
        email,
        phone,
        address,
        cityId,
        categoryId,
        levelId,
        isFeatured: isFeatured ?? false,
        isActive: isActive ?? true,
        type: type || 'PUBLIC',
        seoTitle,
        seoDescription,
      },
      include: {
        city: { include: { region: true } },
        category: true,
        level: true,
      },
    })

    return NextResponse.json({ data: school }, { status: 201 })
  } catch (error) {
    console.error('Error creating school:', error)
    return NextResponse.json(
      { error: 'Failed to create school' },
      { status: 500 }
    )
  }
}
