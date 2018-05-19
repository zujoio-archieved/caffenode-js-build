const path = require('path');
const os = require('os');

const exportModules = {

    rootDir: __dirname,


    /**
     * OPENCV CONFIG
     */
    opencvRoot: path.join(this.rootDir, 'opencv'),
    opencvSrc: path.join(this.opencvRoot, 'opencv'),
    opencvModules: [
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
    ],


    /**
     * OPENCV CONTRIB CONFIG
     */
    opencvContrib: path.join(this.opencvRoot, 'opencv_contrib'),
    opencvContribModules: path.join(this.opencvContrib, 'modules'),

    /**
     * OPENCV BUILD
     */
    opencvBuild: path.join(this.opencvRoot, 'build'),
    opencvInclude: path.join(this.opencvBuild, 'include'),
    opencvLibDir: path.join(this.opencvBuild, 'lib'),
    opencvBinDir: path.join(this.opencvBuild, 'bin'),

    /**
     * OPENCV REPO
     */
    opencvTag: '3.4.1',
    opencvRepo: 'https://github.com/opencv/opencv.git',
    opencvContribRepo: 'https://github.com/opencv/opencv_contrib.git',


    /**
     * CAFFE CONFIG
     */
    caffeRoot: path.join(this.rootDir, 'caffe'),
    caffeSrc: path.join(this.caffeRoot, 'src/caffe'),


    /**
     * CAFFE BUILD
     */
    caffeBuild: path.join(this.caffeRoot, 'build'),
    caffeInclude: path.join(this.caffeRoot, 'include/caffe'),
    caffeLibDir: path.join(this.caffeBuild, 'lib'),


    /**
     * OTHERS
     */
    numberOfCores: os.cpus().length,
}