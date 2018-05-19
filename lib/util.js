const { exec, execFile, spawn } = require('child_process');
const { opencvBuild, opencvContribModules, opencvSrc } = require('config');
const log = require('npmlog');

/**
 * execute native exec
 * @param {string} cmd 
 * @param {Object} opts 
 */
const exec_ = async (cmd, opts) => {
    log.silly("install", "executing", cmd);
    return new Promise((resolve, reject) => {
        exec(cmd, opts, (err, stdout, stderr) => {
            const err_ = err || stderr;
            if (err_) return reject(err_);
            return resolve(stdout);
        })
    })
}

/**
 * execute native execFile
 * @param {string} cmd 
 * @param {Array} args 
 * @param {Object} opts 
 */
const execFile_ = async (cmd, args, opts) => {
    log.silly("install", "executing", cmd, args);
    return new Promise((resolve, reject) => {
        const child_ = execFile(cmd, args, opts, (err, stdout, stderr) => {
            const err_ = err || stderr;
            if (err_) return reject(err_);
            return resolve(stdout);
        })
        child_.stdin.end()
    })
}

/**
 * executes native span command
 * @param {string} cmd 
 * @param {Array} args 
 * @param {object} opts 
 */
const spawn_ = async (cmd, args, opts) => {
    log.silly("install", "executing", cmd, args);
    return new Promise((resolve, reject) => {
        try {
            const stdioInherit = Object.assign({}, { stdio: 'inherit' }, opts);
            const child_ = spawn(cmd, args, stdioInherit);

            child_.on('exit', (code) => {
                const message = `child process exited with code: ${code.toString()}`;
                if (code !== 0) {
                    return reject(message);
                }
                return resolve(message);
            })
        } catch (err) {
            return reject(err);
        }
    });
}

/**
 * FIND PLATEFORM
 */
const isWindows_ = async () => {
    return process.platform == 'win32';
}
const isOSX_ = async () => {
    return process.platform == 'darwin';
}
const isUnix_ = async () => {
    return !(await isWindows_()) && !(await isOSX_());
}

/**
 * VALIDATE MAKE AND GIT
 */
/**
 * check git installed
 */
const requireGit_ = () => {
    const stdout = await exec_('git --version');
    log.silly('install', stdout);
    return stdout;
}

/**
 * check make installed
 */
const requireCmake_ = () => {
    const stdout = await exec_('cmake --version');
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



module.exports = {
    exec: exec_,
    execFile: execFile_,
    spawn: spawn_,

    isWindows: isWindows_,
    isOSX: isOSX_,
    isUnix: isUnix_,

    requireGit: requireGit_,
    requireCmake: requireCmake_,

    getIfDirExistsCommand: getIfDirExistsCommand_,
    getMakeDirCommand: getMakeDirCommand_,
    getRmDirCommand: getRmDirCommand_,

    getCvSharedCmakeFlags: getCvSharedCmakeFlags_,
    getCvCmakeArgs: getCvCmakeArgs_
}