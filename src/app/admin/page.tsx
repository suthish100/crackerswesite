import { redirect } from 'next/navigation';
import { getAdminFromCookie } from '@/lib/auth';

export default async function AdminIndexPage() {
  const admin = await getAdminFromCookie();
  if (!admin) redirect('/admin/login');
  redirect('/admin/dashboard');
}