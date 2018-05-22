const log = require('npmlog');
const {
    exec,
    spawn
} = require('./native');
/**
 * FIND PLATEFORM
 */
const isWindows_ = () => {
    return process.platform == 'win32';
}
const isOSX_ = () => {
    return process.platform == 'darwin';
}
const isUnix_ = () => {
    return !(isWindows_()) && !(isOSX_());
}

/**
 * install native packge in OSX
 * @param {string} name : name of package
 * @param {string} link : link installed package
 */
const installPackageOSX_ = async (name, link = undefined) => {
    const packageMeta = await exec(`brew ls --versions ${name} | grep ${name} || true`);
    log.silly('install', `checking for ${name}`);
    // install package
    if (packageMeta == "" || packageMeta == undefined) {
        log.silly('install', `not ${name} found; setting it up.`);
        await exec('set -x');
        const stdout = await exec(`brew install -vd ${name}`)
        return stdout;
    }
    else {
        log.silly('install', `${name} already installed.`);
    }
    // link package
    if (link) {
        await exec(`brew link --force --overwrite ${link}`);
    }
    return packageMeta;
}

/**
 * install package in Linux
 * @param {string} name : name of package
 * @param {string} link : link installed package
 */
const installPackageLinux_ = async (name, link = undefined) => {
    const packageMeta = await exec(`dpkg -s ${name} | grep installed || true`);
    log.silly('install', `checking for ${name}`);
    // install package 
    if (packageMeta == "" || packageMeta == undefined) {
        log.silly('install', `not ${name} found; setting it up.`);
        await exec('set -x');
        const stdout = await exec(`sudo apt-get --force-yes --yes install ${name}`);
    }
    else {
        log.silly('install', `${name} already installed.`);
    }
    // link package
    if (link) {
        await exec(`ln -s ${name} ${link}`);
    }
    return packageMeta;
}

/**
 * install native package 
 * @param {string} name : name of package
 * @param {string} link : link installed package
 */
const installPackage_ = async (name, link = undefined) => {
    return isOSX_() ? installPackageOSX_(name, link) : installPackageLinux_(name, link);
}

module.exports = {
    isWindows: isWindows_,
    isOSX: isOSX_,
    isUnix: isUnix_,

    installPackage: installPackage_
}