const fs = require("fs");
const path = require("path");

const render = require("./render");
const traitsLib = require("./vendor/qql-traits.min.js");

async function main(args) {
  const [outdir, seed = randomSeed(), extraArg] = args;
  if (outdir == null || extraArg != null) {
    throw new Error("usage: render <outdir> [<seed>]");
  }
  console.log("Seed:", seed);
  const traits = traitsLib.extractTraits(seed);
  console.log("Traits:", JSON.stringify(traits, null, 2));

  const { imageData, renderData } = await render({ seed, width: 2400 });
  const basename = `${new Date().toISOString()}-${seed}.png`;
  const outfile = path.join(outdir, basename);
  await fs.promises.writeFile(outfile, imageData);

  console.log("Render data:", JSON.stringify(renderData, null, 2));
  console.log("Image:", outfile);
}

function randomSeed() {
  const buf = Buffer.from(
    Array(32)
      .fill()
      .map(() => Math.random() * 256)
  );
  // Set "version 1" to get proper spirals.
  const version = 1;
  buf[26] = buf[27] = 0xff; // version sentinel
  buf[28] = (buf[28] & 0x0f) | (version << 4);
  return "0x" + buf.toString("hex");
}

main(process.argv.slice(2)).catch((e) => {
  process.exitCode = process.exitCode || 1;
  console.error(e);
});
