const path = require('path');
const os = require('os');

const {
    isOSX,
} = require('./plateform');
const {
    isCPU,
    hasGPU
} = require('./device');

//////////////////// COMMON /////////////////////
const commonModules = [
    'pthread',
    'pthread',
    'boost_system',
    'glog',
    'boost_filesystem'
]

//////////////////// CUDA ///////////////////////
const cudaPath = '/usr/local/cuda';
const cudaInclude = `${cudaPath}/include`;
const cudaLib = `${cudaPath}/lib`;
const cudaLib64 = `${cudaPath}/lib64`;
const cudaModules = [
    'accinj64',
    'cublas',
    'cudart',
    'cufft',
    'cufftw',
    'cuinj64',
    'curand',
    'cusolver',
    'cusparse',
    'nppc',
    'nppial',
    'nppicc',
    'nppicom',
    'nppidei',
    'nppif',
    'nppig',
    'nppim',
    'nppist',
    'nppisu',
    'nppitc',
    'npps',
    'nvblas',
    'nvgraph',
    'nvrtc',
    'nvrtc-builtins',
    'nvToolsExt',
    'OpenCL'
]
const cuDnnModules = [
    'cudnn'
]

//////////////////// CV ///////////////////////
const rootDir = __dirname;
const opencvRoot = path.join(rootDir, 'opencv');
const opencvSrc = path.join(opencvRoot, 'opencv');
const opencvModules = [
    'opencv_core',
    'opencv_highgui',
    'opencv_imgcodecs',
    'opencv_imgproc',
    'opencv_features2d',
    'opencv_calib3d',
    'photo',
    'opencv_objdetect',
    'opencv_ml',
    'opencv_video',
    'opencv_videoio',
    'opencv_videostab',
    'opencv_dnn',
    'opencv_face',
    'opencv_text',
    'opencv_tracking',
    'opencv_xfeatures2d',
    'opencv_ximgproc'
]
const opencvContribSrc = path.join(opencvRoot, 'opencv_contrib');
const opencvContribModules = path.join(opencvContribSrc, 'modules');
const opencvBuild = path.join(opencvRoot, 'build');
const opencvInclude = path.join(opencvBuild, 'include');
const opencvSrcInclude = path.join(opencvBuild, 'src');
const opencvLibDir = path.join(opencvBuild, 'lib');
const opencvBinDir = path.join(opencvBuild, 'bin');
const opencvTag = '3.4.1';
const opencvRepo = 'https://github.com/opencv/opencv.git';
const opencvContribRepo = 'https://github.com/opencv/opencv_contrib.git';

//////////////////// CAFFE ///////////////////////
const caffeRoot = path.join(rootDir, 'caffe');
const caffeSrc = path.join(caffeRoot, 'caffe');
const caffeBuild = path.join(caffeSrc, 'build');
const caffeInclude = path.join(caffeSrc, 'include');
const caffeLibDir = path.join(caffeBuild, 'lib');
const caffeProtoDir = path.join(caffeSrc, '/src/caffe/proto/')
const caffeRepo = 'https://github.com/BVLC/caffe.git';
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
let caffeMakeFileReplacements = [
    // CUSTOM_CXX
    {
        original: '# CUSTOM_CXX := g++',
        replace: 'CUSTOM_CXX := /usr/bin/g++',
        isCpu: true
    },
    // USE_CUDNN
    {
        original: '# USE_CUDNN := 1',
        replace: ' USE_CUDNN := 1',
        isCpu: false
    },
    // todo-check version of cuda before replacement
    // -gencode arch=compute_20,code=sm_20 \
    {
        original: '-gencode arch=compute_20,code=sm_20 \\',
        replace: '\\',
        isCpu: false
    },
    // -gencode arch=compute_20,code=sm_21 \
    {
        original: '-gencode arch=compute_20,code=sm_21 \\',
        replace: '\\',
        isCpu: false
    },
    // INCLUDE_DIRS := $(PYTHON_INCLUDE) /usr/local/include
    {
        original: 'INCLUDE_DIRS := $(PYTHON_INCLUDE) /usr/local/include',
        replace: `INCLUDE_DIRS := $(PYTHON_INCLUDE) /usr/local/include /usr/include/hdf5/serial/ ${opencvInclude} ${isCPU() ? '' : cudaInclude}`,
        isCpu: true
    },
    // LIBRARY_DIRS := $(PYTHON_LIB) /usr/local/lib /usr/lib
    {
        original: 'LIBRARY_DIRS := $(PYTHON_LIB) /usr/local/lib /usr/lib',
        replace: `LIBRARY_DIRS := $(PYTHON_LIB) /usr/local/lib /usr/lib ${!isOSX() ? '/usr/lib/x86_64-linux-gnu /usr/lib/x86_64-linux-gnu/hdf5/serial/' : ''} ${opencvLibDir} ${isCPU() ? '' : cudaLib} ${isCPU() ? '' : cudaLib64}`,
        isCpu: true
    },
    // BLAS := atlas
    {
        original: 'BLAS := atlas',
        replace: 'BLAS := open',
        isCpu: true
    },
    // # OPENCV_VERSION := 3
    {
        original: '# OPENCV_VERSION := 3',
        replace: ' OPENCV_VERSION := 3',
        isCpu: true
    },
    // # CPU_ONLY := 1
    {
        original: '# CPU_ONLY := 1',
        replace: `${ isCPU() ? 'CPU_ONLY := 1' : 'CPU_ONLY := 0' }`,
        isCpu: true
    }
]
if(isOSX()){
    // BLAS_INCLUDE
    caffeMakeFileReplacements.push({
        original: "# BLAS_INCLUDE := $(shell brew --prefix openblas)/include",
        replace: "BLAS_INCLUDE := $(shell brew --prefix openblas)/include",
        isCpu: true
    })
    // BLAS_LIB
    caffeMakeFileReplacements.push({
        original: "# BLAS_LIB := $(shell brew --prefix openblas)/lib",
        replace: "BLAS_LIB := $(shell brew --prefix openblas)/lib",
        isCpu: true
    })
}
else{
    // USE_OPENCV, issue while linking libs for high sierra
    caffeMakeFileReplacements.push({
        original: '# USE_OPENCV := 0',
        replace: ' USE_OPENCV := 1',
        isCpu: true
    })
}

const caffeModules = [
    'caffe'
]


//////////////////// NCCL ///////////////////////
const ncclRoot = path.join(rootDir, 'nccl')
const ncclSrc = path.join(ncclRoot, 'nccl')
const ncclBuild = path.join(ncclRoot, 'build');
const ncclInclude = path.join(ncclBuild, 'include');
const ncclLibDir = path.join(ncclBuild, 'lib');
const ncclBinDir = path.join(ncclBuild, 'bin');
const ncclRepo = 'https://github.com/NVIDIA/nccl.git';
const ncclModules = ['nccl'];


module.exports = {
    rootDir,
    commonModules,
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
    opencvSrcInclude,
    /**
     * OPENCV REPO
     */
    opencvTag,
    opencvRepo,
    opencvContribRepo,
    /**
     * CUDA + CUDNN CONFIG
     */
    cudaPath,
    cudaInclude,
    cudaLib,
    cudaLib64,
    cudaModules,
    cuDnnModules,
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
    ncclModules,
    /**
     * PROTOBUF CONFIG
     */
    caffeProtoDir,
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
    caffeRepo,
    caffeDependeciesLinux,
    caffeDependeciesDarvin,
    caffeMakeFileReplacements,
    caffeModules,
    /**
     * OTHERS
     */
    numberOfCores: os.cpus().length,
}