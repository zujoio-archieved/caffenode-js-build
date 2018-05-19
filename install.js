const path = require('path')
const fs = require('fs')
const log = require('npmlog')

if (process.env.npm_config_loglevel === 'silly') {
    log.level = 'silly'
}

const {
    opencvModules
} = require('lib/config');
const {
    isWindows,
    isOSX,
    requireGit,
    requireCmake,
    opencvLibDir
} = require('lib/util');
const {
    build
} = require('lib/build');

const install_ = () => {
    log.silly('install', 'install');

    if (fs.existsSync(opencvLibDir)) {
        return;
    }

    try {
        log.silly('install', 'installing opencv');
        await requireGit();
        await requireCmake();
        await build();
    }
    catch (err) {
        log.error(err);
        process.exit(1);
    }
}
install_();e