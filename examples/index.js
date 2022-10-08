const dcmjsDimse = require('./../src');
const path = require('path');

const { Dataset, Client, Server, Scp } = dcmjsDimse;
const { CEchoRequest, CFindRequest, CStoreRequest } = dcmjsDimse.requests;
const { CEchoResponse, CFindResponse, CStoreResponse } = dcmjsDimse.responses;
const {
  Status,
  PresentationContextResult,
  RejectResult,
  RejectSource,
  RejectReason,
  TransferSyntax,
  SopClass,
  StorageClass,
} = dcmjsDimse.constants;

function performCEcho(host, port, callingAeTitle, calledAeTitle) {
  const client = new Client();
  const request = new CEchoRequest();
  request.on('response', (response) => {
    if (response.getStatus() === Status.Success) {
      console.log('Happy!');
    }
  });
  client.addRequest(request);
  client.send(host, port, callingAeTitle, calledAeTitle);
}

function performCFindStudy(host, port, callingAeTitle, calledAeTitle) {
  const client = new Client();
  const request = CFindRequest.createStudyFindRequest({ PatientName: '*' });
  request.on('response', (response) => {
    if (response.getStatus() === Status.Pending && response.hasDataset()) {
      console.log(response.getDataset());
    }
  });
  client.addRequest(request);
  client.send(host, port, callingAeTitle, calledAeTitle);
}

function performCFindMwl(host, port, callingAeTitle, calledAeTitle) {
  const client = new Client();
  const request = CFindRequest.createWorklistFindRequest({ PatientName: '*' });
  request.on('response', (response) => {
    if (response.getStatus() === Status.Pending && response.hasDataset()) {
      console.log(response.getDataset());
    }
  });
  client.addRequest(request);
  client.send(host, port, callingAeTitle, calledAeTitle);
}

function performCStore(host, port, callingAeTitle, calledAeTitle) {
  const rootPath = process.cwd();
  const elePath = path.join(rootPath, 'datasets', 'ele.dcm');
  const j2kPath = path.join(rootPath, 'datasets', 'j2k.dcm');
  const srPath = path.join(rootPath, 'datasets', 'sr.dcm');
  const pdfPath = path.join(rootPath, 'datasets', 'pdf.dcm');

  const client = new Client();
  client.addRequest(new CStoreRequest(elePath));
  client.addRequest(new CStoreRequest(j2kPath));
  client.addRequest(new CStoreRequest(srPath));
  client.addRequest(new CStoreRequest(pdfPath));
  client.send(host, port, callingAeTitle, calledAeTitle);
}

class ExampleScp extends Scp {
  constructor(socket, opts) {
    super(socket, opts);
    this.association = undefined;
  }

  associationRequested(association) {
    this.association = association;

    if (this.association.getCallingAeTitle() !== 'SCU') {
      this.sendAssociationReject(
        RejectResult.Permanent,
        RejectSource.ServiceUser,
        RejectReason.CallingAeNotRecognized
      );
      return;
    }

    const contexts = association.getPresentationContexts();
    contexts.forEach((c) => {
      const context = association.getPresentationContext(c.id);
      if (
        context.getAbstractSyntaxUid() === SopClass.Verification ||
        context.getAbstractSyntaxUid() === SopClass.StudyRootQueryRetrieveInformationModelFind ||
        context.getAbstractSyntaxUid() === SopClass.ModalityWorklistInformationModelFind ||
        Object.values(StorageClass).includes(context.getAbstractSyntaxUid())
      ) {
        const transferSyntaxes = context.getTransferSyntaxUids();
        transferSyntaxes.forEach((transferSyntax) => {
          if (transferSyntax === TransferSyntax.ImplicitVRLittleEndian) {
            context.setResult(
              PresentationContextResult.Accept,
              TransferSyntax.ImplicitVRLittleEndian
            );
          } else {
            context.setResult(PresentationContextResult.RejectTransferSyntaxesNotSupported);
          }
        });
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
    console.log(request.getDataset());

    const response1 = CFindResponse.fromRequest(request);
    response1.setDataset(new Dataset({ PatientID: '12345', PatientName: 'JOHN^DOE' }));
    response1.setStatus(Status.Pending);

    const response2 = CFindResponse.fromRequest(request);
    response2.setStatus(Status.Success);

    callback([response1, response2]);
  }

  cStoreRequest(request, callback) {
    console.log(request.getDataset());

    const response = CStoreResponse.fromRequest(request);
    response.setStatus(Status.Success);
    callback(response);
  }

  associationReleaseRequested() {
    this.sendAssociationReleaseResponse();
  }
}

const host = '127.0.0.1';
const port = 2104;
const callingAeTitle = 'SCU';
const calledAeTitle = 'ANY-SCP';

const server = new Server(ExampleScp);
server.listen(port);

const operations = [performCEcho, performCFindStudy, performCFindMwl, performCStore];
operations.forEach((o) => {
  Reflect.apply(o, null, [host, port, callingAeTitle, calledAeTitle]);
});

setTimeout(() => {
  server.close();
  const statistics = server.getStatistics();
  console.log('Server statistics:', statistics.toString());
}, 3000);
