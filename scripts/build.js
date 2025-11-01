let fs = require("fs")
let esbuild = require("esbuild")

console.log(`building plugin`)
esbuild.buildSync({
  entryPoints: [`remote-component/builds/cdn.js`],
  bundle: true,
  platform: "browser",
  outfile: `remote-component/dist/cdn.js`
})
console.log(`building plugin`)
esbuild.buildSync({
  entryPoints: [`remote-component/builds/cdn.js`],
  bundle: true,
  platform: "browser",
  minify: true,
  outfile: `remote-component/dist/cdn.min.js`
})
console.log(`building plugin`)
esbuild.buildSync({
  entryPoints: [`remote-component/builds/module.js`],
  bundle: true,
  mainFields: ["module", "main"],
  platform: "neutral",
  outfile: `remote-component/dist/module.esm.js`
})

console.log(`building plugin`)
esbuild.buildSync({
  entryPoints: [`remote-component-lite/builds/cdn.js`],
  bundle: true,
  platform: "browser",
  outfile: `remote-component-lite/dist/cdn.js`
})
console.log(`building plugin`)
esbuild.buildSync({
  entryPoints: [`remote-component-lite/builds/cdn.js`],
  bundle: true,
  platform: "browser",
  minify: true,
  outfile: `remote-component-lite/dist/cdn.min.js`
})
console.log(`building plugin`)
esbuild.buildSync({
  entryPoints: [`remote-component-lite/builds/module.js`],
  bundle: true,
  mainFields: ["module", "main"],
  platform: "neutral",
  outfile: `remote-component-lite/dist/module.esm.js`
})
