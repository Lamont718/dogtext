import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyUnsubToken } from '@/lib/email';

export const dynamic = 'force-dynamic';

function page(title: string, body: string, status = 200) {
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${title} | DogText</title>
<style>
  body { margin:0; min-height:100vh; display:grid; place-items:center; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; background:#FFF8F0; color:#2C2C2C; padding:24px; }
  .card { max-width:480px; background:#fff; border-radius:24px; padding:36px 32px; box-shadow:0 8px 32px rgba(0,0,0,0.08); text-align:center; }
  h1 { margin:0 0 12px; font-size:24px; }
  p { margin:0 0 16px; color:#666; line-height:1.5; }
  a { color:#FF8C42; text-decoration:none; font-weight:600; }
  .emoji { font-size:48px; display:block; margin-bottom:8px; }
</style>
</head>
<body>
  <div class="card">${body}</div>
</body>
</html>`;
  return new NextResponse(html, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('u');
  const token = searchParams.get('t');

  if (!userId || !token) {
    return page(
      'Invalid link',
      `<span class="emoji">😕</span><h1>Link missing pieces</h1><p>The unsubscribe link looks incomplete. Try the link in the latest email, or <a href="/dashboard/settings">manage email settings</a>.</p>`,
      400,
    );
  }

  if (!verifyUnsubToken(userId, token)) {
    return page(
      'Invalid link',
      `<span class="emoji">🔒</span><h1>This link can't be verified</h1><p>The token didn't match. Try the link in the latest email, or <a href="/dashboard/settings">manage email settings</a>.</p>`,
      403,
    );
  }

  try {
    await prisma.userSettings.upsert({
      where: { userId },
      update: { emailNotifications: false },
      create: { userId, emailNotifications: false },
    });
  } catch (err) {
    console.error('Unsubscribe failed:', err);
    return page(
      'Hmm',
      `<span class="emoji">⚠️</span><h1>Something went wrong</h1><p>We couldn't update your preferences right now. Email lamont@communitynyc.org and we'll take care of it.</p>`,
      500,
    );
  }

  return page(
    'Unsubscribed',
    `<span class="emoji">🐾</span><h1>You're unsubscribed</h1><p>No more daily texts from your dog. We'll miss you both.</p><p style="margin-top:24px;font-size:14px;">Changed your mind? <a href="/dashboard/settings">Turn emails back on</a> any time.</p>`,
  );
}
