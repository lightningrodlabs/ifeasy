
export const TYPES: Array<string> = ["verb", "what", "where", "when"]
export const OFFER: string = "offer"
export const REQUEST: string = "need"

export interface Ifeasy {
  content: string;
}

export interface IfeasyItem {
  who: string;
  verb: string;
  where: string;
  what: string;
  when: string;
  matches: Array<string>;
}

export interface IfEasyOptions {
  who: Array<string>;
  verb: Array<string>;
  where: Array<string>;
  what: Array<string>;
  when: Array<string>;
}