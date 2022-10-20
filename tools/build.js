var glob = require( 'glob' )
  , path = require( 'path' )
  , fs = require('fs')
  , child_process = require('child_process')

const compileMetadata = require('./src/plugin.js')
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