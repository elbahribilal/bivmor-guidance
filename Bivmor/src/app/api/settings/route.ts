import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/auth/admin-guard'

// GET /api/settings - Get all site settings
export async function GET() {
  try {
    const settings = await db.siteSetting.findMany()
    
    // Convert to key-value object for easy access
    const settingsMap = Object.fromEntries(
      settings.map((s) => [s.key, s.value])
    )

    return NextResponse.json({
      data: settings,
      map: settingsMap,
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

// PUT /api/settings - Update site settings (Admin only)
export async function PUT(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await requireAdminAuth(request)
    if (!authResult.authorized) return authResult.response

    const body = await request.json()
    const { settings } = body as { settings: { key: string; value: string; type?: 'TEXT' | 'JSON' | 'NUMBER' | 'BOOLEAN' }[] }

    if (!settings || !Array.isArray(settings)) {
      return NextResponse.json(
        { error: 'Settings array is required' },
        { status: 400 }
      )
    }

    const results = await Promise.all(
      settings.map((setting) =>
        db.siteSetting.upsert({
          where: { key: setting.key },
          update: { value: setting.value, ...(setting.type && { type: setting.type }) },
          create: {
            key: setting.key,
            value: setting.value,
            type: setting.type || 'TEXT',
          },
        })
      )
    )

    return NextResponse.json({ data: results })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
