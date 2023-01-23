const { Association, PresentationContext } = require('./Association');
const { Scp, Server } = require('./Server');
const {
  CCancelRequest,
  CEchoRequest,
  CEchoResponse,
  CFindRequest,
  CFindResponse,
  CGetRequest,
  CGetResponse,
  CMoveRequest,
  CMoveResponse,
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
} = require('./Command');
const {
  AbortReason,
  AbortSource,
  CommandFieldType,
  PresentationContextResult,
  Priority,
  RejectReason,
  RejectResult,
  RejectSource,
  SopClass,
  Status,
  StorageClass,
  TransferSyntax,
  Uid,
  UserIdentityType,
} = require('./Constants');
const Client = require('./Client');
const Dataset = require('./Dataset');
const Implementation = require('./Implementation');
const Statistics = require('./Statistics');
const log = require('./log');
const version = require('./version');

//#region association
const association = {
  Association,
  PresentationContext,
};
//#endregion

//#region requests
const requests = {
  CCancelRequest,
  CEchoRequest,
  CFindRequest,
  CGetRequest,
  CMoveRequest,
  CStoreRequest,
  NActionRequest,
  NCreateRequest,
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
  CGetResponse,
  CMoveResponse,
  CStoreResponse,
  NActionResponse,
  NCreateResponse,
  NDeleteResponse,
  NEventReportResponse,
  NGetResponse,
  NSetResponse,
};
//#endregion

//#region constants
const constants = {
  AbortReason,
  AbortSource,
  CommandFieldType,
  PresentationContextResult,
  Priority,
  RejectReason,
  RejectResult,
  RejectSource,
  SopClass,
  Status,
  StorageClass,
  TransferSyntax,
  Uid,
  UserIdentityType,
};
//#endregion

const DcmjsDimse = {
  association,
  Client,
  constants,
  Dataset,
  Implementation,
  log,
  requests,
  responses,
  Scp,
  Server,
  Statistics,
  version,
};

//#region Exports
module.exports = DcmjsDimse;
//#endregion
