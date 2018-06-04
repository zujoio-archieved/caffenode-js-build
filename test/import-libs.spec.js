const { expect } = require('chai');
const path = require('path');
const nodeCaffeBuild = require('../index');

const indexZero = 0;

/**
 * check path is not undefined as well as actually exists,
 * @param {string} dirPath 
 */
const resolvePath = (dirPath) => {
    expect(dirPath).to.not.eql(undefined);
    expect(path.resolve(dirPath)).to.not.eql(undefined);
}

/**
 * check array defined and have elements
 * @param {Array} array 
 */
const checkArrayHaveEle = (array) => {
    expect(array).to.not.eql(undefined);
    expect(array).to.be.an('array');
    expect(array[indexZero]).to.not.eql(undefined);
}

describe('check CPU / GPU mode', () => {
    it('should have either CPU / GPU mode', () => {
        expect(nodeCaffeBuild.isCPU).to.not.eql(undefined);
    })
})

describe('opencv import libs and includes', () => {
    it('should check opencvBuild is not undefined.', () => {
        resolvePath(nodeCaffeBuild.opencvBuild);
    });
    it('should check opencvInclude is not undefined.', () => {
        resolvePath(nodeCaffeBuild.opencvInclude);
    });
    it('should check opencvSrcInclude is not undefined.', () => {
        resolvePath(nodeCaffeBuild.opencvSrcInclude);
    });
});

if (!nodeCaffeBuild.isCPU) {
    describe('GPU MODE: cuda import libs and includes', () => {
        it('should check cudaInclude is not undefined', () => {
            resolvePath(nodeCaffeBuild.cudaInclude);
        })
        it('should check cudaLib is not undefined', () => {
            resolvePath(nodeCaffeBuild.cudaLib);
        })
        it('should check cudaLib64 is not undefined', () => {
            resolvePath(nodeCaffeBuild.cudaLib64);
        })
    })
}

describe('caffe import libs and deps', () => {
    it('should check caffeBuild is not undefined.', () => {
        resolvePath(nodeCaffeBuild.caffeBuild);
    });
    it('should check caffeInclude is not undefined.', () => {
        resolvePath(nodeCaffeBuild.caffeInclude);
    });
    it('should check caffeProtoDir is not undefined.', () => {
        resolvePath(nodeCaffeBuild.caffeProtoDir);
    });
    it('should check caffeLibDir is not undefined.', () => {
        resolvePath(nodeCaffeBuild.caffeLibDir);
    });
});

describe('fetch all libs and validate', () => {
    it('should check get libs available', () => {
        checkArrayHaveEle(nodeCaffeBuild.libs);
    })
})