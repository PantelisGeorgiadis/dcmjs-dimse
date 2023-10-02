import { Mixin } from 'ts-mixer';
import { Logger } from 'winston';
import { Socket } from 'net';
import { SecureContext, TLSSocket } from 'tls';
import AsyncEventEmitter from 'async-eventemitter';

declare namespace PresentationContextResult {
  const Proposed: number;
  const Accept: number;
  const RejectUser: number;
  const RejectNoReason: number;
  const RejectAbstractSyntaxNotSupported: number;
  const RejectTransferSyntaxesNotSupported: number;
}

declare namespace UserIdentityType {
  const Username: number;
  const UsernameAndPasscode: number;
  const Kerberos: number;
  const Saml: number;
  const Jwt: number;
}

declare namespace AbortSource {
  const ServiceUser: number;
  const Unknown: number;
  const ServiceProvider: number;
}

declare namespace AbortReason {
  const NotSpecified: number;
  const UnrecognizedPdu: number;
  const UnexpectedPdu: number;
  const UnrecognizedPduParameter: number;
  const UnexpectedPduParameter: number;
  const InvalidPduParameter: number;
}

declare namespace RejectResult {
  const Permanent: number;
  const Transient: number;
}

declare namespace RejectSource {
  const ServiceUser: number;
  const ServiceProviderAcse: number;
  const ServiceProviderPresentation: number;
}

declare namespace RejectReason {
  const NoReasonGiven: number;
  const ApplicationContextNotSupported: number;
  const CallingAeNotRecognized: number;
  const CalledAeNotRecognized: number;
  const ProtocolVersionNotSupported: number;
  const TemporaryCongestion: number;
  const LocalLimitExceeded: number;
}

declare namespace Priority {
  const Low: number;
  const Medium: number;
  const High: number;
}

declare namespace Status {
  const Success: number;
  const Cancel: number;
  const Pending: number;
  const ClassInstanceConflict: number;
  const DataSetSopClassMismatch: number;
  const DuplicateSOPInstance: number;
  const DuplicateInvocation: number;
  const InvalidArgumentValue: number;
  const InvalidAttributeValue: number;
  const InvalidObjectInstance: number;
  const MissingAttribute: number;
  const MissingAttributeValue: number;
  const MistypedArgument: number;
  const MoveDestinationUnknown: number;
  const NoSuchActionType: number;
  const NoSuchArgument: number;
  const NoSuchEventType: number;
  const NoSuchObjectInstance: number;
  const NoSuchSopClass: number;
  const NotAuthorized: number;
  const OutOfResourcesNumberOfMatches: number;
  const OutOfResourcesSubOperations: number;
  const ProcessingFailure: number;
  const ResourceLimitation: number;
  const SopClassNotSupported: number;
  const UnrecognizedOperation: number;
}

declare namespace StorageClass {
  const BasicTextSrStorage: string;
  const BreastProjectionXRayImageStorageForPresentation: string;
  const BreastProjectionXRayImageStorageForProcessing: string;
  const BreastTomosynthesisImageStorage: string;
  const ChestCadSrStorage: string;
  const ComprehensiveSrStorage: string;
  const ComputedRadiographyImageStorage: string;
  const CtImageStorage: string;
  const DigitalIntraOralXRayImageStorageForPresentation: string;
  const DigitalIntraOralXRayImageStorageForProcessing: string;
  const DigitalMammographyXRayImageStorageForPresentation: string;
  const DigitalMammographyXRayImageStorageForProcessing: string;
  const DigitalXRayImageStorageForPresentation: string;
  const DigitalXRayImageStorageForProcessing: string;
  const EncapsulatedCdaStorage: string;
  const EncapsulatedPdfStorage: string;
  const EnhancedCtImageStorage: string;
  const EnhancedMrColorImageStorage: string;
  const EnhancedMrImageStorage: string;
  const EnhancedPetImageStorage: string;
  const EnhancedSrStorage: string;
  const EnhancedXaImageStorage: string;
  const EnhancedXrfImageStorage: string;
  const IntravascularOpticalCoherenceTomographyImageStorageForPresentation: string;
  const IntravascularOpticalCoherenceTomographyImageStorageForProcessing: string;
  const LegacyConvertedEnhancedCTImageStorage: string;
  const LegacyConvertedEnhancedMRImageStorage: string;
  const LegacyConvertedEnhancedPETImageStorage: string;
  const MammographyCadSrStorage: string;
  const MrImageStorage: string;
  const MultiframeGrayscaleByteSecondaryCaptureImageStorage: string;
  const MultiframeGrayscaleWordSecondaryCaptureImageStorage: string;
  const MultiframeSingleBitSecondaryCaptureImageStorage: string;
  const MultiframeTrueColorSecondaryCaptureImageStorage: string;
  const NuclearMedicineImageStorage: string;
  const OphthalmicOpticalCoherenceTomographyEnFaceImageStorage: string;
  const OphthalmicPhotography16BitImageStorage: string;
  const OphthalmicPhotography8BitImageStorage: string;
  const OphthalmicTomographyImageStorage: string;
  const PositronEmissionTomographyImageStorage: string;
  const RtImageStorage: string;
  const SecondaryCaptureImageStorage: string;
  const UltrasoundImageStorage: string;
  const UltrasoundMultiframeImageStorage: string;
  const VideoEndoscopicImageStorage: string;
  const VideoMicroscopicImageStorage: string;
  const VideoPhotographicImageStorage: string;
  const VlEndoscopicImageStorage: string;
  const VlMicroscopicImageStorage: string;
  const VlPhotographicImageStorage: string;
  const VlSlideCoordinatesMicroscopicImageStorage: string;
  const VlWholeSlideMicroscopyImageStorage: string;
  const WideFieldOphthalmicPhotography3dCoordinatesImageStorage: string;
  const WideFieldOphthalmicPhotographyStereographicProjectionImageStorage: string;
  const XRay3dAngiographicImageStorage: string;
  const XRay3dCraniofacialImageStorage: string;
  const XRayAngiographicImageStorage: string;
  const XRayRadiationDoseSRStorage: string;
  const XRayRadiofluoroscopicImageStorage: string;
}

