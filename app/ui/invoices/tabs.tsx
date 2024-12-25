import Link from "next/link";
import type { ReactNode } from "react";

export default function Tabs() {
  return (
    <nav className="mt-4 flex gap-x-2">
      <TabItem tab="">All</TabItem>
      <TabItem tab="paid">Paid</TabItem>
      <TabItem tab="pending">Pending</TabItem>
      <TabItem tab="overdue">Overdue</TabItem>
      <TabItem tab="canceled">Canceled</TabItem>
    </nav>
  );
}

function TabItem({ tab, children }: { tab: string; children: ReactNode }) {
  return (
    <li className="list-none inline-block py-2 px-4 hover:bg-gray-200 rounded-lg">
      <Link href={`/dashboard/invoices?query=${tab}`}>{children}</Link>
    </li>
  );
}
