import { apiUser, json } from '@/lib/mobile-api';

export async function GET() {
  const { user, error } = await apiUser();
  if (error) return error;
  return json({ id: user.id, name: user.name, email: user.email, role: user.role });
}
