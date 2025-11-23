import { Suspense } from "react";
import CustomizePageContent from "./pageContent";

export default function CustomizePage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <CustomizePageContent />
    </Suspense>
  );
}
