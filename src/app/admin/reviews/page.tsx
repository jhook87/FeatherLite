import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminReviewDashboard from '@/components/AdminReviewDashboard';
import { getSessionFromCookies } from '@/lib/auth';

export default function ReviewsAdminPage() {
  const session = getSessionFromCookies(cookies());
  if (!session) {
    redirect('/admin/login');
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <AdminReviewDashboard />
    </main>
  );
}
