const Statistics = require('../src/Statistics');

const chai = require('chai');
const expect = chai.expect;

describe('Statistics', () => {
  it('should correctly construct Statistics', () => {
    const statistics = new Statistics();

    expect(statistics.getBytesReceived()).to.be.eq(0);
    expect(statistics.getBytesSent()).to.be.eq(0);
  });

  it('should correctly add and reset statistics values', () => {
    const statistics = new Statistics();

    statistics.addBytesReceived(10);
    statistics.addBytesSent(20);
    expect(statistics.getBytesReceived()).to.be.eq(10);
    expect(statistics.getBytesSent()).to.be.eq(20);

    statistics.addBytesReceived(30);
    statistics.addBytesSent(40);
    expect(statistics.getBytesReceived()).to.be.eq(40);
    expect(statistics.getBytesSent()).to.be.eq(60);

    statistics.reset();
    expect(statistics.getBytesReceived()).to.be.eq(0);
    expect(statistics.getBytesSent()).to.be.eq(0);
  });

  it('should correctly add other statistics values', () => {
    const statistics1 = new Statistics();
    const statistics2 = new Statistics();

    statistics1.addBytesReceived(10);
    statistics1.addBytesSent(20);

    statistics2.addBytesReceived(30);
    statistics2.addBytesSent(40);

    statistics1.addFromOtherStatistics(statistics2);
    expect(statistics1.getBytesReceived()).to.be.eq(40);
    expect(statistics1.getBytesSent()).to.be.eq(60);
  });
});
