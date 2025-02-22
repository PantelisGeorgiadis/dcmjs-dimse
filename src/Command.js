const { CommandFieldType, Priority, SopClass, Status } = require('./Constants');
const Dataset = require('./Dataset');

const { Mixin } = require('ts-mixer');
const { EOL } = require('os');
const AsyncEventEmitter = require('async-eventemitter');
const dcmjs = require('dcmjs');
const { DicomMetaDictionary } = dcmjs.data;

//#region Command
class Command {
  /**
   * Creates an instance of Command.
   * @constructor
   * @param {Dataset} [commandDataset] - Command dataset.
   * @param {Dataset} [dataset] - Dataset.
   */
  constructor(commandDataset, dataset) {
    this.commandDataset = commandDataset || new Dataset();
    this.dataset = dataset;
  }

  /**
   * Gets command dataset.
   * @method
   * @returns {Dataset} Command dataset.
   */
  getCommandDataset() {
    return this.commandDataset;
  }

  /**
   * Sets command dataset.
   * @method
   * @param {Dataset} dataset - Command dataset.
   */
  setCommandDataset(dataset) {
    this.commandDataset = dataset;
  }

  /**
   * Gets dataset.
   * @method
   * @returns {Dataset|undefined} Dataset, if exists.
   */
  getDataset() {
    return this.dataset;
  }

  /**
   * Sets dataset and updates CommandDataSetType element.
   * @method
   * @param {Dataset} dataset - Dataset.
   */
  setDataset(dataset) {
    this.dataset = dataset;
    this.commandDataset.setElement('CommandDataSetType', this.dataset ? 0x0202 : 0x0101);
  }

  /**
   * Gets command field type.
   * @method
   * @returns {number} Command field type.
   */
  getCommandFieldType() {
    return this.commandDataset.getElement('CommandField');
  }

  /**
   * Command has dataset.
   * @method
   * @returns {boolean} Command has dataset.
   */
  hasDataset() {
    return this.commandDataset.getElement('CommandDataSetType') !== 0x0101;
  }

  /**
   * Gets the command description.
   * @method
   * @param {Object} [opts] - Description generation options.
   * @param {boolean} [opts.includeCommandDataset] - Include command dataset in the description.
   * @param {boolean} [opts.includeDataset] - Include dataset in the description.
   * @returns {string} Command description.
   */
  toString(opts) {
    const options = opts || {};
    const includeCommandDataset = options.includeCommandDataset || false;
    const includeDataset = options.includeDataset || false;

    const str = [];
    str.push(
      `${this._typeToString(this.getCommandFieldType())} [HasDataset: ${this.hasDataset()}]`
    );

    if (includeCommandDataset) {
      str.push('DIMSE Command Dataset:');
      str.push('='.repeat(50));
      str.push(JSON.stringify(this.commandDataset.getElements()));
    }
    if (includeDataset && this.dataset) {
      str.push('DIMSE Dataset:');
      str.push('='.repeat(50));
      str.push(JSON.stringify(this.dataset.getElements()));
    }

    return str.join(EOL);
  }

  //#region Private Methods
  /**
   * Returns a readable string from message type.
   * @method
   * @private
   * @param {number} type - Command field type.
   * @returns {string} Readable string.
   */
  _typeToString(type) {
    switch (type) {
      case CommandFieldType.CCancelRequest:
        return 'C-CANCEL RQ';
      case CommandFieldType.CEchoRequest:
        return 'C-ECHO RQ';
      case CommandFieldType.CEchoResponse:
        return 'C-ECHO RSP';
      case CommandFieldType.CFindRequest:
        return 'C-FIND RQ';
      case CommandFieldType.CFindResponse:
        return 'C-FIND RSP';
      case CommandFieldType.CGetRequest:
        return 'C-GET RQ';
      case CommandFieldType.CGetResponse:
        return 'C-GET RSP';
      case CommandFieldType.CMoveRequest:
        return 'C-MOVE RQ';
      case CommandFieldType.CMoveResponse:
        return 'C-MOVE RSP';
      case CommandFieldType.CStoreRequest:
        return 'C-STORE RQ';
      case CommandFieldType.CStoreResponse:
        return 'C-STORE RSP';
      case CommandFieldType.NActionRequest:
        return 'N-ACTION RQ';
      case CommandFieldType.NActionResponse:
        return 'N-ACTION RSP';
      case CommandFieldType.NCreateRequest:
        return 'N-CREATE RQ';
      case CommandFieldType.NCreateResponse:
        return 'N-CREATE RSP';
      case CommandFieldType.NDeleteRequest:
        return 'N-DELETE RQ';
      case CommandFieldType.NDeleteResponse:
        return 'N-DELETE RSP';
      case CommandFieldType.NEventReportRequest:
        return 'N-EVENT-REPORT RQ';
      case CommandFieldType.NEventReportResponse:
        return 'N-EVENT-REPORT RSP';
      case CommandFieldType.NGetRequest:
        return 'N-GET RQ';
      case CommandFieldType.NGetResponse:
        return 'N-GET RSP';
      case CommandFieldType.NSetRequest:
        return 'N-SET RQ';
      case CommandFieldType.NSetResponse:
        return 'N-SET RSP';
      default:
        return `${type}`;
    }
  }
  //#endregion
}
//#endregion

//#region Request
class Request extends Mixin(Command, AsyncEventEmitter) {
  /**
   * Creates an instance of Request.
   * @constructor
   * @param {number} type - Command field type.
   * @param {string} affectedOrRequestedClassUid - Affected or requested SOP Class UID.
   * @param {boolean} hasDataset - Request has dataset.
   * @param {string} [metaSopClassUid] - Meta SOP Class UID.
   */
  constructor(type, affectedOrRequestedClassUid, hasDataset, metaSopClassUid) {
    super(
      new Dataset({
        CommandField: type,
        CommandDataSetType: hasDataset ? 0x0202 : 0x0101,
      })
    );
    switch (type) {
      case CommandFieldType.NGetRequest:
      case CommandFieldType.NSetRequest:
      case CommandFieldType.NActionRequest:
      case CommandFieldType.NDeleteRequest:
        this.setRequestedSopClassUid(affectedOrRequestedClassUid);
        break;
      default:
        this.setAffectedSopClassUid(affectedOrRequestedClassUid);
        break;
    }
    this.metaSopClassUid = metaSopClassUid;
  }

  /**
   * Gets affected SOP class UID.
   * @method
   * @returns {string} Affected SOP class UID.
   */
  getAffectedSopClassUid() {
    const command = this.getCommandDataset();
    return command.getElement('AffectedSOPClassUID');
  }

  /**
   * Sets affected SOP class UID.
   * @method
   * @param {string} affectedSopClassUid - Affected SOP class UID.
   */
  setAffectedSopClassUid(affectedSopClassUid) {
    const command = this.getCommandDataset();
    command.setElement('AffectedSOPClassUID', affectedSopClassUid);
  }

  /**
   * Gets requested SOP class UID.
   * @method
   * @returns {string} Requested SOP class UID.
   */
  getRequestedSopClassUid() {
    const command = this.getCommandDataset();
    return command.getElement('RequestedSOPClassUID');
  }

  /**
   * Sets requested SOP class UID.
   * @method
   * @param {string} requestedSopClassUid - Requested SOP class UID.
   */
  setRequestedSopClassUid(requestedSopClassUid) {
    const command = this.getCommandDataset();
    command.setElement('RequestedSOPClassUID', requestedSopClassUid);
  }

