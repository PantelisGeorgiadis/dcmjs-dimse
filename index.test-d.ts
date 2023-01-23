import { expectType, expectError } from 'tsd';
import { Socket } from 'net';
import { TLSSocket } from 'tls';
import {
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
} from '.';
const { Association, PresentationContext } = association;
const {
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
  Request,
} = requests;
const {
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
  Response,
} = responses;
const { Priority, SopClass, Status, TransferSyntax } = constants;

// log
expectType<typeof log>(log.error('error'));

// version
expectType<string>(version);

// PresentationContext
expectError(new PresentationContext());
expectError(new PresentationContext(1, 2));
expectError(new PresentationContext('1', '1.2.3.4.5'));
expectError(new PresentationContext(1, '1.2.3.4.5', 1, '2'));

const presentationContext = new PresentationContext(
  1,
  SopClass.Verification,
  TransferSyntax.ImplicitVRLittleEndian
);
expectType<number>(presentationContext.getPresentationContextId());
expectType<string>(presentationContext.getAbstractSyntaxUid());
expectType<Array<string>>(presentationContext.getTransferSyntaxUids());
expectError(presentationContext.addTransferSyntaxUid(1));
expectError(presentationContext.removeTransferSyntaxUid(1));
expectError(presentationContext.hasTransferSyntaxUid(1));
expectType<string | undefined>(presentationContext.getAcceptedTransferSyntaxUid());
expectType<number>(presentationContext.getResult());
expectError(presentationContext.setResult('1', 1));
expectType<string>(presentationContext.getResultDescription());
expectType<string>(presentationContext.toString());

// Association
expectError(new Association());
expectError(new Association(1));
expectError(new Association(1, 1));

const assoc = new Association('SCU', 'SCP');
expectType<string>(assoc.getCallingAeTitle());
expectError(assoc.setCallingAeTitle(1));
expectType<string>(assoc.getCalledAeTitle());
expectError(assoc.setCalledAeTitle(1));
expectType<number>(assoc.getMaxPduLength());
expectError(assoc.setMaxPduLength('1'));
expectType<string>(assoc.getImplementationClassUid());
expectError(assoc.setImplementationClassUid(1));
expectType<string>(assoc.getImplementationVersion());
expectError(assoc.setImplementationVersion(1));
expectType<boolean>(assoc.getNegotiateAsyncOps());
expectError(assoc.setNegotiateAsyncOps(1));
expectType<number>(assoc.getMaxAsyncOpsInvoked());
expectError(assoc.setMaxAsyncOpsInvoked('1'));
expectType<number>(assoc.getMaxAsyncOpsPerformed());
expectError(assoc.setMaxAsyncOpsPerformed('2'));
expectType<boolean>(assoc.getNegotiateUserIdentity());
expectError(assoc.setNegotiateUserIdentity(1));
expectType<number>(assoc.getUserIdentityType());
expectError(assoc.setUserIdentityType('1'));
expectType<boolean>(assoc.getUserIdentityPositiveResponseRequested());
expectError(assoc.setUserIdentityPositiveResponseRequested(1));
expectType<string>(assoc.getUserIdentityPrimaryField());
expectError(assoc.setUserIdentityPrimaryField(1));
expectType<string>(assoc.getUserIdentitySecondaryField());
expectError(assoc.setUserIdentitySecondaryField(2));
expectType<boolean>(assoc.getNegotiateUserIdentityServerResponse());
expectError(assoc.setNegotiateUserIdentityServerResponse(1));
expectType<string>(assoc.getUserIdentityServerResponse());
expectError(assoc.setUserIdentityServerResponse(1));
expectError(assoc.addPresentationContext(1));
expectError(assoc.addPresentationContext(1, '2'));
expectType<number>(assoc.addPresentationContext('1.2.3.4.5', 1));
expectError(assoc.addOrGetPresentationContext(1));
expectType<number>(assoc.addOrGetPresentationContext('1.2.3.4.5'));
expectError(assoc.addTransferSyntaxToPresentationContext('1', 1));
expectError(assoc.findPresentationContextByAbstractSyntaxAndTransferSyntax(1, 1));
expectType<number | undefined>(
  assoc.findPresentationContextByAbstractSyntaxAndTransferSyntax('1.2.3.4.5', '1.2.3.4.5.6')
);
expectError(assoc.getPresentationContext('1'));
expectType<association.PresentationContext>(assoc.getPresentationContext(1));
expectType<Array<{ id: number; context: association.PresentationContext }>>(
  assoc.getPresentationContexts()
);
expectType<void>(assoc.clearPresentationContexts());
expectError(assoc.addPresentationContextFromRequest('1', 2));
expectType<number>(assoc.addPresentationContextFromRequest(new CEchoRequest()));
expectError(assoc.getAcceptedPresentationContextFromRequest('1'));
expectType<association.PresentationContext | undefined>(
  assoc.getAcceptedPresentationContextFromRequest(new CEchoRequest())
);
expectType<string>(assoc.toString());

