const { DistributionAPI } = require('helios-core/common')
const fs = require('fs-extra')
const path = require('path')

const ConfigManager = require('./configmanager')

exports.REMOTE_DISTRO_URL = 'https://raw.githubusercontent.com/lunce0503/capitalcratf-launcher/master/distribution.json'

const embeddedDistroPath = path.resolve(__dirname, '..', '..', '..', 'distribution.json')
const userDistroPath = path.join(ConfigManager.getLauncherDirectory(), 'distribution.json')

if(fs.existsSync(embeddedDistroPath) && !fs.existsSync(userDistroPath)){
    fs.ensureDirSync(path.dirname(userDistroPath))
    fs.copyFileSync(embeddedDistroPath, userDistroPath)
}

const api = new DistributionAPI(
    ConfigManager.getLauncherDirectory(),
    null, // Injected forcefully by the preloader.
    null, // Injected forcefully by the preloader.
    exports.REMOTE_DISTRO_URL,
    false
)

exports.DistroAPI = api
