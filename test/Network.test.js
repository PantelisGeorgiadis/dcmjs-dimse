const Client = require('./../src/Client');
const Dataset = require('./../src/Dataset');
const { PresentationContext } = require('./../src/Association');
const { Scp, Server } = require('./../src/Server');
const {
  CEchoRequest,
  CEchoResponse,
  CFindRequest,
  CFindResponse,
  CGetRequest,
  CGetResponse,
  CStoreRequest,
  CStoreResponse,
  NActionRequest,
  NActionResponse,
  NEventReportRequest,
  NEventReportResponse,
  NGetRequest,
  NGetResponse,
} = require('../src/Command');
const {
  AbortReason,
  AbortSource,
  PresentationContextResult,
  SopClass,
  Status,
  StorageClass,
  TransferSyntax,
  UserIdentityType,
} = require('./../src/Constants');
const log = require('./../src/log');

const selfSigned = require('selfsigned');
const chai = require('chai');
const expect = chai.expect;

const datasets = [
  new Dataset({
    PatientID: '12345',
    PatientName: 'JOHN^DOE',
    StudyInstanceUID: Dataset.generateDerivedUid(),
  }),
  new Dataset({
    PatientID: '54321',
    PatientName: 'JANE^DOE',
    StudyInstanceUID: Dataset.generateDerivedUid(),
  }),
];

class RejectingScp extends Scp {
  constructor(socket, opts) {
    super(socket, opts);
    this.association = undefined;
  }
  associationRequested(association) {
    this.association = association;
    this.sendAssociationReject();
  }
}

class UserIdentityScp extends Scp {
  constructor(socket, opts) {
    super(socket, opts);
    this.association = undefined;
  }
  associationRequested(association) {
    this.association = association;
    if (
      this.association.getNegotiateUserIdentity() &&
      this.association.getUserIdentityPositiveResponseRequested()
    ) {
      if (this.association.getUserIdentityType() === UserIdentityType.Username) {
        this.association.setUserIdentityServerResponse(
          this.association.getUserIdentityPrimaryField()
        );
        this.association.setNegotiateUserIdentityServerResponse(true);
      } else {
        this.sendAssociationReject(
          RejectResult.Permanent,
          RejectSource.ServiceUser,
          RejectReason.NoReasonGiven
        );
        return;
      }
    }
    const contexts = association.getPresentationContexts();
    contexts.forEach((c) => {
      const context = association.getPresentationContext(c.id);
      if (context.getAbstractSyntaxUid() === SopClass.Verification) {
        context.setResult(PresentationContextResult.Accept, TransferSyntax.ImplicitVRLittleEndian);
      } else {
        context.setResult(PresentationContextResult.RejectAbstractSyntaxNotSupported);
      }
    });
    this.sendAssociationAccept();
  }
  cEchoRequest(request, callback) {
    const response = CEchoResponse.fromRequest(request);
    response.setStatus(Status.Success);
    callback(response);
  }
  associationReleaseRequested() {
    this.sendAssociationReleaseResponse();
  }
}

