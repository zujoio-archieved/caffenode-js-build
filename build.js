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

    isCudaInstalled,
    isCuDnnInstallted,
    installCaffeDependencies,

    getNcclCmakeArgs,
    getProtobufCmakeArgs
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

    caffeRoot,
    caffeSrc,
    caffeBuild,
    caffeInclude,
    caffeLibDir,
    caffeRepo,
    caffeMakeFileReplacements,
    caffeProtoDir,

    numberOfCores
} = require('./config');

const {
    isCPU,
    hasGPU
} = require('./device');

/**
 * build opencv 
 */
const buildCv = async () => {

    log.silly('install', 'installing opencv');
    /**
    * create dir opencv
    */
    if (!fs.existsSync(opencvRoot)) {
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
    //await spawn('make', ['test', `-j${numberOfCores}`], { cwd: ncclSrc });
    await spawn('make', [getNcclCmakeArgs(), 'install', `-j${numberOfCores}`], { cwd: ncclSrc });
}

/**
 * edit makefile anfd change it's content
 */
const modifyCaffeMakeFile = async () => {
    const isCpuEnable = isCPU();
    const makeFileConfigPath = `${caffeSrc}/Makefile.config`;

    try {
        let makeFile = fs.readFileSync(makeFileConfigPath, 'utf8');
        caffeMakeFileReplacements.forEach(caffeMakeFileReplacement => {
            const forCpuOnly = isCpuEnable && caffeMakeFileReplacement.isCpu;
            if (forCpuOnly) {
                makeFile = makeFile.replace(`${caffeMakeFileReplacement.original}`, `${caffeMakeFileReplacement.replace}`);
            }
            else if (!isCpuEnable) {
                makeFile = makeFile.replace(`${caffeMakeFileReplacement.original}`, `${caffeMakeFileReplacement.replace}`);
            }
        })
        fs.writeFileSync(makeFileConfigPath, makeFile, 'utf8');
        return;
    }
    catch (err) {
        throw err;
    }

}

/**
 * build cafee based on GPU mode
 * @param {boolean} isCpuEnable 
 */
const buildCaffe = async () => {
    const isCpuEnable = isCPU();
    log.silly('install', 'installing caffe');

    if (!fs.existsSync(caffeRoot)) {
        await exec(getMakeDirCommand('caffe'), { cwd: rootDir });
    }

    if (!fs.existsSync(caffeSrc)) {
        await exec(getRmDirCommand('caffe'), { cwd: caffeRoot });
        await spawn('git', ['clone', '--progress', caffeRepo], { cwd: caffeRoot });
    }

    // copy config makefile
    await exec(getRmDirCommand('Makefile.config'), { cwd: caffeSrc });
    await spawn('cp', ['Makefile.config.example', 'Makefile.config'], { cwd: caffeSrc });

    // set necessary flags
    await modifyCaffeMakeFile();

    // compile caffe
    //await spawn('make', ['clean'], { cwd: caffeSrc });
    await spawn('make', ['all', `-j${numberOfCores}`], { cwd: caffeSrc });
    await spawn('make', ['test', `-j${numberOfCores}`], { cwd: caffeSrc });

    // compile proto header
    await spawn('protoc', ['caffe.proto', '--cpp_out=.'], { cwd: caffeProtoDir });
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

    // NCCL required for both CV CUDA and Caffe CUDA
    if (!isCpuEnable) {
        // build NCCL
        await buildNccl();
    }

    // build opencv todo: compile cuda libs in GPU mode
    await buildCv();

    // build caffe
    await buildCaffe();

    return;
}

module.exports = {
    build: build_
}