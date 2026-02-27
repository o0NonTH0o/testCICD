import { Suspense } from "react";
import HeadOfDeptApplicationsPageClient from "./pageClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <HeadOfDeptApplicationsPageClient />
    </Suspense>
  );
}