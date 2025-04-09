const { AbortReason, AbortSource } = require('./../src/Constants');
const { CFindRequest } = require('./../src/Command');
const Client = require('./../src/Client');

const chai = require('chai');
const expect = chai.expect;

describe('Client', () => {
  it('should throw for invalid requests and presentation contexts', () => {
    expect(() => {
      const client = new Client();
      client.addRequest('invalid request');
    }).to.throw();

    expect(() => {
      const client = new Client();
      client.addAdditionalPresentationContext('invalid presentation contexts');
    }).to.throw();

    expect(() => {
      const client = new Client();
      client.send('127.0.0.1', 11112, 'SCU', 'SCP');
    }).to.throw();
  });

  it('should throw for invalid cancellation and abortion', () => {
    expect(() => {
      const client = new Client();
      client.abort(AbortSource.ServiceUser, AbortReason.NoReasonGiven);
    }).to.throw();

    expect(() => {
      const client = new Client();
      client.cancel(CFindRequest.createStudyFindRequest());
    }).to.throw();
  });
});