// Implementation
expectType<string>(Implementation.getImplementationClassUid());
expectError(Implementation.setImplementationClassUid(1));
expectType<string>(Implementation.getImplementationVersion());
expectError(Implementation.setImplementationVersion(1));
expectType<number>(Implementation.getMaxPduLength());
expectError(Implementation.setMaxPduLength('1'));

// Request
expectError(new Request('1', 123, 'true'));
expectType<requests.Request>(new Request(1, '1.2.3.4.5', false));

const request = new Request(1, '1.2.3.4.5', false);
expectType<string>(request.getAffectedSopClassUid());
expectError(request.setAffectedSopClassUid(1));
expectType<void>(request.setAffectedSopClassUid('1.2.3.4'));
expectType<string>(request.getRequestedSopClassUid());
expectError(request.setRequestedSopClassUid(1));
expectType<void>(request.setRequestedSopClassUid('1.2.3.4'));
expectType<string>(request.getAffectedSopInstanceUid());
expectError(request.setAffectedSopInstanceUid(1));
expectType<void>(request.setAffectedSopInstanceUid('1.2.3.4'));
expectType<string>(request.getRequestedSopInstanceUid());
expectError(request.setRequestedSopInstanceUid(1));
expectType<void>(request.setRequestedSopInstanceUid('1.2.3.4'));
expectType<number>(request.getMessageId());
expectError(request.setMessageId('1'));
expectType<void>(request.setMessageId(1));
expectError(request.raiseResponseEvent({}));
expectError(request.raiseInstanceEvent({}));
expectType<string>(request.toString());

// Response
expectError(new Response('1', 123, 'true', '2', 1));
expectType<responses.Response>(new Response(1, '1.2.3.4.5', false, 2, ''));

const response = new Response(1, '1.2.3.4.5', false, 2, '');
expectType<string>(response.getAffectedSopClassUid());
expectError(response.setAffectedSopClassUid(1));
expectType<void>(response.setAffectedSopClassUid('1.2.3.4'));
expectType<string>(response.getRequestedSopClassUid());
expectError(response.setRequestedSopClassUid(1));
expectType<void>(response.setRequestedSopClassUid('1.2.3.4'));
expectType<string>(response.getAffectedSopInstanceUid());
expectError(response.setAffectedSopInstanceUid(1));
expectType<void>(response.setAffectedSopInstanceUid('1.2.3.4'));
expectType<string>(response.getRequestedSopInstanceUid());
expectError(response.setRequestedSopInstanceUid(1));
expectType<void>(response.setRequestedSopInstanceUid('1.2.3.4'));
expectType<number>(response.getStatus());
expectError(response.setStatus('1'));
expectType<void>(response.setStatus(1));
expectType<string>(response.getErrorComment());
expectError(response.setErrorComment(1));
expectType<void>(response.setErrorComment('ERROR'));
expectType<number>(response.getMessageIdBeingRespondedTo());
expectError(response.setMessageIdBeingRespondedTo('1'));
expectType<void>(response.setMessageIdBeingRespondedTo(1));
expectType<string>(response.toString());

// CEchoRequest
expectType<requests.CEchoRequest>(new CEchoRequest());

// CEchoResponse
expectError(new CEchoResponse('1', 2));
expectType<responses.CEchoResponse>(CEchoResponse.fromRequest(new CEchoRequest()));

// CFindRequest
expectError(new CFindRequest('1'));
expectType<requests.CFindRequest>(new CFindRequest());

