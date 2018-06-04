const path = require('path');
const fs = require('fs');
const log = require('npmlog');

const {
    commonModules,

    cudaLib,
    cudaModules,
    cuDnnModules,

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
const {
    isCPU,
    hasGPU
} = require('./device');


/**
 * get prefix for NCCL
 */
const getLibPrefix = () => {
    return 'lib';
}

/**
 * get suffix for NCCL
 */
const getLibSuffix = () => {
    return (isOSX() ? 'dylib' : 'so');
}

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
    let libPath = libFile ? path.resolve(libDir, libFile) : path.resolve(libDir);
    return fs.realpathSync(libPath);
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
 * fetching all dependent libraries
 */
const getLibs = () => {
    let libraries = commonModules;
    libraries = libraries.concat(opencvModules);

    // include NCCL and CUDA dependencies
    if (!isCPU()) {
        libraries = libraries.concat(ncclModules);
        libraries = libraries.concat(cuDnnModules);
    }

    // include caffe dependencies
    libraries = libraries.concat(caffeModules);

    // include as flags
    libraries.map(lib =>  `-l${lib}`);

    return libraries;
}


module.exports = {
    getLibs
}