declare namespace SopClass {
  const Verification: string;
  const StudyRootQueryRetrieveInformationModelFind: string;
  const ModalityWorklistInformationModelFind: string;
  const ModalityPerformedProcedureStep: string;
  const StudyRootQueryRetrieveInformationModelMove: string;
  const StudyRootQueryRetrieveInformationModelGet: string;
  const StorageCommitmentPushModel: string;
  const BasicFilmSession: string;
  const PrintJob: string;
  const BasicAnnotationBox: string;
  const Printer: string;
  const PrinterConfigurationRetrieval: string;
  const BasicGrayscalePrintManagementMeta: string;
  const BasicColorPrintManagementMeta: string;
  const BasicFilmBox: string;
  const PresentationLut: string;
  const BasicGrayscaleImageBox: string;
  const BasicColorImageBox: string;
  const InstanceAvailabilityNotification: string;
}

declare namespace TransferSyntax {
  const ImplicitVRLittleEndian: string;
  const ExplicitVRLittleEndian: string;
  const DeflatedExplicitVRLittleEndian: string;
  const ExplicitVRBigEndian: string;
  const RleLossless: string;
  const JpegBaseline: string;
  const JpegLossless: string;
  const JpegLsLossless: string;
  const JpegLsLossy: string;
  const Jpeg2000Lossless: string;
  const Jpeg2000Lossy: string;
}

declare class Dataset {
  /**
   * Creates an instance of Dataset.
   */
  constructor(
    elementsOrBuffer?: Record<string, unknown> | Buffer,
    transferSyntaxUid?: string,
    readOptions?: Record<string, unknown>
  );

  /**
   * Gets element value.
   */
  getElement(tag: string): string | undefined;

  /**
   * Sets element value.
   */
  setElement(tag: string, value: string): void;

  /**
   * Gets all elements.
   */
  getElements(): Record<string, unknown>;

  /**
   * Gets DICOM transfer syntax UID.
   */
  getTransferSyntaxUid(): string;

  /**
   * Sets DICOM transfer syntax UID.
   */
  setTransferSyntaxUid(transferSyntaxUid: string): void;

  /**
   * Gets elements encoded in a DICOM dataset buffer.
   */
  getDenaturalizedDataset(
    writeOptions?: Record<string, unknown>,
    nameMap?: Record<string, unknown>
  ): Buffer;

  /**
   * Gets command elements encoded in a DICOM dataset buffer.
   */
  getDenaturalizedCommandDataset(): Buffer;

  /**
   * Loads a dataset from DICOM P10 file.
   */
  static fromFile(
    path: string,
    callback?: (error: Error | undefined, dataset: Dataset | undefined) => void,
    readOptions?: Record<string, unknown>
  ): Dataset | undefined;

  /**
   * Saves a dataset to DICOM P10 file.
   */
  toFile(
    path: string,
    callback?: (error: Error | undefined) => void,
    nameMap?: Record<string, unknown>,
    writeOptions?: Record<string, unknown>
  ): void;

  /**
   * Generates a UUID-derived UID.
   */
  static generateDerivedUid(): string;

  /**
   * Gets the dataset description.
   */
  toString(): string;
}

declare class Implementation {
  /**
   * Gets implementation class UID.
   */
  static getImplementationClassUid(): string;

  /**
   * Sets implementation class UID.
   */
  static setImplementationClassUid(uid: string): void;

  /**
   * Gets implementation version.
   */
  static getImplementationVersion(): string;

  /**
   * Sets implementation version.
   */
  static setImplementationVersion(version: string): void;

  /**
   * Gets max PDU length.
   */
  static getMaxPduLength(): number;

  /**
   * Sets max PDU length.
   */
  static setMaxPduLength(maxLength: number): void;
}

declare class PresentationContext {
  /**
   * Creates an instance of PresentationContext.
   */
  constructor(pcId: number, abstractSyntaxUid: string, transferSyntaxUid?: string, result?: number);

  /**
   * Gets presentation context ID.
   */
  getPresentationContextId(): number;

  /**
   * Gets abstract syntax UID.
   */
  getAbstractSyntaxUid(): string;

  /**
   * Gets transfer syntax UIDs.
   */
  getTransferSyntaxUids(): Array<string>;

