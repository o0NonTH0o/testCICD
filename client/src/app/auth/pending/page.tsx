import { Suspense } from "react";
import PendingClient from "./pageClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PendingClient />
    </Suspense>
  );
}