  /**
   * Gets meta SOP class UID.
   * @method
   * @returns {string} Meta SOP class UID.
   */
  getMetaSopClassUid() {
    return this.metaSopClassUid;
  }

  /**
   * Sets meta SOP class UID.
   * @method
   * @param {string} metaSopClassUid - Meta SOP class UID.
   */
  setMetaSopClassUid(metaSopClassUid) {
    this.metaSopClassUid = metaSopClassUid;
  }

  /**
   * Gets affected SOP instance UID.
   * @method
   * @returns {string} Affected SOP instance UID.
   */
  getAffectedSopInstanceUid() {
    const command = this.getCommandDataset();
    return command.getElement('AffectedSOPInstanceUID');
  }

  /**
   * Sets affected SOP instance UID.
   * @method
   * @param {string} affectedSopInstanceUid - Affected SOP instance UID.
   */
  setAffectedSopInstanceUid(affectedSopInstanceUid) {
    const command = this.getCommandDataset();
    command.setElement('AffectedSOPInstanceUID', affectedSopInstanceUid);
  }

  /**
   * Gets requested SOP instance UID.
   * @method
   * @returns {string} Requested SOP instance UID.
   */
  getRequestedSopInstanceUid() {
    const command = this.getCommandDataset();
    return command.getElement('RequestedSOPInstanceUID');
  }

  /**
   * Sets requested SOP instance UID.
   * @method
   * @param {string} requestedSopInstanceUid - Requested SOP instance UID.
   */
  setRequestedSopInstanceUid(requestedSopInstanceUid) {
    const command = this.getCommandDataset();
    command.setElement('RequestedSOPInstanceUID', requestedSopInstanceUid);
  }

  /**
   * Gets request message ID.
   * @method
   * @return {number} Request message ID.
   */
  getMessageId() {
    const command = this.getCommandDataset();
    return command.getElement('MessageID');
  }

  /**
   * Sets request message ID.
   * @method
   * @param {number} messageId - Request message ID.
   */
  setMessageId(messageId) {
    const command = this.getCommandDataset();
    command.setElement('MessageID', messageId);
  }

  /**
   * Raise response event.
   * @method
   * @param {Response} response - Response.
   */
  raiseResponseEvent(response) {
    this.emit('response', response);
  }

  /**
   * Raise instance event.
   * Special event for datasets coming from C-GET operations,
   * as C-STORE requests.
   * @method
   * @param {Dataset} dataset - Dataset.
   */
  raiseInstanceEvent(dataset) {
    this.emit('instance', dataset);
  }

  /**
   * Raise done event.
   * @method
   */
  raiseDoneEvent() {
    this.emit('done');
  }

  /**
   * Gets the request description.
   * @method
   * @param {Object} [opts] - Description generation options.
   * @param {boolean} [opts.includeCommandDataset] - Include command dataset in the description.
   * @param {boolean} [opts.includeDataset] - Include dataset in the description.
   * @return {string} Request description.
   */
  toString(opts) {
    return `${super.toString(opts)} [id: ${this.getMessageId() || ''}]`;
  }
}
//#endregion

//#region Response
class Response extends Command {
  /**
   * Creates an instance of Response.
   * @constructor
   * @param {number} type - Command field type.
   * @param {string} affectedOrRequestedClassUid - Affected or requested SOP Class UID.
   * @param {boolean} hasDataset - Response has dataset.
   * @param {number} status - Response status.
   * @param {string} errorComment - Response error comment.
   */
  constructor(type, affectedOrRequestedClassUid, hasDataset, status, errorComment) {
    super(
      new Dataset({
        CommandField: type,
        CommandDataSetType: hasDataset ? 0x0202 : 0x0101,
        Status: status,
        ErrorComment: errorComment,
      })
    );
    switch (type) {
      case CommandFieldType.NGetRequest:
      case CommandFieldType.NSetRequest:
      case CommandFieldType.NActionRequest:
      case CommandFieldType.NDeleteRequest:
        this.setRequestedSopClassUid(affectedOrRequestedClassUid);
        break;
      default:
        this.setAffectedSopClassUid(affectedOrRequestedClassUid);
        break;
    }
  }

  /**
   * Gets affected SOP class UID.
   * @method
   * @returns {string} Affected SOP class UID.
   */
  getAffectedSopClassUid() {
    const command = this.getCommandDataset();
    return command.getElement('AffectedSOPClassUID');
  }

  /**
   * Sets affected SOP class UID.
   * @method
   * @param {string} affectedSopClassUid - Affected SOP class UID.
   */
  setAffectedSopClassUid(affectedSopClassUid) {
    const command = this.getCommandDataset();
    command.setElement('AffectedSOPClassUID', affectedSopClassUid);
  }

  /**
   * Gets requested SOP class UID.
   * @method
   * @returns {string} Requested SOP class UID.
   */
  getRequestedSopClassUid() {
    const command = this.getCommandDataset();
    return command.getElement('RequestedSOPClassUID');
  }

  /**
   * Sets requested SOP class UID.
   * @method
   * @param {string} requestedSopClassUid - Requested SOP class UID.
   */
  setRequestedSopClassUid(requestedSopClassUid) {
    const command = this.getCommandDataset();
    command.setElement('RequestedSOPClassUID', requestedSopClassUid);
  }

  /**
   * Gets affected SOP instance UID.
   * @method
   * @returns {string} Affected SOP instance UID.
   */
  getAffectedSopInstanceUid() {
    const command = this.getCommandDataset();
    return command.getElement('AffectedSOPInstanceUID');
  }

  /**
   * Sets affected SOP instance UID.
   * @method
   * @param {string} affectedSopInstanceUid - Affected SOP instance UID.
   */
  setAffectedSopInstanceUid(affectedSopInstanceUid) {
    const command = this.getCommandDataset();
    command.setElement('AffectedSOPInstanceUID', affectedSopInstanceUid);
  }

  /**
   * Gets requested SOP instance UID.
   * @method
   * @returns {string} Requested SOP instance UID.
   */
  getRequestedSopInstanceUid() {
    const command = this.getCommandDataset();
    return command.getElement('RequestedSOPInstanceUID');
  }

  /**
   * Sets requested SOP instance UID.
   * @method
   * @param {string} requestedSopInstanceUid - Requested SOP instance UID.
   */
  setRequestedSopInstanceUid(requestedSopInstanceUid) {
    const command = this.getCommandDataset();
    command.setElement('RequestedSOPInstanceUID', requestedSopInstanceUid);
  }

  /**
   * Gets status.
   * @method
   * @returns {number} Status.
   */
  getStatus() {
    const command = this.getCommandDataset();
    return command.getElement('Status');
  }

  /**
   * Sets status.
   * @method
   * @param {number} status - Status.
   */
  setStatus(status) {
    const command = this.getCommandDataset();
    command.setElement('Status', status);
  }

  /**
   * Gets error comment.
   * @method
   * @returns {string} Error comment.
   */
  getErrorComment() {
    const command = this.getCommandDataset();
    return command.getElement('ErrorComment');
  }

  /**
   * Sets error comment.
   * @method
   * @param {string} errorComment - Error comment.
   */
  setErrorComment(errorComment) {
    const command = this.getCommandDataset();
    command.setElement('ErrorComment', errorComment);
  }

  /**
   * Gets response message ID.
   * @method
   * @return {number} Response message ID.
   */
  getMessageIdBeingRespondedTo() {
    const command = this.getCommandDataset();
    return command.getElement('MessageIDBeingRespondedTo');
  }

