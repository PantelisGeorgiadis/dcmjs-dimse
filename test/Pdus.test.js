const { Association } = require('./../src/Association');
const {
  AAbort,
  AAssociateAC,
  AAssociateRJ,
  AAssociateRQ,
  PDataTF,
  Pdv,
  RawPdu,
} = require('../src/Pdu');
const {
  PresentationContextResult,
  RawPduType,
  SopClass,
  TransferSyntax,
  UserIdentityType,
} = require('./../src/Constants');
const Implementation = require('./../src/Implementation');

const chai = require('chai');
const expect = chai.expect;

describe('PDU', () => {
  it('should correctly write and read an A-ASSOCIATE-RQ PDU', () => {
    const callingAet = 'CALLINGAET';
    const calledAet = 'CALLEDAET';
    const maxPdu = 1024;
    const maxAsyncOpsInvoked = 3;
    const maxAsyncOpsPerformed = 4;
    const userIdentityType = UserIdentityType.Saml;
    const userIdentityPrimaryField = 'JOHN';
    const userIdentitySecondaryField = 'DOE';

    const assoc1 = new Association(callingAet, calledAet);
    assoc1.setMaxPduLength(maxPdu);
    assoc1.setNegotiateAsyncOps(true);
    assoc1.setMaxAsyncOpsInvoked(maxAsyncOpsInvoked);
    assoc1.setMaxAsyncOpsPerformed(maxAsyncOpsPerformed);
    assoc1.setNegotiateUserIdentity(true);
    assoc1.setUserIdentityType(userIdentityType);
    assoc1.setUserIdentityPositiveResponseRequested(true);
    assoc1.setUserIdentityPrimaryField(userIdentityPrimaryField);
    assoc1.setUserIdentitySecondaryField(userIdentitySecondaryField);

    const pcId = assoc1.addPresentationContext(SopClass.Verification);
    assoc1.addTransferSyntaxToPresentationContext(pcId, TransferSyntax.ImplicitVRLittleEndian);

    const rq1 = new AAssociateRQ(assoc1);
    const pduRq = rq1.write();

    const assoc2 = new Association();
    const rq2 = new AAssociateRQ(assoc2);
    rq2.read(pduRq);

    const pcs1 = rq1.getAssociation().getPresentationContexts();
    const pc1 = pcs1[0].context;

    const pcs2 = rq2.getAssociation().getPresentationContexts();
    const pc2 = pcs2[0].context;

    expect(assoc1.getCallingAeTitle()).to.be.eq(assoc2.getCallingAeTitle());
    expect(assoc1.getCalledAeTitle()).to.be.eq(assoc2.getCalledAeTitle());
    expect(assoc1.getImplementationVersion()).to.be.eq(Implementation.getImplementationVersion());
    expect(assoc1.getImplementationClassUid()).to.be.eq(Implementation.getImplementationClassUid());
    expect(assoc1.getMaxPduLength()).to.be.eq(assoc2.getMaxPduLength());
    expect(assoc1.getNegotiateAsyncOps()).to.be.eq(assoc2.getNegotiateAsyncOps());
    expect(assoc1.getMaxAsyncOpsInvoked()).to.be.eq(assoc2.getMaxAsyncOpsInvoked());
    expect(assoc1.getMaxAsyncOpsPerformed()).to.be.eq(assoc2.getMaxAsyncOpsPerformed());
    expect(assoc1.getNegotiateUserIdentity()).to.be.eq(assoc2.getNegotiateUserIdentity());
    expect(assoc1.getUserIdentityType()).to.be.eq(assoc2.getUserIdentityType());
    expect(assoc1.getUserIdentityPositiveResponseRequested()).to.be.eq(
      assoc2.getUserIdentityPositiveResponseRequested()
    );
    expect(assoc1.getUserIdentityPrimaryField()).to.be.eq(assoc2.getUserIdentityPrimaryField());
    expect(assoc1.getUserIdentitySecondaryField()).to.be.eq(assoc2.getUserIdentitySecondaryField());

    expect(pc1.getAbstractSyntaxUid()).to.be.eq(pc2.getAbstractSyntaxUid());
    expect(pc1.getAcceptedTransferSyntaxUid()).to.be.eq(pc2.getAcceptedTransferSyntaxUid());
  });

  it('should correctly write and read an A-ASSOCIATE-AC PDU', () => {
    const callingAet = 'CALLINGAET';
    const calledAet = 'CALLEDAET';
    const maxAsyncOpsInvoked = 3;
    const maxAsyncOpsPerformed = 4;
    const userIdentityServerResponse = 'ALLOWED';
    const sop = SopClass.Verification;
    const tx = TransferSyntax.ImplicitVRLittleEndian;
    const res = PresentationContextResult.Accept;

    const assoc1 = new Association(callingAet, calledAet);
    assoc1.setNegotiateAsyncOps(true);
    assoc1.setMaxAsyncOpsInvoked(maxAsyncOpsInvoked);
    assoc1.setMaxAsyncOpsPerformed(maxAsyncOpsPerformed);
    assoc1.setNegotiateUserIdentityServerResponse(true);
    assoc1.setUserIdentityServerResponse(userIdentityServerResponse);
    const pcId = assoc1.addPresentationContext(sop);
    assoc1.addTransferSyntaxToPresentationContext(pcId, tx);
    const context1 = assoc1.getPresentationContext(pcId);
    context1.setResult(res, tx);

    const rq1 = new AAssociateAC(assoc1);
    const pduRq = rq1.write();

    const rq2 = new AAssociateAC(assoc1);
    rq2.read(pduRq);

    const pcs2 = rq2.getAssociation().getPresentationContexts();
    const pc2 = pcs2[0].context;

    expect(rq2.getAssociation().getNegotiateAsyncOps()).to.be.eq(true);
    expect(rq2.getAssociation().getMaxAsyncOpsInvoked()).to.be.eq(maxAsyncOpsInvoked);
    expect(rq2.getAssociation().getMaxAsyncOpsPerformed()).to.be.eq(maxAsyncOpsPerformed);
    expect(rq2.getAssociation().getNegotiateUserIdentityServerResponse()).to.be.eq(true);
    expect(rq2.getAssociation().getUserIdentityServerResponse()).to.be.eq(
      userIdentityServerResponse
    );

    expect(pc2.getAbstractSyntaxUid()).to.be.eq(sop);
    expect(pc2.getAcceptedTransferSyntaxUid()).to.be.eq(tx);
    expect(pc2.getResult()).to.be.eq(res);
  });

  it('should correctly write and read an A-ASSOCIATE-RJ PDU', () => {
    const rej1 = new AAssociateRJ(1, 2, 3);
    const pdu = rej1.write();

    const rej2 = new AAssociateRJ();
    rej2.read(pdu);

    expect(rej1.getResult()).to.be.eq(rej2.getResult());
    expect(rej1.getSource()).to.be.eq(rej2.getSource());
    expect(rej1.getReason()).to.be.eq(rej2.getReason());
  });

  it('should correctly write and read an A-ABORT PDU', () => {
    const abort1 = new AAbort(5, 4);
    const pdu = abort1.write();

    const abort2 = new AAbort();
    abort2.read(pdu);

    expect(abort1.getSource()).to.be.eq(abort2.getSource());
    expect(abort1.getReason()).to.be.eq(abort2.getReason());
  });

  it('should correctly write and read a PDV', () => {
    const pcId = 2;
    const data = Buffer.from([3, 4, 5, 6, 7]);
    const command = false;
    const last = true;

    const pdu = new RawPdu(RawPduType.AAssociateRQ);
    const pdv1 = new Pdv(pcId, data, command, last);
    pdv1.write(pdu);

    const pdv2 = new Pdv();
    pdv2.read(pdu);

    expect(pcId).to.be.eq(pdv2.getPresentationContextId());
    expect(data).to.be.deep.eq(pdv2.getValue());
    expect(command).to.be.eq(pdv2.isCommand());
    expect(last).to.be.eq(pdv2.isLastFragment());
    expect(pdu.toString()).to.be.a('string');
  });

  it('should correctly write and read a P-DATA-TF PDU', () => {
    const pcId = 2;
    const data1 = Buffer.from([3, 4, 5, 6, 7]);
    const command1 = false;
    const last1 = true;
    const data2 = Buffer.from([7, 6, 5, 4, 3]);
    const command2 = true;
    const last2 = false;

    const pdv1 = new Pdv(pcId, data1, command1, last1);
    const pdv2 = new Pdv(pcId, data2, command2, last2);

    const pDataTF1 = new PDataTF();
    pDataTF1.addPdv(pdv1);
    pDataTF1.addPdv(pdv2);
    const pdu = pDataTF1.write();

    const pDataTF2 = new PDataTF();
    pDataTF2.read(pdu);

    const pdvs = pDataTF2.getPdvs();
    const pdv3 = pdvs[0];
    const pdv4 = pdvs[1];

    expect(pcId).to.be.eq(pdv3.getPresentationContextId());
    expect(data1).to.be.deep.eq(pdv3.getValue());
    expect(command1).to.be.eq(pdv3.isCommand());
    expect(last1).to.be.eq(pdv3.isLastFragment());

    expect(pcId).to.be.eq(pdv4.getPresentationContextId());
    expect(data2).to.be.deep.eq(pdv4.getValue());
    expect(command2).to.be.eq(pdv4.isCommand());
    expect(last2).to.be.eq(pdv4.isLastFragment());
  });
});
