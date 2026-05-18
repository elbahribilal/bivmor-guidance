import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/admin-system/auth/admin-guard';

// GET /api/news/[id] - Get single news item
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const news = await db.news.findUnique({ where: { id } })

    if (!news) {
      return NextResponse.json({ error: 'الخبر غير موجود' }, { status: 404 })
    }

    return NextResponse.json({ data: news })
  } catch (error) {
    console.error('Error fetching news:', error)
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 })
  }
}

// PUT /api/news/[id] - Update news item (Admin only)
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
    const { title, content, excerpt, category, isPublished, isPinned, publishedAt } = body

    const existing = await db.news.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'الخبر غير موجود' }, { status: 404 })
    }

    const news = await db.news.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(excerpt !== undefined && { excerpt: excerpt || null }),
        ...(category !== undefined && { category }),
        ...(isPublished !== undefined && { isPublished }),
        ...(isPinned !== undefined && { isPinned }),
        ...(publishedAt !== undefined && { publishedAt: new Date(publishedAt) }),
      },
    })

    return NextResponse.json({ data: news })
  } catch (error) {
    console.error('Error updating news:', error)
    return NextResponse.json({ error: 'Failed to update news' }, { status: 500 })
  }
}

// DELETE /api/news/[id] - Delete news item (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const authResult = await requireAdminAuth(request)
    if (!authResult.authorized) return authResult.response

    const { id } = await params

    const existing = await db.news.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'الخبر غير موجود' }, { status: 404 })
    }

    await db.news.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting news:', error)
    return NextResponse.json({ error: 'Failed to delete news' }, { status: 500 })
  }
}
