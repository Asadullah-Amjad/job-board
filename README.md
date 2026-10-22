# job-board
# JobHive - Job Board (Next.js 16 + Tailwind v4)

Poora project: public site, auth, candidate dashboard, admin panel.
Alag database ya backend ki zaroorat nahi. Data `data/db.json` mein save hota hai.

## Chalane ka tareeqa

```bash
npm install
npm run dev
```

Phir http://localhost:3000 kholein.

## Admin login (pehli dafa run par khud ban jata hai)

- Email: admin@jobhive.com
- Password: Admin@123

Pehle login karke password badal dein (ya `src/lib/db.ts` ke seed mein badal kar `data/` folder delete kar dein).

## Candidate
`/register` se naya account banayein, phir resume upload karein aur jobs par apply karein.

## Production se pehle
1. `.env.local` mein `AUTH_SECRET` lamba random string rakhein (`.env.example` dekhein).
2. Forgot password abhi link screen par dikhata hai. Email service jorein aur
   `src/actions/auth.actions.ts` ke `forgotPasswordAction` mein link email karein.
3. JSON file database chhote project ke liye hai. Bari site ke liye Postgres/MySQL
   (Prisma ya Drizzle) lagayein: sirf `src/modules/*` ke functions badalne hon ge.
4. Resumes `data/uploads/` mein hain. Vercel jaisi serverless hosting par file system
   permanent nahi hota, wahan S3/Cloudinary use karein.

## Folder guide
- `src/app/(public)`: home, jobs, job detail, categories, companies, blog, contact
- `src/app/(auth)`: login, register, forgot/reset password
- `src/app/(candidate)/dashboard`: overview, profile, resumes, applications
- `src/app/admin`: jobs CRUD, categories, applications + status update
- `src/actions`: server actions (forms yahan save hote hain)
- `src/modules`: business logic (jobs, auth, applications, resumes)
- `src/lib/db.ts`: JSON database + seed data
- `src/proxy.ts`: /dashboard aur /admin ko login ke baghair block karta hai

## Hero image
`public/images/hero.png` rakhein aur `src/components/home/HeroSection.tsx` mein comment wali `<Image />` line on karein.
