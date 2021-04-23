# dcmjs-dimse
DICOM DIMSE implementation for Node.js using Steve Pieper's [dcmjs](https://github.com/dcmjs-org/dcmjs) library.
This library was inspired by [fo-dicom](https://github.com/fo-dicom/fo-dicom) and [mdcm](https://github.com/fo-dicom/mdcm).
Part of the networking code was taken from [dicom-dimse](https://github.com/OHIF/dicom-dimse).

### Note
**This effort is a work-in-progress and should not be used for production or clinical purposes.**

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
request.on('response', request => {
  if (request.getStatus() === Status.Pending && request.hasDataset()) {
    console.log(request.getDataset());
  }
});
client.addRequest(request);
client.send('127.0.0.1', 12345, 'SCU', 'ANY-SCP');
```

#### C-Find SCU (Worklist)
```js
const client = new Client();
const request = CFindRequest.createWorklistFindRequest({ PatientName: '*' });
request.on('response', request => {
  if (request.getStatus() === Status.Pending && request.hasDataset()) {
    console.log(request.getDataset());
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

### License
dcmjs-dimse is released under the MIT License.
