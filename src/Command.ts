import { CommandFieldType, Priority, SopClass, Status } from './Constants';
import Dataset, { DatasetElements } from './Dataset';

import AsyncEventEmitter, { AsyncListener, EventMap } from 'async-eventemitter';
import dcmjs from 'dcmjs';
const { DicomMetaDictionary } = dcmjs.data;
import { Mixin } from 'ts-mixer';

type toStringOptions = { includeCommandDataset?: boolean; includeDataset?: boolean };

//#region Command
class Command extends AsyncEventEmitter<RequestEventMap> {
  commandDataset: Dataset;
  dataset: Dataset;
  /**
   * Creates an instance of Command.
   * @constructor
   * @param {Dataset} [commandDataset] - Command dataset.
   * @param {Dataset} [dataset] - Dataset.
   */
  constructor(commandDataset?: Dataset, dataset?: Dataset) {
    super();
    this.commandDataset = commandDataset || new Dataset();
    this.dataset = dataset;
  }

  /**
   * Gets command dataset.
   * @method
   * @returns {Dataset} Command dataset.
   */
  getCommandDataset(): Dataset {
    return this.commandDataset;
  }

  /**
   * Sets command dataset.
   * @method
   * @param {Dataset} dataset - Command dataset.
   */
  setCommandDataset(dataset: Dataset) {
    this.commandDataset = dataset;
  }

  /**
   * Gets dataset.
   * @method
   * @returns {Dataset} Dataset.
   */
  getDataset(): Dataset {
    return this.dataset;
  }

  /**
   * Sets dataset and updates CommandDataSetType element.
   * @method
   * @param {Dataset} dataset - Dataset.
   */
  setDataset(dataset: Dataset) {
    this.dataset = dataset;
    this.commandDataset.setElement('CommandDataSetType', this.dataset ? 0x0202 : 0x0101);
  }

  /**
   * Gets command field type.
   * @method
   * @returns {number} Command field type.
   */
  getCommandFieldType(): number {
    return Number.parseInt(this.commandDataset.getElement('CommandField'));
  }

  /**
   * Command has dataset.
   * @method
   * @returns {boolean} Command has dataset.
   */
  hasDataset(): boolean {
    return Number.parseInt(this.commandDataset.getElement('CommandDataSetType')) !== 0x0101;
  }

