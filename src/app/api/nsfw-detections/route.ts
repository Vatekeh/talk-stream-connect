import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    // Check for Bearer token in request header
    const auth = req.headers.get('authorization') ?? ''
    const token = auth.replace(/^Bearer /, '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Verify token
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    const body = await req.json()
    
    // Validate required fields
    const { pageUrl, mediaUrl, detectedClass, confidence } = body
    if (!pageUrl || !mediaUrl || !detectedClass || confidence === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Optional: validate detectedClass is one of the allowed values
    const validClasses = ['Porn', 'Sexy', 'Drawing', 'Neutral', 'Hentai']
    if (!validClasses.includes(detectedClass)) {
      return NextResponse.json({ error: 'Invalid detection class' }, { status: 400 })
    }
    
    // Insert into database
    const { error: insertError } = await supabase
      .from('nsfw_detections')
      .insert({
        page_url: pageUrl,
        media_url: mediaUrl,
        detected_class: detectedClass,
        confidence,
        thumbnail: body.thumbBase64
      })

    if (insertError) {
      console.error('Error inserting detection:', insertError)
      return NextResponse.json({ error: 'Failed to save detection' }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (e) {
    console.error('Error processing NSFW detection:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}