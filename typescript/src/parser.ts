/**
 * JSONの値の型定義
 */
export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONObject
  | JSONArray;

/**
 * JSONオブジェクトの型定義
 */
export interface JSONObject {
  [key: string]: JSONValue;
}

/**
 * JSON配列の型定義
 */
export type JSONArray = JSONValue[];

/**
 * JSON文字列をパースしてJavaScriptの値に変換する
 * @param input JSON文字列
 * @returns パース結果
 */
export function parse(input: string): JSONValue {
  let pos = 0;

  function skipWhitespace(): void {
    while (pos < input.length && /[ \t\n\r]/.test(input[pos])) {
      pos++;
    }
  }

  function parseValue(): JSONValue {
    skipWhitespace();
    if (pos >= input.length) {
      throw new SyntaxError("Unexpected end of input");
    }
    const ch = input[pos];
    if (ch === '"') return parseString();
    if (ch === "{") return parseObject();
    if (ch === "[") return parseArray();
    if (ch === "t") return parseLiteral("true", true);
    if (ch === "f") return parseLiteral("false", false);
    if (ch === "n") return parseLiteral("null", null);
    if (ch === "-" || (ch >= "0" && ch <= "9")) return parseNumber();
    throw new SyntaxError(`Unexpected character '${ch}' at position ${pos}`);
  }

  function parseLiteral<T extends JSONValue>(text: string, value: T): T {
    if (input.startsWith(text, pos)) {
      pos += text.length;
      return value;
    }
    throw new SyntaxError(`Unexpected token at position ${pos}`);
  }

  function parseNumber(): number {
    const start = pos;

    // optional minus
    if (input[pos] === "-") pos++;

    // integer part
    if (input[pos] === "0") {
      pos++;
    } else if (input[pos] >= "1" && input[pos] <= "9") {
      pos++;
      while (pos < input.length && input[pos] >= "0" && input[pos] <= "9") {
        pos++;
      }
    } else {
      throw new SyntaxError(`Invalid number at position ${pos}`);
    }

    // fractional part
    if (pos < input.length && input[pos] === ".") {
      pos++;
      if (pos >= input.length || input[pos] < "0" || input[pos] > "9") {
        throw new SyntaxError(`Invalid number at position ${pos}`);
      }
      while (pos < input.length && input[pos] >= "0" && input[pos] <= "9") {
        pos++;
      }
    }

    // exponent part
    if (pos < input.length && (input[pos] === "e" || input[pos] === "E")) {
      pos++;
      if (pos < input.length && (input[pos] === "+" || input[pos] === "-")) {
        pos++;
      }
      if (pos >= input.length || input[pos] < "0" || input[pos] > "9") {
        throw new SyntaxError(`Invalid number at position ${pos}`);
      }
      while (pos < input.length && input[pos] >= "0" && input[pos] <= "9") {
        pos++;
      }
    }

    return Number(input.slice(start, pos));
  }

  function parseString(): string {
    pos++; // skip opening "
    let result = "";

    while (pos < input.length) {
      const ch = input[pos];
      if (ch === '"') {
        pos++;
        return result;
      }
      if (ch === "\\") {
        pos++;
        if (pos >= input.length) {
          throw new SyntaxError("Unexpected end of input in string");
        }
        const esc = input[pos];
        pos++;
        switch (esc) {
          case '"':
            result += '"';
            break;
          case "\\":
            result += "\\";
            break;
          case "/":
            result += "/";
            break;
          case "b":
            result += "\b";
            break;
          case "f":
            result += "\f";
            break;
          case "n":
            result += "\n";
            break;
          case "r":
            result += "\r";
            break;
          case "t":
            result += "\t";
            break;
          case "u": {
            const hex = input.slice(pos, pos + 4);
            if (hex.length < 4 || !/^[0-9a-fA-F]{4}$/.test(hex)) {
              throw new SyntaxError(
                `Invalid unicode escape at position ${pos}`,
              );
            }
            result += String.fromCharCode(parseInt(hex, 16));
            pos += 4;
            break;
          }
          default:
            throw new SyntaxError(
              `Invalid escape character '${esc}' at position ${pos}`,
            );
        }
      } else if (ch.charCodeAt(0) < 0x20) {
        throw new SyntaxError(`Unescaped control character at position ${pos}`);
      } else {
        result += ch;
        pos++;
      }
    }

    throw new SyntaxError("Unterminated string");
  }

  function parseArray(): JSONArray {
    pos++; // skip [
    skipWhitespace();

    const arr: JSONArray = [];
    if (input[pos] === "]") {
      pos++;
      return arr;
    }

    arr.push(parseValue());
    skipWhitespace();

    while (pos < input.length && input[pos] === ",") {
      pos++;
      skipWhitespace();
      if (pos >= input.length || input[pos] === "]") {
        throw new SyntaxError(`Trailing comma in array at position ${pos}`);
      }
      arr.push(parseValue());
      skipWhitespace();
    }

    if (pos >= input.length || input[pos] !== "]") {
      throw new SyntaxError(`Expected ']' at position ${pos}`);
    }
    pos++;
    return arr;
  }

  function parseObject(): JSONObject {
    pos++; // skip {
    skipWhitespace();

    const obj: JSONObject = {};
    if (input[pos] === "}") {
      pos++;
      return obj;
    }

    if (input[pos] !== '"') {
      throw new SyntaxError(`Expected string key at position ${pos}`);
    }
    let key = parseString();
    skipWhitespace();
    if (pos >= input.length || input[pos] !== ":") {
      throw new SyntaxError(`Expected ':' at position ${pos}`);
    }
    pos++;
    obj[key] = parseValue();
    skipWhitespace();

    while (pos < input.length && input[pos] === ",") {
      pos++;
      skipWhitespace();
      if (pos >= input.length || input[pos] === "}") {
        throw new SyntaxError(`Trailing comma in object at position ${pos}`);
      }
      if (input[pos] !== '"') {
        throw new SyntaxError(`Expected string key at position ${pos}`);
      }
      key = parseString();
      skipWhitespace();
      if (pos >= input.length || input[pos] !== ":") {
        throw new SyntaxError(`Expected ':' at position ${pos}`);
      }
      pos++;
      obj[key] = parseValue();
      skipWhitespace();
    }

    if (pos >= input.length || input[pos] !== "}") {
      throw new SyntaxError(`Expected '}' at position ${pos}`);
    }
    pos++;
    return obj;
  }

  // main
  const result = parseValue();
  skipWhitespace();
  if (pos < input.length) {
    throw new SyntaxError(`Unexpected token at position ${pos}`);
  }
  return result;
}
