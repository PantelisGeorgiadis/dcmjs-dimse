
import Sequence from './sequence'

type VR= {
    na: undefined //The VR for Data Elements, Item (FFFE,E000), Item Delimitation Item (FFFE,E00D), and Sequence Delimitation Item (FFFE,E0DD) do not exist. See PS3.5 for explanation.
    AE: string //Application Entity
    AS: string //Age String
    AT: number //Attribute Tag
    CS: string //Code String
    DA: string //Date
    DS: string //Decimal String
    DT: string //Date Time
    FL: number //Floating Point Single
    FD: number //Floating Point Double
    IS: string //Integer String
    LO: string //Long String
    LT: string //Long Text
    OB: string | ArrayBuffer //Other Byte String
    OD: string //Other Double String
    OF: string //Other Float String
    OL: string //Other Long String
    OW: string //Other Word String
    PN: string //Person Name
    SH: string //Short String
    SL: number //Signed Long
    SQ: Sequence //Sequence Of Items
    SS: number //Signed Short
    ST: string //Short Text
    TM: string //Time
    UC: string //Unlimited Characters
    UI: string //Unique Identifier (UID)
    UL: number //Unsigned Long
    UN: undefined //Unknown
    UR: string //URL
    US: number //Unsigned Short
    UT: string //Unlimited Text
}

export default VR