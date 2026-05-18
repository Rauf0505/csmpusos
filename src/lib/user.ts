export type UserInfo = {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string | null;
  initials: string;
};

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

export function getUserFromToken(): UserInfo | null {
  const token = getCookie("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const names = (payload.name || "").split(" ");
    const initials = names.map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
    return {
      id: payload.id,
      name: payload.name,
      email: payload.email,
      role: payload.role,
      department: payload.department || null,
      initials,
    };
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  return getCookie("token");
}
