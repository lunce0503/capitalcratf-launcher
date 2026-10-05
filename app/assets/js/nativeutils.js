const AdmZip = require('adm-zip')
const fs     = require('fs-extra')
const path   = require('path')

/**
 * Resolve the directory used by java.library.path. Minecraft 26.3 and newer
 * separate launcher-managed natives from JNA, LWJGL, and Netty temp files.
 *
 * @param {Object} vanillaManifest The Mojang version manifest.
 * @param {string} tempNativePath The root native directory for this launch.
 * @returns {string} The directory where launcher-managed natives must be extracted.
 */
function resolveNativeLibraryPath(vanillaManifest, tempNativePath){
    const prefix = '-Djava.library.path='
    const nativePathArgument = vanillaManifest.arguments?.jvm?.find(argument =>
        typeof argument === 'string' && argument.startsWith(prefix)
    )

    if(nativePathArgument == null) {
        return tempNativePath
    }

    const configuredPath = nativePathArgument.substring(prefix.length)
    const placeholder = '${natives_directory}'
    if(!configuredPath.startsWith(placeholder)) {
        return tempNativePath
    }

    const relativePath = configuredPath.substring(placeholder.length).replace(/^[/\\]+/, '')
    const resolvedPath = path.resolve(tempNativePath, relativePath)
    const nativeRoot = path.resolve(tempNativePath)
    if(resolvedPath !== nativeRoot && !resolvedPath.startsWith(nativeRoot + path.sep)) {
        return tempNativePath
    }

    return resolvedPath
}

/**
 * Extract a native archive before the game process starts.
 *
 * @param {string} archivePath Path to the native jar.
 * @param {string} destinationPath Native extraction directory.
 * @param {Array.<string>} exclusions Archive paths to ignore.
 */
function extractNativeLibrary(archivePath, destinationPath, exclusions){
    const zipEntries = new AdmZip(archivePath).getEntries()

    for(const entry of zipEntries){
        if(entry.isDirectory || exclusions.some(exclusion => entry.entryName.includes(exclusion))) {
            continue
        }

        const extractName = path.posix.basename(entry.entryName.replaceAll('\\', '/'))
        fs.writeFileSync(path.join(destinationPath, extractName), entry.getData())
    }
}

module.exports = { extractNativeLibrary, resolveNativeLibraryPath }
