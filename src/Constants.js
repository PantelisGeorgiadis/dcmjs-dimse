//#region CommandFieldType
/**
 * Command field types.
 * @constant {Object}
 */
const CommandFieldType = {
  CStoreRequest: 0x0001,
  CStoreResponse: 0x8001,
  CGetRequest: 0x0010,
  CGetResponse: 0x8010,
  CFindRequest: 0x0020,
  CFindResponse: 0x8020,
  CMoveRequest: 0x0021,
  CMoveResponse: 0x8021,
  CEchoRequest: 0x0030,
  CEchoResponse: 0x8030,
  NEventReportRequest: 0x0100,
  NEventReportResponse: 0x8100,
  NGetRequest: 0x0110,
  NGetResponse: 0x8110,
  NSetRequest: 0x0120,
  NSetResponse: 0x8120,
  NActionRequest: 0x0130,
  NActionResponse: 0x8130,
  NCreateRequest: 0x0140,
  NCreateResponse: 0x8140,
  NDeleteRequest: 0x0150,
  NDeleteResponse: 0x8150,
  CCancelRequest: 0x0fff,
};
Object.freeze(CommandFieldType);
//#endregion

//#region PresentationContextResult
/**
 * Presentation context results.
 * @constant {Object}
 */
const PresentationContextResult = {
  Proposed: 255,
  Accept: 0,
  RejectUser: 1,
  RejectNoReason: 2,
  RejectAbstractSyntaxNotSupported: 3,
  RejectTransferSyntaxesNotSupported: 4,
};
Object.freeze(PresentationContextResult);
//#endregion

//#region AbortSource
/**
 * Abort sources.
 * @constant {Object}
 */
const AbortSource = {
  ServiceUser: 0,
  Reserved: 1,
  ServiceProvider: 2,
};
Object.freeze(AbortSource);
//#endregion

//#region AbortReason
/**
 * Abort reasons.
 * @constant {Object}
 */
const AbortReason = {
  Unknown: 0,
  ServiceUser: 1,
  ServiceProvider: 2,
};
Object.freeze(AbortReason);
//#endregion

//#region RejectResult
/**
 * Reject results.
 * @constant {Object}
 */
const RejectResult = {
  NotSpecified: 0,
  UnrecognizedPdu: 1,
  UnexpectedPdu: 2,
  UnrecognizedPduParameter: 4,
  UnexpectedPduParameter: 5,
  InvalidPduParameter: 6,
};
Object.freeze(RejectResult);
//#endregion

//#region RejectSource
/**
 * Reject sources.
 * @constant {Object}
 */
const RejectSource = {
  ServiceUser: 1,
  ServiceProviderAcse: 2,
  ServiceProviderPresentation: 3,
};
Object.freeze(RejectSource);
//#endregion

//#region RejectReason
/**
 * Reject reasons.
 * @constant {Object}
 */
const RejectReason = {
  // Service user
  NoReasonGiven: 1,
  ApplicationContextNotSupported: 2,
  CallingAeNotRecognized: 3,
  CalledAeNotRecognized: 7,
  // Service provider
  ProtocolVersionNotSupported: 1,
  TemporaryCongestion: 1,
  LocalLimitExceeded: 2,
};
Object.freeze(RejectReason);
//#endregion

//#region Priority
/**
 * Priority.
 * @constant {Object}
 */
const Priority = {
  Low: 0x0002,
  Medium: 0x0000,
  High: 0x0001,
};
Object.freeze(Priority);
//#endregion

//#region Status
/**
 * Statuses.
 * @constant {Object}
 */
const Status = {
  Success: 0x0000,
  Cancel: 0xfe00,
  Pending: 0xff00,
  SopClassNotSupported: 0x0122,
  ClassInstanceConflict: 0x0119,
  DuplicateSOPInstance: 0x0111,
  DuplicateInvocation: 0x0210,
  InvalidArgumentValue: 0x0115,
  InvalidAttributeValue: 0x0106,
  InvalidObjectInstance: 0x0117,
  MissingAttribute: 0x0120,
  MissingAttributeValue: 0x0121,
  MistypedArgument: 0x0212,
  NoSuchArgument: 0x0114,
  NoSuchEventType: 0x0113,
  NoSuchObjectInstance: 0x0112,
  NoSuchSopClass: 0x0118,
  ProcessingFailure: 0x0110,
  ResourceLimitation: 0x0213,
  UnrecognizedOperation: 0x0211,
  NoSuchActionType: 0x0123,
};
Object.freeze(Status);
//#endregion

//#region Uid
/**
 * UIDs.
 * @constant {Object}
 */
const Uid = {
  ApplicationContextName: '1.2.840.10008.3.1.1.1',
};
Object.freeze(Uid);
//#endregion

//#region StorageClass
/**
 * Storage classes.
 * @constant {Object}
 */
