export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(date: string | null): string {
  if (!date) return "-";
  return new Date(date).toLocaleString();
}

export function truncateId(id: string): string {
  return id.slice(0, 8);
}