const findRequest = new CFindRequest(Priority.High);
expectType<number>(findRequest.getPriority());
expectError(findRequest.setPriority('1'));
expectError(CFindRequest.createStudyFindRequest(1));
expectError(CFindRequest.createStudyFindRequest(1, '2'));
expectType<requests.CFindRequest>(CFindRequest.createStudyFindRequest({}));
expectError(CFindRequest.createSeriesFindRequest(1));
expectError(CFindRequest.createSeriesFindRequest(1, '2'));
expectType<requests.CFindRequest>(CFindRequest.createSeriesFindRequest({}));
expectError(CFindRequest.createImageFindRequest(1));
expectError(CFindRequest.createImageFindRequest(1, '2'));
expectType<requests.CFindRequest>(CFindRequest.createImageFindRequest({}));
expectError(CFindRequest.createWorklistFindRequest(1));
expectError(CFindRequest.createWorklistFindRequest(1, '2'));
expectType<requests.CFindRequest>(CFindRequest.createWorklistFindRequest({}));

// CFindResponse
expectError(new CFindResponse('1', 2));
expectType<responses.CFindResponse>(CFindResponse.fromRequest(new CFindRequest()));

// CStoreRequest
expectError(new CStoreRequest(1));
expectType<requests.CStoreRequest>(
  new CStoreRequest(new Dataset({}, TransferSyntax.ExplicitVRBigEndian))
);

const storeRequest = new CStoreRequest(
  new Dataset({}, TransferSyntax.ExplicitVRLittleEndian),
  Priority.High
);
expectType<number>(storeRequest.getPriority());
expectError(storeRequest.setPriority('1'));

// CStoreResponse
expectError(new CStoreResponse('1', 2));
expectType<responses.CStoreResponse>(
  CStoreResponse.fromRequest(new CStoreRequest(new Dataset({}, TransferSyntax.Jpeg2000Lossless)))
);

// CMoveRequest
expectError(new CMoveRequest('1'));
expectType<requests.CMoveRequest>(new CMoveRequest());

const moveRequest = new CMoveRequest(Priority.High);
expectType<number>(moveRequest.getPriority());
expectError(moveRequest.setPriority('1'));
expectError(CMoveRequest.createStudyMoveRequest(1));
expectError(CMoveRequest.createStudyMoveRequest(1, 2));
expectType<requests.CMoveRequest>(CMoveRequest.createStudyMoveRequest('1', '2'));
expectError(CMoveRequest.createSeriesMoveRequest(1));
expectError(CMoveRequest.createSeriesMoveRequest(1, 2, 3));
expectType<requests.CMoveRequest>(CMoveRequest.createSeriesMoveRequest('1', '2', '3'));
expectError(CMoveRequest.createImageMoveRequest(1));
expectError(CMoveRequest.createImageMoveRequest(1, 2, 3, 4));
expectType<requests.CMoveRequest>(CMoveRequest.createImageMoveRequest('1', '2', '3', '4'));

// CMoveResponse
expectError(new CMoveResponse('1', 2));
expectType<responses.CMoveResponse>(CMoveResponse.fromRequest(new CMoveRequest()));

const moveResponse = new CMoveResponse(Status.Success, '');
expectType<number>(moveResponse.getRemaining());
expectType<number>(moveResponse.getCompleted());
expectType<number>(moveResponse.getWarnings());
expectType<number>(moveResponse.getFailures());

// CGetRequest
expectError(new CMoveRequest('1'));
expectType<requests.CMoveRequest>(new CMoveRequest());

const getRequest = new CGetRequest(Priority.High);
expectType<number>(getRequest.getPriority());
expectError(getRequest.setPriority('1'));
expectType<boolean>(getRequest.getAddStorageSopClassesToAssociation());
expectError(getRequest.setAddStorageSopClassesToAssociation('true'));
expectError(CGetRequest.createStudyGetRequest(1));
expectError(CGetRequest.createStudyGetRequest(1, '2'));
expectType<requests.CGetRequest>(CGetRequest.createStudyGetRequest('1'));
expectError(CGetRequest.createSeriesGetRequest(1));
expectError(CGetRequest.createSeriesGetRequest(1, 2, '3'));
expectType<requests.CGetRequest>(CGetRequest.createSeriesGetRequest('1', '2'));
expectError(CGetRequest.createImageGetRequest(1, 2));
expectError(CGetRequest.createImageGetRequest(1, 2, 3, '4'));
expectType<requests.CGetRequest>(CGetRequest.createImageGetRequest('1', '2', '3'));

// CGetResponse
expectError(new CGetResponse('1', 2));
expectType<responses.CGetResponse>(CGetResponse.fromRequest(new CGetRequest()));

const getResponse = new CGetResponse(Status.Success, '');
expectType<number>(getResponse.getRemaining());
expectType<number>(getResponse.getCompleted());
expectType<number>(getResponse.getWarnings());
expectType<number>(getResponse.getFailures());