  /**
   * Add transfer syntax UID.
   */
  addTransferSyntaxUid(transferSyntaxUid: string): void;

  /**
   * Removes transfer syntax UID.
   */
  removeTransferSyntaxUid(transferSyntaxUid: string): void;

  /**
   * Checks whether transfer syntax UID is present.
   */
  hasTransferSyntaxUid(transferSyntaxUid: string): boolean;

  /**
   * Gets the accepted transfer syntax UID.
   */
  getAcceptedTransferSyntaxUid(): string | undefined;

  /**
   * Gets the presentation context result.
   */
  getResult(): number;

  /**
   * Sets the presentation context result.
   */
  setResult(result: number, acceptedTransferSyntaxUid?: string): void;

  /**
   * Gets the presentation context result description.
   */
  getResultDescription(): string;

  /**
   * Gets the presentation context description.
   */
  toString(): string;
}

declare class Association {
  /**
   * Creates an instance of Association.
   */
  constructor(callingAeTitle: string, calledAeTitle: string);

  /**
   * Gets the calling AE title.
   */
  getCallingAeTitle(): string;

  /**
   * Sets the calling AE title.
   */
  setCallingAeTitle(aet: string): void;

  /**
   * Gets the called AE title.
   */
  getCalledAeTitle(): string;

  /**
   * Sets the called AE title.
   */
  setCalledAeTitle(aet: string): void;

  /**
   * Gets maximum PDU length.
   */
  getMaxPduLength(): number;

  /**
   * Sets maximum PDU length.
   */
  setMaxPduLength(maxPduLength: number): void;

  /**
   * Gets the application context name.
   */
  getApplicationContextName(): string;

  /**
   * Gets the implementation class UID.
   */
  getImplementationClassUid(): string;

  /**
   * Sets the implementation class UID.
   */
  setImplementationClassUid(uid: string): void;

  /**
   * Gets the implementation version.
   */
  getImplementationVersion(): string;

  /**
   * Sets the implementation version.
   */
  setImplementationVersion(version: string): void;

  /**
   * Gets a flag indicating whether to negotiate asynchronous operations.
   */
  getNegotiateAsyncOps(): boolean;

  /**
   * Sets a flag indicating whether to negotiate asynchronous operations.
   */
  setNegotiateAsyncOps(negotiate: boolean): void;

  /**
   * Gets the supported maximum number of asynchronous operations invoked.
   */
  getMaxAsyncOpsInvoked(): number;

  /**
   * Sets the supported maximum number of asynchronous operations invoked.
   */
  setMaxAsyncOpsInvoked(ops: number): void;

  /**
   * Gets the supported maximum number of asynchronous operations performed.
   */
  getMaxAsyncOpsPerformed(): number;

  /**
   * Sets the supported maximum number of asynchronous operations performed.
   */
  setMaxAsyncOpsPerformed(ops: number): void;

  /**
   * Gets a flag indicating whether to negotiate user identity.
   */
  getNegotiateUserIdentity(): boolean;

  /**
   * Sets a flag indicating whether to negotiate user identity.
   */
  setNegotiateUserIdentity(negotiate: boolean): void;

  /**
   * Gets the user identity type.
   */
  getUserIdentityType(): number;

  /**
   * Sets the user identity type.
   */
  setUserIdentityType(type: number): void;

  /**
   * Gets a flag indicating whether a positive response requested.
   */
  getUserIdentityPositiveResponseRequested(): boolean;

  /**
   * Sets a flag indicating whether a positive response requested.
   */
  setUserIdentityPositiveResponseRequested(positiveResponseRequested: boolean): void;

  /**
   * Gets the user identity primary field.
   * This field might contain the username, the Kerberos service ticket or the JWT.
   */
  getUserIdentityPrimaryField(): string;

  /**
   * Sets the user identity primary field.
   * This field might contain the username, the Kerberos service ticket or the JWT.
   */
  setUserIdentityPrimaryField(primaryField: string): void;

  /**
   * Gets the user identity secondary field.
   * This field might contain the passcode.
   */
  getUserIdentitySecondaryField(): string;

  /**
   * Sets the user identity secondary field.
   * This field might contain the passcode.
   */
  setUserIdentitySecondaryField(secondaryField: string): void;

  /**
   * Gets a flag indicating whether to negotiate user identity server response.
   */
  getNegotiateUserIdentityServerResponse(): boolean;

  /**
   * Sets a flag indicating whether to negotiate user identity server response.
   */
  setNegotiateUserIdentityServerResponse(negotiate: boolean): void;

  /**
   * Gets the user identity server response.
   * This field might contain the Kerberos server ticket if the user identity type value was 3,
   * the SAML response if the user identity type value was 4, or it might be empty
   * if the user identity type value was 1 or 2.
   */
  getUserIdentityServerResponse(): string;

  /**
   * Sets the user identity server response.
   * This field might contain the Kerberos server ticket if the user identity type value was 3,
   * the SAML response if the user identity type value was 4, or it might be empty
   * if the user identity type value was 1 or 2.
   */
  setUserIdentityServerResponse(serverResponse: string): void;

