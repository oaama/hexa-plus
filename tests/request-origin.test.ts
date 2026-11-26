import { describe, it, expect } from "vitest";
import { hasAllowedOrigin } from "../src/lib/request-origin";
describe("reverse proxy origin validation", () => {
  const request = (origin?: string) =>
    new Request("http://localhost:10000/api/inquiry", {
      headers: origin ? { origin } : {},
    });
  it("accepts configured public origin behind internal proxy URL", () =>
    expect(
      hasAllowedOrigin(
        request("https://hexa-plus.onrender.com"),
        "https://hexa-plus.onrender.com",
      ),
    ).toBe(true));
  it("rejects foreign, null, malformed and wrong-protocol origins", () => {
    for (const origin of [
      "https://evil.invalid",
      "null",
      "bad",
      "http://hexa-plus.onrender.com",
    ])
      expect(
        hasAllowedOrigin(request(origin), "https://hexa-plus.onrender.com"),
      ).toBe(false);
  });
  it("allows non-browser callers with no Origin and falls back locally", () => {
    expect(hasAllowedOrigin(request(), "https://hexa-plus.onrender.com")).toBe(
      true,
    );
    expect(hasAllowedOrigin(request("http://localhost:10000"), "")).toBe(true);
  });
});
