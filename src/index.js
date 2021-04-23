const Client = require('./Client');
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
  CGetResponse
} = require('./Command');
const {
  CommandFieldType,
  PresentationContextResult,
  Priority,
  Status,
  Uid,
  StorageClass,
  SopClass,
  TransferSyntax,
  Implementation
} = require('./Constants');
const log = require('./log');

//#region requests
const requests = {
  CEchoRequest,
  CFindRequest,
  CStoreRequest,
  CMoveRequest,
  CGetRequest
};
//#endregion

//#region responses
const responses = {
  CEchoResponse,
  CFindResponse,
  CStoreResponse,
  CMoveResponse,
  CGetResponse
};
//#endregion

//#region constants
const constants = {
  CommandFieldType,
  PresentationContextResult,
  Priority,
  Status,
  Uid,
  StorageClass,
  SopClass,
  TransferSyntax,
  Implementation
};
//#endregion

const DcmjsDimse = {
  Client,
  requests,
  responses,
  constants,
  log
};

//#region Exports
module.exports = DcmjsDimse;
//#endregion
