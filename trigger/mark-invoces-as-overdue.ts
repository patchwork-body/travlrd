import { markInvoicesAsOverdue } from "@/app/lib/actions";
import { logger, schedules } from "@trigger.dev/sdk/v3";

export const markInvoicesAsOverdueScheduledTask = schedules.task({
  id: "mark-invoices-as-overdue",
  // Every day at midnight
  cron: "0 0 * * *",
  // Set an optional maxDuration to prevent tasks from running indefinitely
  maxDuration: 300, // Stop executing after 300 secs (5 mins) of compute
  run: async (payload) => {
    logger.debug("Marking invoices as overdue", { payload });
    await markInvoicesAsOverdue();
  },
});
