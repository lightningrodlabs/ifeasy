
export const TYPES: Array<string> = ["who", "call" , "action", "preposition", "where", "what", "when"];
export const OFFER: string = "offer"
export const REQUEST: string = "need"
export type PREPOSITION = "at" | "to" | "on" | "from";

export interface Ifeasy {
  content: string;
}

export interface IfeasyItem {
  who: string
  call?: string;
  action?: string;
  preposition?: PREPOSITION;
  where?: string;
  what?: string;
  when?: string;
  matches?: Array<string>;
}

export interface IfEasyOptions {
  who: Array<string>;
  call: Array<string>;
  action: Array<string>;
  preposition: Array<string>;
  where: Array<string>;
  what: Array<string>;
  when: Array<string>;
}