const StorageClass = {
  BasicTextSrStorage: '1.2.840.10008.5.1.4.1.1.88.11',
  BreastProjectionXRayImageStorageForPresentation: '1.2.840.10008.5.1.4.1.1.13.1.4',
  BreastProjectionXRayImageStorageForProcessing: '1.2.840.10008.5.1.4.1.1.13.1.5',
  BreastTomosynthesisImageStorage: '1.2.840.10008.5.1.4.1.1.13.1.3',
  ChestCadSrStorage: '1.2.840.10008.5.1.4.1.1.88.65',
  ComprehensiveSrStorage: '1.2.840.10008.5.1.4.1.1.88.33',
  ComputedRadiographyImageStorage: '1.2.840.10008.5.1.4.1.1.1',
  CtImageStorage: '1.2.840.10008.5.1.4.1.1.2',
  DigitalIntraOralXRayImageStorageForPresentation: '1.2.840.10008.5.1.4.1.1.1.3',
  DigitalIntraOralXRayImageStorageForProcessing: '1.2.840.10008.5.1.4.1.1.1.3.1',
  DigitalMammographyXRayImageStorageForPresentation: '1.2.840.10008.5.1.4.1.1.1.2',
  DigitalMammographyXRayImageStorageForProcessing: '1.2.840.10008.5.1.4.1.1.1.2.1',
  DigitalXRayImageStorageForPresentation: '1.2.840.10008.5.1.4.1.1.1.1',
  DigitalXRayImageStorageForProcessing: '1.2.840.10008.5.1.4.1.1.1.1.1',
  EncapsulatedCdaStorage: '1.2.840.10008.5.1.4.1.1.104.2',
  EncapsulatedPdfStorage: '1.2.840.10008.5.1.4.1.1.104.1',
  EnhancedCtImageStorage: '1.2.840.10008.5.1.4.1.1.2.1',
  EnhancedMrColorImageStorage: '1.2.840.10008.5.1.4.1.1.4.3',
  EnhancedMrImageStorage: '1.2.840.10008.5.1.4.1.1.4.1',
  EnhancedPetImageStorage: '1.2.840.10008.5.1.4.1.1.130',
  EnhancedSrStorage: '1.2.840.10008.5.1.4.1.1.88.22',
  EnhancedXaImageStorage: '1.2.840.10008.5.1.4.1.1.12.1.1',
  EnhancedXrfImageStorage: '1.2.840.10008.5.1.4.1.1.12.2.1',
  IntravascularOpticalCoherenceTomographyImageStorageForPresentation:
    '1.2.840.10008.5.1.4.1.1.14.1',
  IntravascularOpticalCoherenceTomographyImageStorageForProcessing: '1.2.840.10008.5.1.4.1.1.14.2',
  LegacyConvertedEnhancedCTImageStorage: '1.2.840.10008.5.1.4.1.1.2.2',
  LegacyConvertedEnhancedMRImageStorage: '1.2.840.10008.5.1.4.1.1.4.4',
  LegacyConvertedEnhancedPETImageStorage: '1.2.840.10008.5.1.4.1.1.128.1',
  MammographyCadSrStorage: '1.2.840.10008.5.1.4.1.1.88.50',
  MrImageStorage: '1.2.840.10008.5.1.4.1.1.4',
  MultiframeGrayscaleByteSecondaryCaptureImageStorage: '1.2.840.10008.5.1.4.1.1.7.2',
  MultiframeGrayscaleWordSecondaryCaptureImageStorage: '1.2.840.10008.5.1.4.1.1.7.3',
  MultiframeSingleBitSecondaryCaptureImageStorage: '1.2.840.10008.5.1.4.1.1.7.1',
  MultiframeTrueColorSecondaryCaptureImageStorage: '1.2.840.10008.5.1.4.1.1.7.4',
  NuclearMedicineImageStorage: '1.2.840.10008.5.1.4.1.1.20',
  OphthalmicOpticalCoherenceTomographyEnFaceImageStorage: '1.2.840.10008.5.1.4.1.1.77.1.5.7',
  OphthalmicPhotography16BitImageStorage: '1.2.840.10008.5.1.4.1.1.77.1.5.2',
  OphthalmicPhotography8BitImageStorage: '1.2.840.10008.5.1.4.1.1.77.1.5.1',
  OphthalmicTomographyImageStorage: '1.2.840.10008.5.1.4.1.1.77.1.5.4',
  PositronEmissionTomographyImageStorage: '1.2.840.10008.5.1.4.1.1.128',
  RtImageStorage: '1.2.840.10008.5.1.4.1.1.481.1',
  SecondaryCaptureImageStorage: '1.2.840.10008.5.1.4.1.1.7',
  UltrasoundImageStorage: '1.2.840.10008.5.1.4.1.1.6.1',
  UltrasoundMultiframeImageStorage: '1.2.840.10008.5.1.4.1.1.3.1',
  VideoEndoscopicImageStorage: '1.2.840.10008.5.1.4.1.1.77.1.1.1',
  VideoMicroscopicImageStorage: '1.2.840.10008.5.1.4.1.1.77.1.2.1',
  VideoPhotographicImageStorage: '1.2.840.10008.5.1.4.1.1.77.1.4.1',
  VlEndoscopicImageStorage: '1.2.840.10008.5.1.4.1.1.77.1.1',
  VlMicroscopicImageStorage: '1.2.840.10008.5.1.4.1.1.77.1.2',
  VlPhotographicImageStorage: '1.2.840.10008.5.1.4.1.1.77.1.4',
  VlSlideCoordinatesMicroscopicImageStorage: '1.2.840.10008.5.1.4.1.1.77.1.3',
  VlWholeSlideMicroscopyImageStorage: '1.2.840.10008.5.1.4.1.1.77.1.6',
  WideFieldOphthalmicPhotography3dCoordinatesImageStorage: '1.2.840.10008.5.1.4.1.1.77.1.5.6',
  WideFieldOphthalmicPhotographyStereographicProjectionImageStorage:
    '1.2.840.10008.5.1.4.1.1.77.1.5.5',
  XRay3dAngiographicImageStorage: '1.2.840.10008.5.1.4.1.1.13.1.1',
  XRay3dCraniofacialImageStorage: '1.2.840.10008.5.1.4.1.1.13.1.2',
  XRayAngiographicImageStorage: '1.2.840.10008.5.1.4.1.1.12.1',
  XRayRadiationDoseSRStorage: '1.2.840.10008.5.1.4.1.1.88.67',
  XRayRadiofluoroscopicImageStorage: '1.2.840.10008.5.1.4.1.1.12.2',
};
Object.freeze(StorageClass);
//#endregion

