const { Association } = require('./../src/Association');
const { Request } = require('../src/Command');
const { CommandFieldType, SopClass, TransferSyntax, PresentationContextResult, Priority } = require('./../src/Constants');

const chai = require('chai');
const expect = chai.expect;

describe('Association', () => {
  it('should correctly construct an association', () => {
    const callingAet = 'CALLINGAET';
    const calledAet = 'CALLEDAET';

    const association = new Association(callingAet, calledAet);

    expect(association.getCallingAeTitle()).to.be.eq(callingAet);
    expect(association.getCalledAeTitle()).to.be.eq(calledAet);
  });

  it('should correctly add presentation contexts', () => {
    const callingAet = 'CALLINGAET';
    const calledAet = 'CALLEDAET';

    const association = new Association(callingAet, calledAet);
    const pcId = association.addPresentationContext('1.2.3.4.5.6.7.8.9');
    association.addTransferSyntaxToPresentationContext(pcId, '9.8.7.6.5.4.3.2.1');
    const context = association.getPresentationContext(pcId);

    expect(context.getAbstractSyntaxUid()).to.be.eq('1.2.3.4.5.6.7.8.9');
    expect(context.getAcceptedTransferSyntaxUid()).to.be.eq('9.8.7.6.5.4.3.2.1');
  });

  it('should correctly set presentation context results', () => {
    const callingAet = 'CALLINGAET';
    const calledAet = 'CALLEDAET';

    const association = new Association(callingAet, calledAet);
    const pcId = association.addPresentationContext('1.2.3.4.5.6.7.8.9');
    association.addTransferSyntaxToPresentationContext(pcId, '9.8.7.6.5.4.3.2.1');
    const context = association.getPresentationContext(pcId);
    context.setResult(1, '9.8.7.6.5.4.3.2.1');

    expect(context.getAbstractSyntaxUid()).to.be.eq('1.2.3.4.5.6.7.8.9');
    expect(context.getAcceptedTransferSyntaxUid()).to.be.eq('9.8.7.6.5.4.3.2.1');
    expect(context.getResult()).to.be.eq(1);
  });

  it('should throw for unknown presentation contexts', () => {
    const callingAet = 'CALLINGAET';
    const calledAet = 'CALLEDAET';

    const association = new Association(callingAet, calledAet);
    const pcId = association.addPresentationContext('1.2.3.4.5.6.7.8.9', 1);
    association.addTransferSyntaxToPresentationContext(pcId, '9.8.7.6.5.4.3.2.1');

    expect(() => {
      association.getPresentationContext(3);
    }).to.throw();
  });

  it('should correctly add a presentation context from a request', () => {
    const callingAet = 'CALLINGAET';
    const calledAet = 'CALLEDAET';

    const association = new Association(callingAet, calledAet);
    const request = new Request(1, SopClass.Verification, 1, false);
    const pcId = association.addPresentationContextFromRequest(request);
    const context = association.getPresentationContext(pcId);

    expect(context.getAbstractSyntaxUid()).to.be.eq(SopClass.Verification);
    expect(context.getAcceptedTransferSyntaxUid()).to.be.eq(TransferSyntax.ImplicitVRLittleEndian);
  });

  it('should correctly get the accepted presentation context for a request', () => {
    const callingAet = 'CALLINGAET';
    const calledAet = 'CALLEDAET';

    const association = new Association(callingAet, calledAet);
    const request = new Request(CommandFieldType.CEchoRequest, SopClass.Verification, Priority.High, false);
    let pcId = association.addPresentationContextFromRequest(request);
    const context = association.getPresentationContext(pcId);
    context.setResult(PresentationContextResult.Accept, TransferSyntax.ExplicitVRLittleEndian);

    expect(context.getAbstractSyntaxUid()).to.be.eq(SopClass.Verification);
    expect(context.getAcceptedTransferSyntaxUid()).to.be.eq(TransferSyntax.ExplicitVRLittleEndian);
  });
});
