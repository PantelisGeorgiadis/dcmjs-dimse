[![NPM version][npm-version-image]][npm-url] [![build][build-image]][build-url] [![MIT License][license-image]][license-url] 

# dcmjs-dimse
DICOM DIMSE implementation for Node.js using Steve Pieper's [dcmjs][dcmjs-url] library.
This library was inspired by [fo-dicom][fo-dicom-url] and [mdcm][mdcm-url].
Part of the networking code was taken from [dicom-dimse][dicom-dimse-url].

### Note
**This effort is a work-in-progress and should not be used for production or clinical purposes.**

### Install

	npm install dcmjs-dimse

### Build

	npm install
	npm run build

### Run examples

	npm install
	npm run build
	npm run start:examples

### Usage

#### C-Echo SCU
```js
const dcmjsDimse = require('dcmjs-dimse');
const { Client } = dcmjsDimse;
const { CEchoRequest } = dcmjsDimse.requests;
const { Status } = dcmjsDimse.constants;

const client = new Client();
const request = new CEchoRequest();
request.on('response', (response) => {
  if (response.getStatus() === Status.Success) {
    console.log('Happy!');
  }
});
client.addRequest(request);
client.on('networkError', (e) => {
  console.log('Network error: ', e);
});
client.send('127.0.0.1', 12345, 'SCU', 'ANY-SCP');
```

#### C-Find SCU (Studies)
```js
const dcmjsDimse = require('dcmjs-dimse');
const { Client } = dcmjsDimse;
const { CFindRequest } = dcmjsDimse.requests;
const { Status } = dcmjsDimse.constants;

const client = new Client();
const request = CFindRequest.createStudyFindRequest({ PatientID: '12345', PatientName: '*' });
request.on('response', (response) => {
  if (response.getStatus() === Status.Pending && response.hasDataset()) {
    console.log(response.getDataset());
  }
});
client.addRequest(request);
client.on('networkError', (e) => {
  console.log('Network error: ', e);
});
client.send('127.0.0.1', 12345, 'SCU', 'ANY-SCP');
```

#### C-Find SCU (Worklist)
```js
const dcmjsDimse = require('dcmjs-dimse');
const { Client } = dcmjsDimse;
const { CFindRequest } = dcmjsDimse.requests;
const { Status } = dcmjsDimse.constants;

const client = new Client();
const request = CFindRequest.createWorklistFindRequest({ PatientName: '*' });
request.on('response', (response) => {
  if (response.getStatus() === Status.Pending && response.hasDataset()) {
    console.log(response.getDataset());
  }
});
client.addRequest(request);
client.on('networkError', (e) => {
  console.log('Network error: ', e);
});
client.send('127.0.0.1', 12345, 'SCU', 'ANY-SCP');
```

#### C-Store SCU
```js
const dcmjsDimse = require('dcmjs-dimse');
const { Client } = dcmjsDimse;
const { CStoreRequest } = dcmjsDimse.requests;

const client = new Client();
const request = new CStoreRequest('test.dcm');
client.addRequest(request);
client.on('networkError', (e) => {
  console.log('Network error: ', e);
});
client.send('127.0.0.1', 12345, 'SCU', 'ANY-SCP');
```

#### C-Move SCU
```js
const dcmjsDimse = require('dcmjs-dimse');
const { Client } = dcmjsDimse;
const { CMoveRequest } = dcmjsDimse.requests;
const { Status } = dcmjsDimse.constants;

const client = new Client();
const request = CMoveRequest.createStudyMoveRequest('DEST-AE', studyInstanceUid);
request.on('response', (response) => {
  if (response.getStatus() === Status.Pending) {
    console.log('Remaining: ' + response.getRemaining());
    console.log('Completed: ' + response.getCompleted());
    console.log('Warning: ' + response.getWarnings());
    console.log('Failed: ' + response.getFailures());
  }
});
client.addRequest(request);
client.on('networkError', (e) => {
  console.log('Network error: ', e);
});
client.send('127.0.0.1', 12345, 'SCU', 'ANY-SCP');
```

#### C-Get SCU
```js
const dcmjsDimse = require('dcmjs-dimse');
const { Client } = dcmjsDimse;
const { CGetRequest } = dcmjsDimse.requests;
const { CStoreResponse } = dcmjsDimse.responses;
const { Status } = dcmjsDimse.constants;

const client = new Client();
const request = CGetRequest.createStudyGetRequest(studyInstanceUid);
request.on('response', (response) => {
  if (response.getStatus() === Status.Pending) {
    console.log('Remaining: ' + response.getRemaining());
    console.log('Completed: ' + response.getCompleted());
    console.log('Warning: ' + response.getWarnings());
    console.log('Failed: ' + response.getFailures());
  }
});
client.on('cStoreRequest', (e) => {
  console.log(e.request.getDataset());

  e.response = CStoreResponse.fromRequest(e.request);
  e.response.setStatus(Status.Success);
});
client.addRequest(request);
client.on('networkError', (e) => {
  console.log('Network error: ', e);
});
client.send('127.0.0.1', 12345, 'SCU', 'ANY-SCP');
```

