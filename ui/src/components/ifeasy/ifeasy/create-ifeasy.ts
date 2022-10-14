
import { LitElement, html, css } from 'lit';
import { state, customElement, property, query } from 'lit/decorators.js';
import { AppWebsocket, InstalledAppInfo } from '@holochain/client';
import { contextProvided } from '@lit-labs/context';
import { appWebsocketContext, appInfoContext } from '../../../contexts';
import { IfeasyItem, TYPES, IfEasyOptions, OFFER, REQUEST } from '../../../types/ifeasy/ifeasy';
import '@material/mwc-button';
import '@type-craft/content/create-content';

@customElement('create-ifeasy')
export class CreateIfeasy extends LitElement {

  @property()
  _who: string = "zippy"
  // @state()
  // _content: string | undefined;

  @query('#who')
  _who_el?: HTMLInputElement;
  @query('#action')
  _action_el?: HTMLInputElement;
  @query('#what')
  _what_el?: HTMLInputElement;
  @query('#where')
  _where_el?: HTMLInputElement;
  @query('#when')
  _when_el?: HTMLInputElement;

  @state()
  _proposition_count: number = 1;

  @state()
  _selected: { [key: string] : string } = {who: "i"};

  @state()
  _items: Array<IfeasyItem> = [
    {
      who: "zippy",
      call: OFFER,
      action: "shop",
      preposition: "at",
      where: "price chopper",
      what: "dozen eggs, mushrooms",
      when: "today",
      matches: []
    },
    {
      who: "jean",
      call: REQUEST,
      action: "ride",
      preposition: "to",
      where: "albany",
      when: "tommorow",
      matches: ["Eric can at 10:15", "zippy can at 2:30"]
    }
  ]

  @state()
  _options: Record<string, Array<string>> =
    {
      who: ["i", "zippy", "jean"],
      call: [OFFER, REQUEST],
      action: ["shop", "baby-sit", "drive", "ride", "clean"],
      preposition: ["at", "from", "to", "on"],
      where: ["price chopper", "home", "chatham", "troy", "albany"],
      what: ["bananas", "appointment", "book"],
      when: ["today", "tommorow", "this week", "this month", "sometime"]
    }

    get count(): string {
      return (this._proposition_count as unknown )as string;
    }

  isIfeasyValid() {
    const cols = TYPES.map((type) => this._selected[type]).filter(e => e)
    return cols.length == TYPES.length
  }

  @contextProvided({ context: appWebsocketContext })
  appWebsocket!: AppWebsocket;

  @contextProvided({ context: appInfoContext })
  appInfo!: InstalledAppInfo;

  selectItem(type: string, item: string) {
    console.log(type, item);
    if (item === "at" || item === "from" || item === "on" || item === "to") {
      if (!this._selected[type]) {
        this._options[`preposition-${this.count}`] = ["at", "from", "to", "on"];
        this._proposition_count++;
      }
    }
    this._selected[type] = item
    this.requestUpdate()
  }
  resetSelected() {
    this._selected = {who: "i"}
  }
  handleEnter(event: KeyboardEvent) {
    // Enter key has been pressed
    if (event.key === 'Enter') {
      const type = (event.target as HTMLInputElement).id;
      const value = (event.target as HTMLInputElement).value;
      this._options[type as keyof typeof this._options].unshift(value);
      this.selectItem(type, value);
      // focus on next input
      const keys: Array<string> = Object.keys(this._options)
      // get index of key, increment, get option
      const nextInput = keys[keys.indexOf(type) + 1];
      const nextEl: HTMLInputElement | null = this.renderRoot?.querySelector(`#${nextInput}`);
      // XXX - not working
      nextEl?.focus();
    }
  }

