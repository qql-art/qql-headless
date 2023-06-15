# qql-headless

Render high-resolution QQL images from the comfort of your Node shell.

This repository has two main goodies:

  - `src/index.js` is a simple command-line client that can be used for one-off
    renders of either specific seeds or random QQLs from a given address.

    Usage:

    ```
    $ # Render a specific seed:
    $ node src/index.js /tmp/myqqls 0x33c9371d25ce44a408f8a6473fbad86bf81e1a178c012cd49a85ffff14c54b46
    $ # Render a random seed owned by your address:
    $ node src/index.js /tmp/myqqls 0xcccccccccccccccccccccccccccccccccccccccc
    ```

    When generating random seeds for an address, you can fix values for some
    traits by editing the `FIXED_TRAITS` object at the top of `src/index.js`.
    (Set this to an empty object to allow all traits to vary.)

    Running `src/index.js` will write a PNG image file to the given output
    directory. The filename will have the current date and time as well as
    the seed.

  - `src/render.js` exports a pure function `render` that takes a `seed` and a
    `width`, and spits out a PNG image along with the "render data", which
    contains emergent traits of the QQL. You can import this function and use
    it for custom searches: for instance, keep rendering random QQLs until the
    `renderData` shows that the "`fPaleYellow`" color was actually used in the
    output.

## Installation

This is a Node project. Install Node (e.g., with [Volta][]), clone this
repository, then run `npm i` in the project directory to install dependencies.

If this produces errors about installing `canvas`, you may need to [install
dependencies for `canvas`][canvas-deps]. This is needed for some combinations
of operating system, processor architecture, and Node version.

[Volta]: https://volta.sh/
[canvas-deps]: https://github.com/Automattic/node-canvas#compiling

## Licensing

Only some of this code is permissively licensed. Please see `LICENSE` for
details.
