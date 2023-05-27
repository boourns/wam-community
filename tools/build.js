import pkg from 'glob';
const { sync } = pkg;

import { basename } from 'path'
import { readFileSync, existsSync, cpSync, writeFileSync } from 'fs'
import { execSync } from 'child_process'

import compileMetadata from './src/plugin.js'
const categories = JSON.parse(readFileSync('./categories.json'))["categories"]

/**
 * packageFiles installs plugins by running ./package.sh (if it exists) or by just copying the files into ./dist/plugins
 * @param {string} dir 
 *  
 * */ 
const packageFiles = (dir) => {
  console.log("Packaging ", dir)

  const packageScript = `${dir}/package.sh`
  if (existsSync(packageScript)) {
    console.log(`Package script ${packageScript} exists, running it`)
    execSync(packageScript)
  } else {
    console.log(`Package script ${packageScript} does not exist, copying files`)

    const target = basename(dir)

    cpSync(dir, `./dist/plugins/${target}`, { recursive: true })
  }    
  console.log("")
}

const main = async () => {
  console.log("[1/3] Packaging plugins into ./dist")
  sync('./plugins/*').forEach(collection => packageFiles(collection))
  
  console.log("[2/3] Compiling Plugin metadata")
  var metadata = []
  const collections = sync( './dist/plugins/*' )
  for (let collection of collections) {
    const data = await compileMetadata(collection)
    metadata.push(...data)
  }
  
  console.log("Writing ./dist/plugins.json")
  writeFileSync("./dist/plugins.json", JSON.stringify(metadata, undefined, 2))
  
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
  
  const WAMCommunity = {
    Plugins,
    Categories,
    Vendors,
    Keywords
  };
  
  export {Plugins, Categories, Vendors, Keywords};
  
  export default WAMCommunity;
  
  `
  writeFileSync("./dist/index.js", code)
  
  cpSync("./index.d.ts", `./dist/index.d.ts`)
}

await main()