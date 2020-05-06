const { readFile, writeFile, mkdir } = require("fs");
const { promisify } = require("util");
const { dirname } = require("path");
const buildDir = "./build/";

async function main() {
  const data = await promisify(readFile)(buildDir + "index.html", "utf8");
  promisify(writeFile)(buildDir + "default.html", data, "utf8");

  async function replaceWrite(dist, text) {
    await promisify(mkdir)(dirname(dist), { recursive: true });
    const result = data.replace(/<title>/g, `<title>${text} - `);

    promisify(writeFile)(dist, result, "utf8");
    console.log(`write ${dist}`);
  }

  await Promise.all([
    replaceWrite("./functions/views/index.ejs", "<%= title %>"),
    replaceWrite(buildDir + "index.html", "最新の日間ランキング"),
    replaceWrite(buildDir + "ranking/d/index.html", "最新の日間ランキング"),
    replaceWrite(buildDir + "ranking/w/index.html", "最新の日間ランキング"),
    replaceWrite(buildDir + "ranking/m/index.html", "最新の日間ランキング"),
    replaceWrite(buildDir + "custom/index.html", "カスタム日間ランキング"),
  ]);
}

(async function() {
  try {
    await main();
  } catch (e) {
    console.error(e);
  }
})();