  /**
   * Adds presentation context to association.
   */
  addPresentationContext(abstractSyntaxUid: string, presentationContextId?: number): number;

  /**
   * Adds presentation context to association if not exists.
   */
  addOrGetPresentationContext(abstractSyntaxUid: string): number;

  /**
   * Adds transfer syntax to presentation context.
   */
  addTransferSyntaxToPresentationContext(pcId: number, transferSyntaxUid: string): void;

  /**
   * Finds presentation context.
   */
  findPresentationContextByAbstractSyntaxAndTransferSyntax(
    abstractSyntaxUid: string,
    transferSyntaxUid: string
  ): number | undefined;

  /**
   * Gets presentation context.
   */
  getPresentationContext(pcId: number): PresentationContext;

  /**
   * Gets presentation contexts.
   */
  getPresentationContexts(): Array<{
    id: number;
    context: PresentationContext;
  }>;

  /**
   * Clears all presentation contexts.
   */
  clearPresentationContexts(): void;

  /**
   * Adds presentation context from request.
   */
  addPresentationContextFromRequest(
    request: Request,
    transferSyntaxes?: string | Array<string>
  ): number;

  /**
   * Gets accepted presentation context from request.
   */
  getAcceptedPresentationContextFromRequest(request: Request): PresentationContext | undefined;

  /**
   * Gets the association description.
   */
  toString(): string;
}

declare class Command {
  /**
   * Creates an instance of Command.
   */
  constructor(commandDataset?: Dataset, dataset?: Dataset);

  /**
   * Gets command dataset.
   */
  getCommandDataset(): Dataset;

  /**
   * Sets command dataset.
   */
  setCommandDataset(dataset: Dataset): void;

  /**
   * Gets dataset.
   */
  getDataset(): Dataset | undefined;

  /**
   * Sets dataset and updates CommandDataSetType element.
   */
  setDataset(dataset: Dataset): void;

  /**
   * Gets command field type.
   */
  getCommandFieldType(): number;

  /**
   * Command has dataset.
   */
  hasDataset(): boolean;

  /**
   * Gets the command description.
   */
  toString(opts?: { includeCommandDataset?: boolean; includeDataset?: boolean }): string;
}

declare class Request extends Mixin(Command, AsyncEventEmitter) {
  /**
   * Creates an instance of Request.
   */
  constructor(type: number, affectedOrRequestedClassUid: string, hasDataset: boolean);

  /**
   * Gets affected SOP class UID.
   */
  getAffectedSopClassUid(): string;

  /**
   * Sets affected SOP class UID.
   */
  setAffectedSopClassUid(affectedSopClassUid: string): void;

  /**
   * Gets requested SOP class UID.
   */
  getRequestedSopClassUid(): string;

  /**
   * Sets requested SOP class UID.
   */
  setRequestedSopClassUid(requestedSopClassUid: string): void;

  /**
   * Gets affected SOP instance UID.
   */
  getAffectedSopInstanceUid(): string;

  /**
   * Sets affected SOP instance UID.
   */
  setAffectedSopInstanceUid(affectedSopInstanceUid: string): void;

  /**
   * Gets requested SOP instance UID.
   */
  getRequestedSopInstanceUid(): string;

  /**
   * Sets requested SOP instance UID.
   */
  setRequestedSopInstanceUid(requestedSopInstanceUid: string): void;

  /**
   * Gets request message ID.
   */
  getMessageId(): number;

  /**
   * Sets request message ID.
   */
  setMessageId(messageId: number): void;

  /**
   * Raise response event.
   */
  raiseResponseEvent(response: Response): void;

  /**
   * Raise instance event.
   */
  raiseInstanceEvent(dataset: Dataset): void;

  /**
   * Raise done event.
   */
  raiseDoneEvent(): void;

  /**
   * Gets the request description.
   */
  toString(opts?: { includeCommandDataset?: boolean; includeDataset?: boolean }): string;
}

declare class Response extends Command {
  /**
   * Creates an instance of Response.
   */
  constructor(
    type: number,
    affectedOrRequestedClassUid: string,
    hasDataset: boolean,
    status: number,
    errorComment: string
  );

  /**
   * Gets affected SOP class UID.
   */
  getAffectedSopClassUid(): string;

  /**
   * Sets affected SOP class UID.
   */
  setAffectedSopClassUid(affectedSopClassUid: string): void;

  /**
   * Gets requested SOP class UID.
   */
  getRequestedSopClassUid(): string;

  /**
   * Sets requested SOP class UID.
   */
  setRequestedSopClassUid(requestedSopClassUid: string): void;

  /**
   * Gets affected SOP instance UID.
   */
  getAffectedSopInstanceUid(): string;

  /**
   * Sets affected SOP instance UID.
   */
  setAffectedSopInstanceUid(affectedSopInstanceUid: string): void;

  /**
   * Gets requested SOP instance UID.
   */
  getRequestedSopInstanceUid(): string;

  /**
   * Sets requested SOP instance UID.
   */
  setRequestedSopInstanceUid(requestedSopInstanceUid: string): void;

  /**
   * Gets status.
   */
  getStatus(): number;

  /**
   * Sets status.
   */
  setStatus(status: number): void;

