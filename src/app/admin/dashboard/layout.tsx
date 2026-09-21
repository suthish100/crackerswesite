import { redirect } from 'next/navigation';
import { getAdminFromCookie } from '@/lib/auth';

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminFromCookie();
  if (!admin) redirect('/admin/login');
  return children;
}