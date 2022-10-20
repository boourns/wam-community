var fs = require('fs')
const path = require('path')

const categories = JSON.parse(fs.readFileSync('./categories.json'))["categories"]

const validateCategory = (plugin) => {
    if (plugin.category.length != 2) {
        throw new Error(`Plugin category should be a 2-element array, got ${plugin.category}`)
    }
    const cat = categories[plugin.category[0]]

    if (!cat) {
        throw new Error(`Top-level plugin category ${plugin.category[0]} does not exist`)
    }

    if (!cat.includes(plugin.category[1])) {
        throw new Error(`Secondary plugin category ${plugin.category[1]} does not exist as sub-category of ${plugin.category[0]}`)
    }
}

const validateDescriptor = (descriptor) => {

}

/**
 * processPlugin validates a single plugin entry
 */
const processPlugin = ((dir, plugin) => {
    console.log(`${dir}/${plugin.path}: Validating category`)
    validateCategory(plugin)
    
    console.log(`${dir}/${plugin.path}: Reading descriptor`)
    const descriptor = JSON.parse(fs.readFileSync(`${dir}/${plugin.path}/descriptor.json`))
    validateDescriptor(descriptor)

    let entry = {
        name: descriptor.name,
        vendor: descriptor.vendor,
        description: descriptor.description,
        keywords: descriptor.keywords,
        category: plugin.category,
        thumbnail: plugin.thumbnail,
        version: plugin.version,
        path: `${path.basename(dir)}/${plugin.path}`
    }

    return entry
})

/**
* compileMetadata reads the plugin list from a collection, reads the plugin descriptor.json files, validates and compiles them all into one document
* @param {string} dir 
*/
const compileMetadata = (dir) => {
    console.log(`Reading plugin list for ${dir}`)
    const plugins = JSON.parse(fs.readFileSync(`${dir}/plugins.json`))
    return plugins["plugins"].map(plugin => processPlugin(dir, plugin))
}


module.exports = compileMetadata