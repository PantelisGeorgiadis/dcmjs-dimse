const Client = require('./Client');
const { CEchoRequest, CEchoResponse, CFindRequest, CFindResponse, CStoreRequest, CStoreResponse, CMoveRequest, CMoveResponse } = require('./Command');
const { CommandFieldType, PresentationContextResult, Priority, Status, Uid, SopClass, TransferSyntax, Implementation } = require('./Constants');
const log = require('./log');

//#region requests
const requests = {
  CEchoRequest,
  CFindRequest,
  CStoreRequest,
  CMoveRequest
};
//#endregion

//#region responses
const responses = {
  CEchoResponse,
  CFindResponse,
  CStoreResponse,
  CMoveResponse
};
//#endregion

//#region constants
const constants = {
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

const dcmjsDimse = {
  Client,
  requests,
  responses,
  constants,
  log
};

//#region Exports
module.exports = dcmjsDimse;
//#endregion
