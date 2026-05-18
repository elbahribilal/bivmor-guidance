import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/auth/admin-guard

// GET /api/schools/[id] - Get single school with competitions
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const school = await db.school.findUnique({
      where: { id },
      include: {
        city: { include: { region: true } },
        category: true,
        level: true,
        competitions: {
          where: { isArchived: false },
          include: {
            category: true,
            level: true,
            tags: { include: { tag: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        media: true,
      },
    })

    if (!school) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: school })
  } catch (error) {
    console.error('Error fetching school:', error)
    return NextResponse.json(
      { error: 'Failed to fetch school' },
      { status: 500 }
    )
  }
}

// PUT /api/schools/[id] - Update school (Admin only)
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

    const existing = await db.school.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      )
    }

    const {
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
      isFeatured,
      isActive,
      type,
      seoTitle,
      seoDescription,
    } = body

    const school = await db.school.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(shortDescription !== undefined && { shortDescription }),
        ...(fullDescription !== undefined && { fullDescription }),
        ...(logo !== undefined && { logo }),
        ...(coverImage !== undefined && { coverImage }),
        ...(website !== undefined && { website }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
        ...(cityId !== undefined && { cityId }),
        ...(categoryId !== undefined && { categoryId }),
        ...(levelId !== undefined && { levelId }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(isActive !== undefined && { isActive }),
        ...(type !== undefined && { type }),
        ...(seoTitle !== undefined && { seoTitle }),
        ...(seoDescription !== undefined && { seoDescription }),
      },
      include: {
        city: { include: { region: true } },
        category: true,
        level: true,
      },
    })

    return NextResponse.json({ data: school })
  } catch (error) {
    console.error('Error updating school:', error)
    return NextResponse.json(
      { error: 'Failed to update school' },
      { status: 500 }
    )
  }
}

// DELETE /api/schools/[id] - Delete school (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const authResult = await requireAdminAuth(request)
    if (!authResult.authorized) return authResult.response

    const { id } = await params

    const existing = await db.school.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      )
    }

    await db.school.delete({ where: { id } })

    return NextResponse.json({ message: 'School deleted successfully' })
  } catch (error) {
    console.error('Error deleting school:', error)
    return NextResponse.json(
      { error: 'Failed to delete school' },
      { status: 500 }
    )
  }
}
