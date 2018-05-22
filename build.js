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

    protobufRoot,
    protobufSrc,
    protobufBuild,
    protobufTarPath,
    protobufTarName,

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
    checkCvAlreadyCompiled,
    checkNcclAlreadyCompiled,
    checkProtobufAlreadyCompiled,
    checkCaffeAlreadyCompiled
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
    //await spawn('make', ['test', `-j${numberOfCores}`], { cwd: ncclSrc });
    await spawn('make', [getNcclCmakeArgs(), 'install', `-j${numberOfCores}`], { cwd: ncclSrc });
}

/**
 * build protobuf
 */
const buildProtobuf = async () => {
    log.silly('install', 'installing protobuf');

    if (await checkProtobufAlreadyCompiled()) {
        log.silly('install', 'protobuf already installed.');
        return;
    }

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
    await spawn('sudo', ['make', getProtobufCmakeArgs(), 'install', `-j${numberOfCores}`], { cwd: protobufSrc });
    await spawn('sudo', ['ldconfig'], { cwd: protobufSrc });
    return;
}


/**
 * edit makefile anfd change it's content
 */
const modifyCaffeMakeFile = async () => {
    const makeFileConfigPath = `${caffeSrc}/Makefile.config`;

    try {
        let makeFile = fs.readFileSync(makeFileConfigPath, 'utf8');
        caffeMakeFileReplacements.forEach(caffeMakeFileReplacement => {
            makeFile = makeFile.replace(`${caffeMakeFileReplacement.original}`, `${caffeMakeFileReplacement.replace}`);
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
const buildCaffe = async (isCpuEnable = true) => {
    log.silly('install', 'installing caffe');
    if (await checkCaffeAlreadyCompiled()) {
        log.silly('install', 'caffe already installed');
        return;
    }

    /**
     * create dir caffe
     */
    if (!fs.existsSync(caffeRoot)) {
        await exec(getMakeDirCommand('caffe'), { cwd: rootDir });
    }

    /**
     * clone caffe 
     */
    if (!fs.existsSync(caffeSrc)) {
        await exec(getRmDirCommand('caffe'), { cwd: caffeRoot });
        await spawn('git', ['clone', '--progress', caffeRepo], { cwd: caffeRoot });
    }

    // copy config makefile
    await spawn('cp', ['Makefile.config.example', 'Makefile.config'], { cwd: caffeSrc });

    // set necessary flags
    await modifyCaffeMakeFile();

    // compile caffe
    await spawn('make', ['clean'], { cwd: caffeSrc });
    await spawn('make', ['all', `-j${numberOfCores}`], { cwd: caffeSrc });

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

    // build caffe
    await buildCaffe();

    return;
}

module.exports = {
    build: build_
}