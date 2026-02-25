import { Suspense } from "react";
import ViceDeanApplicationsPageClient from "./pageClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ViceDeanApplicationsPageClient />
    </Suspense>
  );
}