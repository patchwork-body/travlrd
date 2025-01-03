'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth, signIn } from '@/auth';
import { AuthError } from 'next-auth';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ date: true, id: true });

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createInvoice(prevState: State, formData: FormData) {
  // Retrieve session
  const session = await auth();

  if (!session || !session.user) {
    return {
      message: 'Unauthorized. Failed to Create Invoice.',
    };
  }

  // Validate form fields using Zod
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

  // Prepare data for insertion into the database
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  // Insert data into the database
  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date, user_id)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date}, ${session.user.id})
    `;
  } catch (error) {
    // If a database error occurs, return a more specific error.
    console.error(error);

    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }

  // Revalidate the cache for the invoices page and redirect the user.
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData,
) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;

  try {
    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
  } catch (error) {
    return { message: 'Database Error: Failed to Update Invoice.' };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function updateInvoiceStatus(id: string, status: string, restorable = true) {
  const session = await auth();

  if (!session || !session.user) {
    return {
      message: 'Unauthorized. Failed to Create Invoice.',
    };
  }

  try {
    const invoice = await sql<{ id: string }>`
      UPDATE invoices
      SET status = ${status}
      WHERE id = ${id}
      RETURNING id
    `;

    if (!restorable) {
      const invoiceId = invoice.rows[0].id;

      await sql`
        UPDATE invoice_logs
        SET restorable = false
        WHERE id = (
          SELECT id FROM invoice_logs WHERE invoice_id = ${invoiceId}
          ORDER BY date DESC
          LIMIT 1
        )
      `;
    }

    revalidatePath('/dashboard/invoices');
    revalidatePath(`/dashboard/invoices/${id}/edit`);
    return { message: 'Updated Invoice Status' };
  } catch (error) {
    console.error(error);
    return { message: 'Database Error: Failed to Update Invoice Status.' };
  }
}

export async function deleteInvoice(id: string) {
  // throw new Error('Failed to Delete Invoice');

  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
    return { message: 'Deleted Invoice' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Invoice.' };
  }
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

export async function markInvoicesAsOverdue() {
  try {
    await sql`
      UPDATE invoices
      SET status = 'overdue'
      WHERE status = 'pending' AND due_date < NOW()
    `;
  } catch (error) {
    console.error(error);
    return { message: 'Database Error: Failed to mark invoices as overdue.' };
  }
}

export async function markInvoiceLogAsNonRestorable(id: string) {
  try {
    await sql`
      UPDATE invoice_logs
      SET restorable = false
      WHERE id = ${id}
    `;
  } catch (error) {
    console.error(error);
    return { message: 'Database Error: Failed to mark invoice log as non-restorable.' };
  }
}
