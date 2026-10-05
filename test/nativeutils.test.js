const assert = require('node:assert/strict')
const fs = require('fs-extra')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')
const AdmZip = require('adm-zip')

const { extractNativeLibrary, resolveNativeLibraryPath } = require('../app/assets/js/nativeutils')

test('resolves the split native directory used by Minecraft 26.3', () => {
    const manifest = {
        arguments: {
            jvm: ['-Djava.library.path=${natives_directory}/java']
        }
    }

    assert.equal(resolveNativeLibraryPath(manifest, '/tmp/natives'), path.resolve('/tmp/natives/java'))
})

test('keeps the legacy native directory used by Minecraft 1.21.11', () => {
    const manifest = {
        arguments: {
            jvm: ['-Djava.library.path=${natives_directory}']
        }
    }

    assert.equal(resolveNativeLibraryPath(manifest, '/tmp/natives'), path.resolve('/tmp/natives'))
})

test('extracts a nested LWJGL native before launch', () => {
    const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'capitalcraft-native-test-'))
    const archivePath = path.join(tempDirectory, 'lwjgl-natives.jar')
    const destinationPath = path.join(tempDirectory, 'java')
    const archive = new AdmZip()
    archive.addFile('META-INF/MANIFEST.MF', Buffer.from('Manifest-Version: 1.0'))
    archive.addFile('windows/x64/org/lwjgl/lwjgl.dll', Buffer.from('native'))
    archive.writeZip(archivePath)
    fs.ensureDirSync(destinationPath)

    extractNativeLibrary(archivePath, destinationPath, ['META-INF/'])

    assert.equal(fs.readFileSync(path.join(destinationPath, 'lwjgl.dll'), 'utf8'), 'native')
    assert.equal(fs.existsSync(path.join(destinationPath, 'MANIFEST.MF')), false)
})
