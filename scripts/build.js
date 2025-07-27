let fs = require("fs")
let esbuild = require("esbuild")

console.log(`building plugin`)
esbuild.buildSync({
  entryPoints: [`builds/cdn.js`],
  bundle: true,
  platform: "browser",
  outfile: `dist/cdn.js`
})
console.log(`building plugin`)
esbuild.buildSync({
  entryPoints: [`builds/cdn.js`],
  bundle: true,
  platform: "browser",
  minify: true,
  outfile: `dist/cdn.min.js`
})
console.log(`building plugin`)
esbuild.buildSync({
  entryPoints: [`builds/module.js`],
  bundle: true,
  mainFields: ["module", "main"],
  platform: "neutral",
  outfile: `dist/module.esm.js`
})
