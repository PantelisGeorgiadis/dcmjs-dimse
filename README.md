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

### Features
- Implements C-ECHO, C-FIND, C-STORE, C-MOVE, C-GET, C-CANCEL, N-CREATE, N-ACTION, N-DELETE, N-EVENT-REPORT, N-GET and N-SET services as SCU and SCP.
- Supports secure DICOM TLS connections and user identity negotiation.
- Allows custom DICOM implementations (Implementation Class UID and Implementation Version).
- Provides asynchronous event handlers and streaming support for incoming SCP requests.

### Examples

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
client.on('cStoreRequest', (request, callback) => {
  console.log(request.getDataset());

  const response = CStoreResponse.fromRequest(request);
  response.setStatus(Status.Success);
  callback(response);
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
const { Dataset, Server, Scp } = dcmjsDimse;
const { CEchoResponse, CFindResponse, CStoreResponse } = dcmjsDimse.responses;
const {
  Status,
  PresentationContextResult,
  UserIdentityType,
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

    // Evaluate user identity and reject association, if needed
    if (
      this.association.getNegotiateUserIdentity() &&
      this.association.getUserIdentityPositiveResponseRequested()
    ) {
      if (
        this.association.getUserIdentityType() === UserIdentityType.UsernameAndPasscode &&
        this.association.getUserIdentityPrimaryField() === 'USERNAME' &&
        this.association.getUserIdentitySecondaryField() === 'PASSWORD'
      ) {
        this.association.setUserIdentityServerResponse('');
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

    // Optionally set the preferred max PDU length
    this.association.setMaxPduLength(65536);

    const contexts = association.getPresentationContexts();
    contexts.forEach((c) => {
      const context = association.getPresentationContext(c.id);
      if (
        context.getAbstractSyntaxUid() === SopClass.Verification ||
        context.getAbstractSyntaxUid() === SopClass.StudyRootQueryRetrieveInformationModelFind ||
        context.getAbstractSyntaxUid() === StorageClass.MrImageStorage
        // Accept other presentation contexts, as needed
      ) {
        const transferSyntaxes = context.getTransferSyntaxUids();
        transferSyntaxes.forEach((transferSyntax) => {
          if (
            transferSyntax === TransferSyntax.ImplicitVRLittleEndian ||
            transferSyntax === TransferSyntax.ExplicitVRLittleEndian
          ) {
            context.setResult(PresentationContextResult.Accept, transferSyntax);
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

  // Handle incoming C-ECHO requests
  cEchoRequest(request, callback) {
    const response = CEchoResponse.fromRequest(request);
    response.setStatus(Status.Success);
    
    callback(response);
  }

  // Handle incoming C-FIND requests
  cFindRequest(request, callback) {
    console.log(request.getDataset());

    const pendingResponse = CFindResponse.fromRequest(request);
    pendingResponse.setDataset(new Dataset({ PatientID: '12345', PatientName: 'JOHN^DOE' }));
    pendingResponse.setStatus(Status.Pending);

    const finalResponse = CFindResponse.fromRequest(request);
    finalResponse.setStatus(Status.Success);

    callback([pendingResponse, finalResponse]);
  }

  // Handle incoming C-STORE requests
  cStoreRequest(request, callback) {
    console.log(request.getDataset());

    const response = CStoreResponse.fromRequest(request);
    response.setStatus(Status.Success);

    callback(response);
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
Please check the respecting [Wiki][dcmjs-dimse-wiki-examples-url] section for more examples.

### Related libraries
* [dcmjs-imaging][dcmjs-imaging-url] - DICOM image and overlay rendering for Node.js and browser using dcmjs.
* [dcmjs-ecg][dcmjs-ecg-url] - DICOM electrocardiography (ECG) rendering for Node.js and browser using dcmjs.

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
[dcmjs-imaging-url]: https://github.com/PantelisGeorgiadis/dcmjs-imaging
[dcmjs-ecg-url]: https://github.com/PantelisGeorgiadis/dcmjs-ecg

[dcmjs-dimse-wiki-examples-url]: https://github.com/PantelisGeorgiadis/dcmjs-dimse/wiki/Examples
