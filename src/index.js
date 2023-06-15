const fs = require("fs");
const path = require("path");

const render = require("./render");
const traitsLib = require("./vendor/qql-traits.min.js");
const random = require("./vendor/qql-safe-random.min.js");

const FIXED_TRAITS = {
  margin: "Crisp",
  ringSize: "Large",
};

async function main(args) {
  const [outdir, target, extraArg] = args;
  if (outdir == null || target == null || extraArg != null) {
    throw new Error("usage: render <outdir> { <seed> | <address> }");
  }

  const seed = generateSeed(target);
  console.log("Seed:", seed);
  const traits = traitsLib.extractTraits(seed);
  console.log("Traits:", JSON.stringify(traits, null, 2));

  const { imageData, renderData } = await render({ seed, width: 2400 });
  const basename = `${new Date().toISOString()}-${seed}.png`;
  const outfile = path.join(outdir, basename);

  if (!fs.existsSync(outdir)){
    fs.mkdirSync(outdir);
  }

  await fs.promises.writeFile(outfile, imageData);

  console.log("Render data:", JSON.stringify(renderData, null, 2));
  console.log("Image:", outfile);
}

function generateSeed(target) {
  target = target.toLowerCase();
  if (!target.match(/^0x[0-9a-f]*$/)) {
    throw new Error("expected hex string; got: " + target);
  }
  const nibbles = target.slice(2);
  if (nibbles.length === 40) {
    const address = Buffer.from(nibbles, "hex");
    return randomSeed(address, FIXED_TRAITS);
  }
  if (nibbles.length === 64) return target;
  throw new Error(
    "expected address (bytes20) or seed (bytes32); got: " + target
  );
}

function randomSeed(address, traits) {
  if (!Buffer.isBuffer(address) || address.length !== 20)
    throw new Error("expected address, got: " + address);
  const buf = Buffer.from(
    Array(32)
      .fill()
      .map(() => Math.random() * 256)
  );
  address.copy(buf);
  const baseSeed = "0x" + buf.toString("hex");

  const rng = random.makeUnseededRng();
  const fullTraits = traitsLib.fillTraits(traits, rng);

  return traitsLib.encodeTraits(baseSeed, fullTraits);
}

main(process.argv.slice(2)).catch((e) => {
  process.exitCode = process.exitCode || 1;
  console.error(e);
});