  /**
   * Gets error comment.
   */
  getErrorComment(): string;

  /**
   * Sets error comment.
   */
  setErrorComment(errorComment: string): void;

  /**
   * Gets response message ID.
   */
  getMessageIdBeingRespondedTo(): number;

  /**
   * Sets response message ID.
   */
  setMessageIdBeingRespondedTo(messageId: number): void;

  /**
   * Gets the response description.
   */
  toString(opts?: { includeCommandDataset?: boolean; includeDataset?: boolean }): string;
}

declare class CEchoRequest extends Request {
  /**
   * Creates an instance of CEchoRequest.
   */
  constructor();
}

declare class CEchoResponse extends Response {
  /**
   * Creates an instance of CEchoResponse.
   */
  constructor(status: number, errorComment: string);

  /**
   * Creates a C-ECHO response from a request.
   */
  static fromRequest(request: CEchoRequest): CEchoResponse;
}

declare class CFindRequest extends Request {
  /**
   * Creates an instance of CFindRequest.
   */
  constructor(priority?: number);

  /**
   * Gets request priority.
   */
  getPriority(): number;

  /**
   * Sets request priority.
   */
  setPriority(priority: number): void;

  /**
   * Creates study find request.
   */
  static createStudyFindRequest(elements: Record<string, unknown>, priority?: number): CFindRequest;

  /**
   * Creates series find request.
   */
  static createSeriesFindRequest(
    elements: Record<string, unknown>,
    priority?: number
  ): CFindRequest;

  /**
   * Creates image find request.
   */
  static createImageFindRequest(elements: Record<string, unknown>, priority?: number): CFindRequest;

  /**
   * Creates worklist find request.
   */
  static createWorklistFindRequest(
    elements: Record<string, unknown>,
    priority?: number
  ): CFindRequest;
}

declare class CFindResponse extends Response {
  /**
   * Creates an instance of CEchoResponse.
   */
  constructor(status: number, errorComment: string);

  /**
   * Creates a C-FIND response from a request.
   */
  static fromRequest(request: CFindRequest): CFindResponse;
}

declare class CStoreRequest extends Request {
  /**
   * Creates an instance of CStoreRequest.
   */
  constructor(datasetOrFile: Dataset | string, priority?: number);

  /**
   * Gets request priority.
   */
  getPriority(): number;

  /**
   * Sets request priority.
   */
  setPriority(priority: number): void;
}

declare class CStoreResponse extends Response {
  /**
   * Creates an instance of CStoreResponse.
   */
  constructor(status: number, errorComment: string);

  /**
   * Creates a C-STORE response from a request.
   */
  static fromRequest(request: CStoreRequest): CStoreResponse;
}

declare class CMoveRequest extends Request {
  /**
   * Creates an instance of CMoveRequest.
   */
  constructor(priority?: number);

  /**
   * Gets request priority.
   */
  getPriority(): number;

  /**
   * Sets request priority.
   */
  setPriority(priority: number): void;

  /**
   * Creates study move request.
   */
  static createStudyMoveRequest(
    destinationAet: string,
    studyInstanceUid: string,
    priority?: number
  ): CMoveRequest;

  /**
   * Creates series move request.
   */
  static createSeriesMoveRequest(
    destinationAet: string,
    studyInstanceUid: string,
    seriesInstanceUid: string,
    priority?: number
  ): CMoveRequest;

  /**
   * Creates image move request.
   */
  static createImageMoveRequest(
    destinationAet: string,
    studyInstanceUid: string,
    seriesInstanceUid: string,
    sopInstanceUid: string,
    priority?: number
  ): CMoveRequest;
}

declare class CMoveResponse extends Response {
  /**
   * Creates an instance of CMoveResponse.
   */
  constructor(status: number, errorComment: string);

  /**
   * Gets remaining sub operations.
   */
  getRemaining(): number;

  /**
   * Gets completed sub operations.
   */
  getCompleted(): number;

  /**
   * Gets sub operations with warnings.
   */
  getWarnings(): number;

  /**
   * Gets failed sub operations.
   */
  getFailures(): number;

  /**
   * Creates a C-MOVE response from a request.
   */
  static fromRequest(request: CMoveRequest): CMoveResponse;
}

declare class CGetRequest extends Request {
  /**
   * Creates an instance of CGetRequest.
   */
  constructor(priority?: number);

  /**
   * Gets request priority.
   */
  getPriority(): number;

  /**
   * Sets request priority.
   */
  setPriority(priority: number): void;

  /**
   * Gets the flag indicating whether to add all known storage SOP
   * classes, as presentation contexts, during the association.
   */
  getAddStorageSopClassesToAssociation(): boolean;

  /**
   * Sets the flag indicating whether to add all known storage SOP
   * classes, as presentation contexts, during the association.
   */
  setAddStorageSopClassesToAssociation(add: boolean): void;

  /**
   * Creates study get request.
   */
  static createStudyGetRequest(studyInstanceUid: string, priority?: number): CGetRequest;

  /**
   * Creates series get request.
   */
  static createSeriesGetRequest(
    studyInstanceUid: string,
    seriesInstanceUid: string,
    priority?: number
  ): CGetRequest;

