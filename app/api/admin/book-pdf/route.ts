import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { isAdminEmail } from '@/lib/admin';
import { bookTitle, buildCoverPdf, buildInteriorPdf, loadBookInput } from '@/lib/book-pdf';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// GET /api/admin/book-pdf?userId=...&part=interior|cover
// The Mixam upload files for one family's book (admin only).
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdminEmail(session?.user?.email)) return new NextResponse('Not found', { status: 404 });

  const userId = req.nextUrl.searchParams.get('userId');
  const part = req.nextUrl.searchParams.get('part');
  if (!userId || (part !== 'interior' && part !== 'cover')) {
    return NextResponse.json({ error: 'userId and part=interior|cover required' }, { status: 400 });
  }

  const input = await loadBookInput(userId);
  if (!input) return NextResponse.json({ error: 'No dog for that family' }, { status: 404 });

  const pdf = part === 'interior' ? await buildInteriorPdf(input) : await buildCoverPdf(input);
  const name = `${bookTitle(input).replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '')}-${part}.pdf`;
  return new NextResponse(Buffer.from(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${name}"`,
      'Cache-Control': 'no-store',
    },
  });
}
