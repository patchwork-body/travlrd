import Link from "next/link";
import type { ReactNode } from "react";

export default function Tabs({ currentTab }: { currentTab: string }) {
  return (
    <nav className="mt-4 flex gap-x-2">
      <TabItem tab="" isActive={currentTab === ""}>
        All
      </TabItem>
      <TabItem tab="paid" isActive={currentTab === "paid"}>
        Paid
      </TabItem>
      <TabItem tab="pending" isActive={currentTab === "pending"}>
        Pending
      </TabItem>
      <TabItem tab="overdue" isActive={currentTab === "overdue"}>
        Overdue
      </TabItem>
      <TabItem tab="canceled" isActive={currentTab === "canceled"}>
        Canceled
      </TabItem>
    </nav>
  );
}

function TabItem({
  tab,
  children,
  isActive,
}: {
  tab: string;
  children: ReactNode;
  isActive: boolean;
}) {
  const searchParams = new URLSearchParams(tab ? { tab } : undefined).toString();

  return (
    <li
      className={`list-none inline-block py-2 px-4 hover:bg-gray-200 rounded-lg ${
        isActive ? "bg-gray-300" : ""
      }`}
    >
      <Link href={`/api/set-invoice-tab?${searchParams}`}>{children}</Link>
    </li>
  );
}
