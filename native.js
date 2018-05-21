const { exec, execFile, spawn } = require('child_process');
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



module.exports = {
    exec: exec_,
    execFile: execFile_,
    spawn: spawn_
}