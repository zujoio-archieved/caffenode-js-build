const {
    opencvBuild,
    opencvInclude,
    opencvLibDir,
    opencvSrcInclude,

    cudaInclude,
    cudaLib,
    cudaLib64,

    caffeBuild,
    caffeProtoDir,
    caffeSrc,
    caffeInclude,
    caffeLibDir
} = require('./config');
const {
    isCPU,
    hasGPU
} = require('./device');
const {
    getLibs
} = require('./libs');
module.exports = {

    // build
    caffeBuild,
    opencvBuild,

    // includes
    caffeInclude,
    caffeProtoDir,
    opencvInclude,
    opencvSrcInclude,
    cudaInclude,

    // libs
    opencvLibDir,
    caffeLibDir,
    cudaLib,
    cudaLib64,

    // fetching required libs
    libs: getLibs(),

    // GPU / CPU
    isCPU: isCPU()
}

