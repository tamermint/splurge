import { test, expect, request as requestFactory } from "@playwright/test";
//need to generate random IPs
import { randomUUID } from "crypto";

test.describe("Proxy tests", () => {
  test("Anonymous users must be denied from strict routes", async ({
    request,
  }) => {
    const headers = { "x-forwarded-for": `ip-${randomUUID()}` };
    const routes = ["/api/forecast", "/api/insights", "/api/onboarding"];

    for (const route of routes) {
      const response = await request.get(route, { headers });
      expect(response.status()).toBe(401);
      const body = await response.json();
      expect(body.error).toBe("Authentication required!");
    }
  });

  test("Anonymous user must be throttled on teaser route", async ({
    request,
  }) => {
    const headers = { "x-forwarded-for": `ip-${randomUUID()}` };
    const route = "/api/teaser";
    const ANONYMOUS_LIMIT = 3;

    for (let i = 0; i < ANONYMOUS_LIMIT; i++) {
      const response = await request.get(route, { headers });
      expect(response.status()).not.toBe(429);
    }

    const throttledResponse = await request.get(route, { headers });
    expect(throttledResponse.status()).toBe(429);
    const body = await throttledResponse.json();
    expect(body.error).toBe("Anonymous user throttled");
  });

  test("Free users are downgraded from insights", async ({ request }) => {
    const userId = randomUUID();
    const csrfReq = await request.get("/api/auth/csrf");
    const { csrfToken } = await csrfReq.json();

    await request.post("/api/auth/callback/test-credentials", {
      form: { id: userId, plan: "FREE", csrfToken: csrfToken },
    });

    const response = await request.get("/api/insights");
    expect(response.status()).toBe(429);
    expect(response.headers()["x-downgrade"]).toBe("teaser");
  });
});
