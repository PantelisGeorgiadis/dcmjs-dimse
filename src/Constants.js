//#region CommandFieldType
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
  CCancelRequest: 0x0fff
};
//#endregion

//#region PresentationContextResult
const PresentationContextResult = {
  Proposed: 255,
  Accept: 0,
  RejectUser: 1,
  RejectNoReason: 2,
  RejectAbstractSyntaxNotSupported: 3,
  RejectTransferSyntaxesNotSupported: 4
};
//#endregion

//#region Priority
const Priority = {
  Low: 0x0002,
  Medium: 0x0000,
  High: 0x0001
};
//#endregion

//#region Status
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
  NoSuchActionType: 0x0123
};
//#endregion

//#region Uid
const Uid = {
  ApplicationContextName: '1.2.840.10008.3.1.1.1'
};
//#endregion

//#region SopClass
const SopClass = {
  Verification: '1.2.840.10008.1.1',
  StudyRootQueryRetrieveInformationModelFind: '1.2.840.10008.5.1.4.1.2.2.1',
  ModalityWorklistInformationModelFind: '1.2.840.10008.5.1.4.31',
  StudyRootQueryRetrieveInformationModelMove: '1.2.840.10008.5.1.4.1.2.2.2'
};
//#endregion

//#region TransferSyntax
const TransferSyntax = {
  ImplicitVRLittleEndian: '1.2.840.10008.1.2',
  ExplicitVRLittleEndian: '1.2.840.10008.1.2.1'
};
//#endregion

//#region Implementation
const Implementation = {
  ImplementationClassUid: '1.3.6.1.4.1.41293.8',
  ImplementationVersion: 'DCMJS-DIMSE-V0.1',
  MaxPduLength: 262144
};
//#endregion

//#region Exports
module.exports = {
  CommandFieldType,
  PresentationContextResult,
  Priority,
  Status,
  Uid,
  SopClass,
  TransferSyntax,
  Implementation
};
//#endregion