class AcceptingScp extends Scp {
  constructor(socket, opts) {
    super(socket, opts);
    this.association = undefined;
  }
  associationRequested(association) {
    this.association = association;
    const contexts = association.getPresentationContexts();
    contexts.forEach((c) => {
      const context = association.getPresentationContext(c.id);
      if (
        context.getAbstractSyntaxUid() === SopClass.Verification ||
        context.getAbstractSyntaxUid() === SopClass.StudyRootQueryRetrieveInformationModelFind ||
        context.getAbstractSyntaxUid() === SopClass.StudyRootQueryRetrieveInformationModelGet ||
        context.getAbstractSyntaxUid() === SopClass.ModalityWorklistInformationModelFind ||
        context.getAbstractSyntaxUid() === SopClass.Printer ||
        context.getAbstractSyntaxUid() === SopClass.StorageCommitmentPushModel ||
        context.getAbstractSyntaxUid() === StorageClass.MrImageStorage
      ) {
        context.setResult(PresentationContextResult.Accept, TransferSyntax.ImplicitVRLittleEndian);
      } else {
        context.setResult(PresentationContextResult.RejectAbstractSyntaxNotSupported);
      }
    });
    this.sendAssociationAccept();
  }
  cEchoRequest(request, callback) {
    const response = CEchoResponse.fromRequest(request);
    response.setStatus(Status.Success);
    callback(response);
  }
  cFindRequest(request, callback) {
    const requestDataset = request.getDataset();
    const foundDataset = datasets.find(
      (d) => d.getElement('PatientID') === requestDataset.getElement('PatientID')
    );

    const responses = [];
    if (foundDataset) {
      const response1 = CFindResponse.fromRequest(request);
      response1.setStatus(Status.Pending);
      response1.setDataset(foundDataset);
      responses.push(response1);
    }

    const response2 = CFindResponse.fromRequest(request);
    response2.setStatus(Status.Success);
    responses.push(response2);

    callback(responses);
  }
  cStoreRequest(request, callback) {
    datasets.push(request.getDataset());
    const response = CStoreResponse.fromRequest(request);
    response.setStatus(Status.Success);
    callback(response);
  }
  cGetRequest(request, callback) {
    const requestDataset = request.getDataset();
    const foundDataset = datasets.find(
      (d) => d.getElement('StudyInstanceUID') === requestDataset.getElement('StudyInstanceUID')
    );

    if (foundDataset) {
      const cStoreRequest = new CStoreRequest(foundDataset);
      this.sendRequests(cStoreRequest);
    }

    const response = CGetResponse.fromRequest(request);
    response.setStatus(Status.Success);
    callback(response);
  }
  nActionRequest(request, callback) {
    const nEventRequest = new NEventReportRequest(
      request.getRequestedSopClassUid(),
      request.getRequestedSopInstanceUid(),
      request.getActionTypeId()
    );
    const actionDataset = request.getDataset();
    const transactionUid = actionDataset.getElement('TransactionUID');
    const referencedSOPSequenceItem = actionDataset.getElement('ReferencedSOPSequence');
    const sopInstanceUid = referencedSOPSequenceItem.ReferencedSOPInstanceUID;

    nEventRequest.setDataset(
      new Dataset({
        TransactionUID: transactionUid,
        FailedSOPSequence: [
          {
            ReferencedSOPClassUID: StorageClass.MrImageStorage,
            ReferencedSOPInstanceUID: sopInstanceUid,
            FailureReason: 0x0112,
          },
        ],
      })
    );
    this.sendRequests(nEventRequest);

    const response = NActionResponse.fromRequest(request);
    response.setStatus(Status.Success);
    callback(response);
  }
  nGetRequest(request, callback) {
    const response = NGetResponse.fromRequest(request);
    const attributes = request.getAttributeIdentifierList();
    const dataset = new Dataset();
    attributes.forEach((attribute) => {
      // Echo the requested attribute name
      dataset.setElement(attribute, attribute);
    });
    response.setDataset(dataset);
    response.setStatus(Status.Success);
    callback(response);
  }
  associationReleaseRequested() {
    this.sendAssociationReleaseResponse();
  }
}

class CancelingScp extends Scp {
  constructor(socket, opts) {
    super(socket, opts);
    this.association = undefined;

    this.cancelation = {
      _canceled: false,
      _listener: (val) => {},
      setCancelation(val) {
        this._canceled = val;
        this._listener(val);
      },
      getCancelation() {
        return this._canceled;
      },
      cancelationListener: function (listener) {
        this._listener = listener;
      },
    };
  }
  associationRequested(association) {
    this.association = association;
    const contexts = association.getPresentationContexts();
    contexts.forEach((c) => {
      const context = association.getPresentationContext(c.id);
      if (context.getAbstractSyntaxUid() === SopClass.StudyRootQueryRetrieveInformationModelFind) {
        context.setResult(PresentationContextResult.Accept, TransferSyntax.ImplicitVRLittleEndian);
      } else {
        context.setResult(PresentationContextResult.RejectAbstractSyntaxNotSupported);
      }
    });
    this.sendAssociationAccept();
  }
  cFindRequest(request, callback) {
    this.cancelation.cancelationListener((val) => {
      if (val === true) {
        const response = CFindResponse.fromRequest(request);
        response.setStatus(Status.Cancel);
        callback([response]);
      }
    });
  }
  cCancelRequest(request) {
    this.cancelation.setCancelation(true);
  }
  associationReleaseRequested() {
    this.sendAssociationReleaseResponse();
  }
}

