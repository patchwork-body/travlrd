import { Select, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { CheckIcon, ClockIcon } from '@heroicons/react/24/outline';
import { SelectTrigger } from '@radix-ui/react-select';
import clsx from 'clsx';

const availableStatuses = ['paid', 'pending', 'overdue', 'canceled'];

export default function InvoiceStatus({ status }: { status: string }) {
  const statusesToDisplay = availableStatuses.filter((availableStatus) => {
    return availableStatus !== status;
  });

  return (
    <Select value={status}>
      <SelectTrigger>
        <SelectValue>
          <span
            className={clsx(
              'inline-flex items-center rounded-full px-2 py-1 text-xs',
              {
                'bg-gray-100 text-gray-500': status === 'pending',
                'bg-green-500 text-white': status === 'paid',
                'bg-orange-500 text-white': status === 'overdue',
              },
            )}
          >
            {status === 'overdue' ? (
              <>
                Overdue
                <ClockIcon className="ml-1 w-4 text-white" />
              </>
            ) : null}
            {status === 'pending' ? (
              <>
                Pending
                <ClockIcon className="ml-1 w-4 text-gray-500" />
              </>
            ) : null}
            {status === 'paid' ? (
              <>
                Paid
                <CheckIcon className="ml-1 w-4 text-white" />
              </>
            ) : null}
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {statusesToDisplay.map((statusToDisplay) => (
          <SelectItem key={statusToDisplay} value={statusToDisplay}>
            {statusToDisplay}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