  /**
   * Creates image get request.
   */
  static createImageGetRequest(
    studyInstanceUid: string,
    seriesInstanceUid: string,
    sopInstanceUid: string,
    priority?: number
  ): CGetRequest;
}

declare class CGetResponse extends Response {
  /**
   * Creates an instance of CGetResponse.
   */
  constructor(status: number, errorComment: string);

  /**
   * Gets remaining sub operations.
   */
  getRemaining(): number;

  /**
   * Gets completed sub operations.
   */
  getCompleted(): number;

  /**
   * Gets sub operations with warnings.
   */
  getWarnings(): number;

  /**
   * Gets failed sub operations.
   */
  getFailures(): number;

  /**
   * Creates a C-GET response from a request.
   */
  static fromRequest(request: CGetRequest): CGetResponse;
}

declare class NCreateRequest extends Request {
  /**
   * Creates an instance of NCreateRequest.
   */
  constructor(affectedSopClassUid: string, affectedSopInstanceUid: string);
}

declare class NCreateResponse extends Response {
  /**
   * Creates an instance of NCreateResponse.
   */
  constructor(
    affectedSopClassUid: string,
    affectedSopInstanceUid: string,
    status: number,
    errorComment: string
  );

  /**
   * Creates an N-CREATE response from a request.
   */
  static fromRequest(request: NCreateRequest): NCreateResponse;
}

declare class NActionRequest extends Request {
  /**
   * Creates an instance of NActionRequest.
   */
  constructor(requestedSopClassUid: string, requestedSopInstanceUid: string, actionTypeId: number);

  /**
   * Gets action type ID.
   */
  getActionTypeId(): number;

  /**
   * Sets action type ID.
   */
  setActionTypeId(actionTypeId: number): void;
}

declare class NActionResponse extends Response {
  /**
   * Creates an instance of NActionResponse.
   */
  constructor(
    affectedSopClassUid: string,
    affectedSopInstanceUid: string,
    actionTypeId: number,
    status: number,
    errorComment: string
  );

  /**
   * Gets action type ID.
   */
  getActionTypeId(): number;

  /**
   * Sets action type ID.
   */
  setActionTypeId(actionTypeId: number): void;

  /**
   * Creates an N-ACTION response from a request.
   */
  static fromRequest(request: NActionRequest): NActionResponse;
}

declare class NDeleteRequest extends Request {
  /**
   * Creates an instance of NDeleteRequest.
   */
  constructor(requestedSopClassUid: string, requestedSopInstanceUid: string);
}

declare class NDeleteResponse extends Response {
  /**
   * Creates an instance of NDeleteResponse.
   */
  constructor(
    affectedSopClassUid: string,
    affectedSopInstanceUid: string,
    status: number,
    errorComment: string
  );

  /**
   * Creates an N-DELETE response from a request.
   */
  static fromRequest(request: NDeleteRequest): NDeleteResponse;
}

declare class NEventReportRequest extends Request {
  /**
   * Creates an instance of NEventReportRequest.
   */
  constructor(affectedSopClassUid: string, affectedSopInstanceUid: string, eventTypeID: number);

  /**
   * Gets event type ID.
   */
  getEventTypeId(): number;

  /**
   * Sets event type ID.
   */
  setEventTypeId(eventTypeId: number): void;
}

declare class NEventReportResponse extends Response {
  /**
   * Creates an instance of NEventReportResponse.
   */
  constructor(
    affectedSopClassUid: string,
    affectedSopInstanceUid: string,
    eventTypeID: number,
    status: number,
    errorComment: string
  );

  /**
   * Gets event type ID.
   */
  getEventTypeId(): number;

  /**
   * Sets event type ID.
   */
  setEventTypeId(eventTypeId: number): void;

  /**
   * Creates an N-EVENT-REPORT response from a request.
   */
  static fromRequest(request: NEventReportRequest): NEventReportResponse;
}

declare class NGetRequest extends Request {
  /**
   * Creates an instance of NGetRequest.
   */
  constructor(
    requestedSopClassUid: string,
    requestedSopInstanceUid: string,
    attributeIdentifierList: Array<string>
  );

  /**
   * Gets requested attributes identifier list.
   */
  getAttributeIdentifierList(): Array<string>;

  /**
   * Sets requested attributes identifier list.
   */
  setAttributeIdentifierList(attributeIdentifierList: Array<string>): void;
}

declare class NGetResponse extends Response {
  /**
   * Creates an instance of NGetResponse.
   */
  constructor(
    affectedSopClassUid: string,
    affectedSopInstanceUid: string,
    status: number,
    errorComment: string
  );

  /**
   * Creates an N-GET response from a request.
   */
  static fromRequest(request: NGetRequest): NGetResponse;
}

declare class NSetRequest extends Request {
  /**
   * Creates an instance of NSetRequest.
   */
  constructor(requestedSopClassUid: string, requestedSopInstanceUid: string);
}

declare class NSetResponse extends Response {
  /**
   * Creates an instance of NSetResponse.
   */
  constructor(
    affectedSopClassUid: string,
    affectedSopInstanceUid: string,
    status: number,
    errorComment: string
  );

  /**
   * Creates an N-SET response from a request.
   */
  static fromRequest(request: NSetRequest): NSetResponse;
}

