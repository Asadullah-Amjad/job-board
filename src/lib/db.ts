import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import type { Database } from "@/types/db.types";
import type { Job, JobType } from "@/types/job.types";

// Simple JSON database. Production mein Postgres/MySQL (Prisma/Drizzle) laga sakte hain,
// bas modules/* ke functions replace karne honge.
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

export const uid = () => crypto.randomUUID();

const DAY = 86_400_000;

function seed(): Database {
  const ago = (d: number) => new Date(Date.now() - d * DAY).toISOString();
  const categoryNames = [
    "Plumber", "Car Driver", "Computer Operator", "Electrician", "Security Guard",
    "Office Boy", "Healthcare", "Teaching", "Technician", "Others",
  ];
  const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const rows: [string, string, string, JobType, number, number, string, number][] = [
    ["Plumber", "ABC Construction", "Lahore, Pakistan", "Full Time", 25000, 35000, "plumber", 1],
    ["Car Driver", "City Transport Co.", "Karachi, Pakistan", "Full Time", 30000, 40000, "car-driver", 2],
    ["Computer Operator", "Tech Solutions", "Islamabad, Pakistan", "Full Time", 35000, 50000, "computer-operator", 3],
    ["Office Boy", "Global Enterprises", "Lahore, Pakistan", "Part Time", 18000, 25000, "office-boy", 9],
    ["Security Guard", "Safe & Secure Ltd.", "Rawalpindi, Pakistan", "Full Time", 28000, 38000, "security-guard", 10],
    ["Electrician", "Power Solutions", "Karachi, Pakistan", "Full Time", 30000, 45000, "electrician", 2],
    ["Primary School Teacher", "Bright Future School", "Lahore, Pakistan", "Full Time", 30000, 45000, "teaching", 12],
    ["Staff Nurse", "Shifa Care Hospital", "Islamabad, Pakistan", "Contract", 45000, 65000, "healthcare", 15],
  ];

  const jobs: Job[] = rows.map(([title, company, location, type, min, max, cat, d], i) => ({
    id: uid(),
    slug: `${slug(title)}-${slug(company)}`.replace(/-+$/g, ""),
    title, company, location, type,
    salaryMin: min, salaryMax: max, categorySlug: cat,
    description:
      `${company} is looking for a reliable ${title} to join our team in ${location}.\n\n` +
      `You will work with our supervisor, follow safety rules and complete daily tasks on time. ` +
      `Training is provided to the right candidate.`,
    requirements: "Minimum 1 year experience\nHonest and punctual\nAble to work in shifts\nBasic communication skills",
    status: "open",
    createdAt: ago(d + i * 0),
  }));

  return {
    users: [
      {
        id: uid(),
        name: "Legacy JSON Admin",
        email: "legacy-admin@jobhive.local",
        role: "admin",
        createdAt: ago(30),
      },
    ],
    categories: categoryNames.map((name) => ({ slug: slug(name), name })),
    jobs,
    resumes: [],
    applications: [],
    resetTokens: [],
    messages: [],
  };
}

export function readDb(): Database {
  if (!fs.existsSync(DB_FILE)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    writeDb(seed());
  }
  return JSON.parse(fs.readFileSync(DB_FILE, "utf8")) as Database;
}

export function writeDb(db: Database) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = `${DB_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_FILE);
}

export function updateDb<T>(fn: (db: Database) => T): T {
  const db = readDb();
  const result = fn(db);
  writeDb(db);
  return result;
}
