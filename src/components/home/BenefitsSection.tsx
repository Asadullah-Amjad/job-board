import { FileText, Send, TrendingUp, User } from "lucide-react";

const benefits = [
  { icon: User, title: "100% Free for Job Seekers", text: "Create account and apply easily" },
  { icon: FileText, title: "Upload Your CV", text: "Get noticed by top employers" },
  { icon: Send, title: "Easy Application", text: "Apply in just a few clicks" },
  { icon: TrendingUp, title: "Career Growth", text: "Find opportunities and grow" },
];

export default function BenefitsSection() {
  return (
    <section className="mt-12 bg-surface">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {benefits.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 text-primary">
              <Icon size={26} />
            </span>
            <div>
              <p className="font-semibold text-primary">{title}</p>
              <p className="text-sm text-muted">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
