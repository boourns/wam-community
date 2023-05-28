import { existsSync, readFileSync } from 'fs'
import { basename } from 'path'
import sharp from 'sharp'

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
    if (!descriptor.thumbnail || descriptor.thumbnail == "") {
        throw new Error("Thumbnail must exist")
    }

}

/**
 * processPlugin validates a single plugin entry
 */
const processPlugin = async (dir, plugin) => {
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

    const thumbnail = `${dir}/${plugin.path}/${descriptor.thumbnail}`
    if (!existsSync(thumbnail)) {
        throw new Error(`Thumbnail missing: ${thumbnail}`)
    }

    const dimensions = await calculateImageDimensions(thumbnail)
    
    let entry = {
        identifier: descriptor.identifier,
        name: descriptor.name,
        vendor: descriptor.vendor,
        website: descriptor.website,
        description: descriptor.description,
        keywords: descriptor.keywords,
        category: plugin.category,
        thumbnail: `${basename(dir)}/${plugin.path}/${descriptor.thumbnail}`,
        thumbnailDimensions: dimensions,
        version: plugin.version,
        path: `${basename(dir)}/${plugin.path}/index.js`
    }

    return entry
}

/**
* compileMetadata reads the plugin list from a collection, reads the plugin descriptor.json files, validates and compiles them all into one document
* @param {string} dir 
*/
const compileMetadata = async (dir) => {
    const plugins = JSON.parse(readFileSync(`${dir}/plugins.json`))

    let result = []
    for (let plugin of plugins["plugins"]) {
        result.push(await processPlugin(dir, plugin))
    }
    return result
}

const calculateImageDimensions = async (imageFile) => {
    const metadata = await sharp(imageFile).metadata()
    
    return { width: metadata.width, height: metadata.height };
}


export default compileMetadata