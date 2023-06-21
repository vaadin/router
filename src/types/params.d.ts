export type ParamValue = string | string[];
export type IndexedParams = Readonly<{ [key in string | number]: ParamValue }>;
export type Params = IndexedParams | ParamValue[];
