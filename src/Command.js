const { CommandFieldType, SopClass, Priority, Status } = require('./Constants');
const Dataset = require('./Dataset');

const { EventEmitter } = require('events');
const { Mixin } = require('ts-mixer');

//#region Command
class Command {
  /**
   * Creates an instance of Command.
   *
   * @param {Object} commandDataset - Command dataset.
   * @param {Object} dataset - Dataset.
   * @memberof Command
   */
  constructor(commandDataset, dataset) {
    this.commandDataset = commandDataset;
    this.dataset = dataset;
    if (!this.commandDataset) {
      this.commandDataset = new Dataset();
    }
  }

  /**
   * Gets command dataset.
   *
   * @returns {Object} Command dataset.
   * @memberof Command
   */
  getCommandDataset() {
    return this.commandDataset;
  }

  /**
   * Sets command dataset.
   *
   * @param {Object} dataset - Command dataset.
   * @memberof Command
   */
  setCommandDataset(dataset) {
    this.commandDataset = dataset;
  }

  /**
   * Gets dataset.
   *
   * @returns {Object} Dataset.
   * @memberof Command
   */
  getDataset() {
    return this.dataset;
  }

  /**
   * Sets dataset.
   *
   * @param {Object} dataset - Dataset.
   * @memberof Command
   */
  setDataset(dataset) {
    this.dataset = dataset;
  }

  /**
   * Gets command field type.
   *
   * @returns {Number} Command field type.
   * @memberof Response
   */
  getCommandFieldType() {
    return this.commandDataset.getElement('CommandField');
  }

  /**
   * Command has dataset.
   *
   * @returns {Boolean} Command has dataset.
   * @memberof Response
   */
  hasDataset() {
    return this.commandDataset.getElement('CommandDataSetType') !== 0x0101;
  }

  /**
   * Gets the command description.
   *
   * @param {Boolean} includeCommandDataset - Include command dataset in the description.
   * @param {Boolean} includeDataset - Include dataset in the description.
   * @memberof Command
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
   *
   * @param {Number} type - Command field type.
   * @returns {String} Readable string.
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
   *
   * @param {Number} type - Command field type.
   * @param {String} affectedClass - Affected SOP Class UID.
   * @param {Number} priority - Request priority.
   * @param {Boolean} hasDataset - Request has dataset.
   * @memberof Request
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
   *
   * @returns {String} Affected SOP class UID.
   * @memberof Request
   */
  getAffectedSopClassUid() {
    const command = this.getCommandDataset();
    return command.getElement('AffectedSOPClassUID');
  }

  /**
   * Sets affected SOP class UID.
   *
   * @param {String} affectedSopClassUid - Affected SOP class UID.
   * @memberof Request
   */
  setAffectedSopClassUid(affectedSopClassUid) {
    const command = this.getCommandDataset();
    command.setElement('AffectedSOPClassUID', affectedSopClassUid);
  }

  /**
   * Gets affected SOP instance UID.
   *
   * @returns {String} Affected SOP instance UID.
   * @memberof Request
   */
  getAffectedSopInstanceUid() {
    const command = this.getCommandDataset();
    return command.getElement('AffectedSOPInstanceUID');
  }

  /**
   * Sets affected SOP instance UID.
   *
   * @param {String} affectedSopInstanceUid - Affected SOP instance UID.
   * @memberof Request
   */
  setAffectedSopInstanceUid(affectedSopInstanceUid) {
    const command = this.getCommandDataset();
    command.setElement('AffectedSOPInstanceUID', affectedSopInstanceUid);
  }

  /**
   * Gets request message ID.
   *
   * @return {Number} Request message ID.
   * @memberof Request
   */
  getMessageId() {
    const command = this.getCommandDataset();
    return command.getElement('MessageID');
  }

  /**
   * Sets request message ID.
   *
   * @param {Number} messageId - Request message ID.
   * @memberof Request
   */
  setMessageId(messageId) {
    const command = this.getCommandDataset();
    command.setElement('MessageID', messageId);
  }

  /**
   * Raise response event.
   *
   * @param {Object} response - Response.
   * @memberof Request
   */
  raiseResponseEvent(response) {
    this.emit('response', response);
  }

  /**
   * Raise instance event.
   * Special event for datasets coming from C-GET operations,
   * as C-STORE requests.
   *
   * @param {Object} dataset - Dataset.
   * @memberof Request
   */
  raiseInstanceEvent(dataset) {
    this.emit('instance', dataset);
  }

  /**
   * Raise done event.
   *
   * @memberof Request
   */
  raiseDoneEvent() {
    this.emit('done');
  }