  async createIfeasy() {
    const item : IfeasyItem = {
      who: this._selected.who,
      call: '',
      action: this._selected.action,
      preposition: 'to',
      where: this._selected.where,
      what: this._selected.what,
      when: this._selected.when,
      matches: [],
    }
    this._items.push(item)
    this.resetSelected()
    this.requestUpdate()
    return 
/*
    const cellData = this.appInfo.cell_data.find((c: InstalledCell) => c.role_id === 'ifeasy')!;
    const actionHash = await this.appWebsocket.callZome({
      cap_secret: null,
      cell_id: cellData.cell_id,
      zome_name: 'ifeasy',
      fn_name: 'create_ifeasy',
      payload: ifeasy,
      provenance: cellData.cell_id[1]
    });

    this.dispatchEvent(new CustomEvent('ifeasy-created', {
      composed: true,
      bubbles: true,
      detail: {
        actionHash
      }
    }));*/
  }
  match(index: number) {
    const elem = this.renderRoot.querySelector(`#content-${index}`) as HTMLInputElement |null;
    if (elem?.value) {
      const item = this._items[index]
      item.matches!.push(`${this._who} ${item.action == OFFER ? REQUEST : OFFER} ${elem.value}`)
      this.requestUpdate()
    }
  }

  spell() {
    const phrase = Object.values(this._selected).join(" ");
    return html`
      <p>${phrase}</p>
    `;
  }

  render() {
    const cols = Object.keys(this._options).map((type) => {
        // @ts-ignore
        var items = this._options[type].map((item) => {
        return html`<div class='col-entry ${this._selected[type] == item ? 'selected': ''}' @click=${() => this.selectItem(type, item)}>${item}</div>`
      })
      if (!this._selected[type]) {
        items.unshift(html`<input id=${type} class='call-input' placeholder=${type} @keypress=${this.handleEnter}></input>`)
      }
      // } else {
      //   items.unshift(html`<div class="${this._selected[type] ? '':'not-filled'}">${this._selected[type] ? this._selected[type] : `${type}`}</div>`)
      // }
      return html`<div class='column' id='${type}'>${items}</div>`
    })

    const active = this._items.map((item, i)=>{
      const words:any = TYPES.map((type) => {
        //@ts-ignore
        return html`<div class="word">${item[type]}</div>`
      })
      const matches = item.matches!.map((match) => {
        return html`<div class="match">${match}</div>`
      })
      return html`<div class="active-item"><div class="words">${words}<input type="text" id="content-${i}"></input>
      <div class="match-button" @click=${() => this.match(i)}>Easy</div></div><div class="matches">${matches}</div></div>`
    })



  return html`
      <h1>If Easy</h1>
      <div class="phrase">
        ${this.spell()}
        <mwc-button 
          label="If Easy"
          .disabled=${!this.isIfeasyValid()}
          @click=${() => this.createIfeasy()}
        ></mwc-button>
  </div>

      <div class="columns">
        ${cols}
      </div>
        <h1>If Easy: response</h1>
        <div class="items">${active}</div>
    `;
  }

  static styles = [
    css`
      mwc-button {
        float:right;
        display: flex; 
        flex-direction: row
      }
      input[id^=preposition] {
        visibility: hidden !important;
      }
      .columns {
        display: flex; flex-direction: row; flex: 1;
      }
      .item {
        display: flex; flex-direction: row; flex: 1;
      }
      .active-item {
        margin-top: 16px;
      }
      .active-items {
        display: flex; flex-direction: column
      }
      .phrase {
        width: 75%;
        margin: 1em auto 1em;  
        border: solid #303030;
        background: white;
        border-radius: 12px;
        box-shadow: 1px 1px #949494;
      }
      .call-input {
        margin: 2px;
      }
      .words {
        display: flex; flex-direction: row
      }
      .word {
        margin: 5px;
        padding: 2px;
        border-bottom: solid 1px;
        border-radius: 5px;
      }
      .matches {
        display: flex; flex-direction: column
      }
      .match {
        margin: 5px;
        margin-left: 50px;
        text-align: left;
        padding: 2px;
        border-left: solid 1px;
        border-radius: 5px;
      }
      .match-button {
        margin: 5px;
        padding: 5px;
        background-color: lightgreen;
        border: solid 1px;
        border-radius: 10px;
        cursor: pointer;
      }
      .col-entry {
        margin: 5px;
        padding: 5px;
        background-color: lightgray;
        border: solid 1px;
        border-radius: 10px;
        cursor: pointer;
      }
      .selected {
        background-color: lightblue;
      }
      .not-filled {
        color: lightgray;
        font-style: italic;
      }
      .content {
        display: flex; flex-direction: column
      }
    `,
  ];

}