  /**
   * Sets response message ID.
   * @method
   * @param {number} messageId - Response message ID.
   */
  setMessageIdBeingRespondedTo(messageId) {
    const command = this.getCommandDataset();
    command.setElement('MessageIDBeingRespondedTo', messageId);
  }

  /**
   * Gets the response description.
   * @method
   * @param {Object} [opts] - Description generation options.
   * @param {boolean} [opts.includeCommandDataset] - Include command dataset in the description.
   * @param {boolean} [opts.includeDataset] - Include dataset in the description.
   * @return {string} Response description.
   */
  toString(opts) {
    return `${super.toString(opts)} [id: ${
      this.getMessageIdBeingRespondedTo() || ''
    }; status: ${this._statusToString(this.getStatus())}]`;
  }

  //#region Private Methods
  /**
   * Returns a readable string from status.
   * @method
   * @private
   * @param {number} status - Status code.
   * @returns {string} Readable status string.
   */
  _statusToString(status) {
    switch (status) {
      case Status.Success:
        return 'Success';
      case Status.Cancel:
        return 'Cancel';
      case Status.Pending:
        return 'Pending';
      case Status.SopClassNotSupported:
        return 'SOP Class Not Supported';
      case Status.ClassInstanceConflict:
        return 'Class Instance Conflict';
      case Status.DuplicateSOPInstance:
        return 'Duplicate SOP Instance';
      case Status.DuplicateInvocation:
        return 'Duplicate Invocation';
      case Status.InvalidArgumentValue:
        return 'Invalid Argument Value';
      case Status.InvalidAttributeValue:
        return 'Invalid Attribute Value';
      case Status.InvalidObjectInstance:
        return 'Invalid Object Instance';
      case Status.MissingAttribute:
        return 'Missing Attribute';
      case Status.MissingAttributeValue:
        return 'Missing Attribute Value';
      case Status.MistypedArgument:
        return 'Mistyped Argument';
      case Status.NoSuchArgument:
        return 'No Such Argument';
      case Status.NoSuchEventType:
        return 'No Such Event Type';
      case Status.NoSuchObjectInstance:
        return 'No Such Object Instance';
      case Status.NoSuchSopClass:
        return 'No Such SOP Class';
      case Status.ProcessingFailure:
        return 'Processing Failure';
      case Status.ResourceLimitation:
        return 'Resource Limitation';
      case Status.UnrecognizedOperation:
        return 'Unrecognized Operation';
      case Status.NoSuchActionType:
        return 'No Such Action Type';
      default:
        return `${status}`;
    }
  }
  //#endregion
}
//#endregion

//#region CEchoRequest
class CEchoRequest extends Request {
  /**
   * Creates an instance of CEchoRequest.
   * @constructor
   */
  constructor() {
    super(CommandFieldType.CEchoRequest, SopClass.Verification, false);
  }
}
//#endregion

//#region CEchoResponse
class CEchoResponse extends Response {
  /**
   * Creates an instance of CEchoResponse.
   * @constructor
   * @param {number} status - Response status.
   * @param {string} errorComment - Error comment.
   */
  constructor(status, errorComment) {
    super(CommandFieldType.CEchoResponse, SopClass.Verification, false, status, errorComment);
  }

  /**
   * Creates a C-ECHO response from a request.
   * @method
   * @static
   * @param {CEchoRequest} request - C-ECHO request.
   * @returns {CEchoResponse} C-ECHO response.
   * @throws {Error} If request is not an instance of CEchoRequest.
   */
  static fromRequest(request) {
    if (!(request instanceof CEchoRequest)) {
      throw new Error('Request should be an instance of CEchoRequest');
    }
    const response = new CEchoResponse(Status.ProcessingFailure);
    response.setMessageIdBeingRespondedTo(request.getMessageId());

    return response;
  }
}
//#endregion

//#region CFindRequest
class CFindRequest extends Request {
  /**
   * Creates an instance of CFindRequest.
   * @constructor
   * @param {Priority} [priority] - Request priority.
   */
  constructor(priority) {
    super(
      CommandFieldType.CFindRequest,
      SopClass.StudyRootQueryRetrieveInformationModelFind,
      false
    );
    this.setPriority(priority || Priority.Medium);
  }

  /**
   * Gets request priority.
   * @method
   * @return {Priority} Request priority.
   */
  getPriority() {
    const command = this.getCommandDataset();
    return command.getElement('Priority');
  }

  /**
   * Sets request priority.
   * @method
   * @param {Priority} priority - Request request priority.
   */
  setPriority(priority) {
    const command = this.getCommandDataset();
    command.setElement('Priority', priority);
  }

  /**
   * Creates study find request.
   * @method
   * @static
   * @param {Object} elements - Find request dataset elements.
   * @param {Priority} [priority] - Request priority.
   * @return {CFindRequest} Study find request.
   */
  static createStudyFindRequest(elements, priority) {
    const baseElements = {
      PatientID: '',
      PatientName: '',
      IssuerOfPatientID: '',
      PatientSex: '',
      PatientBirthDate: '',
      StudyInstanceUID: '',
      ModalitiesInStudy: '',
      StudyID: '',
      AccessionNumber: '',
      StudyDate: '',
      StudyTime: '',
      StudyDescription: '',
      NumberOfStudyRelatedSeries: '',
      NumberOfStudyRelatedInstances: '',
    };
    const mergedElements = { ...baseElements, ...elements };
    mergedElements.QueryRetrieveLevel = 'STUDY';

    const findRequest = new CFindRequest(priority);
    findRequest.setDataset(new Dataset(mergedElements));

    return findRequest;
  }

  /**
   * Creates series find request.
   * @method
   * @static
   * @param {Object} elements - Find request dataset elements.
   * @param {Priority} [priority] - Request priority.
   * @return {CFindRequest} Series find request.
   */
  static createSeriesFindRequest(elements, priority) {
    const baseElements = {
      StudyInstanceUID: '',
      SeriesInstanceUID: '',
      SeriesNumber: '',
      SeriesDescription: '',
      Modality: '',
      SeriesDate: '',
      SeriesTime: '',
      NumberOfSeriesRelatedInstances: '',
    };
    const mergedElements = { ...baseElements, ...elements };
    mergedElements.QueryRetrieveLevel = 'SERIES';

    const findRequest = new CFindRequest(priority);
    findRequest.setDataset(new Dataset(mergedElements));

    return findRequest;
  }

  /**
   * Creates image find request.
   * @method
   * @static
   * @param {Object} elements - Find request dataset elements.
   * @param {Priority} [priority] - Request priority.
   * @return {CFindRequest} Image find request.
   */
  static createImageFindRequest(elements, priority) {
    const baseElements = {
      StudyInstanceUID: '',
      SeriesInstanceUID: '',
      SOPInstanceUID: '',
      InstanceNumber: '',
      Modality: '',
    };
    const mergedElements = { ...baseElements, ...elements };
    mergedElements.QueryRetrieveLevel = 'IMAGE';

    const findRequest = new CFindRequest(priority);
    findRequest.setDataset(new Dataset(mergedElements));

    return findRequest;
  }

