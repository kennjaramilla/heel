import Link from 'next/link';

const tabs = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/bookings', label: 'Bookings' },
  { href: '/admin/support', label: 'Support' },
  { href: '/admin/audit', label: 'Audit log' },
];

// Each page checks for the admin role itself; the layout is only navigation.
export default function AdminLayout({ children }: LayoutProps<'/admin'>) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <p className="font-heading text-sm font-semibold tracking-wide text-primary uppercase">
        Admin
      </p>
      <nav aria-label="Admin" className="mt-3 flex flex-wrap gap-1 border-b border-border">
        {tabs.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="rounded-t-lg px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            {t.label}
          </Link>
        ))}
      </nav>
      <div className="mt-8">{children}</div>
    </div>
  );
}
