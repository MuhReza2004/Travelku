// @vitest-environment node
import { describe, it, expect, beforeAll } from "vitest";
import {
  BASE_URL,
  TEST_PASSWORD,
  makeTestEmail,
  loginUser,
  checkServer,
} from "../helpers/api";

const serverAlive = await checkServer();
const itWhenAlive = (name: string, fn: () => Promise<void>) => {
  if (!serverAlive) return it.skip(name, fn);
  return it(name, fn);
};

describe("Auth API", { timeout: 15000 }, () => {
  let email: string;

  beforeAll(async () => {
    if (!serverAlive) return;
    email = makeTestEmail();
  });

  itWhenAlive("register creates a new staff account", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test User", email, password: TEST_PASSWORD }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data).toBeDefined();
    expect(data.data.email).toBe(email);
  });

  itWhenAlive("register rejects missing fields", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: TEST_PASSWORD }),
    });
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("nama");
  });

  itWhenAlive("register rejects short password", async () => {
    const e = makeTestEmail();
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test", email: e, password: "123" }),
    });
    expect(res.status).toBe(400);
  });

  itWhenAlive("login returns session cookie", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: TEST_PASSWORD }),
    });
    expect(res.status).toBe(200);
    expect(res.headers.get("set-cookie")).toBeTruthy();
    const data = await res.json();
    expect(data.data.email).toBe(email);
  });

  itWhenAlive("login rejects wrong password", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: "WrongPassword123!" }),
    });
    expect(res.status).toBe(401);
  });

  itWhenAlive("/me returns current user with cookie", async () => {
    const session = await loginUser(email);
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: session.cookie },
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data.email).toBe(email);
  });

  itWhenAlive("/me returns 401 without auth", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/me`);
    expect(res.status).toBe(401);
  });
});