//#region SopClass
/**
 * SOP classes.
 * @constant {Object}
 */
const SopClass = {
  Verification: '1.2.840.10008.1.1',
  StudyRootQueryRetrieveInformationModelFind: '1.2.840.10008.5.1.4.1.2.2.1',
  ModalityWorklistInformationModelFind: '1.2.840.10008.5.1.4.31',
  ModalityPerformedProcedureStep: '1.2.840.10008.3.1.2.3.3',
  StudyRootQueryRetrieveInformationModelMove: '1.2.840.10008.5.1.4.1.2.2.2',
  StudyRootQueryRetrieveInformationModelGet: '1.2.840.10008.5.1.4.1.2.2.3',
  StorageCommitmentPushModel: '1.2.840.10008.1.20.1',
  BasicFilmSession: '1.2.840.10008.5.1.1.1',
  PrintJob: '1.2.840.10008.5.1.1.14',
  BasicAnnotationBox: '1.2.840.10008.5.1.1.15',
  Printer: '1.2.840.10008.5.1.1.16',
  PrinterConfigurationRetrieval: '1.2.840.10008.5.1.1.16.376',
  BasicGrayscalePrintManagementMeta: '1.2.840.10008.5.1.1.9',
  BasicColorPrintManagementMeta: '1.2.840.10008.5.1.1.18',
  BasicFilmBox: '1.2.840.10008.5.1.1.2',
  PresentationLut: '1.2.840.10008.5.1.1.23',
  BasicGrayscaleImageBox: '1.2.840.10008.5.1.1.4',
  BasicColorImageBox: '1.2.840.10008.5.1.1.4.1',
  InstanceAvailabilityNotification: '1.2.840.10008.5.1.4.33',
};
Object.freeze(SopClass);
//#endregion

//#region TransferSyntax
/**
 * Transfer syntaxes.
 * @constant {Object}
 */
const TransferSyntax = {
  ImplicitVRLittleEndian: '1.2.840.10008.1.2',
  ExplicitVRLittleEndian: '1.2.840.10008.1.2.1',
  DeflatedExplicitVRLittleEndian: '1.2.840.10008.1.2.1.99',
  ExplicitVRBigEndian: '1.2.840.10008.1.2.2',
  RleLossless: '1.2.840.10008.1.2.5',
  JpegBaseline: '1.2.840.10008.1.2.4.50',
  JpegLossless: '1.2.840.10008.1.2.4.70',
  JpegLsLossless: '1.2.840.10008.1.2.4.80',
  JpegLsLossy: '1.2.840.10008.1.2.4.81',
  Jpeg2000Lossless: '1.2.840.10008.1.2.4.90',
  Jpeg2000Lossy: '1.2.840.10008.1.2.4.91',
};
Object.freeze(TransferSyntax);
//#endregion

//#region TranscodableTransferSyntax
/**
 * Transfer syntaxes that can be transcoded.
 * @constant {Object}
 */
const TranscodableTransferSyntax = {
  ImplicitVRLittleEndian: '1.2.840.10008.1.2',
  ExplicitVRLittleEndian: '1.2.840.10008.1.2.1',
};
Object.freeze(TranscodableTransferSyntax);
//#endregion

//#region Implementation
/**
 * Implementation information.
 * @constant {Object}
 */
const Implementation = {
  ImplementationClassUid: '1.2.826.0.1.3680043.10.854',
  ImplementationVersion: 'DCMJS-DIMSE-V0.1',
  MaxPduLength: 262144,
};
Object.freeze(Implementation);
//#endregion

//#region Exports
module.exports = {
  CommandFieldType,
  PresentationContextResult,
  AbortSource,
  AbortReason,
  RejectResult,
  RejectSource,
  RejectReason,
  Priority,
  Status,
  Uid,
  StorageClass,
  SopClass,
  TransferSyntax,
  TranscodableTransferSyntax,
  Implementation,
};
//#endregion
