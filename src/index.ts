import { PresentationContext, Association } from './Association';
import Dataset from './Dataset';
import Implementation from './Implementation';
import Client from './Client';
import { Server, Scp } from './Server';
import {
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
} from './Command';
import {
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
} from './Constants';
import log from './log';
import version from './version';

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
};
//#endregion

const DcmjsDimse = {
  Dataset,
  Implementation,
  Client,
  Server,
  Scp,
  association,
  requests,
  responses,
  constants,
  log,
  version,

  ...association,
  ...requests,
  ...responses,
  ...constants,
};

//#region Exports
export default DcmjsDimse;
//#endregion