#### N-Action SCU (e.g. Storage Commitment)
```js
const dcmjsDimse = require('dcmjs-dimse');
const { Client, Dataset } = dcmjsDimse;
const { NActionRequest } = dcmjsDimse.requests;
const { NEventReportResponse } = dcmjsDimse.responses;
const { SopClass, Status, StorageClass } = dcmjsDimse.constants;

const client = new Client();
const request = new NActionRequest(
  SopClass.StorageCommitmentPushModel,
  Dataset.generateDerivedUid(),
  0x0001
);
request.setDataset(
  new Dataset({
    TransactionUID: Dataset.generateDerivedUid(),
    ReferencedSOPSequence: [
      {
        ReferencedSOPClassUID: StorageClass.MrImageStorage,
        ReferencedSOPInstanceUID: Dataset.generateDerivedUid(),
      },
    ],
  })
);
client.addRequest(request);
client.on('nEventReportRequest', (e) => {
  console.log(e.request.getDataset());

  e.response = NEventReportResponse.fromRequest(e.request);
  e.response.setStatus(Status.Success);
});
client.on('networkError', (e) => {
  console.log('Network error: ', e);
});
client.send('127.0.0.1', 12345, 'SCU', 'ANY-SCP', {
  associationLingerTimeout: 5000,
});
```

#### N-Get SCU (e.g. Printer)
```js
const dcmjsDimse = require('dcmjs-dimse');
const { Client } = dcmjsDimse;
const { NGetRequest } = dcmjsDimse.requests;
const { SopClass, Status } = dcmjsDimse.constants;

const client = new Client();
const request = new NGetRequest(SopClass.Printer, '1.2.840.10008.5.1.1.17', [
  'PrinterStatus',
  'PrinterStatusInfo',
  'PrinterName',
  'Manufacturer',
  'ManufacturersModelName',
  'DeviceSerialNumber',
  'SoftwareVersions',
  'DeviceSerialNumber',
  'DateOfLastCalibration',
  'TimeOfLastCalibration',
]);
request.on('response', (response) => {
  if (response.getStatus() === Status.Success) {
    console.log(response.getDataset());
  }
});
client.addRequest(request);
client.on('networkError', (e) => {
  console.log('Network error: ', e);
});
client.send('127.0.0.1', 12345, 'SCU', 'ANY-SCP');
```

#### SCP
```js
const dcmjsDimse = require('dcmjs-dimse');
const { Server, Scp } = dcmjsDimse;
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

class DcmjsDimseScp extends Scp {
  constructor(socket, opts) {
    super(socket, opts);
    this.association = undefined;
  }

  // Handle incoming association requests
  associationRequested(association) {
    this.association = association;

    // Evaluate calling/called AET and reject association, if needed
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
        context.getAbstractSyntaxUid() === StorageClass.MrImageStorage
        // Accept other presentation contexts, as needed
      ) {
        context.setResult(PresentationContextResult.Accept, TransferSyntax.ImplicitVRLittleEndian);
      } else {
        context.setResult(PresentationContextResult.RejectAbstractSyntaxNotSupported);
      }
    });
    this.sendAssociationAccept();
  }

  // Handle incoming C-ECHO requests
  cEchoRequest(request) {
    const response = CEchoResponse.fromRequest(request);
    response.setStatus(Status.Success);
    
    return response;
  }

  // Handle incoming C-FIND requests
  cFindRequest(request) {
    console.log(request.getDataset());

    const pendingResponse = CFindResponse.fromRequest(request);
    pendingResponse.setDataset(new Dataset({ PatientID: '12345', PatientName: 'JOHN^DOE' }));
    pendingResponse.setStatus(Status.Pending);

    const finalResponse = CFindResponse.fromRequest(request);
    finalResponse.setStatus(Status.Success);

    return [pendingResponse, finalResponse];
  }

  // Handle incoming C-STORE requests
  cStoreRequest(request) {
    console.log(request.getDataset());

    const response = CStoreResponse.fromRequest(request);
    response.setStatus(Status.Success);
    return response;
  }

  // Handle incoming association release requests
  associationReleaseRequested() {
    this.sendAssociationReleaseResponse();
  }
}

const server = new Server(DcmjsDimseScp);
server.on('networkError', (e) => {
  console.log('Network error: ', e);
});
server.listen(port);

// When done
server.close();
```

### License
dcmjs-dimse is released under the MIT License.

[npm-url]: https://npmjs.org/package/dcmjs-dimse
[npm-version-image]: https://img.shields.io/npm/v/dcmjs-dimse.svg?style=flat

[build-url]: https://github.com/PantelisGeorgiadis/dcmjs-dimse/actions/workflows/build.yml
[build-image]: https://github.com/PantelisGeorgiadis/dcmjs-dimse/actions/workflows/build.yml/badge.svg?branch=master

[license-image]: https://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]: LICENSE.txt

[dcmjs-url]: https://github.com/dcmjs-org/dcmjs
[fo-dicom-url]: https://github.com/fo-dicom/fo-dicom
[mdcm-url]: https://github.com/fo-dicom/mdcm
[dicom-dimse-url]: https://github.com/OHIF/dicom-dimse
