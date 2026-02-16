import { describe, it, expect } from "vitest";
import { parse } from "./parser";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";

const testDir = join(
  __dirname,
  "..",
  "..",
  "vendor",
  "JSONTestSuite",
  "test_parsing",
);
const files = readdirSync(testDir).filter((f) => f.endsWith(".json"));

const yFiles = files.filter((f) => f.startsWith("y_"));
const nFiles = files.filter((f) => f.startsWith("n_"));
const iFiles = files.filter((f) => f.startsWith("i_"));

describe("JSONTestSuite", () => {
  describe("y_ (must accept)", () => {
    it.each(yFiles)("%s", (file) => {
      const content = readFileSync(join(testDir, file), "utf-8");
      expect(() => parse(content)).not.toThrow();
    });
  });

  describe("n_ (must reject)", () => {
    it.each(nFiles)("%s", (file) => {
      const content = readFileSync(join(testDir, file), "utf-8");
      expect(() => parse(content)).toThrow();
    });
  });

  describe("i_ (implementation defined)", () => {
    it.each(iFiles)("%s", (file) => {
      const content = readFileSync(join(testDir, file), "utf-8");
      // 実装依存のケースはパース成功/失敗のどちらでもよい
      try {
        parse(content);
      } catch {
        // expected
      }
    });
  });
});
