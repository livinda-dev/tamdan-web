import { Suspense } from "react";
import EditionClient from "./EditionClient";

export const dynamic = "force-dynamic";

export default function EditionPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading edition…</div>}>
      <EditionClient />
    </Suspense>
  );
}