  /**
   * Creates worklist find request.
   * @method
   * @static
   * @param {Object} elements - Find request dataset elements.
   * @param {Priority} [priority] - Request priority.
   * @return {CFindRequest} Worklist find request.
   */
  static createWorklistFindRequest(elements, priority) {
    const baseElements = {
      PatientID: '',
      PatientName: '',
      IssuerOfPatientID: '',
      PatientSex: '',
      PatientWeight: '',
      PatientBirthDate: '',
      MedicalAlerts: '',
      PregnancyStatus: '',
      Allergies: '',
      PatientComments: '',
      SpecialNeeds: '',
      PatientState: '',
      CurrentPatientLocation: '',
      InstitutionName: '',
      AdmissionID: '',
      AccessionNumber: '',
      ReferringPhysicianName: '',
      AdmittingDiagnosesDescription: '',
      RequestingPhysician: '',
      StudyInstanceUID: '',
      StudyDescription: '',
      StudyID: '',
      ReasonForTheRequestedProcedure: '',
      StudyDate: '',
      StudyTime: '',

      RequestedProcedureID: '',
      RequestedProcedureDescription: '',
      RequestedProcedurePriority: '',
      RequestedProcedureCodeSequence: [],
      ReferencedStudySequence: [],
      ProcedureCodeSequence: [],

      ScheduledProcedureStepSequence: [
        {
          ScheduledStationAETitle: '',
          ScheduledStationName: '',
          ScheduledProcedureStepStartDate: '',
          ScheduledProcedureStepStartTime: '',
          Modality: '',
          ScheduledPerformingPhysicianName: '',
          ScheduledProcedureStepDescription: '',
          ScheduledProtocolCodeSequence: [],
          ScheduledProcedureStepLocation: '',
          ScheduledProcedureStepID: '',
          RequestedContrastAgent: '',
          PreMedication: '',
          AnatomicalOrientationType: '',
        },
      ],
    };
    const mergedElements = { ...baseElements, ...elements };
    mergedElements.QueryRetrieveLevel = '';

    const findRequest = new CFindRequest(priority);
    findRequest.setAffectedSopClassUid(SopClass.ModalityWorklistInformationModelFind);
    findRequest.setDataset(new Dataset(mergedElements));

    return findRequest;
  }
}
//#endregion

//#region CFindResponse
class CFindResponse extends Response {
  /**
   * Creates an instance of CEchoResponse.
   * @constructor
   * @param {number} status - Response status.
   * @param {string} errorComment - Error comment.
   */
  constructor(status, errorComment) {
    super(
      CommandFieldType.CFindResponse,
      SopClass.StudyRootQueryRetrieveInformationModelFind,
      false,
      status,
      errorComment
    );
  }

  /**
   * Creates a C-FIND response from a request.
   * @method
   * @static
   * @param {CFindRequest} request - C-FIND request.
   * @returns {CFindResponse} C-FIND response.
   * @throws {Error} If request is not an instance of CFindRequest.
   */
  static fromRequest(request) {
    if (!(request instanceof CFindRequest)) {
      throw new Error('Request should be an instance of CFindRequest');
    }
    const response = new CFindResponse(Status.ProcessingFailure);
    response.setMessageIdBeingRespondedTo(request.getMessageId());

    return response;
  }
}
//#endregion

//#region CStoreRequest
class CStoreRequest extends Request {
  /**
   * Creates an instance of CStoreRequest.
   * @constructor
   * @param {Dataset|string} datasetOrFile - Dataset or part10 file path.
   * @param {Priority} [priority] - Request priority.
   */
  constructor(datasetOrFile, priority) {
    super(CommandFieldType.CStoreRequest, '', false);
    this.setPriority(priority || Priority.Medium);
    this.additionalTransferSyntaxes = [];

    if (datasetOrFile instanceof Dataset) {
      this.setAffectedSopClassUid(datasetOrFile.getElement('SOPClassUID'));
      this.setAffectedSopInstanceUid(datasetOrFile.getElement('SOPInstanceUID'));
      this.setDataset(datasetOrFile);
      return;
    }
    if (typeof datasetOrFile === 'string' || datasetOrFile instanceof String) {
      const dataset = Dataset.fromFile(datasetOrFile, undefined, {
        untilTag: '00080018', // SOPInstanceUID
        includeUntilTagValue: true,
      });
      this.setAffectedSopClassUid(dataset.getElement('SOPClassUID'));
      this.setAffectedSopInstanceUid(dataset.getElement('SOPInstanceUID'));
      this.setDataset(dataset);

      this.needsFullDatasetLoading = true;
      this.datasetOrFile = datasetOrFile;
    }
  }

  /**
   * Gets request priority.
   * @method
   * @return {Priority} Request priority.
   */
  getPriority() {
    const command = this.getCommandDataset();
    return command.getElement('Priority');
  }

  /**
   * Sets request priority.
   * @method
   * @param {Priority} priority - Request request priority.
   */
  setPriority(priority) {
    const command = this.getCommandDataset();
    command.setElement('Priority', priority);
  }

  /**
   * Gets additional transfer syntaxes to propose in the association request.
   * @method
   * @return {Array<string>} Additional transfer syntaxes to propose in the association request.
   */
  getAdditionalTransferSyntaxes() {
    return this.additionalTransferSyntaxes;
  }

  /**
   * Sets additional transfer syntaxes to propose in the association request.
   * Dataset will be transcoded on the fly, if necessary.
   * @method
   * @param {string|Array<string>} priority - Additional transfer syntaxes to propose in the association request.
   */
  setAdditionalTransferSyntaxes(transferSyntaxUids) {
    const syntaxes = Array.isArray(transferSyntaxUids) ? transferSyntaxUids : [transferSyntaxUids];
    this.additionalTransferSyntaxes.push(...syntaxes);
  }

  /**
   * Loads the full dataset when, during the command construction,
   * only the minimum necessary tags were loaded (e.g. loaded from file).
   * @method
   */
  loadFullDatasetIfNeeded() {
    if (
      this.needsFullDatasetLoading !== undefined &&
      this.needsFullDatasetLoading === true &&
      this.datasetOrFile !== undefined &&
      this.datasetOrFile.trim() !== ''
    ) {
      this.setDataset(Dataset.fromFile(this.datasetOrFile));
    }
  }
}
//#endregion

//#region CStoreResponse
class CStoreResponse extends Response {
  /**
   * Creates an instance of CStoreResponse.
   * @constructor
   * @param {number} status - Response status.
   * @param {string} errorComment - Error comment.
   */
  constructor(status, errorComment) {
    super(CommandFieldType.CStoreResponse, '', false, status, errorComment);
  }

  /**
   * Creates a C-STORE response from a request.
   * @method
   * @static
   * @param {CStoreRequest} request - C-STORE request.
   * @returns {CStoreResponse} C-STORE response.
   * @throws {Error} If request is not an instance of CStoreRequest.
   */
  static fromRequest(request) {
    if (!(request instanceof CStoreRequest)) {
      throw new Error('Request should be an instance of CStoreRequest');
    }
    const response = new CStoreResponse(Status.ProcessingFailure);
    response.setMessageIdBeingRespondedTo(request.getMessageId());
    response.setAffectedSopClassUid(request.getAffectedSopClassUid());
    response.setAffectedSopInstanceUid(request.getAffectedSopInstanceUid());

    return response;
  }
}
//#endregion

//#region CMoveRequest
class CMoveRequest extends Request {
  /**
   * Creates an instance of CMoveRequest.
   * @constructor
   * @param {Priority} [priority] - Request priority.
   */
  constructor(priority) {
    super(
      CommandFieldType.CMoveRequest,
      SopClass.StudyRootQueryRetrieveInformationModelMove,
      false
    );
    this.setPriority(priority || Priority.Medium);
  }

  /**
   * Gets request priority.
   * @method
   * @return {Priority} Request priority.
   */
  getPriority() {
    const command = this.getCommandDataset();
    return command.getElement('Priority');
  }

