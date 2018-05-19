const log = require('npmlog');

const {
    exec,
    spawn,
    requireGit,
    requireCmake,

    getIfDirExistsCommand,
    getMakeDirCommand,
    getRmDirCommand,

    getCvSharedCmakeFlags,
    getCvCmakeArgs
} = require('util');
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

    numberOfCoresAvailable
} = require('config');

const build_ = async () => {
    await exec(getMakeDirCommand('opencv'), { cwd: opencvRoot });

    /**
     * clone and checkout opencv_contrib repo
     */
    await exec(getRmDirCommand('opencv_contrib'), { cwd: opencvRoot });
    await spawn('git', ['clone', '--progress', opencvContribRepo], { cwd: opencvRoot });
    await spawn('git', ['checkout', `tags/${opencvTag}`, '-b', `v${opencvTag}`], { cwd: opencvContribSrc });

    /**
     * clone and checkout opencv repo
     */
    await exec(getRmDirCommand('opencv'), { cwd: opencvRoot });
    await spawn('git', ['clone', '--progress', opencvRepo], { cwd: opencvRoot });
    await spawn('git', ['checkout', `tags/${opencvTag}`, '-b', `v${opencvTag}`], { cwd: opencvSrc });

    /**
     * compile
     */
    await spawn('cmake', getCvSharedCmakeFlags(), { cwd: opencvBuild });
    await spawn('make', ['install', `-j${numberOfCoresAvailable}`], { cwd: opencvBuild });
    await spawn('make', ['all', `-j${numberOfCoresAvailable}`], { cwd: opencvBuild });
    return;
}

module.exports = {
    build: build_
}