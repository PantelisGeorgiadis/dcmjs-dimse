const Client = require('./../src/Client');
const Dataset = require('./../src/Dataset');
const { Server, Scp } = require('./../src/Server');
const {
  CEchoRequest,
  CEchoResponse,
  CFindRequest,
  CFindResponse,
  CStoreRequest,
  CStoreResponse,
} = require('../src/Command');
const {
  SopClass,
  TransferSyntax,
  PresentationContextResult,
  Status,
  StorageClass,
} = require('./../src/Constants');
const log = require('./../src/log');

const chai = require('chai');
const expect = chai.expect;

const datasets = [
  new Dataset({ PatientID: '12345', PatientName: 'JOHN^DOE' }),
  new Dataset({ PatientID: '54321', PatientName: 'JANE^DOE' }),
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
        context.getAbstractSyntaxUid() === SopClass.ModalityWorklistInformationModelFind ||
        context.getAbstractSyntaxUid() === StorageClass.MrImageStorage
      ) {
        context.setResult(PresentationContextResult.Accept, TransferSyntax.ImplicitVRLittleEndian);
      } else {
        context.setResult(PresentationContextResult.RejectAbstractSyntaxNotSupported);
      }
    });
    this.sendAssociationAccept();
  }
  cEchoRequest(request) {
    const response = CEchoResponse.fromRequest(request);
    response.setStatus(Status.Success);
    return response;
  }
  cFindRequest(request) {
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

    return responses;
  }
  cStoreRequest(request) {
    datasets.push(request.getDataset());
    const response = CStoreResponse.fromRequest(request);
    response.setStatus(Status.Success);
    return response;
  }
  associationReleaseRequested() {
    this.sendAssociationReleaseResponse();
  }
}

describe('Client/Server', () => {
  before(() => {
    log.level = 'error';
  });

  it('should be able to reject an association', () => {
    const server = new Server(RejectingScp);
    server.listen(2101);

    let rejected = false;

    const client = new Client();
    const request = new CEchoRequest();
    request.on('response', (response) => {
      status = response.getStatus();
    });
    client.addRequest(request);
    client.on('associationRejected', (result, source, reason) => {
      rejected = true;
    });
    client.on('closed', () => {
      expect(rejected).to.be.true;
      server.close();
    });
    client.send('127.0.0.1', 2101, 'CALLINGAET', 'CALLEDAET');
  });

  it('should correctly perform and serve a C-ECHO operation', () => {
    let status = Status.ProcessingFailure;

    const server = new Server(AcceptingScp);
    server.listen(2102);

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
    client.send('127.0.0.1', 2102, 'CALLINGAET', 'CALLEDAET');
  });

  it('should correctly perform and serve a C-FIND operation (Study)', () => {
    const server = new Server(AcceptingScp);
    server.listen(2103);

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
    client.send('127.0.0.1', 2103, 'CALLINGAET', 'CALLEDAET');
  });

  it('should correctly perform and serve a C-FIND operation (Worklist)', () => {
    const server = new Server(AcceptingScp);
    server.listen(2104);

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
    client.send('127.0.0.1', 2104, 'CALLINGAET', 'CALLEDAET');
  });

  it('should correctly perform and serve a C-STORE operation', () => {
    const server = new Server(AcceptingScp);
    server.listen(2105);

    const client = new Client();
    const storeRequest = new CStoreRequest(
      new Dataset({
        SOPClassUID: StorageClass.MrImageStorage,
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
    client.send('127.0.0.1', 2105, 'CALLINGAET', 'CALLEDAET');
  });
});