declare class CCancelRequest extends Request {
  /**
   * Creates an instance of CCancelRequest.
   */
  constructor(affectedSopClassUid: string, messageId: number);

  /**
   * Gets message ID to cancel.
   */
  getMessageIdBeingRespondedTo(): number;

  /**
   * Sets message ID to cancel.
   */
  setMessageIdBeingRespondedTo(messageId: number): void;

  /**
   * Creates a C-CANCEL request from a C-FIND, C-MOVE or C-GET request.
   */
  static fromRequest(request: CFindRequest | CMoveRequest | CGetRequest): CCancelRequest;
}

declare class Network extends AsyncEventEmitter<AsyncEventEmitter.EventMap> {
  /**
   * Creates an instance of Network.
   */
  constructor(
    socket: Socket | TLSSocket,
    opts?: {
      connectTimeout?: number;
      associationTimeout?: number;
      pduTimeout?: number;
      logCommandDatasets?: boolean;
      logDatasets?: boolean;
      datasetReadOptions?: Record<string, unknown>;
      datasetWriteOptions?: Record<string, unknown>;
      datasetNameMap?: Record<string, unknown>;
    }
  );

  /**
   * Sends association request.
   */
  sendAssociationRequest(association: Association): void;

  /**
   * Sends association accept.
   */
  sendAssociationAccept(): void;

  /**
   * Sends association reject.
   */
  sendAssociationReject(result?: number, source?: number, reason?: number): void;

  /**
   * Sends association release request.
   */
  sendAssociationReleaseRequest(): void;

  /**
   * Sends association release response.
   */
  sendAssociationReleaseResponse(): void;

  /**
   * Sends requests.
   */
  sendRequests(requests: Array<Request> | Request): void;

  /**
   * Sends cancel request.
   */
  sendCancel(request: CFindRequest | CMoveRequest | CGetRequest): void;

  /**
   * Sends abort request.
   */
  sendAbort(source?: number, reason?: number): void;
}

declare class Statistics {
  /**
   * Creates an instance of Statistics.
   */
  constructor();

  /**
   * Gets the received bytes.
   */
  getBytesReceived(): number;

  /**
   * Gets the sent bytes.
   */
  getBytesSent(): number;

  /**
   * Adds bytes to the received bytes.
   */
  addBytesReceived(bytes: number): void;

  /**
   * Adds bytes to the sent bytes.
   */
  addBytesSent(bytes: number): void;

  /**
   * Adds values from other statistics.
   */
  addFromOtherStatistics(statistics: Statistics): void;

  /**
   * Resets received and sent bytes.
   */
  reset(): void;

  /**
   * Gets the statistics description.
   */
  toString(): string;
}

declare class Scp extends Network {
  /**
   * Creates an instance of Scp.
   */
  constructor(
    socket: Socket | TLSSocket,
    opts?: {
      connectTimeout?: number;
      associationTimeout?: number;
      pduTimeout?: number;
      logCommandDatasets?: boolean;
      logDatasets?: boolean;
      datasetReadOptions?: Record<string, unknown>;
      datasetWriteOptions?: Record<string, unknown>;
      datasetNameMap?: Record<string, unknown>;
      securityOptions?: {
        key?: string | Array<string> | Buffer | Array<Buffer>;
        cert?: string | Array<string> | Buffer | Array<Buffer>;
        ca?: string | Array<string> | Buffer | Array<Buffer>;
        requestCert?: boolean;
        rejectUnauthorized?: boolean;
        minVersion?: string;
        maxVersion?: string;
        ciphers?: string;
        SNICallback?:
          | ((servername: string, cb: (err: Error | null, ctx?: SecureContext) => void) => void)
          | undefined;
      };
    }
  );

  /**
   * Association request received.
   */
  associationRequested(association: Association): void;

  /**
   * Association release request received.
   */
  associationReleaseRequested(): void;

  /**
   * C-ECHO request received.
   */
  cEchoRequest(request: CEchoRequest, callback: (response: CEchoResponse) => void): void;

  /**
   * C-FIND request received.
   */
  cFindRequest(request: CFindRequest, callback: (responses: Array<CFindResponse>) => void): void;

  /**
   * C-STORE request received.
   */
  cStoreRequest(request: CStoreRequest, callback: (response: CStoreResponse) => void): void;

  /**
   * C-MOVE request received.
   */
  cMoveRequest(request: CMoveRequest, callback: (responses: Array<CMoveResponse>) => void): void;

  /**
   * C-GET request received.
   */
  cGetRequest(request: CGetRequest, callback: (responses: Array<CGetResponse>) => void): void;

  /**
   * N-CREATE request received.
   */
  nCreateRequest(request: NCreateRequest, callback: (response: NCreateResponse) => void): void;

  /**
   * N-ACTION request received.
   */
  nActionRequest(request: NActionRequest, callback: (response: NActionResponse) => void): void;

  /**
   * N-DELETE request received.
   */
  nDeleteRequest(request: NDeleteRequest, callback: (response: NDeleteResponse) => void): void;

  /**
   * N-EVENT-REPORT request received.
   */
  nEventReportRequest(
    request: NEventReportRequest,
    callback: (response: NEventReportResponse) => void
  ): void;

