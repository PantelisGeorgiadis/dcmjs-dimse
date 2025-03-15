const { DefaultImplementation } = require('./../src/Constants');
const Implementation = require('./../src/Implementation');
const Dataset = require('./../src/Dataset');

const chai = require('chai');
const expect = chai.expect;

describe('Implementation', () => {
  beforeEach(() => {
    Implementation.setImplementationClassUid(DefaultImplementation.ImplementationClassUid);
    Implementation.setImplementationVersion(DefaultImplementation.ImplementationVersion);
    Implementation.setMaxPduLength(DefaultImplementation.MaxPduLength);
  });

  afterEach(() => {
    Implementation.setImplementationClassUid(DefaultImplementation.ImplementationClassUid);
    Implementation.setImplementationVersion(DefaultImplementation.ImplementationVersion);
    Implementation.setMaxPduLength(DefaultImplementation.MaxPduLength);
  });

  it('should correctly get the default implementation', () => {
    expect(Implementation.getImplementationClassUid()).to.be.eq(
      DefaultImplementation.ImplementationClassUid
    );
    expect(Implementation.getImplementationVersion()).to.be.eq(
      DefaultImplementation.ImplementationVersion
    );
    expect(Implementation.getMaxPduLength()).to.be.eq(DefaultImplementation.MaxPduLength);
  });

  it('should allow custom implementation', () => {
    const customUid = Dataset.generateDerivedUid();
    const customVersion = 'VERSION_X.X';
    const customMaxPdu = Math.pow(2, Math.floor(Math.random() * 8) + 1);

    Implementation.setImplementationClassUid(customUid);
    Implementation.setImplementationVersion(customVersion);
    Implementation.setMaxPduLength(customMaxPdu);

    expect(Implementation.getImplementationClassUid()).to.be.eq(customUid);
    expect(Implementation.getImplementationVersion()).to.be.eq(customVersion);
    expect(Implementation.getMaxPduLength()).to.be.eq(customMaxPdu);
  });

  it('should throw for setting an invalid implementation version', () => {
    expect(() => {
      Implementation.setImplementationVersion(123456);
    }).to.throw();
    expect(() => {
      Implementation.setImplementationVersion('12345678901234567');
    }).to.throw();
  });
});
