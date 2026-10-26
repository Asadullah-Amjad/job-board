insert into public.categories (slug, name) values
  ('plumber', 'Plumber'),
  ('car-driver', 'Car Driver'),
  ('computer-operator', 'Computer Operator'),
  ('electrician', 'Electrician'),
  ('security-guard', 'Security Guard'),
  ('office-boy', 'Office Boy'),
  ('healthcare', 'Healthcare'),
  ('teaching', 'Teaching'),
  ('technician', 'Technician'),
  ('others', 'Others')
on conflict (slug) do update set name = excluded.name;

insert into public.jobs
  (slug, title, company, location, type, salary_min, salary_max, category_slug, description, requirements, status, created_at)
values
  ('plumber-abc-construction', 'Plumber', 'ABC Construction', 'Lahore, Pakistan', 'Full Time', 25000, 35000, 'plumber', 'ABC Construction is looking for a reliable Plumber to join our team in Lahore, Pakistan.\n\nYou will work with our supervisor, follow safety rules and complete daily tasks on time.\n\nTraining is provided to the right candidate.', 'Minimum 1 year experience\nHonest and punctual\nAble to work in shifts\nBasic communication skills', 'open', now() - interval '1 day'),
  ('car-driver-city-transport-co', 'Car Driver', 'City Transport Co.', 'Karachi, Pakistan', 'Full Time', 30000, 40000, 'car-driver', 'City Transport Co. is looking for a reliable Car Driver to join our team in Karachi, Pakistan.\n\nYou will work with our supervisor, follow safety rules and complete daily tasks on time.\n\nTraining is provided to the right candidate.', 'Minimum 1 year experience\nHonest and punctual\nAble to work in shifts\nBasic communication skills', 'open', now() - interval '2 days'),
  ('computer-operator-tech-solutions', 'Computer Operator', 'Tech Solutions', 'Islamabad, Pakistan', 'Full Time', 35000, 50000, 'computer-operator', 'Tech Solutions is looking for a reliable Computer Operator to join our team in Islamabad, Pakistan.\n\nYou will work with our supervisor, follow safety rules and complete daily tasks on time.\n\nTraining is provided to the right candidate.', 'Minimum 1 year experience\nHonest and punctual\nAble to work in shifts\nBasic communication skills', 'open', now() - interval '3 days'),
  ('office-boy-global-enterprises', 'Office Boy', 'Global Enterprises', 'Lahore, Pakistan', 'Part Time', 18000, 25000, 'office-boy', 'Global Enterprises is looking for a reliable Office Boy to join our team in Lahore, Pakistan.\n\nYou will work with our supervisor, follow safety rules and complete daily tasks on time.\n\nTraining is provided to the right candidate.', 'Minimum 1 year experience\nHonest and punctual\nAble to work in shifts\nBasic communication skills', 'open', now() - interval '9 days'),
  ('security-guard-safe-secure-ltd', 'Security Guard', 'Safe & Secure Ltd.', 'Rawalpindi, Pakistan', 'Full Time', 28000, 38000, 'security-guard', 'Safe & Secure Ltd. is looking for a reliable Security Guard to join our team in Rawalpindi, Pakistan.\n\nYou will work with our supervisor, follow safety rules and complete daily tasks on time.\n\nTraining is provided to the right candidate.', 'Minimum 1 year experience\nHonest and punctual\nAble to work in shifts\nBasic communication skills', 'open', now() - interval '10 days'),
  ('electrician-power-solutions', 'Electrician', 'Power Solutions', 'Karachi, Pakistan', 'Full Time', 30000, 45000, 'electrician', 'Power Solutions is looking for a reliable Electrician to join our team in Karachi, Pakistan.\n\nYou will work with our supervisor, follow safety rules and complete daily tasks on time.\n\nTraining is provided to the right candidate.', 'Minimum 1 year experience\nHonest and punctual\nAble to work in shifts\nBasic communication skills', 'open', now() - interval '2 days'),
  ('primary-school-teacher-bright-future-school', 'Primary School Teacher', 'Bright Future School', 'Lahore, Pakistan', 'Full Time', 30000, 45000, 'teaching', 'Bright Future School is looking for a reliable Primary School Teacher to join our team in Lahore, Pakistan.\n\nYou will work with our supervisor, follow safety rules and complete daily tasks on time.\n\nTraining is provided to the right candidate.', 'Minimum 1 year experience\nHonest and punctual\nAble to work in shifts\nBasic communication skills', 'open', now() - interval '12 days'),
  ('staff-nurse-shifa-care-hospital', 'Staff Nurse', 'Shifa Care Hospital', 'Islamabad, Pakistan', 'Contract', 45000, 65000, 'healthcare', 'Shifa Care Hospital is looking for a reliable Staff Nurse to join our team in Islamabad, Pakistan.\n\nYou will work with our supervisor, follow safety rules and complete daily tasks on time.\n\nTraining is provided to the right candidate.', 'Minimum 1 year experience\nHonest and punctual\nAble to work in shifts\nBasic communication skills', 'open', now() - interval '15 days')
on conflict (slug) do update set
  title = excluded.title,
  company = excluded.company,
  location = excluded.location,
  type = excluded.type,
  salary_min = excluded.salary_min,
  salary_max = excluded.salary_max,
  category_slug = excluded.category_slug,
  description = excluded.description,
  requirements = excluded.requirements,
  status = excluded.status;
