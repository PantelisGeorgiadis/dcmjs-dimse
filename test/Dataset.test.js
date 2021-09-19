const Dataset = require('./../src/Dataset');
const { TransferSyntax } = require('./../src/Constants');

const chai = require('chai');
const expect = chai.expect;

describe('Dataset', () => {
  it('should correctly covert elements to a DICOM dataset and back', () => {
    const patientName = 'JOHN^DOE';
    const patientID = '12345678';
    const accessionNumber = '87654321';
    const studyDescription = 'THIS IS A STUDY';
    const seriesDescription = 'THIS IS A SERIES';

    const dataset1 = new Dataset(
      {
        PatientName: patientName,
        PatientID: patientID,
        AccessionNumber: accessionNumber,
      },
      TransferSyntax.ImplicitVRLittleEndian
    );
    dataset1.setElement('StudyDescription', studyDescription);
    const dicomDataset1 = dataset1.getDenaturalizedDataset();

    const dataset2 = new Dataset(dicomDataset1, TransferSyntax.ImplicitVRLittleEndian);
    expect(dataset2.getElement('PatientName')).to.be.eq(patientName);
    expect(dataset2.getElement('PatientID')).to.be.eq(patientID);
    expect(dataset2.getElement('AccessionNumber')).to.be.eq(accessionNumber);
    expect(dataset2.getElement('StudyDescription')).to.be.eq(studyDescription);
    expect(dataset2.getTransferSyntaxUid()).to.be.eq(TransferSyntax.ImplicitVRLittleEndian);

    dataset2.setTransferSyntaxUid(TransferSyntax.ExplicitVRLittleEndian);
    dataset2.setElement('SeriesDescription', seriesDescription);
    const dicomDataset2 = dataset2.getDenaturalizedDataset();

    const dataset3 = new Dataset(dicomDataset2, TransferSyntax.ExplicitVRLittleEndian);
    expect(dataset3.getElement('PatientName')).to.be.eq(patientName);
    expect(dataset3.getElement('PatientID')).to.be.eq(patientID);
    expect(dataset3.getElement('AccessionNumber')).to.be.eq(accessionNumber);
    expect(dataset3.getElement('StudyDescription')).to.be.eq(studyDescription);
    expect(dataset3.getElement('SeriesDescription')).to.be.eq(seriesDescription);
    expect(dataset3.getTransferSyntaxUid()).to.be.eq(TransferSyntax.ExplicitVRLittleEndian);
  });
});
