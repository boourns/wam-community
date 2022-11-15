import { existsSync, readFileSync } from 'fs'
import { basename } from 'path'

const categories = JSON.parse(readFileSync('./categories.json'))["categories"]

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
    if (!descriptor.identifier || descriptor.identifier == "") {
        throw new Error("descriptor must have an 'identifier' field with content like 'com.myName.wamName'.")
    }
    if (!descriptor.vendor || descriptor.vendor == "") {
        throw new Error("Descriptor must have a non-blank vendor")
    }
    if (!descriptor.name || descriptor.name == "") {
        throw new Error("Descriptor must have a non-blank name")
    }
}

/**
 * processPlugin validates a single plugin entry
 */
const processPlugin = ((dir, plugin) => {
    console.log(`${dir}/${plugin.path}: Confirming entry point exists`)
    const entryPoint = `${dir}/${plugin.path}/index.js`
    if (!existsSync(entryPoint)) {
        throw new Error(`Expected WAM entrypoint does not exist: ${entryPoint}`)
    }

    console.log(`${dir}/${plugin.path}: Validating category`)
    validateCategory(plugin)
    
    console.log(`${dir}/${plugin.path}: Reading descriptor`)
    const descriptor = JSON.parse(readFileSync(`${dir}/${plugin.path}/descriptor.json`))
    validateDescriptor(descriptor)

    let entry = {
        identifier: descriptor.identifier,
        name: descriptor.name,
        vendor: descriptor.vendor,
        website: descriptor.website,
        description: descriptor.description,
        keywords: descriptor.keywords,
        category: plugin.category,
        thumbnail: plugin.thumbnail,
        version: plugin.version,
        path: `${basename(dir)}/${plugin.path}/index.js`
    }

    return entry
})

/**
* compileMetadata reads the plugin list from a collection, reads the plugin descriptor.json files, validates and compiles them all into one document
* @param {string} dir 
*/
const compileMetadata = (dir) => {
    console.log(`Reading plugin list for ${dir}`)
    const plugins = JSON.parse(readFileSync(`${dir}/plugins.json`))
    return plugins["plugins"].map(plugin => processPlugin(dir, plugin))
}


export default compileMetadata