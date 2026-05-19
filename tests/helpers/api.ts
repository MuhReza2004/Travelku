const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

let counter = 0;
function makeTestEmail(): string {
  counter++;
  return `test-${Date.now()}-${counter}@travelku.test`;
}

const TEST_PASSWORD = "Test123456!";

interface AuthSession {
  cookie: string;
  userId: string;
  email: string;
}

async function registerUser(email: string): Promise<{ userId: string }> {
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Test User", email, password: TEST_PASSWORD }),
  });

  if (!res.ok) {
    const err = await res.json();
    if (res.status === 400 && typeof err.error === "string" && err.error.toLowerCase().includes("already")) {
      const session = await loginUser(email);
      return { userId: session.userId };
    }
    throw new Error(`Register failed: ${JSON.stringify(err)} (${res.status})`);
  }

  const data = await res.json();
  return { userId: data.data.id };
}

async function loginUser(email: string): Promise<AuthSession> {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: TEST_PASSWORD }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Login failed: ${JSON.stringify(err)} (${res.status})`);
  }

  const setCookie = res.headers.get("set-cookie") || "";
  const data = await res.json();

  return { cookie: setCookie, userId: data.data.id, email };
}

async function authFetch(
  path: string,
  session: AuthSession,
  options: RequestInit = {}
): Promise<{ status: number; body: unknown }> {
  const res = await fetch(`${BASE_URL}/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Cookie: session.cookie,
      ...(options.headers as Record<string, string> || {}),
    },
  });

  let body: unknown;
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    body = await res.json();
  } else {
    body = await res.text();
  }

  return { status: res.status, body };
}

export { BASE_URL, TEST_PASSWORD, makeTestEmail, registerUser, loginUser, authFetch };
export type { AuthSession };
