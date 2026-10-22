export interface PaginatedItems<T> {
  items: T[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
  start: number;
  end: number;
}

export function parsePage(value?: string) {
  const page = Number(value);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

export function paginate<T>(items: T[], requestedPage: number, pageSize: number): PaginatedItems<T> {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(1, requestedPage), totalPages);
  const start = (currentPage - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize);

  return {
    items: pageItems,
    currentPage,
    totalItems,
    totalPages,
    start: totalItems ? start + 1 : 0,
    end: start + pageItems.length,
  };
}
