
declare type ServerEventMap = {
  networkError: 'networkError',
  listening: 'listening',
  cEchoRequest: 'cEchoRequest'
}

declare type RequestEventMap = {
  response: 'response',
  instance: 'instance',
  done: 'done',
}

declare type ClientEventMap = {
  connected: 'connected',
  associationAccepted: 'associationAccepted',
  associationReleased: 'associationReleased',
  cStoreRequest: 'cStoreRequest',
  nEventReportRequest: 'nEventReportRequest',
  networkError: 'networkError',
  close: 'close',
}

declare namespace ServerEventName {
  type AsyncListener<T, R> = ((data: T, callback: (result?: R) => void) => Promise<R>) | ((data: T, callback: (result?: R) => void) => void);
  type EventMap<T> = {
    [event in keyof T]: AsyncListener<any, any>;
  };
}
