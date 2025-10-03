import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminLoginForm from '@/components/AdminLoginForm';
import { getSessionFromCookies } from '@/lib/auth';

export default function AdminLoginPage() {
  const session = getSessionFromCookies(cookies());
  if (session) {
    redirect('/admin/reviews');
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-4 py-16">
      <div className="rounded-[2.5rem] border border-border/60 bg-white/80 p-10 shadow-xl backdrop-blur">
        <div className="space-y-4 text-center">
          <p className="text-xs uppercase tracking-wide text-muted">FeatherLite admin</p>
          <h1 className="font-heading text-3xl text-text">Moderation sign in</h1>
          <p className="text-sm text-muted">
            Enter your review concierge credentials to approve or reject customer submissions.
          </p>
        </div>
        <div className="mt-8">
          <AdminLoginForm />
        </div>
      </div>
    </main>
  );
}
