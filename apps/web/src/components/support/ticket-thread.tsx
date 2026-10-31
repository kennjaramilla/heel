import type { SupportStatus } from '@heel/db/schema';
import Link from 'next/link';
import { LocalTime } from '@/components/local-time';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { getTicket } from '@/server/support';
import { CloseTicketButton } from './close-ticket-button';
import { ReplyForm } from './reply-form';

type Ticket = NonNullable<Awaited<ReturnType<typeof getTicket>>>;

const labels: Record<'user' | 'staff', Record<SupportStatus, string>> = {
  user: { open: 'Waiting on Heel', answered: 'Heel replied', closed: 'Closed' },
  staff: { open: 'Needs a reply', answered: 'Answered', closed: 'Closed' },
};

export function StatusBadge({ status, staff }: { status: SupportStatus; staff: boolean }) {
  return (
    <Badge variant={status === (staff ? 'open' : 'answered') ? 'default' : 'secondary'}>
      {labels[staff ? 'staff' : 'user'][status]}
    </Badge>
  );
}

export function TicketThread({ data, staff }: { data: Ticket; staff: boolean }) {
  const { ticket, messages } = data;
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{ticket.subject}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {staff && (
              <>
                From {data.userName} ({data.userRole}, {data.userEmail}) ·{' '}
              </>
            )}
            Opened <LocalTime iso={ticket.createdAt.toISOString()} style="short" />
            {ticket.bookingId && (
              <>
                {' · '}
                <Link
                  href={staff ? '/admin/bookings' : `/bookings/${ticket.bookingId}`}
                  className="underline underline-offset-2"
                >
                  {staff ? `Booking ${ticket.bookingId.slice(0, 8)}` : 'View booking'}
                </Link>
              </>
            )}
          </p>
        </div>
        <StatusBadge status={ticket.status} staff={staff} />
      </div>

      <ol className="grid gap-3">
        {messages.map(({ message, authorName }) => (
          <li
            key={message.id}
            className={cn(
              'rounded-2xl p-4 text-sm',
              message.fromStaff
                ? 'bg-secondary text-secondary-foreground'
                : 'border border-border bg-card',
            )}
          >
            <p className="font-medium">
              {message.fromStaff ? 'Heel support' : (authorName ?? 'Deleted user')}
              <span className="ml-2 font-normal text-muted-foreground">
                <LocalTime iso={message.createdAt.toISOString()} style="short" />
              </span>
            </p>
            <p className="mt-2 whitespace-pre-line">{message.body}</p>
          </li>
        ))}
      </ol>

      {ticket.status === 'closed' ? (
        <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
          This request is closed.
          {!staff && (
            <>
              {' '}
              Still need help?{' '}
              <Link href="/dashboard/support/new" className="underline underline-offset-2">
                Open a new request
              </Link>
              .
            </>
          )}
        </p>
      ) : (
        <div className="grid gap-4 rounded-2xl border border-border bg-card p-5">
          <ReplyForm ticketId={ticket.id} staff={staff} />
          <div className="border-t border-border pt-4">
            <CloseTicketButton ticketId={ticket.id} staff={staff} />
          </div>
        </div>
      )}
    </div>
  );
}
