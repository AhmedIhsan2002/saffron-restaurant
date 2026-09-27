const apiOrigin = String(import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api").replace(/\/api\/?$/, "");

export function resolveMediaUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  if (/^(https?:|data:|blob:)/i.test(value)) return value;
  if (value.startsWith("/storage/") || value.startsWith("storage/")) {
    return `${apiOrigin}/${value.replace(/^\//, "")}`;
  }
  return value;
}
