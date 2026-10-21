import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  addDays,
  buildOrderId,
  buildStoreOrderId,
  computeMonthlyExpiry,
  isLifetimeProfile,
  PREMIUM_DAYS,
  PRICES,
  parseOrderId,
  verifyIpnSignature,
} from "./nowpayments";

const SECRET = "test-ipn-secret";

function sign(body: Record<string, unknown>, secret = SECRET): string {
  const sorted = JSON.stringify(body, Object.keys(body).sort());
  return createHmac("sha512", secret).update(sorted).digest("hex");
}

describe("verifyIpnSignature", () => {
  beforeEach(() => {
    process.env.NOWPAYMENTS_IPN_SECRET = SECRET;
  });
  afterEach(() => {
    delete process.env.NOWPAYMENTS_IPN_SECRET;
  });

  it("accepts a correctly signed payload regardless of key order", () => {
    const body = { payment_status: "finished", order_id: "abc", price_amount: 5 };
    const raw = JSON.stringify({ price_amount: 5, order_id: "abc", payment_status: "finished" });
    expect(verifyIpnSignature(raw, sign(body))).toBe(true);
  });

  it("rejects a tampered body", () => {
    const sig = sign({ payment_status: "finished", order_id: "abc" });
    const tampered = JSON.stringify({ payment_status: "finished", order_id: "xyz" });
    expect(verifyIpnSignature(tampered, sig)).toBe(false);
  });

  it("rejects a missing signature", () => {
    expect(verifyIpnSignature("{}", null)).toBe(false);
  });

  it("rejects a signature made with the wrong secret", () => {
    const body = { payment_status: "finished" };
    expect(verifyIpnSignature(JSON.stringify(body), sign(body, "wrong-secret"))).toBe(false);
  });

  it("rejects when the secret is not configured", () => {
    delete process.env.NOWPAYMENTS_IPN_SECRET;
    const body = { payment_status: "finished" };
    expect(verifyIpnSignature(JSON.stringify(body), sign(body))).toBe(false);
  });

  it("rejects an unparseable body", () => {
    expect(verifyIpnSignature("not json", "deadbeef")).toBe(false);
  });
});

describe("parseOrderId", () => {
  it("parses a monthly premium order", () => {
    expect(parseOrderId("user-123:monthly:1700000000000")).toEqual({
      kind: "premium",
      userId: "user-123",
      plan: "monthly",
    });
  });

  it("parses a lifetime premium order", () => {
    expect(parseOrderId("user-123:lifetime:1700000000000")).toEqual({
      kind: "premium",
      userId: "user-123",
      plan: "lifetime",
    });
  });

  it("parses a store order", () => {
    expect(parseOrderId("store:user-123:order-abc")).toEqual({
      kind: "store",
      userId: "user-123",
      storeOrderId: "order-abc",
    });
  });

  it("rejects an unknown plan", () => {
    expect(parseOrderId("user-123:yearly:1700000000000")).toBeNull();
  });

  it("rejects a store order missing its id", () => {
    expect(parseOrderId("store:user-123")).toBeNull();
  });

  it("rejects an empty string", () => {
    expect(parseOrderId("")).toBeNull();
  });
});

describe("buildOrderId / buildStoreOrderId round-trip", () => {
  it("premium order id round-trips through parseOrderId", () => {
    const parsed = parseOrderId(buildOrderId("user-9", "lifetime"));
    expect(parsed).toMatchObject({ kind: "premium", userId: "user-9", plan: "lifetime" });
  });

  it("store order id round-trips through parseOrderId", () => {
    const parsed = parseOrderId(buildStoreOrderId("user-9", "order-42"));
    expect(parsed).toMatchObject({ kind: "store", userId: "user-9", storeOrderId: "order-42" });
  });
});

describe("addDays", () => {
  it("adds days without mutating the input", () => {
    const from = new Date("2026-01-01T00:00:00.000Z");
    const result = addDays(from, 30);
    expect(result.toISOString()).toBe("2026-01-31T00:00:00.000Z");
    expect(from.toISOString()).toBe("2026-01-01T00:00:00.000Z");
  });
});

describe("computeMonthlyExpiry", () => {
  const now = new Date("2026-07-13T00:00:00.000Z");

  it("starts from now when there is no current expiry", () => {
    expect(computeMonthlyExpiry(null, now)).toEqual(addDays(now, PREMIUM_DAYS));
  });

  it("starts from now when the current expiry is in the past", () => {
    const past = new Date("2026-06-01T00:00:00.000Z");
    expect(computeMonthlyExpiry(past, now)).toEqual(addDays(now, PREMIUM_DAYS));
  });

  it("stacks on top of a still-active expiry", () => {
    const future = new Date("2026-08-01T00:00:00.000Z");
    expect(computeMonthlyExpiry(future, now)).toEqual(addDays(future, PREMIUM_DAYS));
  });
});

describe("isLifetimeProfile", () => {
  it("is true for a premium member with no expiry", () => {
    expect(isLifetimeProfile({ isPremium: true, premiumExpiresAt: null })).toBe(true);
  });

  it("is false for a premium member with an expiry", () => {
    expect(isLifetimeProfile({ isPremium: true, premiumExpiresAt: new Date() })).toBe(false);
  });

  it("is false for a non-premium member", () => {
    expect(isLifetimeProfile({ isPremium: false, premiumExpiresAt: null })).toBe(false);
  });
});

describe("PRICES", () => {
  it("keeps monthly and lifetime as whole-dollar amounts the webhook can validate", () => {
    expect(Number.isInteger(PRICES.monthly.amount)).toBe(true);
    expect(Number.isInteger(PRICES.lifetime.amount)).toBe(true);
  });
});
