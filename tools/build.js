var glob = require( 'glob' )
  , path = require( 'path' )
  , fs = require('fs')
const { exit } = require('process')
/**
 * packageCollection installs plugins by running ./package.sh (if it exists) or by just copying the files into ./dist/plugins
 * @param dir string
 *  
 * */ 
const packageCollection = (dir) => {
  console.log("Packaging ", dir)

  const packageScript = `${dir}/package.sh`
  if (fs.existsSync(packageScript)) {
    console.log(`Package script ${packageScript} exists, running it`)
  } else {
    console.log(`Package script ${packageScript} does not exist, copying files`)

    fs.cpSync(dir, './dist/plugins', { recursive: true })
  }    
  console.log("")
}

glob.sync( './plugins/*' ).forEach( ( collection ) => {
    packageCollection(collection)
});