// NCreateRequest
expectError(new NCreateRequest(1));
expectError(new NCreateRequest('1', 2));
expectType<requests.NCreateRequest>(new NCreateRequest(SopClass.BasicFilmBox, '1.2.3.4.5'));

// NCreateResponse
expectError(new NCreateResponse('1', 2, '3', 4));
expectType<responses.NCreateResponse>(
  NCreateResponse.fromRequest(new NCreateRequest(SopClass.BasicColorImageBox, '1.2.3.4.5.6.7'))
);

// NActionRequest
expectError(new NActionRequest(1));
expectError(new NActionRequest('1', 2, '3'));
expectType<requests.NActionRequest>(
  new NActionRequest(SopClass.BasicFilmSession, '1.2.3.4.5', 0x01)
);

const actionRequest = new NActionRequest(SopClass.PrintJob, '1.2.3.4.5', 0x01);
expectType<number>(actionRequest.getActionTypeId());
expectError(actionRequest.setActionTypeId('1'));

// NActionResponse
expectError(new NActionResponse('1', 2, '3', 4, 5));
expectType<responses.NActionResponse>(
  NActionResponse.fromRequest(
    new NActionRequest(SopClass.BasicColorImageBox, '1.2.3.4.5.6.7', 0x01)
  )
);

const actionResponse = new NActionResponse(
  SopClass.BasicColorImageBox,
  '1.2.3.4.5.6.7',
  0x01,
  Status.Success,
  ''
);
expectType<number>(actionResponse.getActionTypeId());
expectError(actionResponse.setActionTypeId('1'));

// NDeleteRequest
expectError(new NDeleteRequest(1));
expectError(new NDeleteRequest('1', 2));
expectType<requests.NDeleteRequest>(new NDeleteRequest(SopClass.BasicFilmSession, '1.2.3.4.5'));

// NDeleteResponse
expectError(new NDeleteResponse('1', 2, '3', 4));
expectType<responses.NDeleteResponse>(
  NDeleteResponse.fromRequest(new NDeleteRequest(SopClass.BasicColorImageBox, '1.2.3.4.5.6.7'))
);

// NEventReportRequest
expectError(new NEventReportRequest(1));
expectError(new NEventReportRequest('1', 2, '3'));
expectType<requests.NEventReportRequest>(
  new NEventReportRequest(SopClass.PrintJob, '1.2.3.4.5', 0x01)
);

const eventReportRequest = new NEventReportRequest(SopClass.PrintJob, '1.2.3.4.5', 0x01);
expectType<number>(eventReportRequest.getEventTypeId());
expectError(eventReportRequest.setEventTypeId('1'));

// NEventReportResponse
expectError(new NEventReportResponse('1', 2, '3', 4, 5));
expectType<responses.NEventReportResponse>(
  NEventReportResponse.fromRequest(
    new NEventReportRequest(SopClass.BasicColorImageBox, '1.2.3.4.5.6.7', 0x01)
  )
);

const eventReportResponse = new NEventReportResponse(
  SopClass.BasicColorImageBox,
  '1.2.3.4.5.6.7',
  0x01,
  Status.Success,
  ''
);
expectType<number>(eventReportResponse.getEventTypeId());
expectError(eventReportResponse.setEventTypeId('1'));

// NGetRequest
expectError(new NGetRequest(1));
expectError(new NGetRequest('1', 2));
expectError(new NGetRequest('1', 2, '3'));
expectType<requests.NGetRequest>(
  new NGetRequest(SopClass.BasicGrayscaleImageBox, '1.2.3.4.5', ['PatientID'])
);

const cGetRequest = new NGetRequest(SopClass.BasicGrayscaleImageBox, '1.2.3.4.5', ['PatientID']);
expectType<Array<string>>(cGetRequest.getAttributeIdentifierList());
expectError(cGetRequest.setAttributeIdentifierList('1'));

// NGetResponse
expectError(new NGetResponse('1', 2, '3', 4));
expectType<responses.NGetResponse>(
  NGetResponse.fromRequest(
    new NGetRequest(SopClass.BasicGrayscaleImageBox, '1.2.3.4.5', ['PatientName'])
  )
);

// NSetRequest
expectError(new NSetRequest(1));
expectError(new NSetRequest('1', 2));
expectType<requests.NSetRequest>(new NSetRequest(SopClass.BasicFilmSession, '1.2.3.4.5'));

// NSetResponse
expectError(new NSetResponse('1', 2, '3', 4));
expectType<responses.NSetResponse>(
  NSetResponse.fromRequest(new NSetRequest(SopClass.BasicGrayscaleImageBox, '1.2.3.4.5'))
);