class AbortingScp extends Scp {
  constructor(socket, opts) {
    super(socket, opts);
    this.association = undefined;

    this.abortion = {
      _aborted: false,
      _listener: (val) => {},
      setAbortion(val) {
        this._aborted = val;
        this._listener(val);
      },
      getAbortion() {
        return this._aborted;
      },
      abortListener: function (listener) {
        this._listener = listener;
      },
    };
  }
  associationRequested(association) {
    this.association = association;
    const contexts = association.getPresentationContexts();
    contexts.forEach((c) => {
      const context = association.getPresentationContext(c.id);
      if (context.getAbstractSyntaxUid() === SopClass.StudyRootQueryRetrieveInformationModelFind) {
        context.setResult(PresentationContextResult.Accept, TransferSyntax.ImplicitVRLittleEndian);
      } else {
        context.setResult(PresentationContextResult.RejectAbstractSyntaxNotSupported);
      }
    });
    this.sendAssociationAccept();
  }
  cFindRequest(request, callback) {
    this.abortion.abortListener((val) => {
      if (val === true) {
        const response = CFindResponse.fromRequest(request);
        response.setStatus(
          // Abusively used here just to get feedback on the client that the association was aborted
          Status.UnrecognizedOperation
        );
        callback([response]);
      }
    });
  }
  abort(source, reason) {
    this.abortion.setAbortion(true);
  }
  associationReleaseRequested() {
    this.sendAssociationReleaseResponse();
  }
}

