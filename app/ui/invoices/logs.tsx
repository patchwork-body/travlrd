import { fetchInvoiceLogsById } from "@/app/lib/data";
import { formatDateToLocal } from "@/app/lib/utils";

export async function InvoiceLogs({id}: {id: string}) {
  const logs = await fetchInvoiceLogsById(id);

  return (
    <section className="p-4 bg-gray-50 mt-4 rounded-md">
      <h2 className="text-2xl font-semibold mb-4">Invoice Logs</h2>
      <ul className="space-y-2">
        {logs.map((log) => (
          <li key={log.id} className="p-2 border rounded bg-white">
            <p className="text-sm text-gray-600">Date: {formatDateToLocal(log.date)}</p>
            <p className="text-sm text-gray-600">New status: {log.status}</p>
            <p className="text-sm text-gray-600">Email: {log.email}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
