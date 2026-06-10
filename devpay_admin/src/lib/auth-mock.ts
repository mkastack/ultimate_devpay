// Lightweight mock auth for the admin dashboard.
// Persists a fake admin session in localStorage. No backend required.

export type AdminUser = {
  name: string;
  email: string;
  role: "admin";
};

const KEY = "devpay:admin-auth";

export function getCurrentAdmin(): AdminUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}

export function signInAdmin(email: string, _password: string): AdminUser {
  const name = email.split("@")[0] || "Admin";
  const user: AdminUser = { name, email, role: "admin" };
  localStorage.setItem(KEY, JSON.stringify(user));
  return user;
}

export function signUpAdmin(name: string, email: string, _password: string): AdminUser {
  const user: AdminUser = { name, email, role: "admin" };
  localStorage.setItem(KEY, JSON.stringify(user));
  return user;
}

export function signOutAdmin() {
  localStorage.removeItem(KEY);
}
