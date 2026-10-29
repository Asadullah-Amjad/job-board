export interface Company {
  id: string;
  name: string;
  createdAt: string;
}

export interface CompanyWithCount extends Company {
  jobCount: number;
}
