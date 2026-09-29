import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';
import { isAdminEmail } from '@/lib/admin';
import { DEMO_BREEDS, type DemoBreedSlug } from '@/lib/dog-voice';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin | DogText', robots: { index: false } };

// Test and sample accounts don't count as members.
const REAL_USER = {
  AND: [
    { email: { not: 'samples@dogtext.local' } },
    { NOT: { email: { endsWith: '@example.com' } } },
  ],
};

function Stat({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-3xl font-bold text-gray-900 mt-1">{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </div>
  );
}

// The numbers that say whether posting is working: who tries the demo, who
// signs up and from where, who comes back, who shares.
export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!isAdminEmail(session?.user?.email)) notFound();

  const week = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const realUser = { user: REAL_USER };

  const [
    members,
    membersWeek,
    sources,
    demoRuns,
    demoRunsWeek,
    demoFromBreed,
    demoBreeds,
    dogs,
    dogsWithPhoto,
    barks,
    pushed,
    emailed,
    chats,
    chatsWeek,
    shareViews,
    devices,
    waitlist,
    pendingCelebrations,
    recent,
  ] = await Promise.all([
    prisma.user.count({ where: REAL_USER }),
    prisma.user.count({ where: { ...REAL_USER, createdAt: { gte: week } } }),
    prisma.user.groupBy({ by: ['signupSource'], where: REAL_USER, _count: true }),
    prisma.demoRun.count(),
    prisma.demoRun.count({ where: { createdAt: { gte: week } } }),
    prisma.demoRun.count({ where: { fromBreedPage: true } }),
    prisma.demoRun.groupBy({ by: ['breed'], _count: true, orderBy: { _count: { breed: 'desc' } }, take: 5 }),
    prisma.dog.count({ where: { isActive: true, ...realUser } }),
    prisma.dog.count({ where: { isActive: true, photoUrl: { not: null }, ...realUser } }),
    prisma.dailyBark.count({ where: realUser }),
    prisma.dailyBark.count({ where: { pushedAt: { not: null }, ...realUser } }),
    prisma.dailyBark.count({ where: { emailedAt: { not: null }, ...realUser } }),
    prisma.aiChatMessage.count({ where: { senderType: 'user', ...realUser } }),
    prisma.aiChatMessage.count({ where: { senderType: 'user', createdAt: { gte: week }, ...realUser } }),
    prisma.dailyBark.aggregate({ _sum: { shareCount: true } }),
    prisma.pushSubscription.count({ where: realUser }),
    prisma.user.findMany({
      where: { ...REAL_USER, interestedPlan: { not: null } },
      select: { email: true, firstName: true, interestedPlan: true, interestedAt: true },
      orderBy: { interestedAt: 'asc' },
    }),
    prisma.celebration.count({ where: { status: 'pending' } }),
    prisma.user.findMany({
      where: REAL_USER,
      select: {
        firstName: true,
        createdAt: true,
        signupSource: true,
        dogs: { select: { name: true, breed: true }, take: 1 },
        _count: { select: { aiChatMessages: true, pushSubscriptions: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 15,
    }),
  ]);

  const bySource = Object.fromEntries(sources.map((s) => [s.signupSource ?? 'before tracking', s._count]));
  const signupRate = demoRuns ? Math.round(((bySource.demo ?? 0) / demoRuns) * 100) : 0;

  return (
    <div className="container max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">DogText numbers</h1>
        <Link href="/admin/celebrations" className="text-sm font-medium text-[#FF8C42]">
          Review celebrations{pendingCelebrations ? ` (${pendingCelebrations} waiting)` : ''} →
        </Link>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-3">Getting people in</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <Stat label="Tried the demo" value={demoRuns} sub={`${demoRunsWeek} this week · ${demoFromBreed} from breed guides`} />
        <Stat label="Members" value={members} sub={`${membersWeek} new this week`} />
        <Stat label="Demo → signup" value={`${signupRate}%`} sub={`${bySource.demo ?? 0} signed up from the demo`} />
        <Stat label="Shared text views" value={shareViews._sum.shareCount ?? 0} sub="visits to shared text pages" />
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-3">Coming back</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <Stat label="Phones with notifications" value={devices} />
        <Stat label="Morning texts written" value={barks} sub={`${pushed} sent as notifications · ${emailed} emailed`} />
        <Stat label="Chats with dogs" value={chats} sub={`${chatsWeek} this week`} />
        <Stat label="Dogs" value={dogs} sub={`${dogsWithPhoto} with a photo`} />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Where members signed up</h2>
          <ul className="text-sm text-gray-700 space-y-1">
            {Object.entries(bySource).map(([k, v]) => (
              <li key={k} className="flex justify-between">
                <span>{k === 'demo' ? 'Homepage demo' : k === 'plan' ? 'Premium list' : k === 'direct' ? 'Signup page' : k}</span>
                <span className="font-semibold">{v}</span>
              </li>
            ))}
            {!sources.length && <li className="text-gray-500">No members yet.</li>}
          </ul>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Most-tried breeds in the demo</h2>
          <ul className="text-sm text-gray-700 space-y-1">
            {demoBreeds.map((b) => (
              <li key={b.breed} className="flex justify-between">
                <span>{DEMO_BREEDS[b.breed as DemoBreedSlug] ?? b.breed}</span>
                <span className="font-semibold">{b._count}</span>
              </li>
            ))}
            {!demoBreeds.length && <li className="text-gray-500">No demo runs yet.</li>}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 mb-8">
        <h2 className="font-semibold text-gray-900 mb-1">Premium list ({waitlist.length})</h2>
        <p className="text-sm text-gray-500 mb-3">People to email, at today&apos;s price, when paid plans open.</p>
        <ul className="text-sm text-gray-700 space-y-1">
          {waitlist.map((w) => (
            <li key={w.email} className="flex justify-between gap-4">
              <span className="truncate">{w.firstName ? `${w.firstName} · ` : ''}{w.email}</span>
              <span className="shrink-0 text-gray-500">{w.interestedPlan === 'FAMILY' ? 'Family' : 'Premium'}</span>
            </li>
          ))}
          {!waitlist.length && <li className="text-gray-500">Nobody yet.</li>}
        </ul>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="font-semibold text-gray-900 mb-3">Newest members</h2>
        <ul className="text-sm text-gray-700 divide-y divide-gray-100">
          {recent.map((u, i) => (
            <li key={i} className="py-2 flex flex-wrap justify-between gap-2">
              <span>
                {u.firstName || 'Someone'} · {u.dogs[0] ? `${u.dogs[0].name} (${u.dogs[0].breed})` : 'no dog'}
              </span>
              <span className="text-gray-500">
                {u.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'America/New_York' })}
                {' · '}
                {u.signupSource ?? '—'} · {u._count.aiChatMessages} chat msgs
                {u._count.pushSubscriptions ? ' · 🔔' : ''}
              </span>
            </li>
          ))}
          {!recent.length && <li className="py-2 text-gray-500">No members yet.</li>}
        </ul>
      </div>
    </div>
  );
}
