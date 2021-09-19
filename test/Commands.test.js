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
} = require('./../src/Command');
const Dataset = require('../src/Dataset');
const { CommandFieldType, SopClass, TransferSyntax } = require('./../src/Constants');

const chai = require('chai');

const expect = chai.expect;

describe('Command', () => {
  it('should correctly create command', () => {
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

  it('should correctly create request', () => {
    const request = new Request(1, '1.2.3.4.5.6.7.8.9.0', 2, true);
    const commandDataset = request.getCommandDataset();

    expect(request.getAffectedSopClassUid()).to.be.eq('1.2.3.4.5.6.7.8.9.0');
    expect(request.hasDataset()).to.be.true;
    expect(commandDataset.getElement('CommandField')).to.be.eq(1);
  });

  it('should correctly create response', () => {
    const response = new Response(7, '1.2.3.4.5.6.7.8.9.0', false, 5, 'This is an error');
    const commandDataset = response.getCommandDataset();

    expect(response.getStatus()).to.be.eq(5);
    expect(response.getErrorComment()).to.be.eq('This is an error');
    expect(response.hasDataset()).to.be.false;
    expect(commandDataset.getElement('CommandField')).to.be.eq(7);
    expect(commandDataset.getElement('AffectedSOPClassUID')).to.be.eq('1.2.3.4.5.6.7.8.9.0');
  });

  it('should correctly create echo request', () => {
    const request = new CEchoRequest();

    expect(request.getAffectedSopClassUid()).to.be.eq(SopClass.Verification);
    expect(request.getCommandFieldType()).to.be.eq(CommandFieldType.CEchoRequest);
    expect(request.hasDataset()).to.be.false;
  });

  it('should correctly create echo response', () => {
    const response = new CEchoResponse();

    expect(response.getAffectedSopClassUid()).to.be.eq(SopClass.Verification);
    expect(response.getCommandFieldType()).to.be.eq(CommandFieldType.CEchoResponse);
    expect(response.hasDataset()).to.be.false;
  });

  it('should correctly create find request', () => {
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
    expect(request.hasDataset()).to.be.true;
    expect(dataset.getElement('PatientName')).to.be.eq('JOHN^DOE');
    expect(dataset.getElement('PatientID')).to.be.eq('12345678');
    expect(dataset.getElement('AccessionNumber')).to.be.eq('87654321');
    expect(dataset.getElement('QueryRetrieveLevel')).to.be.eq('STUDY');
  });

  it('should correctly create find response', () => {
    const response = new CFindResponse();

    expect(response.getAffectedSopClassUid()).to.be.eq(
      SopClass.StudyRootQueryRetrieveInformationModelFind
    );
    expect(response.getCommandFieldType()).to.be.eq(CommandFieldType.CFindResponse);
    expect(response.hasDataset()).to.be.false;
  });

  it('should correctly create store request', () => {
    const patientName = 'JOHN^DOE';
    const patientID = '12345678';
    const accessionNumber = '87654321';
    const studyDescription = 'THIS IS A STUDY';
    const seriesDescription = 'THIS IS A SERIES';

    const dataset = new Dataset(
      {
        SOPClassUID: '1.2.3.4.5.6.7.8.9',
        SOPInstanceUID: '9.8.7.6.5.4.3.2.1',
        PatientName: patientName,
        PatientID: patientID,
        AccessionNumber: accessionNumber,
        StudyDescription: studyDescription,
        SeriesDescription: seriesDescription,
      },
      TransferSyntax.ImplicitVRLittleEndian
    );

    const request = new CStoreRequest(dataset);

    expect(request.getAffectedSopClassUid()).to.be.eq('1.2.3.4.5.6.7.8.9');
    expect(request.getAffectedSopInstanceUid()).to.be.eq('9.8.7.6.5.4.3.2.1');
    expect(request.getCommandFieldType()).to.be.eq(CommandFieldType.CStoreRequest);
    expect(request.hasDataset()).to.be.true;
  });

  it('should correctly create store response', () => {
    const response = new CStoreResponse();

    expect(response.getAffectedSopClassUid()).to.be.eq('');
    expect(response.getCommandFieldType()).to.be.eq(CommandFieldType.CStoreResponse);
    expect(response.hasDataset()).to.be.false;
  });

  it('should correctly create move request', () => {
    const request = CMoveRequest.createStudyMoveRequest('DESTAET', '1.2.3.4.5.6.7.8.9');
    const dataset = request.getDataset();
    const commandDataset = request.getCommandDataset();

    expect(request.getAffectedSopClassUid()).to.be.eq(
      SopClass.StudyRootQueryRetrieveInformationModelMove
    );
    expect(request.getCommandFieldType()).to.be.eq(CommandFieldType.CMoveRequest);
    expect(request.hasDataset()).to.be.true;
    expect(dataset.getElement('StudyInstanceUID')).to.be.eq('1.2.3.4.5.6.7.8.9');
    expect(dataset.getElement('QueryRetrieveLevel')).to.be.eq('STUDY');
    expect(commandDataset.getElement('MoveDestination')).to.be.eq('DESTAET');
  });

  it('should correctly create move response', () => {
    const response = new CMoveResponse();

    expect(response.getAffectedSopClassUid()).to.be.eq(
      SopClass.StudyRootQueryRetrieveInformationModelMove
    );
    expect(response.getCommandFieldType()).to.be.eq(CommandFieldType.CMoveResponse);
    expect(response.hasDataset()).to.be.false;
  });

  it('should correctly create get request', () => {
    const request = CGetRequest.createStudyGetRequest('1.2.3.4.5.6.7.8.9');
    const dataset = request.getDataset();
    const commandDataset = request.getCommandDataset();

    expect(request.getAffectedSopClassUid()).to.be.eq(
      SopClass.StudyRootQueryRetrieveInformationModelGet
    );
    expect(request.getCommandFieldType()).to.be.eq(CommandFieldType.CGetRequest);
    expect(request.hasDataset()).to.be.true;
    expect(dataset.getElement('StudyInstanceUID')).to.be.eq('1.2.3.4.5.6.7.8.9');
    expect(dataset.getElement('QueryRetrieveLevel')).to.be.eq('STUDY');
  });

  it('should correctly create get response', () => {
    const response = new CGetResponse();

    expect(response.getAffectedSopClassUid()).to.be.eq(
      SopClass.StudyRootQueryRetrieveInformationModelGet
    );
    expect(response.getCommandFieldType()).to.be.eq(CommandFieldType.CGetResponse);
    expect(response.hasDataset()).to.be.false;
  });
});
