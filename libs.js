const path = require('path');
const fs = require('fs');
const log = require('npmlog');

const {
    opencvModules,
    opencvLibDir,

    ncclLibDir
} = require('./config');
const {
    isOSX,
} = require('./plateform');

/**
 * config silly log as per env
 */
if (process.env.npm_config_loglevel === 'silly') {
    log.level = 'silly'
}

/**
 * get prefix for CV
 */
const getCvLibPrefix = () => {
    return 'libopencv_';
}

/**
 * get suffix for CV
 */
const getCvLibSuffix = () => {
    return (isOSX() ? 'dylib' : 'so');
}


/**
 * get prefix for NCCL
 */
const getNcclLibPrefix = () => {
    return 'lib';
}

/**
 * get suffix for NCCL
 */
const getNcclLibSuffix = () => {
    return (isOSX() ? 'dylib' : 'so');
}

/**
 * get regex for matching library name
 * @param {string} module 
 */
const getCvLibNameRegex = (module, prefix, suffix) => {
    return new RegExp(`^${prefix}${module}[0-9]{0,3}.${suffix}$`);
}

/**
 * getting absolute path for directory and file
 * @param {string} libDir 
 * @param {string} libFile 
 */
const getLibAbsPath = (libDir, libFile) => {
    let libPath = path.resolve(libDir, libFile)
    return (libFile ? fs.realpathSync(libPath) : undefined);
}

/**
 * match name of CV library
 * @param {string} libDir 
 * @param {string} libFile 
 * @param {string} module 
 */
const matchCvLibName = (libDir, libFile, module, prefix, suffix) => {
    const regex = getCvLibNameRegex(module, prefix, suffix);
    return (libFile.match(regex) || [])[0];
}

/**
 * resolve library path
 * @param {string} libDir 
 * @param {string} module 
 */
const resolveLibPath = (libDir, libFiles, module, prefix, suffix) => {
    return getLibAbsPath(libDir, libFiles.find(libFile => {
        return matchCvLibName(libDir, libFile, module, prefix, suffix);
    }));
}

/**
 * check whether all libraries are installed
 */
const checkCvAlreadyCompiled = async () => {
    if (!fs.existsSync(opencvLibDir)) {
        throw new Error(`Opencv specified lib dir does not exists: ${opencvLibDir}`);
    }

    try {
        const libFiles = fs.readdirSync(opencvLibDir);
        const prefix = getCvLibPrefix();
        const suffix = getCvLibSuffix();
        return opencvModules.every(module => undefined != resolveLibPath(opencvLibDir, libFiles, module, prefix, suffix));
    }
    catch (err) {
        throw err;
    }
}

/**
 * check whether NCCL installed successfully
 */
const checkNcclAlreadyCompiled = async () => {
    if (!fs.existsSync(ncclLibDir)) {
        throw new Error(`NCCL specified lib dir does not exists: ${ncclLibDir}`);
    }

    try {
        const libFiles = fs.readdirSync(ncclLibDir);
        const prefix = getNcclLibPrefix();
        const suffix = getNcclLibSuffix();
        return ['nccl'].every(module => undefined != resolveLibPath(ncclLibDir, libFiles, module, prefix, suffix));
    }
    catch (err) {
        throw err;
    }
}

module.exports = {
    checkCvAlreadyCompiled,
    checkNcclAlreadyCompiled
}