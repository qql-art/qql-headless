const fs = require("fs");
const vm = require("vm");

const jsdom = require("jsdom");

// The `canvas` module needs to be installed for rendering to work, or else
// it'll fail with a late run-time error. Check here and fail fast.
require("canvas");

const { default: qql } = require("./vendor/qql.min.js");

async function render({
  seed,
  width,
}) /*: Promise<{ imageData: ArrayBuffer, renderData: Object }> */ {
  const dom = new jsdom.JSDOM("<!DOCTYPE html>");
  const window = dom.window;
  const container = window.document.createElement("div");

  // Run in a V8 context because p5.js wants to read from and write to global
  // state, and this way we contain the pollution.
  const ctx = vm.createContext(window);
  vm.runInContext(await moduleSource("p5"), ctx, { filename: "p5.min.js" });
  window.container = container;
  window.render = () =>
    new Promise((resolve, reject) => {
      new window.p5((p5) => {
        const pause = () => {}; // don't worry about blocking the main thread; ~5% faster
        const verbose = false;
        qql(p5, width, pause, verbose);

        const setup = p5.setup;
        p5.setup = () => {
          try {
            setup();
          } catch (e) {
            reject(e);
          }
        };

        const draw = p5.draw;
        p5.draw = async () => {
          try {
            resolve(await draw(seed));
          } catch (e) {
            reject(e);
          }
        };
      }, container);
    });
  const renderData = await vm.runInContext("render()", ctx);

  const canvas = container.getElementsByTagName("canvas")[0];
  if (canvas == null) {
    throw new Error("lost canvas :-(");
  }
  const blob = await new Promise((res) => canvas.toBlob(res, "image/png"));
  const imageArrayBuffer = await new Promise((res) => {
    const fileReader = new dom.window.FileReader();
    fileReader.addEventListener("loadend", () => res(fileReader.result));
    fileReader.readAsArrayBuffer(blob);
  });
  const imageData = Buffer.from(imageArrayBuffer);

  return { imageData, renderData };
}

async function moduleSource(module) {
  return await fs.promises
    .readFile(require.resolve(module))
    .then((buf) => buf.toString());
}

module.exports = render;
