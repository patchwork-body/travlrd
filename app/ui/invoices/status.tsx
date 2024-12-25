'use client';

import { updateInvoiceStatus } from '@/app/lib/actions';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CheckIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useCallback } from 'react';

const availableStatuses = ['paid', 'pending', 'overdue', 'canceled'] as const;

const statusToIcon  = {
  pending: <ClockIcon className="w-4" />,
  paid: <CheckIcon className="w-4" />,
  overdue: <ClockIcon className="w-4" />,
  canceled: <XCircleIcon className="w-4" />,
};

export default function InvoiceStatus({ id, status }: { id: string, status: string }) {
  const statusesToDisplay = availableStatuses.filter((availableStatus) => {
    return availableStatus !== status;
  });

  const changeInvoiceStatus = useCallback(async (nextStatus: string) => {
    await updateInvoiceStatus(id, nextStatus);
  }, [id]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <span
          className={clsx(
            'inline-flex gap-1 items-center rounded-full px-2 py-1 text-xs capitalize',
            {
              'bg-gray-100 text-gray-500': status === 'pending',
              'bg-green-500 text-white': status === 'paid',
              'bg-orange-500 text-white': status === 'overdue',
              'bg-red-500 text-white': status === 'canceled',
            },
          )}
        >
          {status}
          {statusToIcon[status as keyof typeof statusToIcon]}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {statusesToDisplay.map((statusToDisplay) => (
          <DropdownMenuItem key={statusToDisplay} className="capitalize" onClick={changeInvoiceStatus.bind(null, statusToDisplay)}>
            {statusToIcon[statusToDisplay]}
            {statusToDisplay}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
