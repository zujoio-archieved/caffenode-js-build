const path = require('path');
const fs = require('fs');
const log = require('npmlog');

/**
 * config silly log as per env
 */
if (process.env.npm_config_loglevel === 'silly') {
    log.level = 'silly'
}

const {
    opencvModules,
    opencvLibDir
} = require('config');
const {
    isWindows,
    isOSX,
    requireGit,
    requireCmake
} = require('util');