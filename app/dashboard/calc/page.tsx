import { Calc } from '@/app/ui/calc';

import type{ Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculator',
};

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {

  return (
    <main className='max-w-md mx-auto p-4'>
      <Calc />
    </main>
  );
}