  /**
   * N-GET request received.
   */
  nGetRequest(request: NGetRequest, callback: (response: NGetResponse) => void): void;

  /**
   * N-SET request received.
   */
  nSetRequest(request: NSetRequest, callback: (response: NSetResponse) => void): void;

  /**
   * C-CANCEL request received.
   */
  cCancelRequest(request: CCancelRequest): void;

  /**
   * A-ABORT received.
   */
  abort(source: number, reason: number): void;
}

declare class Server extends AsyncEventEmitter<AsyncEventEmitter.EventMap> {
  /**
   * Creates an instance of Server.
   */
  constructor(scpClass: typeof Scp);

  /**
   * Listens for incoming connections.
   */
  listen(
    port: number,
    opts?: {
      connectTimeout?: number;
      associationTimeout?: number;
      pduTimeout?: number;
      logCommandDatasets?: boolean;
      logDatasets?: boolean;
      datasetReadOptions?: Record<string, unknown>;
      datasetWriteOptions?: Record<string, unknown>;
      datasetNameMap?: Record<string, unknown>;
      securityOptions?: {
        key?: string | Array<string> | Buffer | Array<Buffer>;
        cert?: string | Array<string> | Buffer | Array<Buffer>;
        ca?: string | Array<string> | Buffer | Array<Buffer>;
        requestCert?: boolean;
        rejectUnauthorized?: boolean;
        minVersion?: string;
        maxVersion?: string;
        ciphers?: string;
        SNICallback?:
          | ((servername: string, cb: (err: Error | null, ctx?: SecureContext) => void) => void)
          | undefined;
      };
    }
  ): void;

  /**
   * Gets network statistics.
   */
  getStatistics(): Statistics;

  /**
   * Closes server.
   */
  close(): void;
}

declare class Client extends AsyncEventEmitter<AsyncEventEmitter.EventMap> {
  /**
   * Creates an instance of Client.
   */
  constructor();

  /**
   * Adds a request.
   */
  addRequest(request: Request): void;

  /**
   * Clears all requests.
   */
  clearRequests(): void;

  /**
   * Adds an additional presentation context.
   */
  addAdditionalPresentationContext(context: PresentationContext, addAsNew?: boolean): void;

  /**
   * Sends requests to the remote host.
   */
  send(
    host: string,
    port: number,
    callingAeTitle: string,
    calledAeTitle: string,
    opts?: {
      connectTimeout?: number;
      associationTimeout?: number;
      pduTimeout?: number;
      associationLingerTimeout?: number;
      logCommandDatasets?: boolean;
      logDatasets?: boolean;
      datasetReadOptions?: Record<string, unknown>;
      datasetWriteOptions?: Record<string, unknown>;
      datasetNameMap?: Record<string, unknown>;
      asyncOps?: {
        maxAsyncOpsInvoked?: number;
        maxAsyncOpsPerformed?: number;
      };
      userIdentity?: {
        type?: number;
        positiveResponseRequested?: boolean;
        primaryField?: string;
        secondaryField?: string;
      };
      securityOptions?: {
        key?: string | Array<string> | Buffer | Array<Buffer>;
        cert?: string | Array<string> | Buffer | Array<Buffer>;
        ca?: string | Array<string> | Buffer | Array<Buffer>;
        requestCert?: boolean;
        rejectUnauthorized?: boolean;
        minVersion?: string;
        maxVersion?: string;
        ciphers?: string;
      };
    }
  ): void;

  /**
   * Gets network statistics.
   */
  getStatistics(): Statistics;

  /**
   * Aborts the established association.
   */
  abort(source?: number, reason?: number): void;

  /**
   * Cancels a C-FIND, C-MOVE or C-GET request.
   */
  cancel(request: CFindRequest | CMoveRequest | CGetRequest): void;
}

/**
 * Logger.
 */
declare const log: Logger;

/**
 * Version.
 */
declare const version: string;

export namespace constants {
  export { PresentationContextResult };
  export { UserIdentityType };
  export { AbortSource };
  export { AbortReason };
  export { RejectResult };
  export { RejectSource };
  export { RejectReason };
  export { Priority };
  export { Status };
  export { StorageClass };
  export { SopClass };
  export { TransferSyntax };
}

export namespace association {
  export { PresentationContext };
  export { Association };
}

export namespace requests {
  export { Request };
  export { CEchoRequest };
  export { CFindRequest };
  export { CStoreRequest };
  export { CMoveRequest };
  export { CGetRequest };
  export { NCreateRequest };
  export { NActionRequest };
  export { NDeleteRequest };
  export { NEventReportRequest };
  export { NGetRequest };
  export { NSetRequest };
  export { CCancelRequest };
}

export namespace responses {
  export { Response };
  export { CEchoResponse };
  export { CFindResponse };
  export { CStoreResponse };
  export { CMoveResponse };
  export { CGetResponse };
  export { NCreateResponse };
  export { NActionResponse };
  export { NDeleteResponse };
  export { NEventReportResponse };
  export { NGetResponse };
  export { NSetResponse };
}

export { Dataset, Implementation, Client, Server, Scp, Statistics, log, version };
