const dcmjsDimse = require('./dcmjs-dimse.min');
const { Client } = dcmjsDimse;
const { CEchoRequest, CFindRequest, CStoreRequest } = dcmjsDimse.requests;
const { Status } = dcmjsDimse.constants;

const path = require('path');

function performEcho(host, port, callingAeTitle, calledAeTitle) {
  const client = new Client();
  const request = new CEchoRequest();
  request.on('response', response => {
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
  request.on('response', request => {
    if (request.getStatus() === Status.Pending && request.hasDataset()) {
      console.log(request.getDataset());
    }
  });
  client.addRequest(request);
  client.send(host, port, callingAeTitle, calledAeTitle);
}

function performCFindMwl(host, port, callingAeTitle, calledAeTitle) {
  const client = new Client();
  const request = CFindRequest.createWorklistFindRequest({ PatientName: '*' });
  request.on('response', request => {
    if (request.getStatus() === Status.Pending && request.hasDataset()) {
      console.log(request.getDataset());
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

const host = '127.0.0.1';
const port = 11112;
const callingAeTitle = 'THESCU';
const calledAeTitle = 'HOROS';

const operations = [performEcho, performCFindStudy, performCFindMwl, performCStore];
operations.forEach(o => {
  Reflect.apply(o, null, [host, port, callingAeTitle, calledAeTitle]);
});
