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

describe('opencv import libs and deps', () => {
    it('should check opencvSrc is not undefined.', () => {
        resolvePath(nodeCaffeBuild.opencvSrc);
    });
    it('should check opencvModules is not undefined and is array.', () => {
        checkArrayHaveEle(nodeCaffeBuild.opencvModules);
    });
    it('should check opencvContribSrc is not undefined.', () => {
        resolvePath(nodeCaffeBuild.opencvContribSrc);
    });
    it('should check opencvContribModules is not undefined.', () => {
        resolvePath(nodeCaffeBuild.opencvContribModules);
    });
    it('should check opencvBuild is not undefined.', () => {
        resolvePath(nodeCaffeBuild.opencvBuild);
    });
    it('should check opencvInclude is not undefined.', () => {
        resolvePath(nodeCaffeBuild.opencvInclude);
    });
    it('should check opencvLibDir is not undefined.', () => {
        resolvePath(nodeCaffeBuild.opencvLibDir);
    });
    it('should check opencvBinDir is not undefined.', () => {
        resolvePath(nodeCaffeBuild.opencvBinDir);
    });
});

if (!nodeCaffeBuild.isCPU) {
    describe('GPU MODE: cuda import libs and deps', () => {
        it('should check cudaInclude is not undefined', () => {
            resolvePath(nodeCaffeBuild.cudaInclude);
        })
        it('should check cudaLib is not undefined', () => {
            resolvePath(nodeCaffeBuild.cudaLib);
        })
        it('should check cudaLib64 is not undefined', () => {
            resolvePath(nodeCaffeBuild.cudaLib64);
        })
        it('should check cudaModules is not undefined and is array.', () => {
            checkArrayHaveEle(nodeCaffeBuild.cudaModules);
        });
        it('should check cudaModules is not undefined and is array.', () => {
            checkArrayHaveEle(nodeCaffeBuild.cudaModules);
        });
        it('should check cuDnnModules is not undefined and is array.', () => {
            checkArrayHaveEle(nodeCaffeBuild.cuDnnModules);
        });
    })

    describe('GPU MODE: nccl import libs and deps', () => {
        it('should check ncclSrc is not undefined', () => {
            resolvePath(nodeCaffeBuild.ncclSrc);
        })
        it('should check ncclBuild is not undefined', () => {
            resolvePath(nodeCaffeBuild.ncclBuild);
        })
        it('should check ncclInclude is not undefined', () => {
            resolvePath(nodeCaffeBuild.ncclInclude);
        })
        it('should check ncclLibDir is not undefined', () => {
            resolvePath(nodeCaffeBuild.ncclLibDir);
        })
        it('should check ncclBinDir is not undefined', () => {
            resolvePath(nodeCaffeBuild.ncclBinDir);
        })
        it('should check ncclModules is not undefined', () => {
            resolvePath(nodeCaffeBuild.ncclModules);
        })
    })
}

/*describe('protobuf import libs and deps', () => {
    it('should check protobufSrc is not undefined.', () => {
        resolvePath(nodeCaffeBuild.protobufSrc);
    });
    it('should check protobufBuild is not undefined.', () => {
        resolvePath(nodeCaffeBuild.protobufBuild);
    });
    it('should check protobufInclude is not undefined.', () => {
        resolvePath(nodeCaffeBuild.protobufInclude);
    });
    it('should check protobufBinDir is not undefined.', () => {
        resolvePath(nodeCaffeBuild.protobufBinDir);
    });
    it('should check protobufModules is not undefined and is array.', () => {
        checkArrayHaveEle(nodeCaffeBuild.protobufModules);
    });
    it('should check caffeProtoDir is not undefined.', () => {
        resolvePath(nodeCaffeBuild.caffeProtoDir);
    });
});*/

describe('caffe import libs and deps', () => {
    it('should check caffeSrc is not undefined.', () => {
        resolvePath(nodeCaffeBuild.caffeSrc);
    });
    it('should check caffeBuild is not undefined.', () => {
        resolvePath(nodeCaffeBuild.caffeBuild);
    });
    it('should check caffeInclude is not undefined.', () => {
        resolvePath(nodeCaffeBuild.caffeInclude);
    });
    it('should check caffeLibDir is not undefined.', () => {
        resolvePath(nodeCaffeBuild.caffeLibDir);
    });
    it('should check caffeMakeFileReplacements is not undefined and is array.', () => {
        checkArrayHaveEle(nodeCaffeBuild.caffeMakeFileReplacements);
    });
    it('should check caffeModules is not undefined and is array.', () => {
        checkArrayHaveEle(nodeCaffeBuild.caffeModules);
    });
});

describe('fetch all libs and validate paths', () => {
    it('should check get libs available', () => {
        checkArrayHaveEle(nodeCaffeBuild.libs);
        nodeCaffeBuild.libs.forEach(lib => {
            expect(lib).to.have.property('prefix');
            expect(lib).to.have.property('suffix');
            expect(lib).to.have.property('module');
            expect(lib).to.have.property('path');
            resolvePath(lib.path);
        });
    })
})