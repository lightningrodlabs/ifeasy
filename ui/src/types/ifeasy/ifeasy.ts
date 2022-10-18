
export const TYPES: Array<string> = ["who", "call", "what", "where",  "when"];
export const OFFER: string = "offer"
export const REQUEST: string = "need"

export interface Ifeasy {
  content: string;
}

export type Detail = {
  easyFor: Array<string>;
  wasEasyFor?: string;
}

export type IfeasyItem  = {
  who: string
  call?: string;
  what?: Record<string, Detail>;
  action?: string;
  where?: string;
  when?: string;
}

export interface IfEasyOptions {
  who: Array<string>;
  call: Array<string>;
  what: Array<string>;
  action: Array<string>;
  where: Array<string>;
  when: Array<string>;
}