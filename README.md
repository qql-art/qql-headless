# qql-headless

Render high-resolution [QQL][] images from the comfort of your Node shell.

This tool has a few advantages over the QQL website:

  - Better performance

  - Easier to parallelize

  - Outputs can be managed with a filesystem

  - Some additional filtering options are available

The downside is that it requires some basic command-line and javascript
skills.

[QQL]: https://qql.art

## Installation

This is a Node project. Install Node (e.g., with [Volta][]), clone this
repository, then run `npm i` in the project directory to install dependencies.

If this produces errors about installing `canvas`, you may need to [install
dependencies for `canvas`][canvas-deps]. This is needed for some combinations
of operating system, processor architecture, and Node version.

[Volta]: https://volta.sh/
[canvas-deps]: https://github.com/Automattic/node-canvas#compiling

## Usage

The primary way of using this tool is to execute `src/index.js`.

The pattern for rendering a specific seed is:

```
node src/index.js <outdir> <seed>
```

This will write a PNG image file to the given output directory. The
filename will have the current date and time as well as the seed.

For example, to render QQL #1 in the `./renders` dir:

```bash
node src/index.js ./renders 0x33c9371d25ce44a408f8a6473fbad86bf81e1a178c012cd49a85ffff14c54b46
```

Alternatively, you can render a random seed owned by your address
by replacing the `<seed>` with your address (e.g.
`0x33c9371d25ce44a408f8a6473fbad86bf81e1a17` for `1.tylerxhobbs.eth`):

```bash
node src/index.js ./renders 0x33c9371d25ce44a408f8a6473fbad86bf81e1a17
```

It's important to **use your address** here, otherwise you won't actually
control the seed.

### Rendering with Specific Traits

When generating random seeds for an address, you can fix values for some
traits by editing the `FIXED_TRAITS` object at the top of `src/index.js`.
See the comments in that file for instructions and documentation.

### The `render` Function

`src/render.js` exports a pure function `render` that takes a `seed` and a
`width`, and spits out a PNG image along with the "render data", which
contains emergent traits of the QQL. You can import this function and use
it for custom searches: for instance, keep rendering random QQLs until the
`renderData` shows that the "`fPaleYellow`" color was actually used in the
output.

## Licensing

Only some of this code is permissively licensed. Please see `LICENSE` for
details.
