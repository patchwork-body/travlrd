"use client";

import { useCallback } from "react";
import { Button } from "../button";
import { updateInvoiceStatus } from "@/app/lib/actions";

export function RestoreInvoiceStatus({invoiceId, status}: {invoiceId: string, status: string}) {
  const restoreInvoiceStatus = useCallback(async () => {
    await updateInvoiceStatus(invoiceId, status, false);
  }, [invoiceId, status]);

  return (
    <Button onClick={restoreInvoiceStatus} type="button">Restore status</Button>
  );
}