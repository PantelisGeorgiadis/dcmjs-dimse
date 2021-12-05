const { PresentationContext, Association } = require('./Association');
const Dataset = require('./Dataset');
const Client = require('./Client');
const { Server, Scp } = require('./Server');
const {
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
} = require('./Command');
const {
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
  Implementation,
} = require('./Constants');
const log = require('./log');
const version = require('./version');

//#region association
const association = {
  PresentationContext,
  Association,
};
//#endregion

//#region requests
const requests = {
  CEchoRequest,
  CFindRequest,
  CStoreRequest,
  CMoveRequest,
  CGetRequest,
  NCreateRequest,
  NActionRequest,
  NDeleteRequest,
  NEventReportRequest,
  NGetRequest,
  NSetRequest,
};
//#endregion

//#region responses
const responses = {
  CEchoResponse,
  CFindResponse,
  CStoreResponse,
  CMoveResponse,
  CGetResponse,
  NCreateResponse,
  NActionResponse,
  NDeleteResponse,
  NEventReportResponse,
  NGetResponse,
  NSetResponse,
};
//#endregion

//#region constants
const constants = {
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
  Implementation,
};
//#endregion

const DcmjsDimse = {
  Dataset,
  Client,
  Server,
  Scp,
  association,
  requests,
  responses,
  constants,
  log,
  version,
};

//#region Exports
module.exports = DcmjsDimse;
//#endregion
