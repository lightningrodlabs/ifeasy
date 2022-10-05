
export const TYPES: Array<string> = ["verb", "what", "where", "when"]
export const OFFER: string = "will"
export const REQUEST: string = "want"

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