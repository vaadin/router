export type ParamValue = string | string[];
export type IndexedParams = Readonly<Record<string | number, ParamValue>>;
export type Params = IndexedParams | ParamValue[];
