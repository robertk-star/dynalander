import { Suspense } from 'react';
import SellClient from './SellClient';

export default function DynamicSellerLandingPage() {
  return (
    <Suspense fallback={<main className="page-shell" />}>
      <SellClient />
    </Suspense>
  );
}
