import React from "react";

/** Publication label using the same approved IAM seal as the existing navbar. */
export default function JournalMediaBrand() {
  return (
    <span data-iam-media-brand="true" className="pointer-events-none absolute left-3 top-3 z-10 inline-flex items-center gap-2 rounded-md border border-white/25 bg-black/90 px-2.5 py-2 text-white shadow-md">
      <img src="/brand-journal/iam-seal.webp" width={28} height={28} alt="" className="h-7 w-7 shrink-0" />
      <span className="text-left text-[12px] font-semibold leading-tight tracking-wide">Industry Army<br />Marketing</span>
    </span>
  );
}
