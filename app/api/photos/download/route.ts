import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const photoUrl = searchParams.get('url');

    if (!photoUrl) {
      return NextResponse.json({ error: 'URL richiesto' }, { status: 400 });
    }

    // Fetch dall'API server-side (nessun problema CORS)
    const response = await fetch(photoUrl, {
      headers: {
        'Accept': 'image/*',
      }
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Errore nel download della foto' }, { status: 500 });
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': 'attachment; filename="alya-photo.jpg"',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });
  } catch (error) {
    console.error('Errore download foto:', error);
    return NextResponse.json({ error: 'Errore durante il download' }, { status: 500 });
  }
}