  /**
   * Gets the request description.
   *
   * @memberof Request
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
   * @param {Number} type - Command field type.
   * @param {String} affectedClass - Affected SOP Class UID.
   * @param {Boolean} hasDataset - Response has dataset.
   * @param {Number} status - Response status.
   * @param {String} errorComment - Response error comment.
   *
   * @memberof Response
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
   *
   * @returns {String} Affected SOP class UID.
   * @memberof Response
   */
  getAffectedSopClassUid() {
    const command = this.getCommandDataset();
    return command.getElement('AffectedSOPClassUID');
  }

  /**
   * Sets affected SOP class UID.
   *
   * @param {String} affectedSopClassUid - Affected SOP class UID.
   * @memberof Response
   */
  setAffectedSopClassUid(affectedSopClassUid) {
    const command = this.getCommandDataset();
    command.setElement('AffectedSOPClassUID', affectedSopClassUid);
  }

  /**
   * Gets affected SOP instance UID.
   *
   * @returns {String} Affected SOP instance UID.
   * @memberof Response
   */
  getAffectedSopInstanceUid() {
    const command = this.getCommandDataset();
    return command.getElement('AffectedSOPInstanceUID');
  }

  /**
   * Sets affected SOP instance UID.
   *
   * @param {String} affectedSopInstanceUid - Affected SOP instance UID.
   * @memberof Response
   */
  setAffectedSopInstanceUid(affectedSopInstanceUid) {
    const command = this.getCommandDataset();
    command.setElement('AffectedSOPInstanceUID', affectedSopInstanceUid);
  }

  /**
   * Sets status.
   *
   * @param {Number} status - Status.
   * @memberof Response
   */
  setStatus(status) {
    const command = this.getCommandDataset();
    command.setElement('Status', status);
  }

  /**
   * Gets status.
   *
   * @returns {Number} Status.
   * @memberof Response
   */
  getStatus() {
    const command = this.getCommandDataset();
    return command.getElement('Status');
  }

  /**
   * Gets error comment.
   *
   * @returns {String} Error comment.
   * @memberof Response
   */
  getErrorComment() {
    const command = this.getCommandDataset();
    return command.getElement('ErrorComment');
  }

  /**
   * Sets error comment.
   *
   * @param {String} errorComment - Error comment.
   * @memberof Response
   */
  setErrorComment(errorComment) {
    const command = this.getCommandDataset();
    command.setElement('ErrorComment', errorComment);
  }

  /**
   * Gets response message ID.
   *
   * @return {Number} Response message ID.
   * @memberof Response
   */
  getMessageIdBeingRespondedTo() {
    const command = this.getCommandDataset();
    return command.getElement('MessageIDBeingRespondedTo');
  }

  /**
   * Sets response message ID.
   *
   * @param {Number} messageId - Response message ID.
   * @memberof Response
   */
  setMessageIdBeingRespondedTo(messageId) {
    const command = this.getCommandDataset();
    command.setElement('MessageIDBeingRespondedTo', messageId);
  }

  /**
   * Gets the response description.
   *
   * @memberof Response
   */
  toString() {
    return `${super.toString()} [id: ${this.getMessageIdBeingRespondedTo()}; status: ${this._statusToString(
      this.getStatus()
    )}]`;
  }

  //#region Private Methods
  /**
   * Returns a readable string from status.
   *
   * @param {Number} status - Status code.
   * @returns {String} Readable string.
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
   * @param {Number} priority - Request priority.
   *
   * @memberof CEchoRequest
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
   * @param {Number} status - Response status.
   * @param {String} errorComment - Error comment.
   *
   * @memberof CEchoResponse
   */
  constructor(status, errorComment) {
    super(CommandFieldType.CEchoResponse, SopClass.Verification, false, status, errorComment);
  }
}
//#endregion

//#region CFindRequest
class CFindRequest extends Request {
  /**
   * Creates an instance of CFindRequest.
   * @param {Number} priority - Request priority.
   *
   * @memberof CFindRequest
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
   *
   * @param {Object} elements - Find request dataset elements.
   * @param {Number} priority - Request priority.
   * @return {Object} Study find request.
   * @memberof CFindRequest
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
   *
   * @param {Object} elements - Find request dataset elements.
   * @param {Number} priority - Request priority.
   * @return {Object} Series find request.
   * @memberof CFindRequest
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
   *
   * @param {Object} elements - Find request dataset elements.
   * @param {Number} priority - Request priority.
   * @return {Object} Image find request.
   * @memberof CFindRequest
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
   *
   * @param {Object} elements - Find request dataset elements.
   * @param {Number} priority - Request priority.
   * @return {Object} Worklist find request.
   * @memberof CFindRequest
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
   * @param {Number} status - Response status.
   * @param {String} errorComment - Error comment.
   *
   * @memberof CFindResponse
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
}
//#endregion

//#region CStoreRequest
class CStoreRequest extends Request {
  /**
   * Creates an instance of CStoreRequest.
   * @param {Object|String} datasetOrFile - Dataset or part10 file path.
   * @param {Number} priority - Request priority.
   *
   * @memberof CStoreRequest
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
   * @param {Number} status - Response status.
   * @param {String} errorComment - Error comment.
   *
   * @memberof CStoreResponse
   */
  constructor(status, errorComment) {
    super(CommandFieldType.CStoreResponse, '', false, status, errorComment);
  }
}
//#endregion

