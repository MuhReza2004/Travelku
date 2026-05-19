// @vitest-environment node
import { describe, it, expect, beforeAll } from "vitest";
import {
  TEST_PASSWORD,
  makeTestEmail,
  loginUser,
  authFetch,
  checkServer,
} from "../helpers/api";
import type { AuthSession } from "../helpers/api";

const serverAlive = await checkServer();
const itWhenAlive = (name: string, fn: () => Promise<void>) => {
  if (!serverAlive) return it.skip(name, fn);
  return it(name, fn);
};

describe("Packages API", { timeout: 15000 }, () => {
  let session: AuthSession;

  beforeAll(async () => {
    if (!serverAlive) return;
    const email = makeTestEmail();
    await fetch(`${process.env.BASE_URL || "http://localhost:3000"}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test User", email, password: TEST_PASSWORD }),
    });
    session = await loginUser(email);
  });

  itWhenAlive("lists packages (empty)", async () => {
    const { status, body } = await authFetch("/packages", session);
    expect(status).toBe(200);
    const data = body as { data: unknown[] };
    expect(Array.isArray(data.data)).toBe(true);
  });

  itWhenAlive("creates a package", async () => {
    const { status, body } = await authFetch("/packages", session, {
      method: "POST",
      body: JSON.stringify({
        name: "Test Package",
        destination: "Test Destination",
        duration: "3D2N",
        capacity: 50,
        price: 1000000,
      }),
    });
    expect(status).toBe(201);
    const data = body as { data: { id: string; name: string } };
    expect(data.data.name).toBe("Test Package");
  });

  itWhenAlive("rejects package with missing required fields", async () => {
    const { status } = await authFetch("/packages", session, {
      method: "POST",
      body: JSON.stringify({ name: "Incomplete" }),
    });
    expect(status).toBe(400);
  });
});
