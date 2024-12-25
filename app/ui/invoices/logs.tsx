import { fetchInvoiceLogsById } from "@/app/lib/data";
import { formatDateToLocal } from "@/app/lib/utils";
import { RestoreInvoiceStatus } from "./restore-invoice-status";
import { ScrollArea } from "@/components/ui/scroll-area";

export async function InvoiceLogs({ id }: { id: string }) {
  const logs = await fetchInvoiceLogsById(id);

  return (
    <section className="p-4 bg-gray-50 mt-4 rounded-md">
      <h2 className="text-2xl font-semibold mb-4">Invoice Logs</h2>
      <ScrollArea className="h-96">
        <ul className="space-y-2">
          {logs.map((log, index) => (
            <li key={log.id} className="p-2 border rounded bg-white">
              <p className="text-sm text-gray-600">
                Date: {formatDateToLocal(log.date)}
              </p>
              <p className="text-sm text-gray-600">New status: {log.status}</p>
              <p className="text-sm text-gray-600">Email: {log.email}</p>

              {index === logs.length - 1 && index !== 0 && log.restorable && (
                <>
                  <hr className="my-2 border-gray-200" />

                  <RestoreInvoiceStatus
                    invoiceId={log.invoice_id}
                    status={logs[index - 1].status}
                  />
                </>
              )}
            </li>
          ))}
        </ul>
      </ScrollArea>
    </section>
  );
}
