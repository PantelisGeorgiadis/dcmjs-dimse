# dcmjs-dimse
DICOM DIMSE implementation for Node.js using Steve Pieper's [dcmjs](https://github.com/dcmjs-org/dcmjs) library.
This library was inspired by [fo-dicom](https://github.com/fo-dicom/fo-dicom) and [mdcm](https://github.com/fo-dicom/mdcm).
Part of the networking code was taken from [dicom-dimse](https://github.com/OHIF/dicom-dimse).

### Note
**This effort is a work-in-progress and should not be used for production or clinical purposes.**

### Build
![build master](https://github.com/PantelisGeorgiadis/dcmjs-dimse/actions/workflows/build.yml/badge.svg?branch=master)

	npm install
	npm run build

### Run examples

	npm install
	npm run build
	npm run start:examples

### Usage

#### C-Echo SCU
```js
const client = new Client();
const request = new CEchoRequest();
request.on('response', response => {
  if (response.getStatus() === Status.Success) {
    console.log('Happy!');
  }
});
client.addRequest(request);
client.send('127.0.0.1', 12345, 'SCU', 'ANY-SCP');
```

#### C-Find SCU (Studies)
```js
const client = new Client();
const request = CFindRequest.createStudyFindRequest({ PatientID: '12345', PatientName: '*' });
request.on('response', response => {
  if (response.getStatus() === Status.Pending && response.hasDataset()) {
    console.log(response.getDataset());
  }
});
client.addRequest(request);
client.send('127.0.0.1', 12345, 'SCU', 'ANY-SCP');
```

#### C-Find SCU (Worklist)
```js
const client = new Client();
const request = CFindRequest.createWorklistFindRequest({ PatientName: '*' });
request.on('response', response => {
  if (response.getStatus() === Status.Pending && response.hasDataset()) {
    console.log(response.getDataset());
  }
});
client.addRequest(request);
client.send('127.0.0.1', 12345, 'SCU', 'ANY-SCP');
```

#### C-Store SCU
```js
const client = new Client();
const request = new CStoreRequest('test.dcm');
client.addRequest(request);
client.send('127.0.0.1', 12345, 'SCU', 'ANY-SCP');
```

#### C-Move SCU
```js
const client = new Client();
const request = CMoveRequest.createStudyMoveRequest('DEST-AE', studyInstanceUid);
request.on('response', response => {
  if (response.getStatus() === Status.Pending) {
    console.log('Remaining: ' + response.getRemaining());
    console.log('Completed: ' + response.getCompleted());
    console.log('Warning: ' + response.getWarnings());
    console.log('Failed: ' + response.getFailures());
  }
});
client.addRequest(request);
client.send('127.0.0.1', 12345, 'SCU', 'ANY-SCP');
```

#### C-Get SCU
```js
const client = new Client();
const request = CGetRequest.createStudyGetRequest(studyInstanceUid);
request.on('response', response => {
  if (response.getStatus() === Status.Pending) {
    console.log('Remaining: ' + response.getRemaining());
    console.log('Completed: ' + response.getCompleted());
    console.log('Warning: ' + response.getWarnings());
    console.log('Failed: ' + response.getFailures());
  }
});
client.on('cStoreRequest', e => {
  console.log(e.request.getDataset());

  e.response = CStoreResponse.fromRequest(e.request);
  e.response.setStatus(Status.Success);
});
client.addRequest(request);
client.send('127.0.0.1', 12345, 'SCU', 'ANY-SCP');
```

#### SCP
```js
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
    contexts.forEach(c => {
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
server.listen(port);

// When done
server.close();
```

### License
dcmjs-dimse is released under the MIT License.
