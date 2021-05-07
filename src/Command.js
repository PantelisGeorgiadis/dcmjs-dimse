const { CommandFieldType, SopClass, Priority, Status } = require('./Constants');
const Dataset = require('./Dataset');

const { EventEmitter } = require('events');
const { Mixin } = require('ts-mixer');

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
   * @returns {Dataset} Dataset.
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
   * @returns {Boolean} Command has dataset.
   */
  hasDataset() {
    return this.commandDataset.getElement('CommandDataSetType') !== 0x0101;
  }

  /**
   * Gets the command description.
   * @method
   * @param {Boolean} [includeCommandDataset] - Include command dataset in the description.
   * @param {Boolean} [includeDataset] - Include dataset in the description.
   * @returns {string} Command description.
   */
  toString(includeCommandDataset, includeDataset) {
    includeCommandDataset = includeCommandDataset || false;
    includeDataset = includeDataset || false;
    const str = [];
    str.push(
      `${this._typeToString(this.getCommandFieldType())} [HasDataset: ${this.hasDataset()}]`
    );
    if (includeCommandDataset) {
      str.push('DIMSE Command Dataset:');
      str.push('===============================================');
      str.push(JSON.stringify(this.commandDataset.getElements()));
    }
    if (includeDataset && this.dataset) {
      str.push('DIMSE Dataset:');
      str.push('===============================================');
      str.push(JSON.stringify(this.dataset.getElements()));
    }

    return str.join('\n');
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
class Request extends Mixin(Command, EventEmitter) {
  /**
   * Creates an instance of Request.
   * @constructor
   * @param {number} type - Command field type.
   * @param {string} affectedClass - Affected SOP Class UID.
   * @param {number} priority - Request priority.
   * @param {Boolean} hasDataset - Request has dataset.
   */
  constructor(type, affectedClass, priority, hasDataset) {
    super(
      new Dataset({
        AffectedSOPClassUID: affectedClass,
        CommandField: type,
        Priority: priority,
        CommandDataSetType: hasDataset ? 0x0202 : 0x0101
      })
    );
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
   * @return {string} Request description.
   */
  toString() {
    return `${super.toString()} [id: ${this.getMessageId()}]`;
  }
}
//#endregion

//#region Response
class Response extends Command {
  /**
   * Creates an instance of Response.
   * @constructor
   * @param {number} type - Command field type.
   * @param {string} affectedClass - Affected SOP Class UID.
   * @param {Boolean} hasDataset - Response has dataset.
   * @param {number} status - Response status.
   * @param {string} errorComment - Response error comment.
   */
  constructor(type, affectedClass, hasDataset, status, errorComment) {
    super(
      new Dataset({
        AffectedSOPClassUID: affectedClass,
        CommandField: type,
        CommandDataSetType: hasDataset ? 0x0202 : 0x0101,
        Status: status,
        ErrorComment: errorComment
      })
    );
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
   * @return {string} Response description.
   */
  toString() {
    return `${super.toString()} [id: ${this.getMessageIdBeingRespondedTo()}; status: ${this._statusToString(
      this.getStatus()
    )}]`;
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
   * @param {number} [priority] - Request priority.
   */
  constructor(priority) {
    super(CommandFieldType.CEchoRequest, SopClass.Verification, priority || Priority.Medium, false);
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
   * Creates an echo response from a request.
   * @method
   * @static
   * @param {CEchoRequest} request - Echo request.
   * @returns {CEchoResponse} Echo response.
   * @throws Error if request is not an instance of CEchoRequest.
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
   * @param {number} [priority] - Request priority.
   */
  constructor(priority) {
    super(
      CommandFieldType.CFindRequest,
      SopClass.StudyRootQueryRetrieveInformationModelFind,
      priority || Priority.Medium,
      true
    );
  }

  /**
   * Creates study find request.
   * @method
   * @static
   * @param {Object} elements - Find request dataset elements.
   * @param {number} [priority] - Request priority.
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
      NumberOfStudyRelatedInstances: ''
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
   * @param {number} [priority] - Request priority.
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
      NumberOfSeriesRelatedInstances: ''
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
   * @param {number} [priority] - Request priority.
   * @return {CFindRequest} Image find request.
   */
  static createImageFindRequest(elements, priority) {
    const baseElements = {
      StudyInstanceUID: '',
      SeriesInstanceUID: '',
      SOPInstanceUID: '',
      InstanceNumber: '',
      Modality: ''
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
   * @param {number} [priority] - Request priority.
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
          AnatomicalOrientationType: ''
        }
      ]
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
   * Creates a find response from a request.
   * @method
   * @static
   * @param {CFindRequest} request - Find request.
   * @returns {CFindResponse} Find response.
   * @throws Error if request is not an instance of CFindRequest.
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
   * @param {Object|String} datasetOrFile - Dataset or part10 file path.
   * @param {number} [priority] - Request priority.
   */
  constructor(datasetOrFile, priority) {
    super(CommandFieldType.CStoreRequest, '', priority || Priority.Medium, true);
    if (datasetOrFile instanceof Dataset) {
      this.setAffectedSopClassUid(datasetOrFile.getElement('SOPClassUID'));
      this.setAffectedSopInstanceUid(datasetOrFile.getElement('SOPInstanceUID'));
      this.setDataset(datasetOrFile);
      return;
    }
    if (typeof datasetOrFile === 'string' || datasetOrFile instanceof String) {
      const dataset = Dataset.fromFile(datasetOrFile);
      this.setAffectedSopClassUid(dataset.getElement('SOPClassUID'));
      this.setAffectedSopInstanceUid(dataset.getElement('SOPInstanceUID'));
      this.setDataset(dataset);
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
   * Creates a store response from a request.
   * @method
   * @static
   * @param {CStoreRequest} request - Store request.
   * @returns {CStoreResponse} Store response.
   * @throws Error if request is not an instance of CStoreRequest.
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
   * @param {number} [priority] - Request priority.
   */
  constructor(priority) {
    super(
      CommandFieldType.CMoveRequest,
      SopClass.StudyRootQueryRetrieveInformationModelMove,
      priority || Priority.Medium,
      true
    );
  }

  /**
   * Creates study move request.
   * @method
   * @static
   * @param {string} destinationAet - Move destination AET.
   * @param {string} studyInstanceUid - Study instance UID of the study to move.
   * @param {number} [priority] - Request priority.
   * @return {CMoveRequest} Study move request.
   */
  static createStudyMoveRequest(destinationAet, studyInstanceUid, priority) {
    const elements = {
      StudyInstanceUID: studyInstanceUid,
      QueryRetrieveLevel: 'STUDY'
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
   * @param {number} [priority] - Request priority.
   * @return {CMoveRequest} Series move request.
   */
  static createSeriesMoveRequest(destinationAet, studyInstanceUid, seriesInstanceUid, priority) {
    const elements = {
      StudyInstanceUID: studyInstanceUid,
      SeriesInstanceUID: seriesInstanceUid,
      QueryRetrieveLevel: 'SERIES'
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
   * @param {number} [priority] - Request priority.
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
      QueryRetrieveLevel: 'IMAGE'
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
   * Creates a move response from a request.
   * @method
   * @static
   * @param {CMoveRequest} request - Move request.
   * @returns {CMoveResponse} Move response.
   * @throws Error if request is not an instance of CMoveRequest.
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
   * @param {number} [priority] - Request priority.
   */
  constructor(priority) {
    super(
      CommandFieldType.CGetRequest,
      SopClass.StudyRootQueryRetrieveInformationModelGet,
      priority || Priority.Medium,
      true
    );
  }

  /**
   * Creates study get request.
   * @method
   * @static
   * @param {string} studyInstanceUid - Study instance UID of the study to get.
   * @param {number} [priority] - Request priority.
   * @return {CGetRequest} Study get request.
   */
  static createStudyGetRequest(studyInstanceUid, priority) {
    const elements = {
      StudyInstanceUID: studyInstanceUid,
      QueryRetrieveLevel: 'STUDY'
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
   * @param {number} priority - Request priority.
   * @return {CGetRequest} Series get request.
   */
  static createSeriesGetRequest(studyInstanceUid, seriesInstanceUid, priority) {
    const elements = {
      StudyInstanceUID: studyInstanceUid,
      SeriesInstanceUID: seriesInstanceUid,
      QueryRetrieveLevel: 'SERIES'
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
   * @param {number} priority - Request priority.
   * @return {CGetRequest} Image get request.
   */
  static createImageGetRequest(studyInstanceUid, seriesInstanceUid, sopInstanceUid, priority) {
    const elements = {
      StudyInstanceUID: studyInstanceUid,
      SeriesInstanceUID: seriesInstanceUid,
      SOPInstanceUID: sopInstanceUid,
      QueryRetrieveLevel: 'IMAGE'
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
   * Creates a get response from a request.
   * @method
   * @static
   * @param {CGetRequest} request - Get request.
   * @returns {CGetResponse} Get response.
   * @throws Error if request is not an instance of CGetRequest.
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

//#region Exports
module.exports = {
  Command,
  Request,
  Response,
  CEchoRequest,
  CEchoResponse,
  CFindRequest,
  CFindResponse,
  CStoreRequest,
  CStoreResponse,
  CMoveRequest,
  CMoveResponse,
  CGetRequest,
  CGetResponse
};
//#endregion
