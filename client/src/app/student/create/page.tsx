import { Suspense } from "react";
import CreateStudentPageClient from "./pageClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CreateStudentPageClient />
    </Suspense>
  );
}