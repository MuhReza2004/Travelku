// @vitest-environment node
import { describe, it, expect, beforeAll } from "vitest";
import {
  TEST_PASSWORD,
  makeTestEmail,
  loginUser,
  authFetch,
} from "../helpers/api";
import type { AuthSession } from "../helpers/api";

describe("Bookings API", { timeout: 15000 }, () => {
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

  it("lists bookings (empty)", async () => {
    const { status, body } = await authFetch("/bookings", session);
    expect(status).toBe(200);
    const data = body as { data: unknown[] };
    expect(Array.isArray(data.data)).toBe(true);
  });

  it("creates a booking", async () => {
    const { status, body } = await authFetch("/bookings", session, {
      method: "POST",
      body: JSON.stringify({
        customer_name: "John Doe",
        contact: "08123456789",
        package_name: "Test Package",
        departure_date: "2099-12-31",
        participants: 2,
        price_per_person: 500000,
        notes: "",
      }),
    });
    expect(status).toBe(201);
    const data = body as { data: { id: string; status: string } };
    expect(data.data.status).toBe("Menunggu");
  });

  it("creates and updates a booking", async () => {
    const createRes = await authFetch("/bookings", session, {
      method: "POST",
      body: JSON.stringify({
        customer_name: "Jane Doe",
        contact: "08234567890",
        package_name: "Another Package",
        departure_date: "2099-12-31",
        participants: 3,
        price_per_person: 750000,
        notes: "",
      }),
    });
    const created = (createRes.body as { data: { id: string } }).data;
    expect(createRes.status).toBe(201);

    const updateRes = await authFetch(`/bookings/${created.id}`, session, {
      method: "PUT",
      body: JSON.stringify({
        customer_name: "Jane Updated",
        contact: "08234567890",
        package_name: "Another Package",
        departure_date: "2099-12-31",
        participants: 4,
        price_per_person: 750000,
        notes: "Updated",
      }),
    });
    expect(updateRes.status).toBe(200);
    const updated = updateRes.body as { data: { customer_name: string; participants: number } };
    expect(updated.data.customer_name).toBe("Jane Updated");
    expect(updated.data.participants).toBe(4);
  });

  it("changes booking status", async () => {
    const createRes = await authFetch("/bookings", session, {
      method: "POST",
      body: JSON.stringify({
        customer_name: "Status Test",
        contact: "08345678901",
        package_name: "Status Package",
        departure_date: "2099-12-31",
        participants: 1,
        price_per_person: 300000,
        notes: "",
      }),
    });
    const booking = (createRes.body as { data: { id: string } }).data;

    const confirmRes = await authFetch(`/bookings/${booking.id}/status`, session, {
      method: "PATCH",
      body: JSON.stringify({ status: "Dikonfirmasi" }),
    });
    expect(confirmRes.status).toBe(200);

    const completeRes = await authFetch(`/bookings/${booking.id}/status`, session, {
      method: "PATCH",
      body: JSON.stringify({ status: "Selesai" }),
    });
    expect(completeRes.status).toBe(200);
  });

  it("rejects invalid status transition", async () => {
    const createRes = await authFetch("/bookings", session, {
      method: "POST",
      body: JSON.stringify({
        customer_name: "Invalid",
        contact: "08456789012",
        package_name: "Test Pkg",
        departure_date: "2099-12-31",
        participants: 1,
        price_per_person: 100000,
        notes: "",
      }),
    });
    const booking = (createRes.body as { data: { id: string } }).data;

    const res = await authFetch(`/bookings/${booking.id}/status`, session, {
      method: "PATCH",
      body: JSON.stringify({ status: "Selesai" }),
    });
    expect(res.status).toBe(400);
  });

  it("rejects booking with missing fields", async () => {
    const { status } = await authFetch("/bookings", session, {
      method: "POST",
      body: JSON.stringify({ customer_name: "Test" }),
    });
    expect(status).toBe(400);
  });

  it("returns audit logs for a booking", async () => {
    const createRes = await authFetch("/bookings", session, {
      method: "POST",
      body: JSON.stringify({
        customer_name: "Audit Test",
        contact: "08567890123",
        package_name: "Audit Pkg",
        departure_date: "2099-12-31",
        participants: 2,
        price_per_person: 400000,
        notes: "",
      }),
    });
    const booking = (createRes.body as { data: { id: string; status: string } }).data;

    await authFetch(`/bookings/${booking.id}/status`, session, {
      method: "PATCH",
      body: JSON.stringify({ status: "Dikonfirmasi" }),
    });

    const { status, body } = await authFetch(`/bookings/${booking.id}/logs`, session);
    expect(status).toBe(200);
    const data = body as { data: unknown[] };
    expect(data.data.length).toBeGreaterThanOrEqual(2);
  });

  it("deletes a booking", async () => {
    const createRes = await authFetch("/bookings", session, {
      method: "POST",
      body: JSON.stringify({
        customer_name: "Delete Test",
        contact: "08678901234",
        package_name: "Delete Pkg",
        departure_date: "2099-12-31",
        participants: 2,
        price_per_person: 250000,
        notes: "",
      }),
    });
    const booking = (createRes.body as { data: { id: string } }).data;

    const { status } = await authFetch(`/bookings/${booking.id}`, session, {
      method: "DELETE",
    });
    expect(status).toBe(200);
  });
});
