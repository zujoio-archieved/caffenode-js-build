const path = require('path');
const fs = require('fs');
const log = require('npmlog');

const {
    opencvModules,
    opencvLibDir,

    ncclLibDir,
    ncclModules,

    protobufLibDir,
    protobufModules,

    caffeLibDir,
    caffeModules

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
 * get prefix for PROTOBUF
 */
const getProtobufLibPrefix = () => {
    return 'lib';
}

/**
 * get suffix for PROTOBUF
 */
const getProtobufLibSuffix = () => {
    return (isOSX() ? 'dylib' : 'so');
}

/**
 * get prefix for CAFFE
 */
const getCaffeLibPrefix = () => {
    return 'lib';
}

/**
 * get suffix for CAFFE
 */
const getCaffeLibSuffix = () => {
    return (isOSX() ? 'dylib' : 'so');
}

/**
 * get regex for matching library name
 * @param {string} module 
 */
const getLibNameRegex = (module, prefix, suffix) => {
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
const matchLibName = (libDir, libFile, module, prefix, suffix) => {
    const regex = getLibNameRegex(module, prefix, suffix);
    return (libFile.match(regex) || [])[0];
}

/**
 * resolve library path
 * @param {string} libDir 
 * @param {string} module 
 */
const resolveLibPath = (libDir, libFiles, module, prefix, suffix) => {
    return getLibAbsPath(libDir, libFiles.find(libFile => {
        return matchLibName(libDir, libFile, module, prefix, suffix);
    }));
}

/**
 * check whether all libraries are installed
 */
const checkCvAlreadyCompiled = async () => {
    if (!fs.existsSync(opencvLibDir)) {
        return false;
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
        return false;
    }

    try {
        const libFiles = fs.readdirSync(ncclLibDir);
        const prefix = getNcclLibPrefix();
        const suffix = getNcclLibSuffix();
        return ncclModules.every(module => undefined != resolveLibPath(ncclLibDir, libFiles, module, prefix, suffix));
    }
    catch (err) {
        throw err;
    }
}

/**
 * check protobuf already compiled
 */
const checkProtobufAlreadyCompiled = async () => {
    if (!fs.existsSync(protobufLibDir)) {
        return false;
    }
    try {
        const libFiles = fs.readdirSync(protobufLibDir);
        const prefix = getProtobufLibPrefix();
        const suffix = getProtobufLibSuffix();
        return protobufModules.every(module => undefined != resolveLibPath(protobufLibDir, libFiles, module, prefix, suffix));
    }
    catch (err) {
        throw err;
    }
}

/**
 * check caffe already compiled
 */
const checkCaffeAlreadyCompiled = async () => {
    if (!fs.existsSync(caffeLibDir)) {
        return false;
    }
    try {
        const libFiles = fs.readdirSync(caffeLibDir);
        const prefix = getCaffeLibPrefix();
        const suffix = getCaffeLibSuffix();
        return caffeModules.every(module => undefined != resolveLibPath(caffeLibDir, libFiles, module, prefix, suffix));
    }
    catch (err) {
        throw err;
    }
}

/**
 * fetching all dependent libraries
 */
const getLibs = async () => {
    let libraries = [];

    // fetching cv dependencies
    let libFiles = fs.readdirSync(opencvLibDir);
    let prefix = getCvLibPrefix();
    let suffix = getCvLibSuffix();
    opencvModules.every(module => {
        libraries.push(resolveLibPath(opencvLibDir, libFiles, module, prefix, suffix));
    });

    // fetching nccl dependecies
    libFiles = fs.readdirSync(ncclLibDir);
    prefix = getNcclLibPrefix();
    suffix = getNcclLibSuffix();
    return ncclModules.every(module => {
        libraries.push(resolveLibPath(ncclLibDir, libFiles, module, prefix, suffix));
    });

    // fetching protobuf dependencies
    libFiles = fs.readdirSync(protobufLibDir);
    prefix = getProtobufLibPrefix();
    suffix = getProtobufLibSuffix();
    return protobufModules.every(module => {
        libraries.push(resolveLibPath(protobufLibDir, libFiles, module, prefix, suffix));
    });

    // featching caffe dependencies
    libFiles = fs.readdirSync(caffeLibDir);
    prefix = getCaffeLibPrefix();
    suffix = getCaffeLibSuffix();
    caffeModules.every(module => {
        libraries.push(resolveLibPath(caffeLibDir, libFiles, module, prefix, suffix));
    });

    return libraries;
}

module.exports = {
    checkCvAlreadyCompiled,
    checkNcclAlreadyCompiled,
    checkProtobufAlreadyCompiled,
    checkCaffeAlreadyCompiled,
    getLibs
}