  /**
   * Sets request priority.
   * @method
   * @param {Priority} priority - Request request priority.
   */
  setPriority(priority) {
    const command = this.getCommandDataset();
    command.setElement('Priority', priority);
  }

  /**
   * Creates study move request.
   * @method
   * @static
   * @param {string} destinationAet - Move destination AET.
   * @param {string} studyInstanceUid - Study instance UID of the study to move.
   * @param {Priority} [priority] - Request priority.
   * @return {CMoveRequest} Study move request.
   */
  static createStudyMoveRequest(destinationAet, studyInstanceUid, priority) {
    const elements = {
      StudyInstanceUID: studyInstanceUid,
      QueryRetrieveLevel: 'STUDY',
    };

    const moveRequest = new CMoveRequest(priority);
    moveRequest.setDataset(new Dataset(elements));

    const command = moveRequest.getCommandDataset();
    command.setElement('MoveDestination', destinationAet);

    return moveRequest;
  }

  /**
   * Creates series move request.
   * @method
   * @static
   * @param {string} destinationAet - Move destination AET.
   * @param {string} studyInstanceUid - Study instance UID of the study to move.
   * @param {string} seriesInstanceUid - Series instance UID of the series to move.
   * @param {Priority} [priority] - Request priority.
   * @return {CMoveRequest} Series move request.
   */
  static createSeriesMoveRequest(destinationAet, studyInstanceUid, seriesInstanceUid, priority) {
    const elements = {
      StudyInstanceUID: studyInstanceUid,
      SeriesInstanceUID: seriesInstanceUid,
      QueryRetrieveLevel: 'SERIES',
    };

    const moveRequest = new CMoveRequest(priority);
    moveRequest.setDataset(new Dataset(elements));

    const command = moveRequest.getCommandDataset();
    command.setElement('MoveDestination', destinationAet);

    return moveRequest;
  }

  /**
   * Creates image move request.
   * @method
   * @static
   * @param {string} destinationAet - Move destination AET.
   * @param {string} studyInstanceUid - Study instance UID of the study to move.
   * @param {string} seriesInstanceUid - Series instance UID of the series to move.
   * @param {string} sopInstanceUid - SOP instance UID of the series to move.
   * @param {Priority} [priority] - Request priority.
   * @return {CMoveRequest} Image move request.
   */
  static createImageMoveRequest(
    destinationAet,
    studyInstanceUid,
    seriesInstanceUid,
    sopInstanceUid,
    priority
  ) {
    const elements = {
      StudyInstanceUID: studyInstanceUid,
      SeriesInstanceUID: seriesInstanceUid,
      SOPInstanceUID: sopInstanceUid,
      QueryRetrieveLevel: 'IMAGE',
    };

    const moveRequest = new CMoveRequest(priority);
    moveRequest.setDataset(new Dataset(elements));

    const command = moveRequest.getCommandDataset();
    command.setElement('MoveDestination', destinationAet);

    return moveRequest;
  }
}
//#endregion

//#region CMoveResponse
class CMoveResponse extends Response {
  /**
   * Creates an instance of CMoveResponse.
   * @constructor
   * @param {number} status - Response status.
   * @param {string} errorComment - Error comment.
   */
  constructor(status, errorComment) {
    super(
      CommandFieldType.CMoveResponse,
      SopClass.StudyRootQueryRetrieveInformationModelMove,
      false,
      status,
      errorComment
    );
  }

  /**
   * Gets remaining sub operations.
   * @method
   * @returns {number} Remaining sub operations.
   */
  getRemaining() {
    const command = this.getCommandDataset();
    return command.getElement('NumberOfRemainingSuboperations');
  }

  /**
   * Gets completed sub operations.
   * @method
   * @returns {number} Completed sub operations.
   */
  getCompleted() {
    const command = this.getCommandDataset();
    return command.getElement('NumberOfCompletedSuboperations');
  }

  /**
   * Gets sub operations with warnings.
   * @method
   * @returns {number} Sub operations with warnings.
   */
  getWarnings() {
    const command = this.getCommandDataset();
    return command.getElement('NumberOfWarningSuboperations');
  }

  /**
   * Gets failed sub operations.
   * @method
   * @returns {number} Failed sub operations.
   */
  getFailures() {
    const command = this.getCommandDataset();
    return command.getElement('NumberOfFailedSuboperations');
  }

  /**
   * Creates a C-MOVE response from a request.
   * @method
   * @static
   * @param {CMoveRequest} request - C-MOVE request.
   * @returns {CMoveResponse} C-MOVE response.
   * @throws {Error} If request is not an instance of CMoveRequest.
   */
  static fromRequest(request) {
    if (!(request instanceof CMoveRequest)) {
      throw new Error('Request should be an instance of CMoveRequest');
    }
    const response = new CMoveResponse(Status.ProcessingFailure);
    response.setMessageIdBeingRespondedTo(request.getMessageId());

    return response;
  }
}
//#endregion

//#region CGetRequest
class CGetRequest extends Request {
  /**
   * Creates an instance of CGetRequest.
   * @constructor
   * @param {Priority} [priority] - Request priority.
   */
  constructor(priority) {
    super(CommandFieldType.CGetRequest, SopClass.StudyRootQueryRetrieveInformationModelGet, false);
    this.setPriority(priority || Priority.Medium);
    this.addStorageSopClassesToAssociation = true;
  }

  /**
   * Gets request priority.
   * @method
   * @return {Priority} Request priority.
   */
  getPriority() {
    const command = this.getCommandDataset();
    return command.getElement('Priority');
  }

  /**
   * Sets request priority.
   * @method
   * @param {Priority} priority - Request request priority.
   */
  setPriority(priority) {
    const command = this.getCommandDataset();
    command.setElement('Priority', priority);
  }

  /**
   * Gets the flag indicating whether to add all known storage SOP
   * classes, as presentation contexts, during the association.
   * @method
   * @return {boolean} Flag indicating whether to add all known storage SOP classes.
   */
  getAddStorageSopClassesToAssociation() {
    return this.addStorageSopClassesToAssociation;
  }

  /**
   * Sets the flag indicating whether to add all known storage SOP
   * classes, as presentation contexts, during the association.
   * @method
   * @param {boolean} add - Flag indicating whether to add all known storage SOP classes.
   */
  setAddStorageSopClassesToAssociation(add) {
    this.addStorageSopClassesToAssociation = add;
  }

  /**
   * Creates study get request.
   * @method
   * @static
   * @param {string} studyInstanceUid - Study instance UID of the study to get.
   * @param {Priority} [priority] - Request priority.
   * @return {CGetRequest} Study get request.
   */
  static createStudyGetRequest(studyInstanceUid, priority) {
    const elements = {
      StudyInstanceUID: studyInstanceUid,
      QueryRetrieveLevel: 'STUDY',
    };

    const getRequest = new CGetRequest(priority);
    getRequest.setDataset(new Dataset(elements));

    return getRequest;
  }

  /**
   * Creates series get request.
   * @method
   * @static
   * @param {string} studyInstanceUid - Study instance UID of the study to get.
   * @param {string} seriesInstanceUid - Series instance UID of the series to get.
   * @param {Priority} [priority] - Request priority.
   * @return {CGetRequest} Series get request.
   */
  static createSeriesGetRequest(studyInstanceUid, seriesInstanceUid, priority) {
    const elements = {
      StudyInstanceUID: studyInstanceUid,
      SeriesInstanceUID: seriesInstanceUid,
      QueryRetrieveLevel: 'SERIES',
    };

    const getRequest = new CGetRequest(priority);
    getRequest.setDataset(new Dataset(elements));

    return getRequest;
  }

