"use client";

export default function QueryTabError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
      <h2 className="font-semibold">Queries are temporarily unavailable.</h2>
      <p className="mt-1 text-sm">Please apply the contact-message database migration, then try again.</p>
      <button type="button" onClick={reset} className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white">Try again</button>
    </div>
  );
}
