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

//#region requests
const requests = {
  CEchoRequest,
  CFindRequest,
  CStoreRequest,
  CMoveRequest,
  CGetRequest,
};
//#endregion

//#region responses
const responses = {
  CEchoResponse,
  CFindResponse,
  CStoreResponse,
  CMoveResponse,
  CGetResponse,
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
  requests,
  responses,
  constants,
  log,
  version,
};

//#region Exports
module.exports = DcmjsDimse;
//#endregion