  /**
   * Creates image get request.
   * @method
   * @static
   * @param {string} studyInstanceUid - Study instance UID of the study to get.
   * @param {string} seriesInstanceUid - Series instance UID of the series to get.
   * @param {string} sopInstanceUid - SOP instance UID of the series to get.
   * @param {Priority} [priority] - Request priority.
   * @return {CGetRequest} Image get request.
   */
  static createImageGetRequest(studyInstanceUid, seriesInstanceUid, sopInstanceUid, priority) {
    const elements = {
      StudyInstanceUID: studyInstanceUid,
      SeriesInstanceUID: seriesInstanceUid,
      SOPInstanceUID: sopInstanceUid,
      QueryRetrieveLevel: 'IMAGE',
    };

    const getRequest = new CGetRequest(priority);
    getRequest.setDataset(new Dataset(elements));

    return getRequest;
  }
}
//#endregion

//#region CGetResponse
class CGetResponse extends Response {
  /**
   * Creates an instance of CGetResponse.
   * @constructor
   * @param {number} status - Response status.
   * @param {string} errorComment - Error comment.
   */
  constructor(status, errorComment) {
    super(
      CommandFieldType.CGetResponse,
      SopClass.StudyRootQueryRetrieveInformationModelGet,
      false,
      status,
      errorComment
    );
  }

  /**
   * Gets remaining sub operations.
   * @method
   * @returns {number} Remaining sub operations.
   */
  getRemaining() {
    const command = this.getCommandDataset();
    return command.getElement('NumberOfRemainingSuboperations');
  }

  /**
   * Gets completed sub operations.
   * @method
   * @returns {number} Completed sub operations.
   */
  getCompleted() {
    const command = this.getCommandDataset();
    return command.getElement('NumberOfCompletedSuboperations');
  }

  /**
   * Gets sub operations with warnings.
   * @method
   * @returns {number} Sub operations with warnings.
   */
  getWarnings() {
    const command = this.getCommandDataset();
    return command.getElement('NumberOfWarningSuboperations');
  }

  /**
   * Gets failed sub operations.
   * @method
   * @returns {number} Failed sub operations.
   */
  getFailures() {
    const command = this.getCommandDataset();
    return command.getElement('NumberOfFailedSuboperations');
  }

  /**
   * Creates a C-GET response from a request.
   * @method
   * @static
   * @param {CGetRequest} request - C-GET request.
   * @returns {CGetResponse} C-GET response.
   * @throws {Error} If request is not an instance of CGetRequest.
   */
  static fromRequest(request) {
    if (!(request instanceof CGetRequest)) {
      throw new Error('Request should be an instance of CGetRequest');
    }
    const response = new CGetResponse(Status.ProcessingFailure);
    response.setMessageIdBeingRespondedTo(request.getMessageId());

    return response;
  }
}
//#endregion

//#region NCreateRequest
class NCreateRequest extends Request {
  /**
   * Creates an instance of NCreateRequest.
   * @constructor
   * @param {string} affectedSopClassUid - Affected SOP Class UID.
   * @param {string} affectedSopInstanceUid - Affected SOP Instance UID.
   * @param {string} [metaSopClassUid] - Meta SOP Class UID.
   */
  constructor(affectedSopClassUid, affectedSopInstanceUid, metaSopClassUid) {
    super(CommandFieldType.NCreateRequest, affectedSopClassUid, false);
    this.setAffectedSopInstanceUid(affectedSopInstanceUid);
    this.setMetaSopClassUid(metaSopClassUid);
  }
}
//#endregion

//#region NCreateResponse
class NCreateResponse extends Response {
  /**
   * Creates an instance of NCreateResponse.
   * @constructor
   * @param {string} affectedSopClassUid - Affected SOP Class UID.
   * @param {string} affectedSopInstanceUid - Affected SOP Instance UID.
   * @param {number} status - Response status.
   * @param {string} errorComment - Error comment.
   */
  constructor(affectedSopClassUid, affectedSopInstanceUid, status, errorComment) {
    super(CommandFieldType.NCreateResponse, affectedSopClassUid, false, status, errorComment);
    this.setAffectedSopInstanceUid(affectedSopInstanceUid);
  }

  /**
   * Creates an N-CREATE response from a request.
   * @method
   * @static
   * @param {NCreateRequest} request - N-CREATE request.
   * @returns {NCreateResponse} N-CREATE response.
   * @throws {Error} If request is not an instance of NCreateRequest.
   */
  static fromRequest(request) {
    if (!(request instanceof NCreateRequest)) {
      throw new Error('Request should be an instance of NCreateRequest');
    }
    const response = new NCreateResponse(
      request.getAffectedSopClassUid(),
      request.getAffectedSopInstanceUid(),
      Status.ProcessingFailure
    );
    response.setMessageIdBeingRespondedTo(request.getMessageId());

    return response;
  }
}
//#endregion

//#region NActionRequest
class NActionRequest extends Request {
  /**
   * Creates an instance of NActionRequest.
   * @constructor
   * @param {string} requestedSopClassUid - Requested SOP Class UID.
   * @param {string} requestedSopInstanceUid - Requested SOP Instance UID.
   * @param {number} actionTypeId - Action type ID.
   * @param {string} [metaSopClassUid] - Meta SOP Class UID.
   */
  constructor(requestedSopClassUid, requestedSopInstanceUid, actionTypeId, metaSopClassUid) {
    super(CommandFieldType.NActionRequest, requestedSopClassUid, false);
    this.setRequestedSopInstanceUid(requestedSopInstanceUid);
    this.setActionTypeId(actionTypeId);
    this.setMetaSopClassUid(metaSopClassUid);
  }

  /**
   * Gets action type ID.
   * @method
   * @return {number} Action type ID.
   */
  getActionTypeId() {
    const command = this.getCommandDataset();
    return command.getElement('ActionTypeID');
  }

  /**
   * Sets action type ID.
   * @method
   * @param {number} actionTypeId - Action type ID.
   */
  setActionTypeId(actionTypeId) {
    const command = this.getCommandDataset();
    command.setElement('ActionTypeID', actionTypeId);
  }
}
//#endregion

//#region NActionResponse
class NActionResponse extends Response {
  /**
   * Creates an instance of NActionResponse.
   * @constructor
   * @param {string} affectedSopClassUid - Affected SOP Class UID.
   * @param {string} affectedSopInstanceUid - Affected SOP Instance UID.
   * @param {number} actionTypeId - Action type ID.
   * @param {number} status - Response status.
   * @param {string} errorComment - Error comment.
   */
  constructor(affectedSopClassUid, affectedSopInstanceUid, actionTypeId, status, errorComment) {
    super(CommandFieldType.NActionResponse, affectedSopClassUid, false, status, errorComment);
    this.setAffectedSopInstanceUid(affectedSopInstanceUid);
    this.setActionTypeId(actionTypeId);
  }

  /**
   * Gets action type ID.
   * @method
   * @return {number} Action type ID.
   */
  getActionTypeId() {
    const command = this.getCommandDataset();
    return command.getElement('ActionTypeID');
  }

  /**
   * Sets action type ID.
   * @method
   * @param {number} actionTypeId - Action type ID.
   */
  setActionTypeId(actionTypeId) {
    const command = this.getCommandDataset();
    command.setElement('ActionTypeID', actionTypeId);
  }

