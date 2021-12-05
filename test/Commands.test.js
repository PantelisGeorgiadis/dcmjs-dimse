const {
  Command,
  Request,
  Response,
  CEchoRequest,
  CEchoResponse,
  CFindRequest,
  CFindResponse,
  CMoveRequest,
  CMoveResponse,
  CStoreRequest,
  CStoreResponse,
  CGetRequest,
  CGetResponse,
  NCreateRequest,
  NCreateResponse,
  NActionRequest,
  NActionResponse,
  NDeleteRequest,
  NDeleteResponse,
  NEventReportRequest,
  NEventReportResponse,
  NGetRequest,
  NGetResponse,
  NSetRequest,
  NSetResponse,
} = require('./../src/Command');
const Dataset = require('../src/Dataset');
const {
  CommandFieldType,
  Priority,
  SopClass,
  Status,
  TransferSyntax,
} = require('./../src/Constants');

const chai = require('chai');

const expect = chai.expect;

describe('Command', () => {
  it('should correctly create a command', () => {
    const command = new Command(
      new Dataset({
        CommandField: 1,
        CommandDataSetType: 0x0101,
      })
    );
    const commandDataset = command.getCommandDataset();

    expect(command.getCommandFieldType()).to.be.eq(1);
    expect(command.hasDataset()).to.be.false;
    expect(commandDataset.getElement('CommandField')).to.be.eq(1);
    expect(commandDataset.getElement('CommandDataSetType')).to.be.eq(0x0101);
  });

  it('should correctly create a request', () => {
    const uid = Dataset.generateDerivedUid();
    const request = new Request(1, uid, 2, true);
    const commandDataset = request.getCommandDataset();

    expect(request.getAffectedSopClassUid()).to.be.eq(uid);
    expect(request.hasDataset()).to.be.true;
    expect(commandDataset.getElement('CommandField')).to.be.eq(1);
  });

  it('should correctly create a response', () => {
    const uid = Dataset.generateDerivedUid();
    const response = new Response(7, uid, false, 5, 'This is an error');
    const commandDataset = response.getCommandDataset();

    expect(response.getStatus()).to.be.eq(5);
    expect(response.getErrorComment()).to.be.eq('This is an error');
    expect(response.hasDataset()).to.be.false;
    expect(commandDataset.getElement('CommandField')).to.be.eq(7);
    expect(commandDataset.getElement('AffectedSOPClassUID')).to.be.eq(uid);
  });

  it('should correctly create a C-ECHO request', () => {
    const request = new CEchoRequest();

    expect(request.getAffectedSopClassUid()).to.be.eq(SopClass.Verification);
    expect(request.getCommandFieldType()).to.be.eq(CommandFieldType.CEchoRequest);
    expect(request.hasDataset()).to.be.false;
  });

  it('should correctly create a C-ECHO response', () => {
    const response = new CEchoResponse(Status.ProcessingFailure);

    expect(response.getAffectedSopClassUid()).to.be.eq(SopClass.Verification);
    expect(response.getCommandFieldType()).to.be.eq(CommandFieldType.CEchoResponse);
    expect(response.getStatus()).to.be.eq(Status.ProcessingFailure);
    expect(response.hasDataset()).to.be.false;
  });

  it('should correctly create a C-FIND request', () => {
    const request = CFindRequest.createStudyFindRequest({
      PatientName: 'JOHN^DOE',
      PatientID: '12345678',
      AccessionNumber: '87654321',
    });
    const dataset = request.getDataset();

    expect(request.getAffectedSopClassUid()).to.be.eq(
      SopClass.StudyRootQueryRetrieveInformationModelFind
    );
    expect(request.getCommandFieldType()).to.be.eq(CommandFieldType.CFindRequest);
    expect(request.getPriority()).to.be.eq(Priority.Medium);
    expect(request.hasDataset()).to.be.true;
    expect(dataset.getElement('PatientName')).to.be.eq('JOHN^DOE');
    expect(dataset.getElement('PatientID')).to.be.eq('12345678');
    expect(dataset.getElement('AccessionNumber')).to.be.eq('87654321');
    expect(dataset.getElement('QueryRetrieveLevel')).to.be.eq('STUDY');
  });

  it('should correctly create a C-FIND response', () => {
    const response = new CFindResponse(Status.ProcessingFailure);

    expect(response.getAffectedSopClassUid()).to.be.eq(
      SopClass.StudyRootQueryRetrieveInformationModelFind
    );
    expect(response.getCommandFieldType()).to.be.eq(CommandFieldType.CFindResponse);
    expect(response.getStatus()).to.be.eq(Status.ProcessingFailure);
    expect(response.hasDataset()).to.be.false;
  });

  it('should correctly create a C-STORE request', () => {
    const patientName = 'JOHN^DOE';
    const patientID = '12345678';
    const accessionNumber = '87654321';
    const studyDescription = 'THIS IS A STUDY';
    const seriesDescription = 'THIS IS A SERIES';

    const sopClassUid = Dataset.generateDerivedUid();
    const sopInstanceUid = Dataset.generateDerivedUid();
    const dataset = new Dataset(
      {
        SOPClassUID: sopClassUid,
        SOPInstanceUID: sopInstanceUid,
        PatientName: patientName,
        PatientID: patientID,
        AccessionNumber: accessionNumber,
        StudyDescription: studyDescription,
        SeriesDescription: seriesDescription,
      },
      TransferSyntax.ImplicitVRLittleEndian
    );

    const request = new CStoreRequest(dataset, Priority.High);

    expect(request.getAffectedSopClassUid()).to.be.eq(sopClassUid);
    expect(request.getAffectedSopInstanceUid()).to.be.eq(sopInstanceUid);
    expect(request.getCommandFieldType()).to.be.eq(CommandFieldType.CStoreRequest);
    expect(request.getPriority()).to.be.eq(Priority.High);
    expect(request.hasDataset()).to.be.true;
  });

  it('should correctly create a C-STORE response', () => {
    const response = new CStoreResponse(Status.Success);

    expect(response.getAffectedSopClassUid()).to.be.eq('');
    expect(response.getCommandFieldType()).to.be.eq(CommandFieldType.CStoreResponse);
    expect(response.getStatus()).to.be.eq(Status.Success);
    expect(response.hasDataset()).to.be.false;
  });

  it('should correctly create a C-MOVE request', () => {
    const uid = Dataset.generateDerivedUid();
    const request = CMoveRequest.createStudyMoveRequest('DESTAET', uid, Priority.Low);
    const dataset = request.getDataset();
    const commandDataset = request.getCommandDataset();

    expect(request.getAffectedSopClassUid()).to.be.eq(
      SopClass.StudyRootQueryRetrieveInformationModelMove
    );
    expect(request.getCommandFieldType()).to.be.eq(CommandFieldType.CMoveRequest);
    expect(request.getPriority()).to.be.eq(Priority.Low);
    expect(request.hasDataset()).to.be.true;
    expect(dataset.getElement('StudyInstanceUID')).to.be.eq(uid);
    expect(dataset.getElement('QueryRetrieveLevel')).to.be.eq('STUDY');
    expect(commandDataset.getElement('MoveDestination')).to.be.eq('DESTAET');
  });

  it('should correctly create a C-MOVE response', () => {
    const response = new CMoveResponse(Status.ProcessingFailure);

    expect(response.getAffectedSopClassUid()).to.be.eq(
      SopClass.StudyRootQueryRetrieveInformationModelMove
    );
    expect(response.getCommandFieldType()).to.be.eq(CommandFieldType.CMoveResponse);
    expect(response.getStatus()).to.be.eq(Status.ProcessingFailure);
    expect(response.hasDataset()).to.be.false;
  });

  it('should correctly create a C-GET request', () => {
    const uid = Dataset.generateDerivedUid();
    const request = CGetRequest.createStudyGetRequest(uid);
    const dataset = request.getDataset();

    expect(request.getAffectedSopClassUid()).to.be.eq(
      SopClass.StudyRootQueryRetrieveInformationModelGet
    );
    expect(request.getCommandFieldType()).to.be.eq(CommandFieldType.CGetRequest);
    expect(request.getPriority()).to.be.eq(Priority.Medium);
    expect(request.hasDataset()).to.be.true;
    expect(dataset.getElement('StudyInstanceUID')).to.be.eq(uid);
    expect(dataset.getElement('QueryRetrieveLevel')).to.be.eq('STUDY');
  });

  it('should correctly create a C-GET response', () => {
    const response = new CGetResponse(Status.ProcessingFailure);

    expect(response.getAffectedSopClassUid()).to.be.eq(
      SopClass.StudyRootQueryRetrieveInformationModelGet
    );
    expect(response.getCommandFieldType()).to.be.eq(CommandFieldType.CGetResponse);
    expect(response.getStatus()).to.be.eq(Status.ProcessingFailure);
    expect(response.hasDataset()).to.be.false;
  });

  it('should correctly create a N-CREATE request', () => {
    const sopClassUid = Dataset.generateDerivedUid();
    const sopInstanceUid = Dataset.generateDerivedUid();
    const request = new NCreateRequest(sopClassUid, sopInstanceUid);

    expect(request.getAffectedSopClassUid()).to.be.eq(sopClassUid);
    expect(request.getAffectedSopInstanceUid()).to.be.eq(sopInstanceUid);
    expect(request.getCommandFieldType()).to.be.eq(CommandFieldType.NCreateRequest);
    expect(request.hasDataset()).to.be.false;
  });

  it('should correctly create a N-CREATE response', () => {
    const sopClassUid = Dataset.generateDerivedUid();
    const sopInstanceUid = Dataset.generateDerivedUid();
    const response = new NCreateResponse(sopClassUid, sopInstanceUid, Status.ProcessingFailure);

    expect(response.getAffectedSopClassUid()).to.be.eq(sopClassUid);
    expect(response.getAffectedSopInstanceUid()).to.be.eq(sopInstanceUid);
    expect(response.getCommandFieldType()).to.be.eq(CommandFieldType.NCreateResponse);
    expect(response.getStatus()).to.be.eq(Status.ProcessingFailure);
    expect(response.hasDataset()).to.be.false;
  });

  it('should correctly create a N-ACTION request', () => {
    const sopClassUid = Dataset.generateDerivedUid();
    const sopInstanceUid = Dataset.generateDerivedUid();
    const request = new NActionRequest(sopClassUid, sopInstanceUid, 0x0001);

    expect(request.getRequestedSopClassUid()).to.be.eq(sopClassUid);
    expect(request.getRequestedSopInstanceUid()).to.be.eq(sopInstanceUid);
    expect(request.getActionTypeId()).to.be.eq(0x0001);
    expect(request.getCommandFieldType()).to.be.eq(CommandFieldType.NActionRequest);
    expect(request.hasDataset()).to.be.false;
  });

  it('should correctly create a N-ACTION response', () => {
    const sopClassUid = Dataset.generateDerivedUid();
    const sopInstanceUid = Dataset.generateDerivedUid();
    const response = new NActionResponse(
      sopClassUid,
      sopInstanceUid,
      0x0002,
      Status.ProcessingFailure
    );

    expect(response.getAffectedSopClassUid()).to.be.eq(sopClassUid);
    expect(response.getAffectedSopInstanceUid()).to.be.eq(sopInstanceUid);
    expect(response.getActionTypeId()).to.be.eq(0x0002);
    expect(response.getCommandFieldType()).to.be.eq(CommandFieldType.NActionResponse);
    expect(response.getStatus()).to.be.eq(Status.ProcessingFailure);
    expect(response.hasDataset()).to.be.false;
  });

  it('should correctly create a N-DELETE request', () => {
    const sopClassUid = Dataset.generateDerivedUid();
    const sopInstanceUid = Dataset.generateDerivedUid();
    const request = new NDeleteRequest(sopClassUid, sopInstanceUid);

    expect(request.getRequestedSopClassUid()).to.be.eq(sopClassUid);
    expect(request.getRequestedSopInstanceUid()).to.be.eq(sopInstanceUid);
    expect(request.getCommandFieldType()).to.be.eq(CommandFieldType.NDeleteRequest);
    expect(request.hasDataset()).to.be.false;
  });

  it('should correctly create a N-DELETE response', () => {
    const sopClassUid = Dataset.generateDerivedUid();
    const sopInstanceUid = Dataset.generateDerivedUid();
    const response = new NDeleteResponse(sopClassUid, sopInstanceUid, Status.ProcessingFailure);

    expect(response.getAffectedSopClassUid()).to.be.eq(sopClassUid);
    expect(response.getAffectedSopInstanceUid()).to.be.eq(sopInstanceUid);
    expect(response.getCommandFieldType()).to.be.eq(CommandFieldType.NDeleteResponse);
    expect(response.getStatus()).to.be.eq(Status.ProcessingFailure);
    expect(response.hasDataset()).to.be.false;
  });

  it('should correctly create a N-EVENT-REPORT request', () => {
    const sopClassUid = Dataset.generateDerivedUid();
    const sopInstanceUid = Dataset.generateDerivedUid();
    const request = new NEventReportRequest(sopClassUid, sopInstanceUid, 0x0001);

    expect(request.getAffectedSopClassUid()).to.be.eq(sopClassUid);
    expect(request.getAffectedSopInstanceUid()).to.be.eq(sopInstanceUid);
    expect(request.getEventTypeId()).to.be.eq(0x0001);
    expect(request.getCommandFieldType()).to.be.eq(CommandFieldType.NEventReportRequest);
    expect(request.hasDataset()).to.be.false;
  });

  it('should correctly create a N-EVENT-REPORT response', () => {
    const sopClassUid = Dataset.generateDerivedUid();
    const sopInstanceUid = Dataset.generateDerivedUid();
    const response = new NEventReportResponse(
      sopClassUid,
      sopInstanceUid,
      0x0002,
      Status.ProcessingFailure
    );

    expect(response.getAffectedSopClassUid()).to.be.eq(sopClassUid);
    expect(response.getAffectedSopInstanceUid()).to.be.eq(sopInstanceUid);
    expect(response.getEventTypeId()).to.be.eq(0x0002);
    expect(response.getCommandFieldType()).to.be.eq(CommandFieldType.NEventReportResponse);
    expect(response.getStatus()).to.be.eq(Status.ProcessingFailure);
    expect(response.hasDataset()).to.be.false;
  });

  it('should correctly create a N-GET request', () => {
    const sopClassUid = Dataset.generateDerivedUid();
    const sopInstanceUid = Dataset.generateDerivedUid();
    const attributeIdentifierList = [
      'PatientID',
      'PatientName',
      'IssuerOfPatientID',
      'PatientSex',
      'PatientBirthDate',
      'StudyInstanceUID',
      'ModalitiesInStudy',
      'StudyID',
      'AccessionNumber',
      'StudyDate',
      'StudyTime',
      'StudyDescription',
      'NumberOfStudyRelatedSeries',
      'NumberOfStudyRelatedInstances',
    ];
    const request = new NGetRequest(sopClassUid, sopInstanceUid, attributeIdentifierList);

    expect(request.getRequestedSopClassUid()).to.be.eq(sopClassUid);
    expect(request.getRequestedSopInstanceUid()).to.be.eq(sopInstanceUid);
    expect(request.getAttributeIdentifierList()).to.have.members(attributeIdentifierList);
    expect(request.getCommandFieldType()).to.be.eq(CommandFieldType.NGetRequest);
    expect(request.hasDataset()).to.be.false;
  });

  it('should correctly create a N-GET response', () => {
    const sopClassUid = Dataset.generateDerivedUid();
    const sopInstanceUid = Dataset.generateDerivedUid();
    const response = new NGetResponse(sopClassUid, sopInstanceUid, Status.ProcessingFailure);

    expect(response.getAffectedSopClassUid()).to.be.eq(sopClassUid);
    expect(response.getAffectedSopInstanceUid()).to.be.eq(sopInstanceUid);
    expect(response.getCommandFieldType()).to.be.eq(CommandFieldType.NGetResponse);
    expect(response.getStatus()).to.be.eq(Status.ProcessingFailure);
    expect(response.hasDataset()).to.be.false;
  });

  it('should correctly create a N-SET request', () => {
    const sopClassUid = Dataset.generateDerivedUid();
    const sopInstanceUid = Dataset.generateDerivedUid();
    const request = new NSetRequest(sopClassUid, sopInstanceUid);

    expect(request.getRequestedSopClassUid()).to.be.eq(sopClassUid);
    expect(request.getRequestedSopInstanceUid()).to.be.eq(sopInstanceUid);
    expect(request.getCommandFieldType()).to.be.eq(CommandFieldType.NSetRequest);
    expect(request.hasDataset()).to.be.false;
  });

  it('should correctly create a N-SET response', () => {
    const sopClassUid = Dataset.generateDerivedUid();
    const sopInstanceUid = Dataset.generateDerivedUid();
    const response = new NSetResponse(sopClassUid, sopInstanceUid, Status.ProcessingFailure);

    expect(response.getAffectedSopClassUid()).to.be.eq(sopClassUid);
    expect(response.getAffectedSopInstanceUid()).to.be.eq(sopInstanceUid);
    expect(response.getCommandFieldType()).to.be.eq(CommandFieldType.NSetResponse);
    expect(response.getStatus()).to.be.eq(Status.ProcessingFailure);
    expect(response.hasDataset()).to.be.false;
  });
});
