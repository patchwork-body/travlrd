import { db, type QueryResult, type QueryResultRow } from '@vercel/postgres';
import bcrypt from 'bcrypt';

import { customers, invoices, revenue, users } from '../lib/placeholder-data';
import { markInvoicesAsOverdue } from '../lib/actions';

const client = await db.connect();

async function seedUsers() {
  await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await client.sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `;

  const insertedUsers = await Promise.all(
    users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      return client.sql`
        INSERT INTO users (id, name, email, password)
        VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
        ON CONFLICT (id) DO NOTHING;
      `;
    }),
  );

  return insertedUsers;
}

async function seedInvoices() {
  await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await client.sql`
    CREATE TABLE IF NOT EXISTS invoices (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      customer_id UUID NOT NULL,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      amount INT NOT NULL,
      status VARCHAR(255) NOT NULL,
      due_date DATE NOT NULL DEFAULT CURRENT_DATE + INTERVAL '14 days',
      date DATE NOT NULL
    );
  `;

  await client.sql`
    CREATE TABLE IF NOT EXISTS invoice_logs (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status VARCHAR(255) NOT NULL,
      restorable BOOLEAN DEFAULT TRUE,
      date DATE NOT NULL
    );
  `;

  await client.sql`
    CREATE INDEX IF NOT EXISTS invoice_logs_invoice_id_index
    ON invoice_logs (invoice_id);
  `;

  await client.sql`
    CREATE INDEX IF NOT EXISTS invoice_logs_user_id_index
    ON invoice_logs (user_id);
  `;


  await client.sql`
    CREATE OR REPLACE FUNCTION log_invoice_status_change()
    RETURNS TRIGGER AS $$
    BEGIN
      IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO invoice_logs (invoice_id, status, date, user_id)
        VALUES (NEW.id, NEW.status, CURRENT_DATE, NEW.user_id);
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `;

  await client.sql`
    DROP TRIGGER IF EXISTS invoice_status_change_trigger ON invoices;
  `;

  await client.sql`
    CREATE TRIGGER invoice_status_change_trigger
    AFTER INSERT ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION log_invoice_status_change();
  `;

  await client.sql`
    DROP TRIGGER IF EXISTS invoice_status_change_trigger_update ON invoices;
  `;

  await client.sql`
    CREATE TRIGGER invoice_status_change_trigger_update
    AFTER UPDATE OF status ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION log_invoice_status_change();
  `;

  const insertedInvoices = await Promise.all(
    invoices.map(
      (invoice) => client.sql`
        INSERT INTO invoices (customer_id, amount, status, date, due_date, user_id)
        VALUES (${invoice.customer_id}, ${invoice.amount}, ${invoice.status}, ${invoice.date}, ${invoice.due_date}, ${invoice.user_id})
        ON CONFLICT (id) DO NOTHING;
      `,
    ),
  );

  return insertedInvoices;
}

async function seedCustomers() {
  await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await client.sql`
    CREATE TABLE IF NOT EXISTS customers (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      image_url VARCHAR(255) NOT NULL
    );
  `;

  const insertedCustomers = await Promise.all(
    customers.map(
      (customer) => client.sql`
        INSERT INTO customers (id, name, email, image_url)
        VALUES (${customer.id}, ${customer.name}, ${customer.email}, ${customer.image_url})
        ON CONFLICT (id) DO NOTHING;
      `,
    ),
  );

  return insertedCustomers;
}

async function seedRevenue() {
  await client.sql`
    CREATE TABLE IF NOT EXISTS revenue (
      month VARCHAR(4) NOT NULL UNIQUE,
      revenue INT NOT NULL
    );
  `;

  const insertedRevenue = await Promise.all(
    revenue.map(
      (rev) => client.sql`
        INSERT INTO revenue (month, revenue)
        VALUES (${rev.month}, ${rev.revenue})
        ON CONFLICT (month) DO NOTHING;
      `,
    ),
  );

  return insertedRevenue;
}

export async function GET() {
  // return Response.json({
  //   message:
  //     'Uncomment this file and remove this line. You can delete this file when you are finished.',
  // });
  try {
    // await client.sql`DROP SCHEMA public CASCADE;
    // CREATE SCHEMA public;
    // `;

    await client.sql`BEGIN`;
    await seedUsers();
    await seedCustomers();
    await seedInvoices();
    await seedRevenue();
    await client.sql`COMMIT`;

    await markInvoicesAsOverdue();

    return Response.json({ message: 'Database seeded successfully' });
  } catch (error) {
    await client.sql`ROLLBACK`;
    return Response.json({ error }, { status: 500 });
  }
}