  /**
   * Creates an N-ACTION response from a request.
   * @method
   * @static
   * @param {NActionRequest} request - N-ACTION request.
   * @returns {NActionResponse} N-ACTION response.
   * @throws {Error} If request is not an instance of NActionRequest.
   */
  static fromRequest(request) {
    if (!(request instanceof NActionRequest)) {
      throw new Error('Request should be an instance of NActionRequest');
    }
    const response = new NActionResponse(
      request.getRequestedSopClassUid(),
      request.getRequestedSopInstanceUid(),
      request.getActionTypeId(),
      Status.ProcessingFailure
    );
    response.setMessageIdBeingRespondedTo(request.getMessageId());

    return response;
  }
}
//#endregion

//#region NDeleteRequest
class NDeleteRequest extends Request {
  /**
   * Creates an instance of NDeleteRequest.
   * @constructor
   * @param {string} requestedSopClassUid - Requested SOP Class UID.
   * @param {string} requestedSopInstanceUid - Requested SOP Instance UID.
   * @param {string} [metaSopClassUid] - Meta SOP Class UID.
   */
  constructor(requestedSopClassUid, requestedSopInstanceUid, metaSopClassUid) {
    super(CommandFieldType.NDeleteRequest, requestedSopClassUid, false);
    this.setRequestedSopInstanceUid(requestedSopInstanceUid);
    this.setMetaSopClassUid(metaSopClassUid);
  }
}
//#endregion

//#region NDeleteResponse
class NDeleteResponse extends Response {
  /**
   * Creates an instance of NDeleteResponse.
   * @constructor
   * @param {string} affectedSopClassUid - Affected SOP Class UID.
   * @param {string} affectedSopInstanceUid - Affected SOP Instance UID.
   * @param {number} status - Response status.
   * @param {string} errorComment - Error comment.
   */
  constructor(affectedSopClassUid, affectedSopInstanceUid, status, errorComment) {
    super(CommandFieldType.NDeleteResponse, affectedSopClassUid, false, status, errorComment);
    this.setAffectedSopInstanceUid(affectedSopInstanceUid);
  }

  /**
   * Creates an N-DELETE response from a request.
   * @method
   * @static
   * @param {NDeleteRequest} request - N-DELETE request.
   * @returns {NDeleteResponse} N-DELETE response.
   * @throws {Error} If request is not an instance of NDeleteRequest.
   */
  static fromRequest(request) {
    if (!(request instanceof NDeleteRequest)) {
      throw new Error('Request should be an instance of NDeleteRequest');
    }
    const response = new NDeleteResponse(
      request.getRequestedSopClassUid(),
      request.getRequestedSopInstanceUid(),
      Status.ProcessingFailure
    );
    response.setMessageIdBeingRespondedTo(request.getMessageId());

    return response;
  }
}
//#endregion

//#region NEventReportRequest
class NEventReportRequest extends Request {
  /**
   * Creates an instance of NEventReportRequest.
   * @constructor
   * @param {string} affectedSopClassUid - Affected SOP Class UID.
   * @param {string} affectedSopInstanceUid - Affected SOP Instance UID.
   * @param {number} eventTypeID - Event type ID.
   * @param {string} [metaSopClassUid] - Meta SOP Class UID.
   */
  constructor(affectedSopClassUid, affectedSopInstanceUid, eventTypeID, metaSopClassUid) {
    super(CommandFieldType.NEventReportRequest, affectedSopClassUid, false);
    this.setAffectedSopInstanceUid(affectedSopInstanceUid);
    this.setEventTypeId(eventTypeID);
    this.setMetaSopClassUid(metaSopClassUid);
  }

  /**
   * Gets event type ID.
   * @method
   * @return {number} Event type ID.
   */
  getEventTypeId() {
    const command = this.getCommandDataset();
    return command.getElement('EventTypeID');
  }

  /**
   * Sets event type ID.
   * @method
   * @param {number} actionTypeId - Event type ID.
   */
  setEventTypeId(eventTypeId) {
    const command = this.getCommandDataset();
    command.setElement('EventTypeID', eventTypeId);
  }
}
//#endregion

//#region NEventReportResponse
class NEventReportResponse extends Response {
  /**
   * Creates an instance of NEventReportResponse.
   * @constructor
   * @param {string} affectedSopClassUid - Affected SOP Class UID.
   * @param {string} affectedSopInstanceUid - Affected SOP Instance UID.
   * @param {number} eventTypeID - Event type ID.
   * @param {number} status - Response status.
   * @param {string} errorComment - Error comment.
   */
  constructor(affectedSopClassUid, affectedSopInstanceUid, eventTypeID, status, errorComment) {
    super(CommandFieldType.NEventReportResponse, affectedSopClassUid, false, status, errorComment);
    this.setAffectedSopInstanceUid(affectedSopInstanceUid);
    this.setEventTypeId(eventTypeID);
  }

  /**
   * Gets event type ID.
   * @method
   * @return {number} Event type ID.
   */
  getEventTypeId() {
    const command = this.getCommandDataset();
    return command.getElement('EventTypeID');
  }

  /**
   * Sets event type ID.
   * @method
   * @param {number} actionTypeId - Event type ID.
   */
  setEventTypeId(eventTypeId) {
    const command = this.getCommandDataset();
    command.setElement('EventTypeID', eventTypeId);
  }

  /**
   * Creates an N-EVENT-REPORT response from a request.
   * @method
   * @static
   * @param {NEventReportRequest} request - N-EVENT-REPORT request.
   * @returns {NEventReportResponse} N-EVENT-REPORT response.
   * @throws {Error} If request is not an instance of NEventReportRequest.
   */
  static fromRequest(request) {
    if (!(request instanceof NEventReportRequest)) {
      throw new Error('Request should be an instance of NEventReportRequest');
    }
    const response = new NEventReportResponse(
      request.getAffectedSopClassUid(),
      request.getAffectedSopInstanceUid(),
      request.getEventTypeId(),
      Status.ProcessingFailure
    );
    response.setMessageIdBeingRespondedTo(request.getMessageId());

    return response;
  }
}
//#endregion

//#region NGetRequest
class NGetRequest extends Request {
  /**
   * Creates an instance of NGetRequest.
   * @constructor
   * @param {string} requestedSopClassUid - Requested SOP Class UID.
   * @param {string} requestedSopInstanceUid - Requested SOP Instance UID.
   * @param {Array<string>} attributeIdentifierList - The requested attributes identifier list.
   * @param {string} [metaSopClassUid] - Meta SOP Class UID.
   */
  constructor(
    requestedSopClassUid,
    requestedSopInstanceUid,
    attributeIdentifierList,
    metaSopClassUid
  ) {
    super(CommandFieldType.NGetRequest, requestedSopClassUid, false);
    this.setRequestedSopInstanceUid(requestedSopInstanceUid);
    this.setAttributeIdentifierList(
      !Array.isArray(attributeIdentifierList) ? [attributeIdentifierList] : attributeIdentifierList
    );
    this.setMetaSopClassUid(metaSopClassUid);
  }

