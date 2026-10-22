export function formatSalary(min: number, max: number) {
  const f = (n: number) => n.toLocaleString("en-US");
  return `PKR ${f(min)} - ${f(max)}`;
}
