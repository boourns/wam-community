var glob = require( 'glob' )
  , path = require( 'path' )
  , fs = require('fs')
  , child_process = require('child_process')

const compileMetadata = require('./src/plugin.js')
const categories = JSON.parse(fs.readFileSync('./categories.json'))["categories"]

/**
 * packageFiles installs plugins by running ./package.sh (if it exists) or by just copying the files into ./dist/plugins
 * @param {string} dir 
 *  
 * */ 
const packageFiles = (dir) => {
  console.log("Packaging ", dir)

  const packageScript = `${dir}/package.sh`
  if (fs.existsSync(packageScript)) {
    console.log(`Package script ${packageScript} exists, running it`)
    child_process.execSync(packageScript)
  } else {
    console.log(`Package script ${packageScript} does not exist, copying files`)

    const target = path.basename(dir)

    fs.cpSync(dir, `./dist/plugins/${target}`, { recursive: true })
  }    
  console.log("")
}

console.log("[1/3] Packaging plugins into ./dist")
glob.sync('./plugins/*').forEach(collection => packageFiles(collection))

console.log("[2/3] Compiling Plugin metadata")
var metadata = []
glob.sync( './dist/plugins/*' ).forEach(collection => {
  const data = compileMetadata(collection)
  metadata.push(...data)
})

console.log("Writing ./dist/plugins.json")
fs.writeFileSync("./dist/plugins.json", JSON.stringify(metadata, undefined, 2))

console.log("[3/3] Writing dist/index.js")
let vendors = []
metadata.forEach(m => {
  if (!vendors.includes(m.vendor)) {
    vendors.push(m.vendor)
  }
})

let keywords = []
metadata.forEach(m => {
  m.keywords.forEach(t => {
    if (!keywords.includes(t)) {
      keywords.push(t)
    }
  })
})

const code = `
const Plugins = ${JSON.stringify(metadata, undefined, 2)};

const Vendors = ${JSON.stringify(vendors, undefined, 2)};

const Categories = ${JSON.stringify(categories, undefined, 2)};

const Keywords = ${JSON.stringify(keywords, undefined, 2)};

export {
  Plugins,
  Categories,
  Vendors,
  Keywords
};

`
fs.writeFileSync("./dist/index.js", code)