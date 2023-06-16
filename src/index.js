const fs = require("fs");
const path = require("path");

const render = require("./render");
const traitsLib = require("./vendor/qql-traits.min.js");
const random = require("./vendor/qql-safe-random.min.js");

// Any of the QQL traits may be specified here. Any values
// that are left null will be randomly chosen, just like the
// randomization on qql.art.
//
// Note that this object has no effect when a specific seed
// is generated.
const FIXED_TRAITS = {
  // accepted values: ["Edinburgh", "Fidenza", "Austin", "Seoul", "Seattle", "Berlin", "Miami"]
  colorPalette: null,

  // accepted values: ["Simple", "Stacked", "Zebra"]
  colorMode: null,

  // accepted values: ["Low", "Medium", "High"]
  colorVariety: null,

  // accepted values: ["Orbital", "Formation", "Shadows"]
  structure: null,

  // accepted values: ["None", "Low", "High]
  turbulence: null,

  // accepted values: ["Horizontal", "Vertical", "Diagonal", "Random Linear", "Explosive", "Spiral", "Circular", "Random Radial"]
  flowField: null,

  // accepted values: ["None", "Crisp", "Wide]
  margin: null,

  // accepted values: ["Small", "Medium", "Large"]
  ringSize: null,

  // accepted values: ["Constant", "Variable", "Wild"]
  sizeVariety: null,

  // accepted values: ["Dense", "Medium", "Sparse"]
  spacing: null,

  // each of these can either be "On" or "Off"
  bullseyeRings1: null,
  bullseyeRings3: null,
  bullseyeRings7: null,

  // accepted values: ["Thin", "Thick", "Mixed"]
  ringThickness: null,
};

// to generate smaller or larger images, change this
const IMAGE_WIDTH = 2400;

function parseArgs(args) {
  let [outdir, target, count, extraArg] = args;
  if (outdir == null || target == null || extraArg != null) {
    throw new Error("usage: render <outdir> { <seed> | <address> } [<count>]");
  }

  if (count === null || count === undefined) {
    count = 1;
  } else {
    count = parseInt(count);
    if (count <= 0) {
      throw new Error("count must be a positive integer");
    }
    if (count > 1 && isSeed(target)) {
      throw new Error(
        `You requested ${count} renders, but provided a seed instead of an address`
      );
    }
  }

  return { outdir, target, count };
}

async function renderOne(target, outdir) {
  const seed = generateSeed(target);
  console.log("Seed:", seed);
  const traits = traitsLib.extractTraits(seed);
  console.log("Traits:", JSON.stringify(traits, null, 2));

  const { imageData, renderData } = await render({ seed, width: IMAGE_WIDTH });
  const basename = `${new Date().toISOString()}-${seed}.png`;
  const outfile = path.join(outdir, basename);

  await fs.promises.writeFile(outfile, imageData);

  console.log("Render data:", JSON.stringify(renderData, null, 2));
  console.log("Image:", outfile);
}

async function main(args) {
  const { outdir, target, count } = parseArgs(args);

  if (!fs.existsSync(outdir)) {
    fs.mkdirSync(outdir);
  }

  for (let i = 0; i < count; i++) {
    if (i > 0) {
      console.log("");
    }
    console.log(`======== Rendering ${i + 1} of ${count} ========`);
    await renderOne(target, outdir);
  }
}

function isHex(target) {
  return target.toLowerCase().match(/^0x[0-9a-f]*$/);
}

function isSeed(target) {
  return target.length == 66 && isHex(target);
}

function generateSeed(target) {
  target = target.toLowerCase();
  if (!isHex(target)) {
    throw new Error("expected hex string (like 0x123abc...); got: " + target);
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