describe('Network', () => {
  before(() => {
    log.level = 'error';
  });

  it('should be able to reject an association', () => {
    const server = new Server(RejectingScp);
    server.listen(2101);

    let rejected = false;

    const client = new Client();
    const request = new CEchoRequest();
    client.addRequest(request);
    client.addAdditionalPresentationContext(
      new PresentationContext(
        0,
        SopClass.ModalityWorklistInformationModelFind,
        TransferSyntax.ImplicitVRLittleEndian
      )
    );
    client.addAdditionalPresentationContext(
      new PresentationContext(
        0,
        SopClass.ModalityWorklistInformationModelFind,
        TransferSyntax.ExplicitVRLittleEndian
      ),
      true
    );
    client.on('associationRejected', (reject) => {
      rejected = true;
    });
    client.on('closed', () => {
      expect(rejected).to.be.true;
      server.close();
    });
    client.send('127.0.0.1', 2101, 'CALLINGAET', 'CALLEDAET');
  });

  it('should be able to handle association with user identity', () => {
    const server = new Server(UserIdentityScp);
    server.listen(2102);

    const username = 'USERNAME';
    let serverResponse = '';

    const client = new Client();
    const request = new CEchoRequest();
    client.addRequest(request);
    client.on('associationAccepted', (association) => {
      if (association.getNegotiateUserIdentityServerResponse()) {
        serverResponse = association.getUserIdentityServerResponse();
      }
    });
    client.on('closed', () => {
      expect(username).to.be.eq(serverResponse);
      server.close();
    });
    client.send('127.0.0.1', 2102, 'CALLINGAET', 'CALLEDAET', {
      userIdentity: {
        type: UserIdentityType.Username,
        positiveResponseRequested: true,
        primaryField: username,
      },
    });
  });

  it('should correctly perform and serve a C-ECHO operation', () => {
    let status = Status.ProcessingFailure;

    const server = new Server(AcceptingScp);
    server.listen(2103);

    const client = new Client();
    const request = new CEchoRequest();
    request.on('response', (response) => {
      status = response.getStatus();
    });
    client.addRequest(request);
    client.on('closed', () => {
      expect(status).to.be.eq(Status.Success);
      server.close();
    });
    client.send('127.0.0.1', 2103, 'CALLINGAET', 'CALLEDAET');
  });

  it('should correctly perform and serve a secure C-ECHO operation (TLS)', () => {
    let status = Status.ProcessingFailure;

    const serverAttrs = [
      { name: 'commonName', value: 'DCMJS-DIMSE-SERVER' },
      { name: 'countryName', value: 'GR' },
      { name: 'organizationName', value: 'DCMJS-DIMSE' },
      { name: 'organizationalUnitName', value: 'IT' },
    ];
    const serverPems = selfSigned.generate(serverAttrs, {
      keySize: 2048,
      days: 5,
      algorithm: 'sha256',
    });

    const clientAttrs = [
      { name: 'commonName', value: 'DCMJS-DIMSE-CLIENT' },
      { name: 'countryName', value: 'GR' },
      { name: 'organizationName', value: 'DCMJS-DIMSE' },
      { name: 'organizationalUnitName', value: 'IT' },
    ];
    const clientPems = selfSigned.generate(clientAttrs, {
      keySize: 2048,
      days: 5,
      algorithm: 'sha256',
    });

    const server = new Server(AcceptingScp);
    server.listen(2104, {
      securityOptions: {
        key: serverPems.private,
        cert: serverPems.cert,
        ca: clientPems.cert,
        rejectUnauthorized: false,
        requestCert: false,
      },
    });

    const client = new Client();
    const request = new CEchoRequest();
    request.on('response', (response) => {
      status = response.getStatus();
    });
    client.addRequest(request);
    client.on('closed', () => {
      expect(status).to.be.eq(Status.Success);
      server.close();
    });
    client.send('127.0.0.1', 2104, 'CALLINGAET', 'CALLEDAET', {
      securityOptions: {
        key: clientPems.private,
        cert: clientPems.cert,
        ca: serverPems.cert,
        rejectUnauthorized: false,
        requestCert: false,
      },
    });
  });

  it('should correctly perform and serve a C-FIND operation (Study)', () => {
    const server = new Server(AcceptingScp);
    server.listen(2105);

    let ret = undefined;

    const client = new Client();
    const request = CFindRequest.createStudyFindRequest({ PatientID: '12345' });
    request.on('response', (response) => {
      if (response.getStatus() === Status.Pending) {
        ret = response.getDataset();
      }
    });
    client.addRequest(request);
    client.on('closed', () => {
      expect(ret.getElement('PatientID')).to.be.eq(datasets[0].getElement('PatientID'));
      expect(ret.getElement('PatientName')).to.be.eq(datasets[0].getElement('PatientName'));
      server.close();
    });
    client.send('127.0.0.1', 2105, 'CALLINGAET', 'CALLEDAET');
  });

  it('should correctly perform and serve a C-FIND operation (Worklist)', () => {
    const server = new Server(AcceptingScp);
    server.listen(2106);

    let ret = undefined;

    const client = new Client();
    const request = CFindRequest.createWorklistFindRequest({ PatientID: '54321' });
    request.on('response', (response) => {
      if (response.getStatus() === Status.Pending) {
        ret = response.getDataset();
      }
    });
    client.addRequest(request);
    client.on('closed', () => {
      expect(ret.getElement('PatientID')).to.be.eq(datasets[1].getElement('PatientID'));
      expect(ret.getElement('PatientName')).to.be.eq(datasets[1].getElement('PatientName'));
      server.close();
    });
    client.send('127.0.0.1', 2106, 'CALLINGAET', 'CALLEDAET');
  });

  it('should correctly perform and serve a C-STORE operation', () => {
    const server = new Server(AcceptingScp);
    server.listen(2107);

    let ret = undefined;

    const client = new Client();
    const storeRequest = new CStoreRequest(
      new Dataset({
        SOPClassUID: StorageClass.MrImageStorage,
        StudyInstanceUID: Dataset.generateDerivedUid(),
        PatientID: '45678',
        PatientName: 'JOHN^SMITH',
      })
    );
    client.addRequest(storeRequest);
    const findRequest = CFindRequest.createStudyFindRequest({ PatientID: '45678' });
    findRequest.on('response', (response) => {
      if (response.getStatus() === Status.Pending) {
        ret = response.getDataset();
      }
    });
    client.addRequest(findRequest);
    client.on('closed', () => {
      expect(ret.getElement('PatientID')).to.be.eq(datasets[2].getElement('PatientID'));
      expect(ret.getElement('PatientName')).to.be.eq(datasets[2].getElement('PatientName'));
      server.close();
    });
    client.send('127.0.0.1', 2107, 'CALLINGAET', 'CALLEDAET');
  });

  it('should correctly perform and serve a C-GET operation', () => {
    const server = new Server(AcceptingScp);
    server.listen(2108);

    let ret = undefined;
    const studyInstanceUid = Dataset.generateDerivedUid();

    const client = new Client();
    const storeRequest = new CStoreRequest(
      new Dataset({
        SOPClassUID: StorageClass.MrImageStorage,
        StudyInstanceUID: studyInstanceUid,
        PatientID: '76543',
        PatientName: 'JANE^DOE',
      })
    );
    client.addRequest(storeRequest);
    const getRequest = CGetRequest.createStudyGetRequest(studyInstanceUid);
    client.addRequest(getRequest);
    client.on('cStoreRequest', (request, callback) => {
      ret = request.getDataset();

      const response = CStoreResponse.fromRequest(request);
      response.setStatus(Status.Success);
      callback(response);
    });
    client.on('closed', () => {
      expect(ret.getElement('PatientID')).to.be.eq(datasets[3].getElement('PatientID'));
      expect(ret.getElement('PatientName')).to.be.eq(datasets[3].getElement('PatientName'));
      expect(ret.getElement('StudyInstanceUID')).to.be.eq(
        datasets[3].getElement('StudyInstanceUID')
      );
      server.close();
    });
    client.send('127.0.0.1', 2108, 'CALLINGAET', 'CALLEDAET');
  });

  it('should correctly perform and serve a N-ACTION operation', () => {
    const server = new Server(AcceptingScp);
    server.listen(2109);

    let ret = undefined;
    const sopInstanceUid = Dataset.generateDerivedUid();
    const transactionUid = Dataset.generateDerivedUid();

    const client = new Client();
    const request = new NActionRequest(
      SopClass.StorageCommitmentPushModel,
      Dataset.generateDerivedUid(),
      0x0001
    );
    request.setDataset(
      new Dataset({
        TransactionUID: transactionUid,
        ReferencedSOPSequence: [
          {
            ReferencedSOPClassUID: StorageClass.MrImageStorage,
            ReferencedSOPInstanceUID: sopInstanceUid,
          },
        ],
      })
    );
    client.addRequest(request);
    client.on('nEventReportRequest', (request, callback) => {
      ret = request.getDataset();
      const response = NEventReportResponse.fromRequest(request);
      response.setStatus(Status.Success);
      callback(response);
    });
    client.on('closed', () => {
      expect(ret.getElement('TransactionUID')).to.be.eq(transactionUid);
      const failedSOPSequenceItem = ret.getElement('FailedSOPSequence');
      expect(failedSOPSequenceItem.ReferencedSOPInstanceUID).to.be.eq(sopInstanceUid);
      expect(failedSOPSequenceItem.FailureReason).to.be.eq(0x0112);
      server.close();
    });
    client.send('127.0.0.1', 2109, 'CALLINGAET', 'CALLEDAET');
  });

  it('should correctly perform and serve a N-GET operation', () => {
    const server = new Server(AcceptingScp);
    server.listen(2110);

    let ret = undefined;

    const client = new Client();
    const request = new NGetRequest(SopClass.Printer, '1.2.840.10008.5.1.1.17', [
      'PrinterStatus',
      'PrinterName',
      'Manufacturer',
    ]);
    request.on('response', (response) => {
      if (response.getStatus() === Status.Success) {
        ret = response.getDataset();
      }
    });
    client.addRequest(request);
    client.on('closed', () => {
      // The SCP is echoing the requested attribute name
      expect(ret.getElement('PrinterStatus')).to.be.eq('PrinterStatus');
      expect(ret.getElement('PrinterName')).to.be.eq('PrinterName');
      expect(ret.getElement('Manufacturer')).to.be.eq('Manufacturer');
      server.close();
    });
    client.send('127.0.0.1', 2110, 'CALLINGAET', 'CALLEDAET');
  });

  it('should correctly perform and serve a C-CANCEL operation', () => {
    const server = new Server(CancelingScp);
    server.listen(2111);

    let canceled = false;

    const client = new Client();
    const request = CFindRequest.createStudyFindRequest({ PatientID: '12345' });
    request.on('response', (response) => {
      if (response.getStatus() === Status.Cancel) {
        canceled = true;
      }
    });
    client.addRequest(request);
    client.on('associationAccepted', (association) => {
      // Cancel after 500ms from association acceptance,
      // assuming that the SCP would have received the
      // C-FIND operation by that time
      setTimeout(() => client.cancel(request), 500);
    });
    client.on('closed', () => {
      expect(canceled).to.be.true;
      server.close();
    });
    client.send('127.0.0.1', 2111, 'CALLINGAET', 'CALLEDAET');
  });

  it('should correctly perform and serve an A-ABORT operation', () => {
    const server = new Server(AbortingScp);
    server.listen(2112);

    let aborted = false;

    const client = new Client();
    const request = CFindRequest.createStudyFindRequest({ PatientID: '12345' });
    request.on('response', (response) => {
      if (response.getStatus() === Status.UnrecognizedOperation) {
        aborted = true;
      }
    });
    client.addRequest(request);
    client.on('associationAccepted', (association) => {
      // Abort after 500ms from association acceptance,
      // assuming that the SCP would have received the
      // C-FIND operation by that time
      setTimeout(() => client.abort(AbortSource.ServiceUser, AbortReason.InvalidPduParameter), 500);
    });
    client.on('closed', () => {
      expect(aborted).to.be.true;
      server.close();
    });
    client.send('127.0.0.1', 2112, 'CALLINGAET', 'CALLEDAET');
  });
});
