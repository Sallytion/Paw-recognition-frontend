import { NextResponse } from 'next/server';

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

export async function GET() {
  try {
    if (!UNSPLASH_ACCESS_KEY) {
      console.error('UNSPLASH_ACCESS_KEY is not configured in environment variables');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Fetch a random dog image from Unsplash API
    const apiRes = await fetch(
      `https://api.unsplash.com/photos/random?query=dog&client_id=${UNSPLASH_ACCESS_KEY}`,
      {
        method: 'GET',
        headers: {
          'Accept-Version': 'v1',
        },
      }
    );

    if (!apiRes.ok) {
      console.error('Unsplash API error:', apiRes.status, apiRes.statusText);
      return NextResponse.json({ error: 'Failed to fetch image from Unsplash' }, { status: 502 });
    }

    const data = await apiRes.json();
    const imageUrl = data.urls?.regular || data.urls?.full;

    if (!imageUrl) {
      return NextResponse.json({ error: 'No image URL in response' }, { status: 502 });
    }

    // Fetch the actual image and convert to base64
    const imageRes = await fetch(imageUrl);
    
    if (!imageRes.ok) {
      return NextResponse.json({ error: 'Failed to download image' }, { status: 502 });
    }

    const contentType = imageRes.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await imageRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');

    return NextResponse.json({ 
      image: `data:${contentType};base64,${base64}`,
      attribution: {
        photographer: data.user?.name,
        photographerUrl: data.user?.links?.html,
        unsplashUrl: data.links?.html,
      }
    });
  } catch (err) {
    console.error('Random dog proxy error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
