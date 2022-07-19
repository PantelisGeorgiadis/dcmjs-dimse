import Implementation from '../src/Implementation';
import Dataset from '../src/Dataset';
import { DefaultImplementation } from '../src/Constants';

import { expect as _expect } from 'chai';
import { describe, it } from 'mocha';
const expect = _expect;

describe('Implementation', () => {
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
});
