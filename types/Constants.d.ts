export namespace CommandFieldType {
    const CStoreRequest: number;
    const CStoreResponse: number;
    const CGetRequest: number;
    const CGetResponse: number;
    const CFindRequest: number;
    const CFindResponse: number;
    const CMoveRequest: number;
    const CMoveResponse: number;
    const CEchoRequest: number;
    const CEchoResponse: number;
    const NEventReportRequest: number;
    const NEventReportResponse: number;
    const NGetRequest: number;
    const NGetResponse: number;
    const NSetRequest: number;
    const NSetResponse: number;
    const NActionRequest: number;
    const NActionResponse: number;
    const NCreateRequest: number;
    const NCreateResponse: number;
    const NDeleteRequest: number;
    const NDeleteResponse: number;
    const CCancelRequest: number;
}
export namespace PresentationContextResult {
    const Proposed: number;
    const Accept: number;
    const RejectUser: number;
    const RejectNoReason: number;
    const RejectAbstractSyntaxNotSupported: number;
    const RejectTransferSyntaxesNotSupported: number;
}
export namespace AbortSource {
    const ServiceUser: number;
    const Reserved: number;
    const ServiceProvider: number;
}
export namespace AbortReason {
    export const Unknown: number;
    const ServiceUser_1: number;
    export { ServiceUser_1 as ServiceUser };
    const ServiceProvider_1: number;
    export { ServiceProvider_1 as ServiceProvider };
}
export namespace RejectResult {
    const NotSpecified: number;
    const UnrecognizedPdu: number;
    const UnexpectedPdu: number;
    const UnrecognizedPduParameter: number;
    const UnexpectedPduParameter: number;
    const InvalidPduParameter: number;
}
export namespace RejectSource {
    const ServiceUser_2: number;
    export { ServiceUser_2 as ServiceUser };
    export const ServiceProviderAcse: number;
    export const ServiceProviderPresentation: number;
}
export namespace RejectReason {
    const NoReasonGiven: number;
    const ApplicationContextNotSupported: number;
    const CallingAeNotRecognized: number;
    const CalledAeNotRecognized: number;
    const ProtocolVersionNotSupported: number;
    const TemporaryCongestion: number;
    const LocalLimitExceeded: number;
}
export namespace Priority {
    const Low: number;
    const Medium: number;
    const High: number;
}
export namespace Status {
    const Success: number;
    const Cancel: number;
    const Pending: number;
    const SopClassNotSupported: number;
    const ClassInstanceConflict: number;
    const DuplicateSOPInstance: number;
    const DuplicateInvocation: number;
    const InvalidArgumentValue: number;
    const InvalidAttributeValue: number;
    const InvalidObjectInstance: number;
    const MissingAttribute: number;
    const MissingAttributeValue: number;
    const MistypedArgument: number;
    const NoSuchArgument: number;
    const NoSuchEventType: number;
    const NoSuchObjectInstance: number;
    const NoSuchSopClass: number;
    const ProcessingFailure: number;
    const ResourceLimitation: number;
    const UnrecognizedOperation: number;
    const NoSuchActionType: number;
}
export namespace Uid {
    const ApplicationContextName: string;
}
export namespace StorageClass {
    const BasicTextSrStorage: string;
    const BreastProjectionXRayImageStorageForPresentation: string;
    const BreastProjectionXRayImageStorageForProcessing: string;
    const BreastTomosynthesisImageStorage: string;
    const ChestCadSrStorage: string;
    const ComprehensiveSrStorage: string;
    const ComputedRadiographyImageStorage: string;
    const CtImageStorage: string;
    const DigitalIntraOralXRayImageStorageForPresentation: string;
    const DigitalIntraOralXRayImageStorageForProcessing: string;
    const DigitalMammographyXRayImageStorageForPresentation: string;
    const DigitalMammographyXRayImageStorageForProcessing: string;
    const DigitalXRayImageStorageForPresentation: string;
    const DigitalXRayImageStorageForProcessing: string;
    const EncapsulatedCdaStorage: string;
    const EncapsulatedPdfStorage: string;
    const EnhancedCtImageStorage: string;
    const EnhancedMrColorImageStorage: string;
    const EnhancedMrImageStorage: string;
    const EnhancedPetImageStorage: string;
    const EnhancedSrStorage: string;
    const EnhancedXaImageStorage: string;
    const EnhancedXrfImageStorage: string;
    const IntravascularOpticalCoherenceTomographyImageStorageForPresentation: string;
    const IntravascularOpticalCoherenceTomographyImageStorageForProcessing: string;
    const LegacyConvertedEnhancedCTImageStorage: string;
    const LegacyConvertedEnhancedMRImageStorage: string;
    const LegacyConvertedEnhancedPETImageStorage: string;
    const MammographyCadSrStorage: string;
    const MrImageStorage: string;
    const MultiframeGrayscaleByteSecondaryCaptureImageStorage: string;
    const MultiframeGrayscaleWordSecondaryCaptureImageStorage: string;
    const MultiframeSingleBitSecondaryCaptureImageStorage: string;
    const MultiframeTrueColorSecondaryCaptureImageStorage: string;
    const NuclearMedicineImageStorage: string;
    const OphthalmicOpticalCoherenceTomographyEnFaceImageStorage: string;
    const OphthalmicPhotography16BitImageStorage: string;
    const OphthalmicPhotography8BitImageStorage: string;
    const OphthalmicTomographyImageStorage: string;
    const PositronEmissionTomographyImageStorage: string;
    const RtImageStorage: string;
    const SecondaryCaptureImageStorage: string;
    const UltrasoundImageStorage: string;
    const UltrasoundMultiframeImageStorage: string;
    const VideoEndoscopicImageStorage: string;
    const VideoMicroscopicImageStorage: string;
    const VideoPhotographicImageStorage: string;
    const VlEndoscopicImageStorage: string;
    const VlMicroscopicImageStorage: string;
    const VlPhotographicImageStorage: string;
    const VlSlideCoordinatesMicroscopicImageStorage: string;
    const VlWholeSlideMicroscopyImageStorage: string;
    const WideFieldOphthalmicPhotography3dCoordinatesImageStorage: string;
    const WideFieldOphthalmicPhotographyStereographicProjectionImageStorage: string;
    const XRay3dAngiographicImageStorage: string;
    const XRay3dCraniofacialImageStorage: string;
    const XRayAngiographicImageStorage: string;
    const XRayRadiationDoseSRStorage: string;
    const XRayRadiofluoroscopicImageStorage: string;
}
export namespace SopClass {
    const Verification: string;
    const StudyRootQueryRetrieveInformationModelFind: string;
    const ModalityWorklistInformationModelFind: string;
    const ModalityPerformedProcedureStep: string;
    const StudyRootQueryRetrieveInformationModelMove: string;
    const StudyRootQueryRetrieveInformationModelGet: string;
    const StorageCommitmentPushModel: string;
    const BasicFilmSession: string;
    const PrintJob: string;
    const BasicAnnotationBox: string;
    const Printer: string;
    const PrinterConfigurationRetrieval: string;
    const BasicGrayscalePrintManagementMeta: string;
    const BasicColorPrintManagementMeta: string;
    const BasicFilmBox: string;
    const PresentationLut: string;
    const BasicGrayscaleImageBox: string;
    const BasicColorImageBox: string;
    const InstanceAvailabilityNotification: string;
}
export namespace TransferSyntax {
    const ImplicitVRLittleEndian: string;
    const ExplicitVRLittleEndian: string;
    const DeflatedExplicitVRLittleEndian: string;
    const ExplicitVRBigEndian: string;
    const RleLossless: string;
    const JpegBaseline: string;
    const JpegLossless: string;
    const JpegLsLossless: string;
    const JpegLsLossy: string;
    const Jpeg2000Lossless: string;
    const Jpeg2000Lossy: string;
}
/**
 * Transfer syntaxes that can be transcoded.
 * @constant {Array<TransferSyntax>}
 */
export const TranscodableTransferSyntaxes: string[];
export namespace DefaultImplementation {
    const ImplementationClassUid: string;
    const ImplementationVersion: string;
    const MaxPduLength: number;
}