  /**
   * Gets the command description.
   * @method
   * @param {Object} [opts] - Description generation options.
   * @param {boolean} [opts.includeCommandDataset] - Include command dataset in the description.
   * @param {boolean} [opts.includeDataset] - Include dataset in the description.
   * @returns {string} Command description.
   */
  toString(opts?: toStringOptions): string {
    const options = opts || {};
    const includeCommandDataset = options.includeCommandDataset || false;
    const includeDataset = options.includeDataset || false;

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
  _typeToString(type: number): string {
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

interface RequestEventMap extends EventMap {
  done: AsyncListener<undefined, any> | any;
}

class Request extends Command {
  /**
   * Creates an instance of Request.
   * @constructor
   * @param {number} type - Command field type.
   * @param {string} affectedOrRequestedClassUid - Affected or requested SOP Class UID.
   * @param {boolean} hasDataset - Request has dataset.
   */
  constructor(type: number, affectedOrRequestedClassUid: string, hasDataset: boolean) {
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
  }

  /**
   * Gets affected SOP class UID.
   * @method
   * @returns {string} Affected SOP class UID.
   */
  getAffectedSopClassUid(): string {
    const command = this.getCommandDataset();
    return command.getElement('AffectedSOPClassUID');
  }

  /**
   * Sets affected SOP class UID.
   * @method
   * @param {string} affectedSopClassUid - Affected SOP class UID.
   */
  setAffectedSopClassUid(affectedSopClassUid: string) {
    const command = this.getCommandDataset();
    command.setElement('AffectedSOPClassUID', affectedSopClassUid);
  }

  /**
   * Gets requested SOP class UID.
   * @method
   * @returns {string} Requested SOP class UID.
   */
  getRequestedSopClassUid(): string {
    const command = this.getCommandDataset();
    return command.getElement('RequestedSOPClassUID');
  }

  /**
   * Sets requested SOP class UID.
   * @method
   * @param {string} requestedSopClassUid - Requested SOP class UID.
   */
  setRequestedSopClassUid(requestedSopClassUid: string) {
    const command = this.getCommandDataset();
    command.setElement('RequestedSOPClassUID', requestedSopClassUid);
  }

  /**
   * Gets affected SOP instance UID.
   * @method
   * @returns {string} Affected SOP instance UID.
   */
  getAffectedSopInstanceUid(): string {
    const command = this.getCommandDataset();
    return command.getElement('AffectedSOPInstanceUID');
  }

  /**
   * Sets affected SOP instance UID.
   * @method
   * @param {string} affectedSopInstanceUid - Affected SOP instance UID.
   */
  setAffectedSopInstanceUid(affectedSopInstanceUid: string) {
    const command = this.getCommandDataset();
    command.setElement('AffectedSOPInstanceUID', affectedSopInstanceUid);
  }

  /**
   * Gets requested SOP instance UID.
   * @method
   * @returns {string} Requested SOP instance UID.
   */
  getRequestedSopInstanceUid(): string {
    const command = this.getCommandDataset();
    return command.getElement('RequestedSOPInstanceUID');
  }

  /**
   * Sets requested SOP instance UID.
   * @method
   * @param {string} requestedSopInstanceUid - Requested SOP instance UID.
   */
  setRequestedSopInstanceUid(requestedSopInstanceUid: string) {
    const command = this.getCommandDataset();
    command.setElement('RequestedSOPInstanceUID', requestedSopInstanceUid);
  }

  /**
   * Gets request message ID.
   * @method
   * @return {number} Request message ID.
   */
  getMessageId(): number {
    const command = this.getCommandDataset();
    return Number.parseInt(command.getElement('MessageID'));
  }

  /**
   * Sets request message ID.
   * @method
   * @param {number} messageId - Request message ID.
   */
  setMessageId(messageId: number) {
    const command = this.getCommandDataset();
    command.setElement('MessageID', messageId);
  }

  /**
   * Raise response event.
   * @method
   * @param {Response} response - Response.
   */
  raiseResponseEvent(response: Response) {
    this.emit('response', response, this._cb);
  }

  /**
   * Raise instance event.
   * Special event for datasets coming from C-GET operations,
   * as C-STORE requests.
   * @method
   * @param {Dataset} dataset - Dataset.
   */
  raiseInstanceEvent(dataset: Dataset) {
    this.emit('instance', dataset, this._cb);
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
  toString(opts?: toStringOptions): string {
    return `${super.toString(opts)} [id: ${this.getMessageId()}]`;
  }

  _cb() {
    return;
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
  constructor(
    type: number,
    affectedOrRequestedClassUid: string,
    hasDataset: boolean,
    status: number,
    errorComment: string
  ) {
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
  getAffectedSopClassUid(): string {
    const command = this.getCommandDataset();
    return command.getElement('AffectedSOPClassUID');
  }

  /**
   * Sets affected SOP class UID.
   * @method
   * @param {string} affectedSopClassUid - Affected SOP class UID.
   */
  setAffectedSopClassUid(affectedSopClassUid: string) {
    const command = this.getCommandDataset();
    command.setElement('AffectedSOPClassUID', affectedSopClassUid);
  }

  /**
   * Gets requested SOP class UID.
   * @method
   * @returns {string} Requested SOP class UID.
   */
  getRequestedSopClassUid(): string {
    const command = this.getCommandDataset();
    return command.getElement('RequestedSOPClassUID');
  }

  /**
   * Sets requested SOP class UID.
   * @method
   * @param {string} requestedSopClassUid - Requested SOP class UID.
   */
  setRequestedSopClassUid(requestedSopClassUid: string) {
    const command = this.getCommandDataset();
    command.setElement('RequestedSOPClassUID', requestedSopClassUid);
  }

  /**
   * Gets affected SOP instance UID.
   * @method
   * @returns {string} Affected SOP instance UID.
   */
  getAffectedSopInstanceUid(): string {
    const command = this.getCommandDataset();
    return command.getElement('AffectedSOPInstanceUID');
  }

  /**
   * Sets affected SOP instance UID.
   * @method
   * @param {string} affectedSopInstanceUid - Affected SOP instance UID.
   */
  setAffectedSopInstanceUid(affectedSopInstanceUid: string) {
    const command = this.getCommandDataset();
    command.setElement('AffectedSOPInstanceUID', affectedSopInstanceUid);
  }

  /**
   * Gets requested SOP instance UID.
   * @method
   * @returns {string} Requested SOP instance UID.
   */
  getRequestedSopInstanceUid(): string {
    const command = this.getCommandDataset();
    return command.getElement('RequestedSOPInstanceUID');
  }

  /**
   * Sets requested SOP instance UID.
   * @method
   * @param {string} requestedSopInstanceUid - Requested SOP instance UID.
   */
  setRequestedSopInstanceUid(requestedSopInstanceUid: string) {
    const command = this.getCommandDataset();
    command.setElement('RequestedSOPInstanceUID', requestedSopInstanceUid);
  }

  /**
   * Gets status.
   * @method
   * @returns {number} Status.
   */
  getStatus(): number {
    const command = this.getCommandDataset();
    return Number.parseInt(command.getElement('Status'));
  }

  /**
   * Sets status.
   * @method
   * @param {number} status - Status.
   */
  setStatus(status: number) {
    const command = this.getCommandDataset();
    command.setElement('Status', status);
  }

  /**
   * Gets error comment.
   * @method
   * @returns {string} Error comment.
   */
  getErrorComment(): string {
    const command = this.getCommandDataset();
    return command.getElement('ErrorComment');
  }

  /**
   * Sets error comment.
   * @method
   * @param {string} errorComment - Error comment.
   */
  setErrorComment(errorComment: string) {
    const command = this.getCommandDataset();
    command.setElement('ErrorComment', errorComment);
  }

  /**
   * Gets response message ID.
   * @method
   * @return {number} Response message ID.
   */
  getMessageIdBeingRespondedTo(): number {
    const command = this.getCommandDataset();
    return Number.parseInt(command.getElement('MessageIDBeingRespondedTo'));
  }

  /**
   * Sets response message ID.
   * @method
   * @param {number} messageId - Response message ID.
   */
  setMessageIdBeingRespondedTo(messageId: number) {
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
  toString(opts?: toStringOptions): string {
    return `${super.toString(
      opts
    )} [id: ${this.getMessageIdBeingRespondedTo()}; status: ${this._statusToString(
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
  _statusToString(status: number): string {
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
   * @param {number} [status] - Response status.
   * @param {string} [errorComment] - Error comment.
   */
  constructor(status?: number, errorComment?: string) {
    super(CommandFieldType.CEchoResponse, SopClass.Verification, false, status, errorComment);
  }

  /**
   * Creates a C-ECHO response from a request.
   * @method
   * @static
   * @param {CEchoRequest} request - C-ECHO request.
   * @returns {CEchoResponse} C-ECHO response.
   * @throws Error if request is not an instance of CEchoRequest.
   */
  static fromRequest(request: CEchoRequest): CEchoResponse {
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
  constructor(priority?: Priority) {
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
  getPriority(): Priority {
    const command = this.getCommandDataset();
    return Number.parseInt(command.getElement('Priority'));
  }

  /**
   * Sets request priority.
   * @method
   * @param {Priority} priority - Request request priority.
   */
  setPriority(priority: Priority) {
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
  static createStudyFindRequest(elements: object, priority?: Priority): CFindRequest {
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
    const mergedElements: DatasetElements = { ...baseElements, ...elements };
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
  static createSeriesFindRequest(elements: object, priority?: Priority): CFindRequest {
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
    const mergedElements: DatasetElements = { ...baseElements, ...elements };
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
  static createImageFindRequest(elements: object, priority?: Priority): CFindRequest {
    const baseElements = {
      StudyInstanceUID: '',
      SeriesInstanceUID: '',
      SOPInstanceUID: '',
      InstanceNumber: '',
      Modality: '',
    };
    const mergedElements: DatasetElements = { ...baseElements, ...elements };
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
  static createWorklistFindRequest(elements: object, priority?: Priority): CFindRequest {
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
    const mergedElements: DatasetElements = { ...baseElements, ...elements };
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
   * @param {number} [status] - Response status.
   * @param {string} [errorComment] - Error comment.
   */
  constructor(status?: number, errorComment?: string) {
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
   * @throws Error if request is not an instance of CFindRequest.
   */
  static fromRequest(request: CFindRequest): CFindResponse {
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
   * @param {Object|String} [datasetOrFile] - Dataset or part10 file path.
   * @param {Priority} [priority] - Request priority.
   */
  constructor(datasetOrFile?: object | string, priority?: Priority) {
    super(CommandFieldType.CStoreRequest, '', false);
    this.setPriority(priority || Priority.Medium);

    if (datasetOrFile instanceof Dataset) {
      this.setAffectedSopClassUid(datasetOrFile.getElement('SOPClassUID'));
      this.setAffectedSopInstanceUid(datasetOrFile.getElement('SOPInstanceUID'));
      this.setDataset(datasetOrFile);
      return;
    }
    if (typeof datasetOrFile === 'string') {
      const dataset = Dataset.fromFile(datasetOrFile);
      this.setAffectedSopClassUid(dataset.getElement('SOPClassUID'));
      this.setAffectedSopInstanceUid(dataset.getElement('SOPInstanceUID'));
      this.setDataset(dataset);
    }
  }

  /**
   * Gets request priority.
   * @method
   * @return {Priority} Request priority.
   */
  getPriority(): Priority {
    const command = this.getCommandDataset();
    return Number.parseInt(command.getElement('Priority'));
  }

  /**
   * Sets request priority.
   * @method
   * @param {Priority} priority - Request request priority.
   */
  setPriority(priority: Priority) {
    const command = this.getCommandDataset();
    command.setElement('Priority', priority);
  }
}
//#endregion

//#region CStoreResponse
class CStoreResponse extends Response {
  /**
   * Creates an instance of CStoreResponse.
   * @constructor
   * @param {number} [status] - Response status.
   * @param {string} [errorComment] - Error comment.
   */
  constructor(status?: number, errorComment?: string) {
    super(CommandFieldType.CStoreResponse, '', false, status, errorComment);
  }

  /**
   * Creates a C-STORE response from a request.
   * @method
   * @static
   * @param {CStoreRequest} request - C-STORE request.
   * @returns {CStoreResponse} C-STORE response.
   * @throws Error if request is not an instance of CStoreRequest.
   */
  static fromRequest(request: CStoreRequest): CStoreResponse {
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
  constructor(priority?: Priority) {
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
  getPriority(): Priority {
    const command = this.getCommandDataset();
    return Number.parseInt(command.getElement('Priority'));
  }

  /**
   * Sets request priority.
   * @method
   * @param {Priority} priority - Request request priority.
   */
  setPriority(priority: Priority) {
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
  static createStudyMoveRequest(
    destinationAet: string,
    studyInstanceUid: string,
    priority: Priority
  ): CMoveRequest {
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
  static createSeriesMoveRequest(
    destinationAet: string,
    studyInstanceUid: string,
    seriesInstanceUid: string,
    priority: Priority
  ): CMoveRequest {
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
    destinationAet: string,
    studyInstanceUid: string,
    seriesInstanceUid: string,
    sopInstanceUid: string,
    priority: Priority
  ): CMoveRequest {
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
   * @param {number} [status] - Response status.
   * @param {string} [errorComment] - Error comment.
   */
  constructor(status?: number, errorComment?: string) {
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
  getRemaining(): number {
    const command = this.getCommandDataset();
    return Number.parseInt(command.getElement('NumberOfRemainingSuboperations'));
  }

  /**
   * Gets completed sub operations.
   * @method
   * @returns {number} Completed sub operations.
   */
  getCompleted(): number {
    const command = this.getCommandDataset();
    return Number.parseInt(command.getElement('NumberOfCompletedSuboperations'));
  }

  /**
   * Gets sub operations with warnings.
   * @method
   * @returns {number} Sub operations with warnings.
   */
  getWarnings(): number {
    const command = this.getCommandDataset();
    return Number.parseInt(command.getElement('NumberOfWarningSuboperations'));
  }

  /**
   * Gets failed sub operations.
   * @method
   * @returns {number} Failed sub operations.
   */
  getFailures(): number {
    const command = this.getCommandDataset();
    return Number.parseInt(command.getElement('NumberOfFailedSuboperations'));
  }

  /**
   * Creates a C-MOVE response from a request.
   * @method
   * @static
   * @param {CMoveRequest} request - C-MOVE request.
   * @returns {CMoveResponse} C-MOVE response.
   * @throws Error if request is not an instance of CMoveRequest.
   */
  static fromRequest(request: CMoveRequest): CMoveResponse {
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
  constructor(priority?: Priority) {
    super(CommandFieldType.CGetRequest, SopClass.StudyRootQueryRetrieveInformationModelGet, false);
    this.setPriority(priority || Priority.Medium);
  }

  /**
   * Gets request priority.
   * @method
   * @return {Priority} Request priority.
   */
  getPriority(): Priority {
    const command = this.getCommandDataset();
    return Number.parseInt(command.getElement('Priority'));
  }

  /**
   * Sets request priority.
   * @method
   * @param {Priority} priority - Request request priority.
   */
  setPriority(priority: Priority) {
    const command = this.getCommandDataset();
    command.setElement('Priority', priority);
  }

  /**
   * Creates study get request.
   * @method
   * @static
   * @param {string} studyInstanceUid - Study instance UID of the study to get.
   * @param {Priority} [priority] - Request priority.
   * @return {CGetRequest} Study get request.
   */
  static createStudyGetRequest(studyInstanceUid: string, priority?: Priority): CGetRequest {
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
  static createSeriesGetRequest(
    studyInstanceUid: string,
    seriesInstanceUid: string,
    priority: Priority
  ): CGetRequest {
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
  static createImageGetRequest(
    studyInstanceUid: string,
    seriesInstanceUid: string,
    sopInstanceUid: string,
    priority: Priority
  ): CGetRequest {
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
   * @param {number} [status] - Response status.
   * @param {string} [errorComment] - Error comment.
   */
  constructor(status?: number, errorComment?: string) {
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
  getRemaining(): number {
    const command = this.getCommandDataset();
    return Number.parseInt(command.getElement('NumberOfRemainingSuboperations'));
  }

  /**
   * Gets completed sub operations.
   * @method
   * @returns {number} Completed sub operations.
   */
  getCompleted(): number {
    const command = this.getCommandDataset();
    return Number.parseInt(command.getElement('NumberOfCompletedSuboperations'));
  }

  /**
   * Gets sub operations with warnings.
   * @method
   * @returns {number} Sub operations with warnings.
   */
  getWarnings(): number {
    const command = this.getCommandDataset();
    return Number.parseInt(command.getElement('NumberOfWarningSuboperations'));
  }

  /**
   * Gets failed sub operations.
   * @method
   * @returns {number} Failed sub operations.
   */
  getFailures(): number {
    const command = this.getCommandDataset();
    return Number.parseInt(command.getElement('NumberOfFailedSuboperations'));
  }

  /**
   * Creates a C-GET response from a request.
   * @method
   * @static
   * @param {CGetRequest} request - C-GET request.
   * @returns {CGetResponse} C-GET response.
   * @throws Error if request is not an instance of CGetRequest.
   */
  static fromRequest(request: CGetRequest): CGetResponse {
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
   * @param {string} [affectedSopClassUid] - Affected SOP Class UID.
   * @param {string} [affectedSopInstanceUid] - Affected SOP Instance UID.
   */
  constructor(affectedSopClassUid?: string, affectedSopInstanceUid?: string) {
    super(CommandFieldType.NCreateRequest, affectedSopClassUid, false);
    this.setAffectedSopInstanceUid(affectedSopInstanceUid);
  }
}
//#endregion

//#region NCreateResponse
class NCreateResponse extends Response {
  /**
   * Creates an instance of NCreateResponse.
   * @constructor
   * @param {string} [affectedSopClassUid] - Affected SOP Class UID.
   * @param {string} [affectedSopInstanceUid] - Affected SOP Instance UID.
   * @param {number} [status] - Response status.
   * @param {string} [errorComment] - Error comment.
   */
  constructor(
    affectedSopClassUid?: string,
    affectedSopInstanceUid?: string,
    status?: number,
    errorComment?: string
  ) {
    super(CommandFieldType.NCreateResponse, affectedSopClassUid, false, status, errorComment);
    this.setAffectedSopInstanceUid(affectedSopInstanceUid);
  }

  /**
   * Creates an N-CREATE response from a request.
   * @method
   * @static
   * @param {NCreateRequest} request - N-CREATE request.
   * @returns {NCreateResponse} N-CREATE response.
   * @throws Error if request is not an instance of NCreateRequest.
   */
  static fromRequest(request: NCreateRequest): NCreateResponse {
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
   * @param {string} [requestedSopClassUid] - Requested SOP Class UID.
   * @param {string} [requestedSopInstanceUid] - Requested SOP Instance UID.
   * @param {number} [actionTypeId] - Action type ID.
   */
  constructor(
    requestedSopClassUid?: string,
    requestedSopInstanceUid?: string,
    actionTypeId?: number
  ) {
    super(CommandFieldType.NActionRequest, requestedSopClassUid, false);
    this.setRequestedSopInstanceUid(requestedSopInstanceUid);
    this.setActionTypeId(actionTypeId);
  }

  /**
   * Gets action type ID.
   * @method
   * @return {number} Action type ID.
   */
  getActionTypeId(): number {
    const command = this.getCommandDataset();
    return Number.parseInt(command.getElement('ActionTypeID'));
  }

  /**
   * Sets action type ID.
   * @method
   * @param {number} actionTypeId - Action type ID.
   */
  setActionTypeId(actionTypeId: number) {
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
   * @param {string} [affectedSopClassUid] - Affected SOP Class UID.
   * @param {string} [affectedSopInstanceUid] - Affected SOP Instance UID.
   * @param {number} [actionTypeId] - Action type ID.
   * @param {number} [status] - Response status.
   * @param {string} [errorComment] - Error comment.
   */
  constructor(
    affectedSopClassUid?: string,
    affectedSopInstanceUid?: string,
    actionTypeId?: number,
    status?: number,
    errorComment?: string
  ) {
    super(CommandFieldType.NActionResponse, affectedSopClassUid, false, status, errorComment);
    this.setAffectedSopInstanceUid(affectedSopInstanceUid);
    this.setActionTypeId(actionTypeId);
  }

  /**
   * Gets action type ID.
   * @method
   * @return {number} Action type ID.
   */
  getActionTypeId(): number {
    const command = this.getCommandDataset();
    return Number.parseInt(command.getElement('ActionTypeID'));
  }

  /**
   * Sets action type ID.
   * @method
   * @param {number} actionTypeId - Action type ID.
   */
  setActionTypeId(actionTypeId: number) {
    const command = this.getCommandDataset();
    command.setElement('ActionTypeID', actionTypeId);
  }

  /**
   * Creates an N-ACTION response from a request.
   * @method
   * @static
   * @param {NActionRequest} request - N-ACTION request.
   * @returns {NActionResponse} N-ACTION response.
   * @throws Error if request is not an instance of NActionRequest.
   */
  static fromRequest(request: NActionRequest): NActionResponse {
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
   * @param {string} [requestedSopClassUid] - Requested SOP Class UID.
   * @param {string} [requestedSopInstanceUid] - Requested SOP Instance UID.
   */
  constructor(requestedSopClassUid?: string, requestedSopInstanceUid?: string) {
    super(CommandFieldType.NDeleteRequest, requestedSopClassUid, false);
    this.setRequestedSopInstanceUid(requestedSopInstanceUid);
  }
}
//#endregion

//#region NDeleteResponse
class NDeleteResponse extends Response {
  /**
   * Creates an instance of NDeleteResponse.
   * @constructor
   * @param {string} [affectedSopClassUid] - Affected SOP Class UID.
   * @param {string} [affectedSopInstanceUid] - Affected SOP Instance UID.
   * @param {number} [status] - Response status.
   * @param {string} [errorComment] - Error comment.
   */
  constructor(
    affectedSopClassUid?: string,
    affectedSopInstanceUid?: string,
    status?: number,
    errorComment?: string
  ) {
    super(CommandFieldType.NDeleteResponse, affectedSopClassUid, false, status, errorComment);
    this.setAffectedSopInstanceUid(affectedSopInstanceUid);
  }

  /**
   * Creates an N-DELETE response from a request.
   * @method
   * @static
   * @param {NDeleteRequest} request - N-DELETE request.
   * @returns {NDeleteResponse} N-DELETE response.
   * @throws Error if request is not an instance of NDeleteRequest.
   */
  static fromRequest(request: NDeleteRequest): NDeleteResponse {
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
   * @param {string} [affectedSopClassUid] - Affected SOP Class UID.
   * @param {string} [affectedSopInstanceUid] - Affected SOP Instance UID.
   * @param {number} [eventTypeID] - Event type ID.
   */
  constructor(affectedSopClassUid?: string, affectedSopInstanceUid?: string, eventTypeID?: number) {
    super(CommandFieldType.NEventReportRequest, affectedSopClassUid, false);
    this.setAffectedSopInstanceUid(affectedSopInstanceUid);
    this.setEventTypeId(eventTypeID);
  }

  /**
   * Gets event type ID.
   * @method
   * @return {number} Event type ID.
   */
  getEventTypeId(): number {
    const command = this.getCommandDataset();
    return Number.parseInt(command.getElement('EventTypeID'));
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
   * @param {string} [affectedSopClassUid] - Affected SOP Class UID.
   * @param {string} [affectedSopInstanceUid] - Affected SOP Instance UID.
   * @param {number} [eventTypeID] - Event type ID.
   * @param {number} [status] - Response status.
   * @param {string} [errorComment] - Error comment.
   */
  constructor(
    affectedSopClassUid?: string,
    affectedSopInstanceUid?: string,
    eventTypeID?: number,
    status?: number,
    errorComment?: string
  ) {
    super(CommandFieldType.NEventReportResponse, affectedSopClassUid, false, status, errorComment);
    this.setAffectedSopInstanceUid(affectedSopInstanceUid);
    this.setEventTypeId(eventTypeID);
  }

  /**
   * Gets event type ID.
   * @method
   * @return {number} Event type ID.
   */
  getEventTypeId(): number {
    const command = this.getCommandDataset();
    return Number.parseInt(command.getElement('EventTypeID'));
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
   * @throws Error if request is not an instance of NEventReportRequest.
   */
  static fromRequest(request: NEventReportRequest): NEventReportResponse {
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
   * @param {string} [requestedSopClassUid] - Requested SOP Class UID.
   * @param {string} [requestedSopInstanceUid] - Requested SOP Instance UID.
   * @param {Array<string>} [attributeIdentifierList] - The requested attributes identifier list.
   */
  constructor(
    requestedSopClassUid?: string,
    requestedSopInstanceUid?: string,
    attributeIdentifierList?: Array<string>
  ) {
    super(CommandFieldType.NGetRequest, requestedSopClassUid, false);
    this.setRequestedSopInstanceUid(requestedSopInstanceUid);
    this.setAttributeIdentifierList(
      !Array.isArray(attributeIdentifierList) ? [attributeIdentifierList] : attributeIdentifierList
    );
  }

  /**
   * Gets requested attributes identifier list.
   * @method
   * @return {Array<string>} The requested attributes identifier list.
   */
  getAttributeIdentifierList(): Array<string> {
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
  setAttributeIdentifierList(attributeIdentifierList: Array<string>) {
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
  _getPaddedHexString(num: number, length: number): string {
    const str = num.toString(16);
    return '0'.repeat(length - str.length) + str;
  }
  //#endregion
}
//#endregion

//#region NGetResponse
class NGetResponse extends Response {
  /**
   * Creates an instance of NEventReportResponse.
   * @constructor
   * @param {string} [affectedSopClassUid] - Affected SOP Class UID.
   * @param {string} [affectedSopInstanceUid] - Affected SOP Instance UID.
   * @param {number} [status] - Response status.
   * @param {string} [errorComment] - Error comment.
   */
  constructor(
    affectedSopClassUid?: string,
    affectedSopInstanceUid?: string,
    status?: number,
    errorComment?: string
  ) {
    super(CommandFieldType.NGetResponse, affectedSopClassUid, false, status, errorComment);
    this.setAffectedSopInstanceUid(affectedSopInstanceUid);
  }

  /**
   * Creates an N-GET response from a request.
   * @method
   * @static
   * @param {NGetRequest} request - N-GET request.
   * @returns {NGetResponse} N-GET response.
   * @throws Error if request is not an instance of NGetRequest.
   */
  static fromRequest(request: NGetRequest): NGetResponse {
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
   * @param {string} [requestedSopClassUid] - Requested SOP Class UID.
   * @param {string} [requestedSopInstanceUid] - Requested SOP Instance UID.
   */
  constructor(requestedSopClassUid?: string, requestedSopInstanceUid?: string) {
    super(CommandFieldType.NSetRequest, requestedSopClassUid, false);
    this.setRequestedSopInstanceUid(requestedSopInstanceUid);
  }
}
//#endregion

//#region NSetResponse
class NSetResponse extends Response {
  /**
   * Creates an instance of NEventReportResponse.
   * @constructor
   * @param {string} [affectedSopClassUid] - Affected SOP Class UID.
   * @param {string} [affectedSopInstanceUid] - Affected SOP Instance UID.
   * @param {number} [status] - Response status.
   * @param {string} [errorComment] - Error comment.
   */
  constructor(
    affectedSopClassUid?: string,
    affectedSopInstanceUid?: string,
    status?: number,
    errorComment?: string
  ) {
    super(CommandFieldType.NSetResponse, affectedSopClassUid, false, status, errorComment);
    this.setAffectedSopInstanceUid(affectedSopInstanceUid);
  }

  /**
   * Creates an N-SET response from a request.
   * @method
   * @static
   * @param {NSetRequest} request - N-SET request.
   * @returns {NSetResponse} N-SET response.
   * @throws Error if request is not an instance of NSetRequest.
   */
  static fromRequest(request: NSetRequest): NSetResponse {
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

//#region Exports
export {
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
};
//#endregion
