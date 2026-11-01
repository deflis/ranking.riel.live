import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { dirname, extname, resolve, sep } from "node:path";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { build } from "vite";

const chrome = process.env.CHROME_BIN;
assert(chrome, "CHROME_BINにChromeの実行ファイルを指定してください");
const directory = dirname(fileURLToPath(import.meta.url));
const project = resolve(directory, "../..");
const run = promisify(execFile);
let temporary;
let server;

before(async () => {
	temporary = await mkdtemp(resolve(tmpdir(), "ranking-layout-"));
	const output = resolve(temporary, "public");
	await build({
		configFile: false,
		root: resolve(directory, "fixture"),
		logLevel: "error",
		plugins: [react(), tailwindcss()],
		resolve: { alias: { "@": resolve(project, "src") } },
		build: { outDir: output, emptyOutDir: true },
	});
	server = createServer(async (request, response) => {
		try {
			const pathname = new URL(request.url, "http://localhost").pathname;
			const path = resolve(
				output,
				`.${pathname === "/" ? "/index.html" : pathname}`,
			);
			if (!path.startsWith(output + sep)) {
				response.writeHead(403).end();
				return;
			}
			response.setHeader(
				"Content-Type",
				{
					".html": "text/html; charset=utf-8",
					".js": "text/javascript",
					".css": "text/css",
				}[extname(path)] ?? "application/octet-stream",
			);
			response.end(await readFile(path));
		} catch {
			response.writeHead(404).end();
		}
	});
	await new Promise((done, reject) => {
		server.once("error", reject);
		server.listen(0, "127.0.0.1", done);
	});
});

after(async () => {
	if (server?.listening) await new Promise((done) => server.close(done));
	if (temporary) await rm(temporary, { recursive: true, force: true });
});

// Chrome CLIの最小幅500pxでも、md未満の1カラム表示を検証できる。
for (const width of [1280, 500]) {
	test(`${width}px: 長短のタイトル・キーワードを持つ通常/R18カードの行揃え`, async () => {
		const { stdout } = await run(
			chrome,
			[
				"--headless",
				"--dump-dom",
				"--virtual-time-budget=10000",
				"--no-first-run",
				"--no-default-browser-check",
				`--user-data-dir=${resolve(temporary, `chrome-${width}`)}`,
				`--window-size=${width},900`,
				`http://127.0.0.1:${server.address().port}/`,
			],
			{ timeout: 30000, maxBuffer: 16 * 1024 * 1024 },
		);
		const encoded = stdout.match(/data-browser-result="([^"]+)"/);
		assert(encoded, "ブラウザ内の検証が完了しませんでした");
		const result = JSON.parse(
			Buffer.from(encoded[1], "base64").toString("utf8"),
		);
		assert.equal(result.passed, true, result.error);
		assert.equal(result.width, width, "要求したビューポート幅で実行すること");
		assert.equal(result.cards, 300);
	});
}
