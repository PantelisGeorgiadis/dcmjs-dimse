const Dataset = require('./../src/Dataset');
const { TransferSyntax, StorageClass } = require('./../src/Constants');

const chai = require('chai');
const expect = chai.expect;
const path = require('path');
const mockFs = require('mock-fs');

describe('Dataset', () => {
  it('should correctly convert elements to a DICOM dataset and back', () => {
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

  it('should create at least 100 different DICOM UIDs sequentially', () => {
    const uids = [];
    for (let i = 0; i < 100; i++) {
      const uid = Dataset.generateDerivedUid();
      expect(uids).to.not.contain(uid);
      uids.push(uid);
    }
  });

  it('should correctly read and write DICOM part10 files', () => {
    mockFs({
      'fileIn.dcm': mockFs.load(path.resolve(__dirname, '../datasets/pdf.dcm')),
    });

    const dataset1 = Dataset.fromFile('fileIn.dcm');
    dataset1.toFile('fileOut1.dcm');
    const dataset2 = Dataset.fromFile('fileOut1.dcm');
    const elements1 = dataset1.getElements();
    const elements2 = dataset2.getElements();
    expect(Object.keys(elements1).length).to.be.eq(Object.keys(elements2).length);
    expect(Object.keys(elements1)).to.have.members(Object.keys(elements2));

    const elements3 = {
      SOPClassUID: StorageClass.SecondaryCaptureImageStorage,
      SOPInstanceUID: Dataset.generateDerivedUid(),
      PatientName: 'JOHN^DOE',
      PatientID: '123456',
      AccessionNumber: '654321',
      StudyDescription: 'STUDY_DESCRIPTION',
      SeriesDescription: 'SERIES_DESCRIPTION',
    };
    const dataset3 = new Dataset(elements3);
    dataset3.toFile('fileOut2.dcm');
    const dataset4 = Dataset.fromFile('fileOut2.dcm');
    const elements4 = dataset4.getElements();
    delete elements4._vrMap;
    expect(Object.keys(elements3).length).to.be.eq(Object.keys(elements4).length);
    expect(Object.keys(elements3)).to.have.members(Object.keys(elements4));
    Object.keys(elements3).forEach((el1) => {
      const val1 = elements3[el1];
      const val2 = elements4[el1];
      expect(val1).to.be.eq(val2);
    });
  });

  it('should keep private tags which are parsed in via a nameMap', () => {
    mockFs({
      'fileIn.dcm': mockFs.load(path.resolve(__dirname, '../datasets/pdf.dcm')),
    });

    const elements1 = {
      SOPClassUID: StorageClass.SecondaryCaptureImageStorage,
      SOPInstanceUID: Dataset.generateDerivedUid(),
      PatientName: 'JOHN^DOE',
      PatientID: '123456',
      AccessionNumber: '654321',
      StudyDescription: 'STUDY_DESCRIPTION',
      SeriesDescription: 'SERIES_DESCRIPTION',
      '00091001': 'Private tag that should stay',
      '00091002': 'Private tag that should NOT stay',
    };
    const dataset1 = new Dataset(elements1);
    dataset1.toFile('fileOut.dcm', undefined, {
      '00091001': {
        tag: '(0009,1001)',
        vr: 'LT',
        name: '00091001',
        vm: '1',
        version: 'PrivateTag',
      },
    });
    const dataset2 = Dataset.fromFile('fileOut.dcm');
    const elements2 = dataset2.getElements();
    delete elements2._vrMap;

    expect(Buffer.from(elements2['00091001'][0]).toString('utf8')).to.equal(
      'Private tag that should stay'
    );
    expect(elements2['00091002']).to.be.undefined;
    expect(Object.keys(elements1).length - 1).to.be.eq(Object.keys(elements2).length);
  });

  it('should correctly read and write DICOM part10 files asynchronously', () => {
    mockFs({
      'fileIn.dcm': mockFs.load(path.resolve(__dirname, '../datasets/pdf.dcm')),
    });

    Dataset.fromFile('fileIn.dcm', (err, dataset1) => {
      dataset1.toFile('fileOut1.dcm', (err2) => {
        Dataset.fromFile('fileOut1.dcm', (err3, dataset2) => {
          const elements1 = dataset1.getElements();
          const elements2 = dataset2.getElements();
          expect(Object.keys(elements1).length).to.be.eq(Object.keys(elements2).length);
          expect(Object.keys(elements1)).to.have.members(Object.keys(elements2));

          mockFs.restore();
        });
      });
    });
  });
});
