"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const ReviewClient = dynamic(() => import("./ReviewClient"), {
  ssr: false,
});

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading Review...</div>}>
      <ReviewClient />
    </Suspense>
  );
}
