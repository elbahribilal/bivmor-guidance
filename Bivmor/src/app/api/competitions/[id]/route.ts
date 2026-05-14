import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/auth/api-guard'

// GET /api/competitions/[id] - Get single competition
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const competition = await db.competition.findUnique({
      where: { id },
      include: {
        city: { include: { region: true } },
        school: true,
        category: { include: { children: true } },
        level: true,
        tags: { include: { tag: true } },
        media: true,
      },
    })

    if (!competition) {
      return NextResponse.json(
        { error: 'Competition not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: competition })
  } catch (error) {
    console.error('Error fetching competition:', error)
    return NextResponse.json(
      { error: 'Failed to fetch competition' },
      { status: 500 }
    )
  }
}

// PUT /api/competitions/[id] - Update competition (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const authResult = await requireAdminAuth(request)
    if (!authResult.authorized) return authResult.response

    const { id } = await params
    const body = await request.json()

    // Check if competition exists
    const existing = await db.competition.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Competition not found' },
        { status: 404 }
      )
    }

    const {
      title,
      slug,
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
      isArchived,
      status,
      type,
      tagIds,
    } = body

    // Auto-update status based on dates if status not explicitly provided
    let finalStatus = status
    if (!status) {
      const effectiveDeadline = deadline ? new Date(deadline) : existing.deadline
      const effectiveStartDate = startDate ? new Date(startDate) : existing.startDate
      if (effectiveDeadline && effectiveDeadline < new Date()) {
        finalStatus = 'EXPIRED'
      } else if (effectiveStartDate && effectiveStartDate > new Date()) {
        finalStatus = 'UPCOMING'
      } else {
        finalStatus = 'OPEN'
      }
    }

    // If tagIds provided, replace existing tags
    if (tagIds !== undefined) {
      await db.competitionTag.deleteMany({ where: { competitionId: id } })
    }

    const competition = await db.competition.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(slug !== undefined && { slug }),
        ...(shortDescription !== undefined && { shortDescription }),
        ...(fullDescription !== undefined && { fullDescription }),
        ...(officialLink !== undefined && { officialLink }),
        ...(registrationOpen !== undefined && { registrationOpen }),
        ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(requirements !== undefined && { requirements }),
        ...(documents !== undefined && { documents }),
        ...(stages !== undefined && { stages }),
        ...(featuredImage !== undefined && { featuredImage }),
        ...(cityId !== undefined && { cityId }),
        ...(schoolId !== undefined && { schoolId }),
        ...(categoryId !== undefined && { categoryId }),
        ...(levelId !== undefined && { levelId }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(isPinned !== undefined && { isPinned }),
        ...(isArchived !== undefined && { isArchived }),
        ...(finalStatus && { status: finalStatus }),
        ...(type !== undefined && { type }),
        ...(tagIds !== undefined && tagIds.length > 0
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

    return NextResponse.json({ data: competition })
  } catch (error) {
    console.error('Error updating competition:', error)
    return NextResponse.json(
      { error: 'Failed to update competition' },
      { status: 500 }
    )
  }
}

// DELETE /api/competitions/[id] - Delete competition (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const authResult = await requireAdminAuth(request)
    if (!authResult.authorized) return authResult.response

    const { id } = await params

    const existing = await db.competition.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Competition not found' },
        { status: 404 }
      )
    }

    await db.competition.delete({ where: { id } })

    return NextResponse.json({ message: 'Competition deleted successfully' })
  } catch (error) {
    console.error('Error deleting competition:', error)
    return NextResponse.json(
      { error: 'Failed to delete competition' },
      { status: 500 }
    )
  }
}
