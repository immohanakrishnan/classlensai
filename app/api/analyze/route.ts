import { NextResponse } from 'next/server';
import { analyzeWithGemini } from '@/lib/gemini';
import { parseDriveUrl } from '@/lib/drive';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get('file');
    const driveUrl = String(form.get('driveUrl') || '').trim();
    if (file instanceof File) {
      const allowed = ['video/mp4', 'video/quicktime', 'video/webm'];
      if (!allowed.includes(file.type)) return NextResponse.json({ error: 'Unsupported file type. Use MP4, MOV, or WebM.' }, { status: 400 });
      if (file.size > 20 * 1024 * 1024) return NextResponse.json({ error: 'This prototype accepts files up to 20 MB for direct analysis.' }, { status: 413 });
      return NextResponse.json({ evaluation: await analyzeWithGemini(file) });
    }
    if (driveUrl) {
      const parsed = parseDriveUrl(driveUrl);
      if (parsed.kind === 'folder') return NextResponse.json({ error: 'That is a Google Drive folder. Paste an individual video URL.' }, { status: 400 });
      if (parsed.kind !== 'file') return NextResponse.json({ error: 'Enter an individual Google Drive video URL.' }, { status: 400 });
      return NextResponse.json({ error: 'The Drive preview is ready, but this server cannot download private Drive media without an authorized Drive connector. Upload the video or configure an approved Drive access path.' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Choose a video file or add a Google Drive video URL.' }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'The analysis could not be completed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