  /**
   * Gets requested attributes identifier list.
   * @method
   * @return {Array<string>} The requested attributes identifier list.
   */
  getAttributeIdentifierList() {
    const command = this.getCommandDataset();
    const attributes = command.getElement('AttributeIdentifierList');
    const attributeItems = [];
    if (attributes !== undefined && Array.isArray(attributes) && attributes.length > 0) {
      attributes.forEach((attribute) => {
        const group = attribute >> 16;
        const element = attribute & 0xffff;
        const tag = `(${this._getPaddedHexString(group, 4)},${this._getPaddedHexString(
          element,
          4
        )})`;
        const dictionaryEntry = DicomMetaDictionary.dictionary[tag.toUpperCase()];
        if (dictionaryEntry) {
          attributeItems.push(dictionaryEntry.name);
        }
      });
    }

    return attributeItems;
  }

  /**
   * Sets requested attributes identifier list.
   * @method
   * @param {Array<string>} attributeIdentifierList - The requested attributes identifier list.
   */
  setAttributeIdentifierList(attributeIdentifierList) {
    const attributeItems = [];
    Object.keys(DicomMetaDictionary.dictionary).forEach((tag) => {
      const dictionaryEntry = DicomMetaDictionary.dictionary[tag];
      if (
        dictionaryEntry.version === 'DICOM' &&
        attributeIdentifierList.includes(dictionaryEntry.name)
      ) {
        const group = parseInt(dictionaryEntry.tag.substring(1, 5), 16);
        const element = parseInt(dictionaryEntry.tag.substring(6, 10), 16);
        attributeItems.push((group << 16) | (element & 0xffff));
      }
    });
    const command = this.getCommandDataset();
    command.setElement('AttributeIdentifierList', attributeItems);
  }

  //#region Private Methods
  /**
   * Returns a padded hexadecimal string.
   * @method
   * @private
   * @param {number} num - Number to convert to hex string.
   * @param {number} length - Number of resulting characters.
   * @returns {string} Padded hexadecimal string.
   */
  _getPaddedHexString(num, length) {
    const str = num.toString(16);
    return '0'.repeat(length - str.length) + str;
  }
  //#endregion
}
//#endregion

//#region NGetResponse
class NGetResponse extends Response {
  /**
   * Creates an instance of NGetResponse.
   * @constructor
   * @param {string} affectedSopClassUid - Affected SOP Class UID.
   * @param {string} affectedSopInstanceUid - Affected SOP Instance UID.
   * @param {number} status - Response status.
   * @param {string} errorComment - Error comment.
   */
  constructor(affectedSopClassUid, affectedSopInstanceUid, status, errorComment) {
    super(CommandFieldType.NGetResponse, affectedSopClassUid, false, status, errorComment);
    this.setAffectedSopInstanceUid(affectedSopInstanceUid);
  }

  /**
   * Creates an N-GET response from a request.
   * @method
   * @static
   * @param {NGetRequest} request - N-GET request.
   * @returns {NGetResponse} N-GET response.
   * @throws {Error} If request is not an instance of NGetRequest.
   */
  static fromRequest(request) {
    if (!(request instanceof NGetRequest)) {
      throw new Error('Request should be an instance of NGetRequest');
    }
    const response = new NGetResponse(
      request.getRequestedSopClassUid(),
      request.getRequestedSopInstanceUid(),
      Status.ProcessingFailure
    );
    response.setMessageIdBeingRespondedTo(request.getMessageId());

    return response;
  }
}
//#endregion

//#region NSetRequest
class NSetRequest extends Request {
  /**
   * Creates an instance of NSetRequest.
   * @constructor
   * @param {string} requestedSopClassUid - Requested SOP Class UID.
   * @param {string} requestedSopInstanceUid - Requested SOP Instance UID.
   * @param {string} [metaSopClassUid] - Meta SOP Class UID.
   */
  constructor(requestedSopClassUid, requestedSopInstanceUid, metaSopClassUid) {
    super(CommandFieldType.NSetRequest, requestedSopClassUid, false);
    this.setRequestedSopInstanceUid(requestedSopInstanceUid);
    this.setMetaSopClassUid(metaSopClassUid);
  }
}
//#endregion

//#region NSetResponse
class NSetResponse extends Response {
  /**
   * Creates an instance of NSetResponse.
   * @constructor
   * @param {string} affectedSopClassUid - Affected SOP Class UID.
   * @param {string} affectedSopInstanceUid - Affected SOP Instance UID.
   * @param {number} status - Response status.
   * @param {string} errorComment - Error comment.
   */
  constructor(affectedSopClassUid, affectedSopInstanceUid, status, errorComment) {
    super(CommandFieldType.NSetResponse, affectedSopClassUid, false, status, errorComment);
    this.setAffectedSopInstanceUid(affectedSopInstanceUid);
  }

  /**
   * Creates an N-SET response from a request.
   * @method
   * @static
   * @param {NSetRequest} request - N-SET request.
   * @returns {NSetResponse} N-SET response.
   * @throws {Error} If request is not an instance of NSetRequest.
   */
  static fromRequest(request) {
    if (!(request instanceof NSetRequest)) {
      throw new Error('Request should be an instance of NSetRequest');
    }
    const response = new NSetResponse(
      request.getRequestedSopClassUid(),
      request.getRequestedSopInstanceUid(),
      Status.ProcessingFailure
    );
    response.setMessageIdBeingRespondedTo(request.getMessageId());

    return response;
  }
}
//#endregion

//#region CCancelRequest
class CCancelRequest extends Request {
  /**
   * Creates an instance of CCancelRequest.
   * @constructor
   * @param {string} affectedSopClassUid - Affected SOP class UID.
   * @param {number} messageId - Message ID to cancel.
   */
  constructor(affectedSopClassUid, messageId) {
    super(CommandFieldType.CCancelRequest, affectedSopClassUid, false);
    this.setMessageIdBeingRespondedTo(messageId);
  }

  /**
   * Gets message ID to cancel.
   * @method
   * @return {number} Message ID to cancel.
   */
  getMessageIdBeingRespondedTo() {
    const command = this.getCommandDataset();
    return command.getElement('MessageIDBeingRespondedTo');
  }

  /**
   * Sets message ID to cancel.
   * @method
   * @param {number} messageId - Message ID to cancel.
   */
  setMessageIdBeingRespondedTo(messageId) {
    const command = this.getCommandDataset();
    command.setElement('MessageIDBeingRespondedTo', messageId);
  }

  /**
   * Creates a C-CANCEL request from a C-FIND, C-MOVE or C-GET request.
   * @method
   * @static
   * @param {CFindRequest|CMoveRequest|CGetRequest} request - C-FIND, C-MOVE or C-GET request.
   * @returns {CCancelRequest} C-CANCEL request.
   * @throws {Error} If request is not an instance of CFindRequest, CMoveRequest or CGetRequest.
   */
  static fromRequest(request) {
    if (
      !(request instanceof CFindRequest) &&
      !(request instanceof CMoveRequest) &&
      !(request instanceof CGetRequest)
    ) {
      throw new Error('Request should be an instance of CFindRequest, CMoveRequest or CGetRequest');
    }

    return new CCancelRequest(request.getAffectedSopClassUid(), request.getMessageId());
  }
}
//#endregion

//#region Exports
module.exports = {
  CCancelRequest,
  CEchoRequest,
  CEchoResponse,
  CFindRequest,
  CFindResponse,
  CGetRequest,
  CGetResponse,
  CMoveRequest,
  CMoveResponse,
  Command,
  CStoreRequest,
  CStoreResponse,
  NActionRequest,
  NActionResponse,
  NCreateRequest,
  NCreateResponse,
  NDeleteRequest,
  NDeleteResponse,
  NEventReportRequest,
  NEventReportResponse,
  NGetRequest,
  NGetResponse,
  NSetRequest,
  NSetResponse,
  Request,
  Response,
};
//#endregion
