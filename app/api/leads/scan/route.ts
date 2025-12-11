import { NextRequest, NextResponse } from 'next/server'

interface ScanRequest {
  city: string
  sector: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ScanRequest = await request.json()
    const { city, sector } = body

    // Validation
    if (!city || !sector || typeof city !== 'string' || typeof sector !== 'string') {
      return NextResponse.json(
        { error: 'city and sector required' },
        { status: 400 }
      )
    }

    // Check if webhook URL is configured
    const webhookUrl = process.env.N8N_LEAD_SCAN_WEBHOOK_URL
    if (!webhookUrl) {
      console.error('N8N_LEAD_SCAN_WEBHOOK_URL is not configured')
      return NextResponse.json(
        { error: 'Webhook URL not configured' },
        { status: 500 }
      )
    }

    // Call n8n webhook
    const n8nResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        city: city.trim(),
        sector: sector.trim(),
        query: `${city.trim()} ${sector.trim()}`,
      }),
    })

    if (!n8nResponse.ok) {
      const responseText = await n8nResponse.text()
      console.error('n8n webhook error:', {
        status: n8nResponse.status,
        statusText: n8nResponse.statusText,
        body: responseText,
      })
      return NextResponse.json(
        { error: 'Failed to trigger scan' },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error in /api/leads/scan:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Only allow POST method
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}
