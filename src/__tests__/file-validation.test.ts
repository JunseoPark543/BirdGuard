import { describe, expect, it } from "vitest";

import { maxUploadSizeBytes } from "@/config/app";
import { validateImageFileMetadata } from "@/lib/file-validation";

describe("validateImageFileMetadata", () => {
  it("accepts supported image metadata", () => {
    expect(() =>
      validateImageFileMetadata({
        name: "building.webp",
        size: 1024,
        type: "image/webp",
      }),
    ).not.toThrow();
  });

  it("rejects unsupported MIME types", () => {
    expect(() =>
      validateImageFileMetadata({
        name: "building.gif",
        size: 1024,
        type: "image/gif",
      }),
    ).toThrow();
  });

  it("rejects files over the size limit", () => {
    expect(() =>
      validateImageFileMetadata({
        name: "building.jpg",
        size: maxUploadSizeBytes + 1,
        type: "image/jpeg",
      }),
    ).toThrow();
  });
});
