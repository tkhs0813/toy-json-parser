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
  // この実装はユーザーが行います
  throw new Error("Not implemented");
}
