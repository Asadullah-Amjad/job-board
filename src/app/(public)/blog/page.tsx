import type { Metadata } from "next";

export const metadata: Metadata = { title: "Blog" };

const posts = [
  { title: "How to write a CV with no experience", text: "Keep it to one page, list your skills first, and add a phone number employers can reach." },
  { title: "5 tips for a successful job interview", text: "Arrive early, dress neatly, listen carefully, and ask one question about the role." },
  { title: "How to spot a fake job offer", text: "Real employers never ask you to pay money before you start. Check the company details first." },
];

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-navy">Career Tips</h1>
      <div className="mt-8 space-y-4">
        {posts.map((p) => (
          <article key={p.title} className="rounded-lg border border-line bg-white p-6">
            <h2 className="text-lg font-bold">{p.title}</h2>
            <p className="mt-2 text-muted">{p.text}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
