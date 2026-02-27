'use client';

import { Suspense } from 'react';
import PendingContent from './pageClient';

export default function PendingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PendingContent />
    </Suspense>
  );
}