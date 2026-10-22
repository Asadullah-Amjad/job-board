import Link from "next/link";
import { Users } from "lucide-react";
import JobSearchBar from "./JobSearchBar";
import { listCategories, listJobs } from "@/modules/jobs/jobs.service";

const popular = ["Plumber", "Car Driver", "Computer Operator", "Office Boy", "Electrician"];

export default function HeroSection() {
  const categories = listCategories();
  const total = listJobs().length;

  return (
    <section className="relative overflow-hidden bg-linear-to-br from-sky-100 via-blue-50 to-white">
      <div className="pointer-events-none absolute -right-24 -top-24 hidden h-[560px] w-[560px] rounded-full bg-blue-200/60 lg:block" />

      <div className="relative mx-auto grid min-h-[368px] max-w-7xl items-center gap-8 px-4 py-14 sm:px-6 lg:grid-cols-2">
        <div>
          <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-navy sm:text-5xl lg:text-6xl">
            Find Your Dream Job
            <span className="block text-primary">Build a Better Future</span>
          </h1>
          <p className="mt-5 max-w-lg text-lg text-muted">
            Search from thousands of job listings, find the right talent, and build your future with us.
          </p>

          <div className="mt-8">
            <JobSearchBar categories={categories} />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold">Popular Searches:</span>
            {popular.map((p) => (
              <Link
                key={p}
                href={`/jobs?q=${encodeURIComponent(p)}`}
                className="rounded-full bg-white/80 px-4 py-1.5 text-xs font-medium ring-1 ring-line hover:bg-white hover:text-primary"
              >
                {p}
              </Link>
            ))}
          </div>
        </div>

        <div className="relative hidden h-full min-h-[300px] lg:block">
          {/* Apni hero image yahan lagayein: /public/images/hero.png rakh kar
              <Image src="/images/hero.png" alt="Job seeker" fill className="object-contain object-bottom" priority />
              (aur upar import Image from "next/image") */}
          <div className="absolute bottom-0 right-0 flex w-72 gap-4 rounded-xl bg-white p-5 shadow-xl">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-primary">
              <Users size={24} />
            </span>
            <div>
              <p className="text-2xl font-extrabold">{total.toLocaleString("en-US")}</p>
              <p className="text-sm font-medium">Jobs Available</p>
              <p className="mt-2 text-xs text-muted">Join thousands of job seekers and find your opportunity.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
