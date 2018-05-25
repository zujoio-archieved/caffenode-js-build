const path = require('path')
const fs = require('fs')
const log = require('npmlog')

//if (process.env.npm_config_loglevel === 'silly') {
log.level = 'silly'
//}

const {
    opencvModules
} = require('./config');
const {
    isWindows,
    isOSX,
} = require('./plateform');
const {
    requireGit,
    requireCmake,
    opencvLibDir
} = require('./util');
const {
    build
} = require('./build');

const install_ = async () => {
    log.silly('install', 'install');

    if (fs.existsSync(opencvLibDir)) {
        return;
    }

    try {

        await requireGit();
        await requireCmake();
        await build();
    }
    catch (err) {
        log.error(err);
        process.exit(1);
    }
}
install_();