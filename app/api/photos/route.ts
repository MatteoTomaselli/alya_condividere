import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readdir, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const UPLOAD_DIR = join(process.cwd(), 'public', 'event-photos');

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const event_id = formData.get('event_id') as string;

    if (!file || !event_id) {
      return NextResponse.json({ error: 'File e event_id richiesti' }, { status: 400 });
    }

    // Crea directory se non esiste
    if (!existsSync(UPLOAD_DIR)) {
      mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    const eventDir = join(UPLOAD_DIR, event_id);
    if (!existsSync(eventDir)) {
      mkdirSync(eventDir, { recursive: true });
    }

    // Salva il file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    const filepath = join(eventDir, filename);

    await writeFile(filepath, buffer);

    return NextResponse.json({
      url: `/event-photos/${event_id}/${filename}`
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

    const eventDir = join(UPLOAD_DIR, event_id);

    if (!existsSync(eventDir)) {
      return NextResponse.json({ photos: [] });
    }

    const files = await readdir(eventDir);
    const photos = files.map(file => `/event-photos/${event_id}/${file}`);

    return NextResponse.json({ photos });
  } catch (error) {
    console.error('Errore lettura foto:', error);
    return NextResponse.json({ error: 'Errore durante la lettura' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL foto richiesto' }, { status: 400 });
    }

    // Estrai il percorso da URL: /event-photos/123/timestamp-file.jpg
    const pathParts = url.split('/event-photos/');
    if (pathParts.length !== 2) {
      return NextResponse.json({ error: 'URL non valido' }, { status: 400 });
    }

    const filepath = join(UPLOAD_DIR, pathParts[1]);

    // Verifica che il file sia in UPLOAD_DIR per sicurezza
    if (!filepath.startsWith(UPLOAD_DIR)) {
      return NextResponse.json({ error: 'Accesso negato' }, { status: 403 });
    }

    if (existsSync(filepath)) {
      await unlink(filepath);
    }

    return NextResponse.json({ message: 'Foto eliminata' });
  } catch (error) {
    console.error('Errore eliminazione foto:', error);
    return NextResponse.json({ error: 'Errore durante l\'eliminazione' }, { status: 500 });
  }
}
