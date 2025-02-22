const { TranscodableTransferSyntaxes, TransferSyntax } = require('./../src/Constants');
const Dataset = require('./../src/Dataset');
const Transcoding = require('./../src/Transcoding');

const chai = require('chai');
const expect = chai.expect;

function createDataset() {
  return new Dataset(
    {
      Rows: 3,
      Columns: 3,
      BitsStored: 8,
      BitsAllocated: 8,
      SamplesPerPixel: 1,
      PixelRepresentation: 0,
      PhotometricInterpretation: 'MONOCHROME2',
      PixelData: [Uint8Array.from([0x00, 0xff, 0x00, 0xff, 0x00, 0xff, 0x00, 0xff, 0x00]).buffer],
    },
    TransferSyntax.ExplicitVRLittleEndian
  );
}

describe('Uninitialized Transcoding', () => {
  it('should throw for uninitialized transcoding', () => {
    const dataset = createDataset();
    expect(() => {
      Transcoding.transcodeDataset(dataset, TransferSyntax.Jpeg2000Lossless);
    }).to.throw();
  });
  it('should not throw for uninitialized transcoding and uncompressed syntaxes', () => {
    const dataset = createDataset();
    expect(() => {
      Transcoding.transcodeDataset(dataset, TransferSyntax.ExplicitVRBigEndian);
    }).not.to.throw();
  });
});

describe('Transcoding', () => {
  before(async () => {
    await Transcoding.initializeAsync();
    this.dataset = createDataset();
  });
  after(() => {
    Transcoding.release();
  });

  it('should throw for invalid transcoding', () => {
    expect(() => {
      Transcoding.transcodeDataset(this.dataset, '1.2.3.4.5.6.7.8.9.0');
    }).to.throw();
  });

  it('should correctly transcode dataset', () => {
    TranscodableTransferSyntaxes.forEach((transferSyntax) => {
      const transcodedDataset = Transcoding.transcodeDataset(this.dataset, transferSyntax);

      expect(transcodedDataset).not.to.be.undefined;
      expect(transcodedDataset).to.be.instanceOf(Dataset);
      expect(transcodedDataset.getTransferSyntaxUid()).to.be.eq(transferSyntax);
    });
  });
});
