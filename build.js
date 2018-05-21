const log = require('npmlog');
const fs = require('fs');
const {
    exec,
    spawn,
} = require('./native');
const {
    requireGit,
    requireCmake,

    getIfDirExistsCommand,
    getMakeDirCommand,
    getRmDirCommand,

    getCvSharedCmakeFlags,
    getCvCmakeArgs,

    isCPU,

    isCudaInstalled,
    isCuDnnInstallted,
    installCaffeDependencies,

    getNcclCmakeArgs
} = require('./util');
const {
    rootDir,
    opencvRoot,
    opencvSrc,
    opencvContribSrc,

    opencvContribModules,

    opencvBuild,
    opencvTag,
    opencvRepo,
    opencvContribRepo,

    ncclRoot,
    ncclSrc,
    ncclBuild,
    ncclRepo,

    protobufRoot,
    protobufSrc,
    protobufBuild,
    protobufTarPath,
    protobufTarName,

    numberOfCores
} = require('./config');
const {
    checkCvAlreadyCompiled,
    checkNcclAlreadyCompiled
} = require('./libs');


/**
 * build opencv 
 */
const buildCv = async () => {

    log.silly('install', 'installing opencv');
    if (await checkCvAlreadyCompiled()) {
        log.silly('install', 'opencv already installed');
        return;
    }
    /**
    * create dir opencv
    */
    if (!fs.existsSync(rootDir)) {
        await exec(getMakeDirCommand('opencv'), { cwd: rootDir });
    }
    /**
     * create dir for build
     */
    if (!fs.existsSync(opencvBuild)) {
        await exec(getMakeDirCommand('build'), { cwd: opencvRoot });
    }


    /**
     * clone and checkout opencv_contrib repo
     */
    if (!fs.existsSync(opencvContribSrc)) {
        await exec(getRmDirCommand('opencv_contrib'), { cwd: opencvRoot });
        await spawn('git', ['clone', '--progress', opencvContribRepo], { cwd: opencvRoot });
        await spawn('git', ['checkout', `tags/${opencvTag}`, '-b', `v${opencvTag}`], { cwd: opencvContribSrc });
    }

    /**
     * clone and checkout opencv repo
     */
    if (!fs.existsSync(opencvSrc)) {
        await exec(getRmDirCommand('opencv'), { cwd: opencvRoot });
        await spawn('git', ['clone', '--progress', opencvRepo], { cwd: opencvRoot });
        await spawn('git', ['checkout', `tags/${opencvTag}`, '-b', `v${opencvTag}`], { cwd: opencvSrc });
    }

    /**
     * compile
     */
    await spawn('cmake', getCvCmakeArgs(getCvSharedCmakeFlags()), { cwd: opencvBuild });
    await spawn('make', ['install', `-j${numberOfCores}`], { cwd: opencvBuild });
    await spawn('make', ['all', `-j${numberOfCores}`], { cwd: opencvBuild });
}

/**
 * build NCCL if GPU enable
 */
const buildNccl = async () => {
    log.silly('install', 'installing nccl');
    if (await checkNcclAlreadyCompiled()) {
        log.silly('install', 'nccl already installed.');
        return;
    }
    /**
     * create dir opencv
     */
    if (!fs.existsSync(ncclRoot)) {
        await exec(getMakeDirCommand('nccl'), { cwd: rootDir });
    }
    /**
     * create dir for build
     */
    if (!fs.existsSync(ncclBuild)) {
        await exec(getMakeDirCommand('build'), { cwd: ncclRoot });
    }
    /**
     * clone and checkout nccl repo
     */
    if (!fs.existsSync(ncclSrc)) {
        await exec(getRmDirCommand('nccl'), { cwd: ncclRoot });
        await spawn('git', ['clone', '--progress', ncclRepo], { cwd: ncclRoot });
    }
    /**
     * compile
     */
    await spawn('make', ['test', `-j${numberOfCores}`], { cwd: ncclSrc });
    await spawn('make', [getNcclCmakeArgs(), 'install', `-j${numberOfCores}`], { cwd: ncclSrc });
}

/**
 * build protobuf
 */
const buildProtobuf = async () => {
    log.silly('install', 'installing protobuf');
    /**
     * create dir protobuf
     */
    if (!fs.existsSync(protobufRoot)) {
        await exec(getMakeDirCommand('protobuf'), { cwd: rootDir });
    }
    /**
     * create dir for build
     */
    if (!fs.existsSync(protobufBuild)) {
        await exec(getMakeDirCommand('build'), { cwd: protobufRoot });
    }
    /**
     * download protobuf, compile and install
     */
    if (!fs.existsSync(protobufSrc)) {
        await exec(getRmDirCommand('protobuf'), { cwd: protobufRoot });
        await exec(getMakeDirCommand('protobuf'), { cwd: protobufRoot });
        await spawn('wget', ['--show-progress', protobufTarPath], { cwd: protobufRoot });
        await spawn('tar', ['-xzvf', protobufTarName, '-C', 'protobuf', '--strip-components=1'], { cwd: protobufRoot });
        await exec(getRmDirCommand(`${protobufSrc}/${protobufTarName}`), { cwd: protobufSrc });
    }
    /**
     * compile
     */
    await spawn('sh', ['autogen.sh'], { cwd: protobufSrc });
    await spawn('sh', ['configure', '--prefix=/usr'], { cwd: protobufSrc });
    await spawn('make', ['clean'], { cwd: protobufSrc });
    await spawn('make', ['all', `-j${numberOfCores}`], { cwd: protobufSrc });
    await spawn('make', ['install', `-j${numberOfCores}`], { cwd: protobufSrc });
    return;
}

/**
 * build all libraries
 */
const build_ = async () => {
    const isCpuEnable = isCPU();

    if (!isCpuEnable) {
        log.info('install', 'GPU Mode, if you want to install caffe using CPU set CPU_ONLY=1');
    }
    else {
        log.info('install', 'CPU Mode, if you want to install caffe using GPU set CPU_ONLY=0');
    }

    // check cuda and cuDnn installation for GPU mode 
    if (!isCpuEnable) {
        // check whether cuda installed
        if (! await isCudaInstalled()) {
            throw new Error("CUDA not installed, either install CUDA or if you want to compile for CPU mode only. set CPU_ONLY=1.")
            return;
        }
        // check whether cuDnn installed
        if (! await isCuDnnInstallted()) {
            throw new Error("CUDA not installed, either install CUDA or if you want to compile for CPU mode only. set CPU_ONLY=1.")
            return;
        }
    }

    // install dependent libraries for 
    await installCaffeDependencies();

    // build opencv todo: compile cuda libs in GPU mode
    await buildCv();

    if (!isCpuEnable) {
        // build NCCL
        await buildNccl();
    }

    // build protobuf
    await buildProtobuf();

    return;
}

module.exports = {
    build: build_
}