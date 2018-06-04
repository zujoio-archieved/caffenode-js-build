const {
    opencvBuild,
    opencvContribModules,
    opencvSrc,
    opencvLibDir,
    opencvModules,

    cudaInclude,
    cudaPath,

    protobufBuild,

    caffeDependeciesLinux,
    caffeDependeciesDarvin,

    caffeBuild,

    ncclSrc,
    ncclBuild

} = require('./config');
const log = require('npmlog');
const {
    exec,
    spawn,
} = require('./native');
const {
    isOSX,
    installPackage
} = require('./plateform');
const {
    isCPU,
    hasGPU
} = require('./device');
/**
 * VALIDATE MAKE AND GIT
 */
/**
 * check git installed
 */
const requireGit_ = async () => {
    const stdout = await exec('git --version');
    log.silly('install', stdout);
    return stdout;
}
/**
 * check make installed
 */
const requireCmake_ = async () => {
    const stdout = await exec('cmake --version');
    log.silly('install', stdout);
    return stdout;
}
/**
 * get command for making directory
 * @param {string} dirName 
 */
const getMakeDirCommand_ = (dirName) => {
    return `mkdir -p ${dirName}`;
}
/**
 * get command for remove directory
 * @param {string} dirName 
 */
const getRmDirCommand_ = (dirName) => {
    return `rm -rf ${dirName}`;
}
/**
 * getting shared flags for opencv
 */
const getCvSharedCmakeFlags_ = () => {
    return [
        `-DCMAKE_INSTALL_PREFIX=${opencvBuild}`,
        '-DCMAKE_BUILD_TYPE=Release',
        `-DOPENCV_EXTRA_MODULES_PATH=${opencvContribModules}`,

        // GPU / CPU
        `-DBUILD_opencv_gpu=${!isCPU() ? 'ON' : 'OFF'}`,
        `-DWITH_CUDA=${!isCPU() ? 'ON' : 'OFF'}`,

        '-DBUILD_EXAMPLES=OFF',
        '-DBUILD_DOCS=OFF',
        '-DBUILD_TESTS=OFF',
        '-DBUILD_PERF_TESTS=OFF',
        '-DBUILD_JAVA=OFF',
        '-DCUDA_NVCC_FLAGS=--expt-relaxed-constexpr',
        '-DBUILD_opencv_apps=OFF',
        '-DBUILD_opencv_aruco=OFF',
        '-DBUILD_opencv_bgsegm=OFF',
        '-DBUILD_opencv_bioinspired=OFF',
        '-DBUILD_opencv_ccalib=OFF',
        '-DBUILD_opencv_datasets=OFF',
        '-DBUILD_opencv_dnn_objdetect=OFF',
        '-DBUILD_opencv_dpm=OFF',
        '-DBUILD_opencv_fuzzy=OFF',
        '-DBUILD_opencv_hfs=OFF',
        '-DBUILD_opencv_java_bindings_generator=OFF',
        '-DBUILD_opencv_js=OFF',
        '-DBUILD_opencv_img_hash=OFF',
        '-DBUILD_opencv_line_descriptor=OFF',
        '-DBUILD_opencv_optflow=OFF',
        '-DBUILD_opencv_phase_unwrapping=OFF',
        '-DBUILD_opencv_python3=OFF',
        '-DBUILD_opencv_python_bindings_generator=OFF',
        '-DBUILD_opencv_reg=OFF',
        '-DBUILD_opencv_rgbd=OFF',
        '-DBUILD_opencv_saliency=OFF',
        '-DBUILD_opencv_shape=OFF',
        '-DBUILD_opencv_stereo=OFF',
        '-DBUILD_opencv_stitching=OFF',
        '-DBUILD_opencv_structured_light=OFF',
        '-DBUILD_opencv_superres=OFF',
        '-DBUILD_opencv_surface_matching=OFF',
        '-DBUILD_opencv_ts=OFF',
        '-DBUILD_opencv_xobjdetect=OFF',
        '-DBUILD_opencv_xphoto=OFF',
        '-DWITH_VTK=OFF'
    ]
}
/**
 * getting arg of cmake
 * @param {string} cMakeFlags 
 */
const getCvCmakeArgs_ = (cMakeFlags) => {
    return [opencvSrc].concat(cMakeFlags);
}

/**
 * check whether cuda installd in system
 */
const isCudaInstalled_ = async () => {
    console.log("`cat ${cudaPath}/version.txt`", `cat ${cudaPath}/version.txt`)
    const stdout = await exec(`cat ${cudaPath}/version.txt`);
    log.silly('install', stdout);
    return (stdout == undefined ? false : true);
}
/**
 * check whether cuDnn installed in system
 */
const isCuDnnInstallted_ = async () => {
    const stdout = await exec(`cat ${cudaInclude}/cudnn.h | grep CUDNN_MAJOR -A 2`);
    log.silly('install', stdout);
    return (stdout == undefined ? false : true);
}
/**
 * install caffe and cv dependencies
 */
const installCaffeDependencies_ = async () => {
    const dependencies = isOSX() ? caffeDependeciesDarvin : caffeDependeciesLinux;
    dependencies.forEach(async dependency => {
        await installPackage(dependency);
    })
    return;
}
/**
 * getting arg of cmake for NCCL
 * @param {string} cMakeFlags 
 */
const getNcclCmakeArgs_ = (cMakeFlags) => {
    return [
        `PREFIX=${ncclBuild}`
    ];
}

/**
 * fetching LDFLAGS for caffe make
 */
const getCaffeMakeLDFLAGS_ = () => {
    return `LDFLAGS="-L${opencvLibDir} ${opencvModules.map(lib => `-l${lib}`)} "`;
}

module.exports = {
    requireGit: requireGit_,
    requireCmake: requireCmake_,

    getMakeDirCommand: getMakeDirCommand_,
    getRmDirCommand: getRmDirCommand_,

    getCvSharedCmakeFlags: getCvSharedCmakeFlags_,
    getCvCmakeArgs: getCvCmakeArgs_,

    isCudaInstalled: isCudaInstalled_,
    isCuDnnInstallted: isCuDnnInstallted_,
    installCaffeDependencies: installCaffeDependencies_,

    getNcclCmakeArgs: getNcclCmakeArgs_,
    getCaffeMakeLDFLAGS: getCaffeMakeLDFLAGS_

}