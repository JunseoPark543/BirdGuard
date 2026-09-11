import { describe, expect, it } from "vitest";
import { polygonArea, rectifyWindowPixels, windowProjection, windowQuad, type PixelImage, type Quad } from "@/lib/rectify-window";

describe("window extraction and perspective rectification", () => {
  it("orders unordered corners without mirroring the window", () => {
    expect(windowQuad([[80, 90], [20, 10], [10, 90], [90, 10]])).toEqual([[20, 10], [90, 10], [80, 90], [10, 90]]);
    expect(windowQuad([[90, 10], [10, 90], [20, 10], [80, 90]])).toEqual([[20, 10], [90, 10], [80, 90], [10, 90]]);
  });
  it("rejects incomplete, collinear and duplicate corners", () => {
    expect(windowQuad([[0, 0], [10, 0], [10, 10]])).toBeNull();
    expect(windowQuad([[0, 0], [10, 0], [20, 0], [30, 0]])).toBeNull();
    expect(windowQuad([[0, 0], [10, 0], [10, 10], [0, 0]])).toBeNull();
  });
  it("uses outline vertices rather than the facade bounding box", () => {
    const polygon: [number, number][] = [[40, 0], [70, 5], [100, 40], [70, 95], [30, 100], [0, 40]];
    const quad = windowQuad(polygon)!;
    expect(quad).toHaveLength(4);
    quad.forEach(point => expect(polygon).toContainEqual(point));
    expect(polygonArea(quad)).toBeLessThanOrEqual(polygonArea(polygon));
  });
  it("maps all four corners and the perspective-correct center", () => {
    const quad: Quad = [[20, 10], [80, 10], [100, 90], [0, 90]];
    const project = windowProjection(quad);
    [[0, 0], [1, 0], [1, 1], [0, 1]].forEach(([x, y], i) => {
      const actual = project(x, y);
      expect(actual[0]).toBeCloseTo(quad[i][0]);
      expect(actual[1]).toBeCloseTo(quad[i][1]);
    });
    expect(project(.5, .5)[0]).toBeCloseTo(50);
    expect(project(.5, .5)[1]).toBeCloseTo(40);
  });
  it("extracts only the window pixels, preserving holes and alpha", () => {
    const source: PixelImage = { width: 40, height: 40, data: new Uint8ClampedArray(40 * 40 * 4) };
    for (let y = 0; y < 40; y++) for (let x = 0; x < 40; x++) {
      const inWindow = x >= 10 && x <= 30 && y >= 10 && y <= 30;
      const hole = x >= 17 && x <= 23 && y >= 17 && y <= 23;
      source.data.set(inWindow ? [0, 0, 255, hole ? 0 : 255] : [255, 0, 0, 255], (y * 40 + x) * 4);
    }
    const output = rectifyWindowPixels(source, [[10, 10], [30, 10], [30, 30], [10, 30]]);
    expect(output.width).toBe(20);
    expect(output.height).toBe(20);
    expect(Array.from(output.data.slice(0, 4))).toEqual([0, 0, 255, 255]);
    expect(output.data[(10 * output.width + 10) * 4 + 3]).toBe(0);
    for (let i = 0; i < output.data.length; i += 4) expect(output.data[i]).toBe(0);
  });
  it("bounds output size while retaining the estimated photo aspect ratio", () => {
    const source: PixelImage = { width: 200, height: 100, data: new Uint8ClampedArray(200 * 100 * 4) };
    const result = rectifyWindowPixels(source, [[0, 0], [200, 0], [200, 100], [0, 100]], 80);
    expect([result.width, result.height]).toEqual([80, 40]);
  });
  it("rejects degenerate transforms", () => {
    expect(() => windowProjection([[0, 0], [10, 0], [20, 0], [30, 0]])).toThrow();
    expect(() => rectifyWindowPixels({ width: 10, height: 10, data: new Uint8ClampedArray(400) }, [[0, 0], [.1, 0], [.1, .1], [0, .1]])).toThrow();
  });
});
