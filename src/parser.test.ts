import { describe, it, expect } from "vitest";
import { parse, JSONValue } from "./parser";

describe("JSONParser", () => {
  describe("基本的な値のパース", () => {
    it("空の文字列をパースできる", () => {
      expect(parse("")).toBeNull();
    });

    it("nullをパースできる", () => {
      expect(parse("null")).toBeNull();
    });

    it("trueをパースできる", () => {
      expect(parse("true")).toBe(true);
    });

    it("falseをパースできる", () => {
      expect(parse("false")).toBe(false);
    });

    it("数値をパースできる", () => {
      expect(parse("123")).toBe(123);
      expect(parse("-123")).toBe(-123);
      expect(parse("0")).toBe(0);
      expect(parse("0.123")).toBe(0.123);
      expect(parse("-0.123")).toBe(-0.123);
      expect(parse("1e2")).toBe(100);
      expect(parse("1E2")).toBe(100);
      expect(parse("1e+2")).toBe(100);
      expect(parse("1e-2")).toBe(0.01);
    });

    it("文字列をパースできる", () => {
      expect(parse('"hello"')).toBe("hello");
      expect(parse('""')).toBe("");
    });
  });

  describe("文字列のエスケープシーケンス", () => {
    it("基本的なエスケープシーケンスをパースできる", () => {
      expect(parse('"\\""')).toBe('"');
      expect(parse('"\\\\"')).toBe("\\");
      expect(parse('"\\/"')).toBe("/");
      expect(parse('"\\b"')).toBe("\b");
      expect(parse('"\\f"')).toBe("\f");
      expect(parse('"\\n"')).toBe("\n");
      expect(parse('"\\r"')).toBe("\r");
      expect(parse('"\\t"')).toBe("\t");
    });

    it("Unicodeエスケープシーケンスをパースできる", () => {
      expect(parse('"\\u0041"')).toBe("A");
      expect(parse('"\\u3042"')).toBe("あ");
      expect(parse('"Hello\\u0020World"')).toBe("Hello World");
    });
  });

  describe("配列のパース", () => {
    it("空の配列をパースできる", () => {
      expect(parse("[]")).toEqual([]);
    });

    it("単一要素の配列をパースできる", () => {
      expect(parse("[1]")).toEqual([1]);
      expect(parse('["hello"]')).toEqual(["hello"]);
      expect(parse("[true]")).toEqual([true]);
    });

    it("複数要素の配列をパースできる", () => {
      expect(parse("[1, 2, 3]")).toEqual([1, 2, 3]);
      expect(parse('["hello", "world"]')).toEqual(["hello", "world"]);
      expect(parse("[true, false, null]")).toEqual([true, false, null]);
    });

    it("ネストした配列をパースできる", () => {
      expect(parse("[[]]")).toEqual([[]]);
      expect(parse("[[1, 2], [3, 4]]")).toEqual([
        [1, 2],
        [3, 4],
      ]);
      expect(parse("[1, [2, 3], 4]")).toEqual([1, [2, 3], 4]);
    });

    it("余分な空白を含む配列をパースできる", () => {
      expect(parse("[ ]")).toEqual([]);
      expect(parse("[ 1 , 2 , 3 ]")).toEqual([1, 2, 3]);
    });
  });

  describe("オブジェクトのパース", () => {
    it("空のオブジェクトをパースできる", () => {
      expect(parse("{}")).toEqual({});
    });

    it("単一プロパティのオブジェクトをパースできる", () => {
      expect(parse('{"key": "value"}')).toEqual({ key: "value" });
      expect(parse('{"key": 123}')).toEqual({ key: 123 });
      expect(parse('{"key": true}')).toEqual({ key: true });
      expect(parse('{"key": null}')).toEqual({ key: null });
    });

    it("複数プロパティのオブジェクトをパースできる", () => {
      expect(parse('{"a": 1, "b": 2}')).toEqual({ a: 1, b: 2 });
      expect(parse('{"name": "John", "age": 30}')).toEqual({
        name: "John",
        age: 30,
      });
    });

    it("ネストしたオブジェクトをパースできる", () => {
      expect(parse('{"a": {"b": 1}}')).toEqual({ a: { b: 1 } });
      expect(parse('{"a": {"b": {"c": 1}}}')).toEqual({ a: { b: { c: 1 } } });
    });

    it("オブジェクトと配列の組み合わせをパースできる", () => {
      expect(parse('{"a": [1, 2]}')).toEqual({ a: [1, 2] });
      expect(parse('[{"a": 1}, {"b": 2}]')).toEqual([{ a: 1 }, { b: 2 }]);
    });

    it("余分な空白を含むオブジェクトをパースできる", () => {
      expect(parse("{ }")).toEqual({});
      expect(parse('{ "a" : 1 , "b" : 2 }')).toEqual({ a: 1, b: 2 });
    });
  });

  describe("複雑なJSONのパース", () => {
    it("複雑なJSONをパースできる", () => {
      const complexJson = `
      {
        "name": "John Doe",
        "age": 30,
        "isEmployed": true,
        "address": {
          "street": "123 Main St",
          "city": "Anytown",
          "zipCode": "12345"
        },
        "phoneNumbers": [
          {
            "type": "home",
            "number": "555-1234"
          },
          {
            "type": "work",
            "number": "555-5678"
          }
        ],
        "children": [],
        "spouse": null
      }
      `;

      const expected = {
        name: "John Doe",
        age: 30,
        isEmployed: true,
        address: {
          street: "123 Main St",
          city: "Anytown",
          zipCode: "12345",
        },
        phoneNumbers: [
          {
            type: "home",
            number: "555-1234",
          },
          {
            type: "work",
            number: "555-5678",
          },
        ],
        children: [],
        spouse: null,
      };

      expect(parse(complexJson)).toEqual(expected);
    });
  });

  describe("エラー処理", () => {
    it("不正なJSONはエラーになる", () => {
      expect(() => parse("{")).toThrow();
      expect(() => parse("}")).toThrow();
      expect(() => parse("[")).toThrow();
      expect(() => parse("]")).toThrow();
      expect(() => parse('"hello')).toThrow();
    });

    it("不正な値はエラーになる", () => {
      expect(() => parse("undefined")).toThrow();
      expect(() => parse("NaN")).toThrow();
      expect(() => parse("Infinity")).toThrow();
      expect(() => parse("-Infinity")).toThrow();
    });

    it("不正なオブジェクトはエラーになる", () => {
      expect(() => parse('{"key": value}')).toThrow();
      expect(() => parse('{"key"}')).toThrow();
      expect(() => parse('{"key": 1,}')).toThrow();
      expect(() => parse('{key: "value"}')).toThrow();
    });

    it("不正な配列はエラーになる", () => {
      expect(() => parse("[1,]")).toThrow();
      expect(() => parse("[,1]")).toThrow();
      expect(() => parse("[1,,2]")).toThrow();
    });
  });

  describe("空白の処理", () => {
    it("値の前後の空白を無視できる", () => {
      expect(parse(" 123 ")).toBe(123);
      expect(parse(' "hello" ')).toBe("hello");
      expect(parse(" true ")).toBe(true);
      expect(parse(" null ")).toBeNull();
    });

    it("配列内の空白を適切に処理できる", () => {
      expect(parse(" [ 1 , 2 , 3 ] ")).toEqual([1, 2, 3]);
    });

    it("オブジェクト内の空白を適切に処理できる", () => {
      expect(parse(' { "a" : 1 , "b" : 2 } ')).toEqual({ a: 1, b: 2 });
    });

    it("JSONの中のさまざまな空白文字を適切に処理できる", () => {
      const jsonWithWhitespace = '{\n  "a": 1,\r\n  "b": 2,\t  "c": 3\n}';
      expect(parse(jsonWithWhitespace)).toEqual({ a: 1, b: 2, c: 3 });
    });
  });
});
