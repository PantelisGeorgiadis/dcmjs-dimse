const { AbortReason, AbortSource } = require('./../src/Constants');
const { CEchoRequest, CFindRequest } = require('./../src/Command');
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

  it('should raise networkError and closed instead of throwing for an invalid port', (done) => {
    const client = new Client();
    client.addRequest(new CEchoRequest());

    const events = [];
    let networkError = undefined;
    client.on('networkError', (e) => {
      events.push('networkError');
      networkError = e;
    });
    client.on('closed', () => {
      events.push('closed');
      try {
        expect(events).to.deep.equal(['networkError', 'closed']);
        expect(networkError).to.be.an.instanceOf(Error);
        done();
      } catch (e) {
        done(e);
      }
    });
    expect(() => client.send('localhost', -1, 'SCU', 'SCP')).to.not.throw();
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
