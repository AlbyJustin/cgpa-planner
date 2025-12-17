export const GRADES = { 'S': 10, 'A': 9, 'B': 8, 'C': 7, 'D': 6, 'F': 0, 'V': 0 };
export const PREDICT_DEFAULT = ['S', 'A', 'B', 'C'];
export const PREDICT_FULL = ['S', 'A', 'B', 'C', 'D'];
export const CHECK_KEYS = ['S', 'A', 'B', 'C', 'D', 'F', 'V']; 

const CSPE_POOL_SEM3_4 = ["Combinatorics and Graph Theory", "Software Engineering", "Design Thinking", "Adv Data Structures & Algorithms", "Multimedia Systems", "Ind. Knowledge Sys. Algorithms"];
const PE_POOL_GEN = ["Machine Learning", "Cloud Computing", "Deep Learning", "Network Security", "IoT", "Big Data Analytics", "Cyber Physical Systems", "Blockchain"];
const OE_POOL_GEN = ["Marketing Mgmt", "Finance", "Supply Chain", "Entrepreneurship", "Human Resource Mgmt", "Cognitive Science"];

export { CSPE_POOL_SEM3_4, PE_POOL_GEN, OE_POOL_GEN };

export const TEMPLATES = {
    "3": [
        {id:"s3_c1", name:"MAIR31 - Prob & OR", cr:4, type:"GIR"},
        {id:"s3_c2", name:"CSPC31 - Princ of Prog Lang", cr:4, type:"PC"},
        {id:"s3_c3", name:"CSPC32 - Data Structures", cr:3, type:"PC"},
        {id:"s3_c4", name:"CSPC33 - Digital Sys Design", cr:3, type:"PC"},
        {id:"s3_c5", name:"CSPC34 - Comp Org", cr:3, type:"PC"},
        {id:"s3_pe1", name:"Prog Elective I", cr:3, type:"PE", opts:CSPE_POOL_SEM3_4},
        {id:"s3_l1", name:"CSLR31 - DS Lab", cr:2, type:"LR"},
        {id:"s3_l2", name:"CSLR32 - Digital Lab", cr:2, type:"LR"}
    ],
    "4": [
        {id:"s4_c1", name:"CSIR14 - Prof Ethics", cr:3, type:"GIR"},
        {id:"s4_c2", name:"CSPC41 - Formal Lang", cr:4, type:"PC"},
        {id:"s4_c3", name:"CSPC42 - Algo Design", cr:3, type:"PC"},
        {id:"s4_c4", name:"CSPC43 - OS", cr:3, type:"PC"},
        {id:"s4_pe2", name:"Prog Elective II", cr:3, type:"PE", opts:CSPE_POOL_SEM3_4},
        {id:"s4_pe3", name:"Prog Elective III", cr:3, type:"PE/OE", opts:CSPE_POOL_SEM3_4, currentType:"PE", peName:"Prog Elective III", oeName:"Open Elective I"},
        {id:"s4_l1", name:"CSLR41 - Algo Lab", cr:2, type:"LR"},
        {id:"s4_l2", name:"CSLR42 - OS Lab", cr:2, type:"LR"}
    ],
    "5": [
        {id:"s5_c1", name:"HSIR13 - Economics", cr:3, type:"GIR"},
        {id:"s5_c2", name:"CSPC51 - Comp Arch", cr:4, type:"PC"},
        {id:"s5_c3", name:"CSPC52 - DBMS", cr:3, type:"PC"},
        {id:"s5_c4", name:"CSPC53 - Networks", cr:3, type:"PC"},
        {id:"s5_c5", name:"CSPC54 - AI & ML", cr:4, type:"PC"},
        {id:"s5_pe4", name:"Prog Elective IV", cr:3, type:"PE/OE", opts:PE_POOL_GEN, currentType:"PE", peName:"Prog Elective IV", oeName:"Open Elective II"},
        {id:"s5_l1", name:"CSLR51 - DBMS Lab", cr:2, type:"LR"},
        {id:"s5_l2", name:"CSLR52 - Networks Lab", cr:2, type:"LR"}
    ],
    "6": [
        {id:"s6_c1", name:"CSIR19 - Ind. Lecture", cr:1, type:"GIR"},
        {id:"s6_c2", name:"CSPC61 - Embedded Sys", cr:3, type:"PC"},
        {id:"s6_c3", name:"CSPC62 - Compiler Design", cr:4, type:"PC"},
        {id:"s6_c4", name:"CSPC63 - Cryptography", cr:4, type:"PC"},
        {id:"s6_pe5", name:"Prog Elective V", cr:3, type:"PE", opts:PE_POOL_GEN},
        {id:"s6_pe6", name:"Prog Elective VI", cr:3, type:"PE", opts:PE_POOL_GEN},
        {id:"s6_pe7", name:"Prog Elective VII", cr:3, type:"PE/OE", opts:PE_POOL_GEN, currentType:"PE", peName:"Prog Elective VII", oeName:"Open Elective III"},
        {id:"s6_l1", name:"CSLR61 - Embedded Lab", cr:2, type:"LR"},
        {id:"s6_l2", name:"CSLR62 - App Dev Lab", cr:2, type:"LR"}
    ],
    "7": [
        {id:"s7_c1", name:"CSIR16 - Internship", cr:2, type:"GIR"},
        {id:"s7_c2", name:"CSIR18 - Comp Viva", cr:1, type:"GIR"},
        {id:"s7_pe8", name:"Prog Elective VIII", cr:3, type:"PE", opts:PE_POOL_GEN},
        {id:"s7_pe9", name:"Prog Elective IX", cr:3, type:"PE", opts:PE_POOL_GEN},
        {id:"s7_oe4", name:"Prog Elective X", cr:3, type:"PE/OE", opts:PE_POOL_GEN, currentType:"PE", peName:"Prog Elective X", oeName:"Open Elective IV"},
        {id:"s7_oe5", name:"Prog Elective XI", cr:3, type:"PE/OE", opts:PE_POOL_GEN, currentType:"PE", peName:"Prog Elective XI", oeName:"Open Elective V"}
    ],
    "8": [
        {id:"s8_oe6", name:"Prog Elective XII", cr:3, type:"PE/OE", opts:PE_POOL_GEN, currentType:"PE", peName:"Prog Elective XII", oeName:"Open Elective VI"},
        {id:"s8_p1", name:"CSIR17 - Project Work", cr:6, type:"GIR"}
    ]
};