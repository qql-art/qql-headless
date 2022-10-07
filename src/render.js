const jsdom = require("jsdom");

// The `canvas` module needs to be installed for rendering to work, or else
// it'll fail with a late run-time error. Check here and fail fast.
require("canvas");

async function render({
  seed,
  width,
}) /*: Promise<{ imageData: ArrayBuffer, renderData: Object }> */ {
  const dom = new jsdom.JSDOM("<!DOCTYPE html>");
  const window = dom.window;
  global.window = window;
  global.document = window.document;
  global.screen = window.screen;
  global.navigator = window.navigator;

  const container = document.createElement("div");
  const p5 = require("p5");
  const { default: qql } = require("./vendor/qql.min.js");

  const renderData = await new Promise((resolve, reject) => {
    new p5((p5) => {
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

module.exports = render;
