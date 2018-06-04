const packageJson = require('./package.json')
const {
    exec,
} = require('./native');
/**
 * check whether system have GPU installed
 */
const hasGPU_ = async () => {
    const stdout = await exec('which nvidia-smi');
    log.silly('install', stdout);
    return (stdout != undefined ? false : true);
}
/**
 * check whether user have defined to build on basis of GPU
 * default: CPU MODE
 */
const isCPU_ = () => {
    if(packageJson && packageJson.name && packageJson.name == 'caffenode-js-build'){
        return 1
    }
    else{
        return 0;
    }
}

module.exports = {
    isCPU: isCPU_,
    hasGPU: hasGPU_
}