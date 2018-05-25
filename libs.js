const path = require('path');
const fs = require('fs');
const log = require('npmlog');

const {
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
 * check all CUDA libs available
 */
const checkCudaCompiled = async () => {
    if (!fs.existsSync(cudaLib)) {
        return false;
    }
    try {
        const libFiles = fs.readdirSync(cudaLib);
        const prefix = getLibPrefix();
        const suffix = getLibPrefix();
        return cudaModules.every(module => undefined != resolveLibPath(cudaLib, libFiles, module, prefix, suffix));
    }
    catch (err) {
        throw err;
    }
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
        const prefix = getLibPrefix();
        const suffix = getLibPrefix();
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
        const prefix = getLibPrefix();
        const suffix = getLibPrefix();
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
        const prefix = getLibPrefix();
        const suffix = getLibPrefix();
        return caffeModules.every(module => {
            const ic = resolveLibPath(caffeLibDir, libFiles, module, prefix, suffix);
            return undefined != resolveLibPath(caffeLibDir, libFiles, module, prefix, suffix)
        });
    }
    catch (err) {
        throw err;
    }
}

/**
 * fetching all dependent libraries
 */
const getLibs = () => {
    let libraries = [];

    // fetching cv dependencies
    if (fs.existsSync(opencvLibDir)) {

        let libFiles = fs.readdirSync(opencvLibDir);
        let prefix = getCvLibPrefix();
        let suffix = getCvLibSuffix();
        opencvModules.forEach(module => {
            libraries.push({
                prefix: prefix,
                suffix: suffix,
                module: module,
                path: resolveLibPath(opencvLibDir, libFiles, module, prefix, suffix)
            });
        });
    }

    if (!isCPU()) {
        if (fs.existsSync(ncclLibDir)) {
            // fetching nccl dependecies
            libFiles = fs.readdirSync(ncclLibDir);
            prefix = getLibPrefix();
            suffix = getLibPrefix();
            ncclModules.forEach(module => {
                libraries.push({
                    prefix: prefix,
                    suffix: suffix,
                    module: module,
                    path: resolveLibPath(ncclLibDir, libFiles, module, prefix, suffix)
                });
            });
        }

        if (fs.existsSync(cudaLib)) {
            // fetching cuda libs
            const libFiles = fs.readdirSync(cudaLib);
            const prefix = getLibPrefix();
            const suffix = getLibPrefix();
            cudaModules.forEach(module => {
                libraries.push({
                    prefix: prefix,
                    suffix: suffix,
                    module: module,
                    path: resolveLibPath(cudaLib, libFiles, module, prefix, suffix)
                });
            });
            cuDnnModules.forEach(module => {
                libraries.push({
                    prefix: prefix,
                    suffix: suffix,
                    module: module,
                    path: resolveLibPath(cudaLib, libFiles, module, prefix, suffix)
                });
            });
        }

    }


    // fetching protobuf dependencies
    /*libFiles = fs.readdirSync(protobufLibDir);
    prefix = getProtobufLibPrefix();
    suffix = getProtobufLibSuffix();
    protobufModules.forEach(module => {
        libraries.push({
            module: module,
            path: resolveLibPath(protobufLibDir, libFiles, module, prefix, suffix)
        });
    });*/

    if (fs.existsSync(caffeLibDir)) {
        // featching caffe dependencies
        libFiles = fs.readdirSync(caffeLibDir);
        prefix = getLibPrefix();
        suffix = getLibPrefix();
        caffeModules.forEach(module => {
            libraries.push({
                prefix: prefix,
                suffix: suffix,
                module: module,
                path: resolveLibPath(caffeLibDir, libFiles, module, prefix, suffix)
            });
        });
    }

    return libraries;
}

module.exports = {
    checkCudaCompiled,
    checkCvAlreadyCompiled,
    checkNcclAlreadyCompiled,
    checkProtobufAlreadyCompiled,
    checkCaffeAlreadyCompiled,
    getLibs
}