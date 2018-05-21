const path = require('path');
const os = require('os');

const {
    isOSX
} = require('./plateform');

//////////////////// CV ///////////////////////
const rootDir = __dirname;
const opencvRoot = path.join(rootDir, 'opencv');
const opencvSrc = path.join(opencvRoot, 'opencv');
const opencvModules = [
    'core',
    'highgui',
    'imgcodecs',
    'imgproc',
    'features2d',
    'calib3d',
    'photo',
    'objdetect',
    'ml',
    'video',
    'videoio',
    'videostab',
    'dnn',
    'face',
    'text',
    'tracking',
    'xfeatures2d',
    'ximgproc'
]
const opencvContribSrc = path.join(opencvRoot, 'opencv_contrib');
const opencvContribModules = path.join(opencvContribSrc, 'modules');
const opencvBuild = path.join(opencvRoot, 'build');
const opencvInclude = path.join(opencvBuild, 'include');
const opencvLibDir = path.join(opencvBuild, 'lib');
const opencvBinDir = path.join(opencvBuild, 'bin');
const opencvTag = '3.4.1';
const opencvRepo = 'https://github.com/opencv/opencv.git';
const opencvContribRepo = 'https://github.com/opencv/opencv_contrib.git';

//////////////////// CAFFE ///////////////////////
const caffeRoot = path.join(rootDir, 'caffe');
const caffeSrc = path.join(caffeRoot, 'src/caffe');
const caffeBuild = path.join(caffeRoot, 'build');
const caffeInclude = path.join(caffeRoot, 'include/caffe');
const caffeLibDir = path.join(caffeBuild, 'lib');
const caffeDependeciesLinux = [
    'libsnappy-dev',
    'libatlas-base-dev',
    'libboost-all-dev',
    'libgflags-dev',
    'libprotobuf-dev',
    'protobuf-compiler',
    'libgoogle-glog-dev',
    'libhdf5-serial-dev',
    'libleveldb-dev',
    'liblmdb-dev',
    'libatlas-base-dev',
    'libboost-all-dev',
    'git',
    'cmake',
    'tar'
];
const caffeDependeciesDarvin = [
    'snappy',
    'gflags',
    'szip',
    'libtool',
    'protobuf',
    'glog',
    'hdf5',
    'openblas',
    'boost',
    'webp' // opencv 3 dependecy
];

//////////////////// CUDA ///////////////////////
const cudaInclude = isOSX() ? '/Library/Frameworks/CUDA' : '/usr/local/cuda';
const cuDnnInclude = `${cudaInclude}/include`;

//////////////////// NCCL ///////////////////////
const ncclRoot = path.join(rootDir, 'nccl')
const ncclSrc = path.join(ncclRoot, 'nccl')
const ncclBuild = path.join(ncclRoot, 'build');
const ncclInclude = path.join(ncclBuild, 'include');
const ncclLibDir = path.join(ncclBuild, 'lib');
const ncclBinDir = path.join(ncclBuild, 'bin');
const ncclRepo = 'https://github.com/NVIDIA/nccl.git';

//////////////////// PROTOBUF ///////////////////////
const protobufRoot = path.join(rootDir, 'protobuf');
const protobufSrc = path.join(protobufRoot, 'protobuf');
const protobufBuild = path.join(protobufRoot, 'build');
const protobufInclude = path.join(protobufBuild, 'include');
const protobufLibDir = path.join(protobufBuild, 'lib');
const protobufBinDir = path.join(protobufBuild, 'bin');
const protobufTarPath = 'https://github.com/google/protobuf/releases/download/v2.5.0/protobuf-2.5.0.tar.gz';
const protobufTarName =  protobufTarPath.split('/').pop();
module.exports = {
    rootDir,
    /**
     * OPENCV CONFIG
     */
    opencvRoot,
    opencvSrc,
    opencvModules,
    /**
     * OPENCV CONTRIB CONFIG
     */
    opencvContribSrc,
    opencvContribModules,
    /**
     * OPENCV BUILD
     */
    opencvBuild,
    opencvInclude,
    opencvLibDir,
    opencvBinDir,
    /**
     * OPENCV REPO
     */
    opencvTag,
    opencvRepo,
    opencvContribRepo,
    /**
     * CUDA + CUDNN CONFIG
     */
    cudaInclude,
    cuDnnInclude,
    /**
     * NCCL CONFIG
     */
    ncclRoot,
    ncclSrc,
    ncclBuild,
    ncclInclude,
    ncclLibDir,
    ncclBinDir,
    ncclRepo,
    /**
     * PROTOBUF CONFIG
     */
    protobufRoot,
    protobufSrc,
    protobufBuild,
    protobufInclude,
    protobufLibDir,
    protobufBinDir,
    protobufTarPath,
    protobufTarName,
    /**
     * CAFFE CONFIG
     */
    caffeRoot,
    caffeSrc,
    /**
     * CAFFE BUILD
     */
    caffeBuild,
    caffeInclude,
    caffeLibDir,
    /**
     * CAFFE DEPENDENCIES
     */
    caffeDependeciesLinux,
    caffeDependeciesDarvin,
    /**
     * OTHERS
     */
    numberOfCores: os.cpus().length,
}