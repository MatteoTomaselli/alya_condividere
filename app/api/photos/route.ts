import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const BUCKET_NAME = 'event-photos';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const event_id = formData.get('event_id') as string;

    if (!file || !event_id) {
      return NextResponse.json({ error: 'File e event_id richiesti' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    const filepath = `${event_id}/${filename}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filepath, buffer, { 
        contentType: file.type,
        upsert: false
      });

    if (error) {
      console.error('Supabase storage error:', error);
      return NextResponse.json({ error: 'Errore durante l\'upload' }, { status: 500 });
    }

    // Genera URL pubblico
    const { data: publicData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filepath);

    return NextResponse.json({
      url: publicData.publicUrl
    });
  } catch (error) {
    console.error('Errore upload foto:', error);
    return NextResponse.json({ error: 'Errore durante l\'upload' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const event_id = searchParams.get('event_id');

    if (!event_id) {
      return NextResponse.json({ error: 'event_id richiesto' }, { status: 400 });
    }

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(event_id, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      console.error('Errore lettura foto:', error);
      return NextResponse.json([]);
    }

    const photos = (data || []).map(file => {
      const { data: publicData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(`${event_id}/${file.name}`);
      return {
        id: `${event_id}/${file.name}`,
        url: publicData.publicUrl,
        uploadedAt: file.created_at || new Date().toISOString()
      };
    });

    return NextResponse.json(photos);
  } catch (error) {
    console.error('Errore lettura foto:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { photoId } = body;

    if (!photoId) {
      return NextResponse.json({ error: 'photoId richiesto' }, { status: 400 });
    }

    // photoId è nel formato "event_id/filename"
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([photoId]);

    if (error) {
      console.error('Errore eliminazione foto:', error);
      return NextResponse.json({ error: 'Errore durante l\'eliminazione' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Foto eliminata' });
  } catch (error) {
    console.error('Errore eliminazione foto:', error);
    return NextResponse.json({ error: 'Errore durante l\'eliminazione' }, { status: 500 });
  }
}
