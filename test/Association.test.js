const { Association } = require('./../src/Association');
const {
  CGetRequest,
  CStoreRequest,
  NCreateRequest,
  NDeleteRequest,
  Request,
} = require('./../src/Command');
const {
  CommandFieldType,
  PresentationContextResult,
  SopClass,
  StorageClass,
  TransferSyntax,
  UserIdentityType,
} = require('./../src/Constants');
const Dataset = require('./../src/Dataset');

const chai = require('chai');
const expect = chai.expect;

describe('Association', () => {
  it('should correctly construct an association', () => {
    const callingAet = 'CALLINGAET';
    const calledAet = 'CALLEDAET';

    const association = new Association(callingAet, calledAet);

    expect(association.getCallingAeTitle()).to.be.eq(callingAet);
    expect(association.getCalledAeTitle()).to.be.eq(calledAet);
    expect(association.toString()).to.be.a('string');
  });

  it('should correctly handle user identity and async ops', () => {
    const callingAet = 'CALLINGAET';
    const calledAet = 'CALLEDAET';

    const association = new Association(callingAet, calledAet);

    expect(association.getCallingAeTitle()).to.be.eq(callingAet);
    expect(association.getCalledAeTitle()).to.be.eq(calledAet);
    expect(association.getCalledAeTitle()).to.be.eq(calledAet);
    expect(association.getUserIdentityType()).to.be.eq(UserIdentityType.Username);
    expect(association.getNegotiateAsyncOps()).to.be.eq(false);
    expect(association.getMaxAsyncOpsInvoked()).to.be.eq(1);
    expect(association.getMaxAsyncOpsPerformed()).to.be.eq(1);
    expect(association.getNegotiateUserIdentity()).to.be.eq(false);
    expect(association.getUserIdentityPositiveResponseRequested()).to.be.eq(false);
    expect(association.getUserIdentityPrimaryField()).to.be.eq('');
    expect(association.getUserIdentitySecondaryField()).to.be.eq('');
    expect(association.getNegotiateUserIdentityServerResponse()).to.be.eq(false);
    expect(association.getUserIdentityServerResponse()).to.be.eq('');

    association.setNegotiateAsyncOps(true);
    association.setMaxAsyncOpsInvoked(3);
    association.setMaxAsyncOpsPerformed(4);
    association.setNegotiateUserIdentity(true);
    association.setUserIdentityType(1);
    association.setUserIdentityPositiveResponseRequested(true);
    association.setUserIdentityPrimaryField('JOHN');
    association.setUserIdentitySecondaryField('DOE');
    association.setNegotiateUserIdentityServerResponse(true);
    association.setUserIdentityServerResponse('ALLOWED');

    expect(association.getNegotiateAsyncOps()).to.be.eq(true);
    expect(association.getMaxAsyncOpsInvoked()).to.be.eq(3);
    expect(association.getMaxAsyncOpsPerformed()).to.be.eq(4);
    expect(association.getNegotiateUserIdentity()).to.be.eq(true);
    expect(association.getUserIdentityType()).to.be.eq(1);
    expect(association.getUserIdentityPositiveResponseRequested()).to.be.eq(true);
    expect(association.getUserIdentityPrimaryField()).to.be.eq('JOHN');
    expect(association.getUserIdentitySecondaryField()).to.be.eq('DOE');
    expect(association.getNegotiateUserIdentityServerResponse()).to.be.eq(true);
    expect(association.getUserIdentityServerResponse()).to.be.eq('ALLOWED');
  });

  it('should correctly add and clear presentation contexts', () => {
    const callingAet = 'CALLINGAET';
    const calledAet = 'CALLEDAET';

    const association = new Association(callingAet, calledAet);
    const pcId = association.addPresentationContext('1.2.3.4.5.6.7.8.9');
    association.addTransferSyntaxToPresentationContext(pcId, '9.8.7.6.5.4.3.2.1');
    const context = association.getPresentationContext(pcId);

    expect(context.getAbstractSyntaxUid()).to.be.eq('1.2.3.4.5.6.7.8.9');
    expect(context.getAcceptedTransferSyntaxUid()).to.be.eq('9.8.7.6.5.4.3.2.1');

    association.clearPresentationContexts();
    const contexts = association.getPresentationContexts();
    expect(contexts.length).to.be.eq(0);
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

  it('should correctly add presentation context from request', () => {
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
    const request = new Request(CommandFieldType.CEchoRequest, SopClass.Verification, false);
    let pcId = association.addPresentationContextFromRequest(request);
    const context = association.getPresentationContext(pcId);
    context.setResult(PresentationContextResult.Accept, TransferSyntax.ExplicitVRLittleEndian);

    expect(context.getAbstractSyntaxUid()).to.be.eq(SopClass.Verification);
    expect(context.getAcceptedTransferSyntaxUid()).to.be.eq(TransferSyntax.ExplicitVRLittleEndian);
  });

  it('should correctly choose the presentation context that exactly matches the transfer syntax when possible', () => {
    const callingAet = 'CALLINGAET';
    const calledAet = 'CALLEDAET';

    const association = new Association(callingAet, calledAet);
    const request = CGetRequest.createStudyGetRequest('1.2');

    // Create association with two presentation contexts for the same abstract syntax but with different
    // transfer syntaxes
    const pcId1 = association.addPresentationContext(
      SopClass.StudyRootQueryRetrieveInformationModelGet
    );
    let context = association.getPresentationContext(pcId1);
    context.setResult(PresentationContextResult.Accept, TransferSyntax.ExplicitVRLittleEndian);
    const pcId2 = association.addPresentationContext(
      SopClass.StudyRootQueryRetrieveInformationModelGet
    );
    context = association.getPresentationContext(pcId2);
    context.setResult(PresentationContextResult.Accept, TransferSyntax.JpegBaseline);

    // Check that a request using ExplicitVRLittleEndian matches the first presentation context
    request.getDataset().setTransferSyntaxUid(TransferSyntax.ExplicitVRLittleEndian);
    expect(association.getAcceptedPresentationContextFromRequest(request).pcId).to.be.eq(pcId1);

    // Check that a request using JpegBaseline matches the second presentation context
    request.getDataset().setTransferSyntaxUid(TransferSyntax.JpegBaseline);
    expect(association.getAcceptedPresentationContextFromRequest(request).pcId).to.be.eq(pcId2);
  });

  it('should correctly add presentation contexts from a C-STORE request', () => {
    const callingAet = 'CALLINGAET';
    const calledAet = 'CALLEDAET';

    const association1 = new Association(callingAet, calledAet);
    const request1 = new CStoreRequest(
      new Dataset({
        SOPClassUID: StorageClass.CtImageStorage,
        SOPInstanceUID: Dataset.generateDerivedUid(),
      })
    );
    const pcId1 = association1.addPresentationContextFromRequest(request1);
    const request2 = new CStoreRequest(
      new Dataset({
        SOPClassUID: StorageClass.CtImageStorage,
        SOPInstanceUID: Dataset.generateDerivedUid(),
      })
    );
    const pcId2 = association1.addPresentationContextFromRequest(request2);
    expect(pcId1).to.be.eq(pcId2);

    const association2 = new Association(callingAet, calledAet);
    const request3 = new CStoreRequest(
      new Dataset({
        SOPClassUID: StorageClass.CtImageStorage,
        SOPInstanceUID: Dataset.generateDerivedUid(),
      })
    );
    const pcId3 = association2.addPresentationContextFromRequest(request3);
    const request4 = new CStoreRequest(
      new Dataset(
        {
          SOPClassUID: StorageClass.CtImageStorage,
          SOPInstanceUID: Dataset.generateDerivedUid(),
        },
        TransferSyntax.Jpeg2000Lossless
      )
    );
    const pcId4 = association2.addPresentationContextFromRequest(request4);
    const request5 = new CStoreRequest(
      new Dataset(
        {
          SOPClassUID: StorageClass.CtImageStorage,
          SOPInstanceUID: Dataset.generateDerivedUid(),
        },
        TransferSyntax.Jpeg2000Lossless
      )
    );
    const pcId5 = association2.addPresentationContextFromRequest(request5);
    const request6 = new CStoreRequest(
      new Dataset(
        {
          SOPClassUID: StorageClass.CtImageStorage,
          SOPInstanceUID: Dataset.generateDerivedUid(),
        },
        TransferSyntax.JpegLossless
      )
    );
    const pcId6 = association2.addPresentationContextFromRequest(request6);
    expect(association2.getPresentationContexts().length).to.be.eq(3);
    expect(pcId3).not.to.be.eq(pcId4);
    expect(pcId4).to.be.eq(pcId5);
    expect(pcId5).not.to.be.eq(pcId6);

    const association3 = new Association(callingAet, calledAet);
    const request7 = new CStoreRequest(
      new Dataset(
        {
          SOPClassUID: StorageClass.CtImageStorage,
          SOPInstanceUID: Dataset.generateDerivedUid(),
        },
        TransferSyntax.Jpeg2000Lossless
      )
    );
    request7.setAdditionalTransferSyntaxes([
      TransferSyntax.Jpeg2000Lossless,
      TransferSyntax.JpegLossless,
    ]);
    const pcId7 = association3.addPresentationContextFromRequest(request7);
    const request8 = new CStoreRequest(
      new Dataset({
        SOPClassUID: StorageClass.MrImageStorage,
        SOPInstanceUID: Dataset.generateDerivedUid(),
      })
    );
    const pcId8 = association3.addPresentationContextFromRequest(request8);
    expect(pcId7).not.to.be.eq(pcId8);
    expect(association3.getPresentationContexts().length).to.be.eq(2);
    expect(association3.getPresentationContext(pcId7).getTransferSyntaxUids().length).to.be.eq(3);
  });

  it('should correctly add presentation contexts from a C-GET request', () => {
    const callingAet = 'CALLINGAET';
    const calledAet = 'CALLEDAET';

    const association = new Association(callingAet, calledAet);
    const request = CGetRequest.createStudyGetRequest(Dataset.generateDerivedUid());
    const pcId = association.addPresentationContextFromRequest(request);

    // All StorageClass SOPs plus the StudyRootQueryRetrieveInformationModelGet SOP
    expect(association.getPresentationContexts().length).to.be.eq(
      Object.keys(StorageClass).length + 1
    );
    const abstractSyntaxUids = association
      .getPresentationContexts()
      .map((p) => p.context.getAbstractSyntaxUid());
    expect(abstractSyntaxUids).to.have.members([
      SopClass.StudyRootQueryRetrieveInformationModelGet,
      ...Object.values(StorageClass),
    ]);
  });

  it('should correctly add presentation contexts with meta SOP classes', () => {
    const callingAet = 'CALLINGAET';
    const calledAet = 'CALLEDAET';

    const association = new Association(callingAet, calledAet);
    association.addPresentationContext(SopClass.BasicGrayscalePrintManagementMeta);
    let pcId = association.addPresentationContextFromRequest(
      new NCreateRequest(
        SopClass.BasicFilmSession,
        Dataset.generateDerivedUid(),
        SopClass.BasicGrayscalePrintManagementMeta
      )
    );
    pcId = association.addPresentationContextFromRequest(
      new NCreateRequest(
        SopClass.BasicFilmBox,
        Dataset.generateDerivedUid(),
        SopClass.BasicGrayscalePrintManagementMeta
      )
    );
    pcId = association.addPresentationContextFromRequest(
      new NDeleteRequest(
        SopClass.BasicFilmBox,
        Dataset.generateDerivedUid(),
        SopClass.BasicGrayscalePrintManagementMeta
      )
    );
    pcId = association.addPresentationContextFromRequest(
      new NDeleteRequest(
        SopClass.BasicFilmSession,
        Dataset.generateDerivedUid(),
        SopClass.BasicGrayscalePrintManagementMeta
      )
    );

    expect(association.getPresentationContexts().length).to.be.eq(1);
  });
});
