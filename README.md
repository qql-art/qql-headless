# qql-headless

Render high-resolution QQL images from the comfort of your Node shell.

This repository has two main goodies:

  - `src/index.js` is a simple command-line client that can be used for one-off
    renders of either specific seeds or random QQLs.

    Usage:

    ```
    $ mkdir /tmp/myqqls
    $ node src/index.js /tmp/myqqls 0xd56707860b0cc2c6be60c3befaaed757c69095f76d4758391c4efa549adb66ff
    $ node src/index.js /tmp/myqqls  # render a random seed
    ```

    Running `src/index.js` will write a PNG image file to the given output
    directory (which should already exist). The filename will have the current
    date and time as well as the seed.

  - `src/render.js` exports a pure function `render` that takes a `seed` and a
    `width`, and spits out a PNG image along with the "render data", which
    contains emergent traits of the QQL. You can import this function and use
    it for custom searches: for instance, keep rendering random QQLs until the
    `renderData` shows that the "`fPaleYellow`" color was actually used in the
    output.

## Licensing

Only some of this code is permissively licensed. Please see `LICENSE` for
details.