// CCancelRequest
expectError(new CCancelRequest(1));
expectError(new CCancelRequest('1', '2'));

const cancelRequest = new CCancelRequest(SopClass.StudyRootQueryRetrieveInformationModelMove, 1);
expectType<number>(cancelRequest.getMessageIdBeingRespondedTo());
expectError(cancelRequest.setMessageIdBeingRespondedTo('1'));
expectType<requests.CCancelRequest>(CCancelRequest.fromRequest(new CFindRequest(1)));

// Statistics
const statistics = new Statistics();
expectType<number>(statistics.getBytesReceived());
expectType<number>(statistics.getBytesSent());
expectError(statistics.addBytesReceived('1'));
expectError(statistics.addBytesSent('1'));
expectError(statistics.addFromOtherStatistics('1'));
expectType<void>(statistics.reset());
expectType<string>(statistics.toString());

// Server
class TestScp extends Scp {
  constructor(
    socket: Socket | TLSSocket,
    opts: {
      connectTimeout?: number;
      associationTimeout?: number;
      pduTimeout?: number;
      logCommandDatasets?: boolean;
      logDatasets?: boolean;
      securityOptions?: {
        key?: Buffer;
        cert?: Buffer;
        ca?: Buffer | Array<Buffer>;
        requestCert?: boolean;
        rejectUnauthorized?: boolean;
        minVersion?: string;
        maxVersion?: string;
      };
    }
  ) {
    super(socket, opts);
  }
  associationRequested(association: association.Association) {}
  associationReleaseRequested() {}
  cEchoRequest(
    request: requests.CEchoRequest,
    callback: (response: responses.CEchoResponse) => void
  ) {}
  cFindRequest(
    request: requests.CFindRequest,
    callback: (responses: Array<responses.CFindResponse>) => void
  ) {}
  cStoreRequest(
    request: requests.CStoreRequest,
    callback: (response: responses.CStoreResponse) => void
  ) {}
  cMoveRequest(
    request: requests.CMoveRequest,
    callback: (responses: Array<responses.CMoveResponse>) => void
  ) {}
  cGetRequest(
    request: requests.CGetRequest,
    callback: (responses: Array<responses.CGetResponse>) => void
  ) {}
  nCreateRequest(
    request: requests.NCreateRequest,
    callback: (response: responses.NCreateResponse) => void
  ) {}
  nActionRequest(
    request: requests.NActionRequest,
    callback: (response: responses.NActionResponse) => void
  ) {}
  nDeleteRequest(
    request: requests.NDeleteRequest,
    callback: (response: responses.NDeleteResponse) => void
  ) {}
  nEventReportRequest(
    request: requests.NEventReportRequest,
    callback: (response: responses.NEventReportResponse) => void
  ) {}
  nGetRequest(
    request: requests.NGetRequest,
    callback: (response: responses.NGetResponse) => void
  ) {}
  nSetRequest(
    request: requests.NSetRequest,
    callback: (response: responses.NSetResponse) => void
  ) {}
  cCancelRequest(request: requests.CCancelRequest) {}
  abort(source: number, reason: number) {}
}

expectError(new Server(1));
expectType<Server>(new Server(TestScp));

const server = new Server(TestScp);
expectError(server.listen('2104'));
expectError(server.listen(2104, '1'));
expectType<void>(server.listen(2104));
expectType<void>(server.close());
expectType<Statistics>(server.getStatistics());

// Client
expectType<Client>(new Client());

const client = new Client();
expectType<void>(client.clearRequests());
expectError(client.addRequest('1'));
expectType<void>(client.addRequest(new CEchoRequest()));
expectError(client.addAdditionalPresentationContext('1'));
expectError(client.addAdditionalPresentationContext('1', 'true'));
expectType<void>(
  client.addAdditionalPresentationContext(
    new PresentationContext(1, SopClass.ModalityWorklistInformationModelFind)
  )
);
expectType<void>(
  client.addAdditionalPresentationContext(
    new PresentationContext(1, SopClass.ModalityWorklistInformationModelFind),
    true
  )
);
expectType<Statistics>(client.getStatistics());
expectError(client.send('1'));
expectError(client.send('1', '2'));
expectError(client.send('1', '2', 3, 4));
expectError(client.send('1', '2', 3, 4, '5'));
expectError(client.abort('1', '2'));
expectError(client.cancel('1'));
