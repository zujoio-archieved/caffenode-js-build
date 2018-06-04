const {
    opencvSrc,
    opencvModules,
    opencvContribSrc,
    opencvContribModules,
    opencvBuild,
    opencvInclude,
    opencvLibDir,
    opencvBinDir,

    cudaInclude,
    cudaLib,
    cudaLib64,
    cudaModules,
    cuDnnModules,

    ncclSrc,
    ncclBuild,
    ncclInclude,
    ncclLibDir,
    ncclBinDir,
    ncclModules,

    protobufSrc,
    protobufBuild,
    protobufInclude,
    protobufLibDir,
    protobufBinDir,
    protobufModules,
    caffeProtoDir,

    caffeSrc,
    caffeBuild,
    caffeInclude,
    caffeLibDir,

    caffeMakeFileReplacements,
    caffeModules
} = require('./config');
const {
    isCPU,
    hasGPU
} = require('./device');
const {
    getLibs
} = require('./libs');
module.exports = {
    opencvSrc,
    opencvModules,
    opencvContribSrc,
    opencvContribModules,
    opencvBuild,
    opencvBinDir,

    cudaInclude,
    cudaLib,
    cudaLib64,
    cudaModules,
    cuDnnModules,

    ncclSrc,
    ncclBuild,
    ncclInclude,
    ncclLibDir,
    ncclBinDir,
    ncclModules,

    /*protobufSrc,
    protobufBuild,
    protobufInclude,
    protobufLibDir,
    protobufBinDir,
    protobufModules,*/


    caffeProtoDir,

    caffeSrc,
    caffeBuild,

    caffeMakeFileReplacements,
    caffeModules,

    libs: getLibs(),
    isCPU: isCPU(),


    // for new version
    // libs
    opencvLibDir,
    caffeLibDir,

    // includes
    caffeInclude,
    opencvInclude,

}

