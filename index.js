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
    cuDnnInclude,

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
    isCPU
} = require('./util');
const {
    getLibs
} = require('./libs');
module.exports = {
    opencvSrc,
    opencvModules,
    opencvContribSrc,
    opencvContribModules,
    opencvBuild,
    opencvInclude,
    opencvLibDir,
    opencvBinDir,

    cudaInclude,
    cuDnnInclude,

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
    caffeModules,

    getLibs: getLibs(),
    isCPU: isCPU()
}

