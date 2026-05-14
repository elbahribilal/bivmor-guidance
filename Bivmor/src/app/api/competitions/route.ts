import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/auth/api-guard'

function slugify(text: string): string {
  return text
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

// GET /api/competitions - List competitions with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cityId = searchParams.get('cityId')
    const categoryId = searchParams.get('categoryId')
    const levelId = searchParams.get('levelId')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const search = searchParams.get('search')
    const isFeatured = searchParams.get('isFeatured')
    const isPinned = searchParams.get('isPinned')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const sort = searchParams.get('sort') || 'createdAt'
    const order = searchParams.get('order') || 'desc'

    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (cityId) where.cityId = cityId
    if (categoryId) where.categoryId = categoryId
    if (levelId) where.levelId = levelId
    if (status) where.status = status
    if (type) where.type = type
    if (isFeatured === 'true') where.isFeatured = true
    if (isPinned === 'true') where.isPinned = true
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { shortDescription: { contains: search } },
        { fullDescription: { contains: search } },
      ]
    }

    // Determine sort order
    let orderBy: Record<string, string> = {}
    if (sort === 'deadline') {
      orderBy = { deadline: order === 'asc' ? 'asc' : 'desc' }
    } else if (sort === 'isPinned') {
      orderBy = { isPinned: 'desc' }
    } else {
      orderBy = { createdAt: order === 'asc' ? 'asc' : 'desc' }
    }

    const [competitions, total] = await Promise.all([
      db.competition.findMany({
        where,
        include: {
          city: { include: { region: true } },
          school: true,
          category: true,
          level: true,
          tags: { include: { tag: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      db.competition.count({ where }),
    ])

    // Lightweight status auto-update: check OPEN/UPCOMING competitions for deadline changes
    const now = new Date()
    const idsToUpdate: { id: string; newStatus: string }[] = []

    for (const comp of competitions) {
      if (comp.status === 'OPEN' && comp.deadline && new Date(comp.deadline) < now) {
        idsToUpdate.push({ id: comp.id, newStatus: 'EXPIRED' })
      } else if (comp.status === 'OPEN' && !comp.registrationOpen) {
        idsToUpdate.push({ id: comp.id, newStatus: 'CLOSED' })
      } else if (comp.status === 'UPCOMING' && comp.startDate && new Date(comp.startDate) <= now && comp.registrationOpen) {
        idsToUpdate.push({ id: comp.id, newStatus: 'OPEN' })
      } else if (comp.status === 'UPCOMING' && comp.deadline && new Date(comp.deadline) < now) {
        idsToUpdate.push({ id: comp.id, newStatus: 'EXPIRED' })
      }
    }

    // Update status in database for any competitions that need it
    if (idsToUpdate.length > 0) {
      await Promise.all(
        idsToUpdate.map(({ id, newStatus }) =>
          db.competition.update({
            where: { id },
            data: { status: newStatus as 'OPEN' | 'CLOSED' | 'EXPIRED' | 'UPCOMING' },
          })
        )
      )
    }

    // Apply status updates to the returned data (avoid re-fetching)
    const updatedCompetitions = competitions.map(comp => {
      const update = idsToUpdate.find(u => u.id === comp.id)
      if (update) {
        return { ...comp, status: update.newStatus as 'OPEN' | 'CLOSED' | 'EXPIRED' | 'UPCOMING' }
      }
      return comp
    })

    return NextResponse.json({
      data: updatedCompetitions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching competitions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch competitions' },
      { status: 500 }
    )
  }
}

// POST /api/competitions - Create a new competition (Admin only)
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await requireAdminAuth(request)
    if (!authResult.authorized) return authResult.response

    const body = await request.json()
    const {
      title,
      slug: customSlug,
      shortDescription,
      fullDescription,
      officialLink,
      registrationOpen,
      deadline,
      startDate,
      endDate,
      requirements,
      documents,
      stages,
      featuredImage,
      cityId,
      schoolId,
      categoryId,
      levelId,
      isFeatured,
      isPinned,
      status,
      type,
      tagIds,
    } = body

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    const slug = customSlug || slugify(title)

    // Auto-determine status if not provided
    let finalStatus = status
    if (!status) {
      if (deadline && new Date(deadline) < new Date()) {
        finalStatus = 'EXPIRED'
      } else if (startDate && new Date(startDate) > new Date()) {
        finalStatus = 'UPCOMING'
      } else {
        finalStatus = 'OPEN'
      }
    }

    const competition = await db.competition.create({
      data: {
        title,
        slug,
        shortDescription,
        fullDescription,
        officialLink,
        registrationOpen: registrationOpen ?? true,
        deadline: deadline ? new Date(deadline) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        requirements,
        documents,
        stages,
        featuredImage,
        cityId,
        schoolId,
        categoryId,
        levelId,
        isFeatured: isFeatured ?? false,
        isPinned: isPinned ?? false,
        status: finalStatus,
        type: type || 'ACADEMIC',
        ...(tagIds && tagIds.length > 0
          ? {
              tags: {
                create: tagIds.map((tagId: string) => ({ tagId })),
              },
            }
          : {}),
      },
      include: {
        city: { include: { region: true } },
        school: true,
        category: true,
        level: true,
        tags: { include: { tag: true } },
      },
    })

    return NextResponse.json({ data: competition }, { status: 201 })
  } catch (error) {
    console.error('Error creating competition:', error)
    return NextResponse.json(
      { error: 'Failed to create competition' },
      { status: 500 }
    )
  }
}