//#region CMoveRequest
class CMoveRequest extends Request {
  /**
   * Creates an instance of CMoveRequest.
   * @param {Number} priority - Request priority.
   *
   * @memberof CMoveRequest
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
   *
   * @param {String} destinationAet - Move destination AET.
   * @param {String} studyInstanceUid - Study instance UID of the study to move.
   * @param {Number} priority - Request priority.
   * @return {Object} Study move request.
   * @memberof CMoveRequest
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
   *
   * @param {String} destinationAet - Move destination AET.
   * @param {String} studyInstanceUid - Study instance UID of the study to move.
   * @param {String} seriesInstanceUid - Series instance UID of the series to move.
   * @param {Number} priority - Request priority.
   * @return {Object} Series move request.
   * @memberof CMoveRequest
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
   *
   * @param {String} destinationAet - Move destination AET.
   * @param {String} studyInstanceUid - Study instance UID of the study to move.
   * @param {String} seriesInstanceUid - Series instance UID of the series to move.
   * @param {String} sopInstanceUid - SOP instance UID of the series to move.
   * @param {Number} priority - Request priority.
   * @return {Object} Image move request.
   * @memberof CMoveRequest
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
   * @param {Number} status - Response status.
   * @param {String} errorComment - Error comment.
   *
   * @memberof CMoveResponse
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
   *
   * @returns {Number} Remaining sub operations.
   * @memberof CMoveResponse
   */
  getRemaining() {
    const command = this.getCommandDataset();
    return command.getElement('NumberOfRemainingSuboperations');
  }

  /**
   * Gets completed sub operations.
   *
   * @returns {Number} Completed sub operations.
   * @memberof CMoveResponse
   */
  getCompleted() {
    const command = this.getCommandDataset();
    return command.getElement('NumberOfCompletedSuboperations');
  }

  /**
   * Gets sub operations with warnings.
   *
   * @returns {Number} Sub operations with warnings.
   * @memberof CMoveResponse
   */
  getWarnings() {
    const command = this.getCommandDataset();
    return command.getElement('NumberOfWarningSuboperations');
  }

  /**
   * Gets failed sub operations.
   *
   * @returns {Number} Failed sub operations.
   * @memberof CMoveResponse
   */
  getFailures() {
    const command = this.getCommandDataset();
    return command.getElement('NumberOfFailedSuboperations');
  }
}
//#endregion

//#region CGetRequest
class CGetRequest extends Request {
  /**
   * Creates an instance of CGetRequest.
   * @param {Number} priority - Request priority.
   *
   * @memberof CGetRequest
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
   *
   * @param {String} studyInstanceUid - Study instance UID of the study to get.
   * @param {Number} priority - Request priority.
   * @return {Object} Study get request.
   * @memberof CGetRequest
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
   *
   * @param {String} studyInstanceUid - Study instance UID of the study to get.
   * @param {String} seriesInstanceUid - Series instance UID of the series to get.
   * @param {Number} priority - Request priority.
   * @return {Object} Series get request.
   * @memberof CGetRequest
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
   *
   * @param {String} studyInstanceUid - Study instance UID of the study to get.
   * @param {String} seriesInstanceUid - Series instance UID of the series to get.
   * @param {String} sopInstanceUid - SOP instance UID of the series to get.
   * @param {Number} priority - Request priority.
   * @return {Object} Image get request.
   * @memberof CGetRequest
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
   * @param {Number} status - Response status.
   * @param {String} errorComment - Error comment.
   *
   * @memberof CGetResponse
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
   *
   * @returns {Number} Remaining sub operations.
   * @memberof CGetResponse
   */
  getRemaining() {
    const command = this.getCommandDataset();
    return command.getElement('NumberOfRemainingSuboperations');
  }

  /**
   * Gets completed sub operations.
   *
   * @returns {Number} Completed sub operations.
   * @memberof CGetResponse
   */
  getCompleted() {
    const command = this.getCommandDataset();
    return command.getElement('NumberOfCompletedSuboperations');
  }

  /**
   * Gets sub operations with warnings.
   *
   * @returns {Number} Sub operations with warnings.
   * @memberof CGetResponse
   */
  getWarnings() {
    const command = this.getCommandDataset();
    return command.getElement('NumberOfWarningSuboperations');
  }

  /**
   * Gets failed sub operations.
   *
   * @returns {Number} Failed sub operations.
   * @memberof CGetResponse
   */
  getFailures() {
    const command = this.getCommandDataset();
    return command.getElement('NumberOfFailedSuboperations');
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
