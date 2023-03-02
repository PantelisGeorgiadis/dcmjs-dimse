import DatasetElements from './datasetElements'

type DicomSequence = {
    [k in keyof DatasetElements]?:
    DatasetElements[k]
}[]

export default DicomSequence