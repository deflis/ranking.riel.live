import { describe, expect, it } from "vitest";

import { decodeNarouText } from "../decodeNarouText";

describe("decodeNarouText", () => {
	it("タイトル・作者名の基本文字参照を復元する", () => {
		expect(
			decodeNarouText(
				"作品 &amp; 作者 &lt;別名&gt; &quot;名前&quot; &#039;名&#39;",
			),
		).toBe("作品 & 作者 <別名> \"名前\" '名'");
	});

	it("エスケープされた文字参照を二重にデコードしない", () => {
		expect(decodeNarouText("&amp;lt; &amp;copy; &amp;#12354;")).toBe(
			"&lt; &copy; &#12354;",
		);
	});

	it("通常の日本語・記号・絵文字をそのまま返す", () => {
		expect(decodeNarouText("作品＆作者 🐈 <名前> &unknown;")).toBe(
			"作品＆作者 🐈 <名前> &unknown;",
		);
	});

	it("読み込み中の未定義値と空文字列を扱える", () => {
		expect(decodeNarouText(undefined)).toBe("");
		expect(decodeNarouText("")).toBe("");
	});
});
