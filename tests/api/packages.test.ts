// @vitest-environment node
import { describe, it, expect, beforeAll } from "vitest";
import {
  TEST_PASSWORD,
  makeTestEmail,
  loginUser,
  authFetch,
} from "../helpers/api";
import type { AuthSession } from "../helpers/api";

describe("Packages API", { timeout: 15000 }, () => {
  let session: AuthSession;

  beforeAll(async () => {
    const email = makeTestEmail();
    await fetch(`${process.env.BASE_URL || "http://localhost:3000"}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test User", email, password: TEST_PASSWORD }),
    });
    session = await loginUser(email);
  });

  it("lists packages (empty)", async () => {
    const { status, body } = await authFetch("/packages", session);
    expect(status).toBe(200);
    const data = body as { data: unknown[] };
    expect(Array.isArray(data.data)).toBe(true);
  });

  it("creates a package", async () => {
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

  it("rejects package with missing required fields", async () => {
    const { status } = await authFetch("/packages", session, {
      method: "POST",
      body: JSON.stringify({ name: "Incomplete" }),
    });
    expect(status).toBe(400);
  });
});
