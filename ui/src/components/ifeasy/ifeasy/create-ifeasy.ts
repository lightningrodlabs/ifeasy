
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
  @query('#verb')
  _verb_el?: HTMLInputElement;
  @query('#what')
  _what_el?: HTMLInputElement;
  @query('#where')
  _where_el?: HTMLInputElement;
  @query('#when')
  _when_el?: HTMLInputElement;

  @state()
  _selected: { [key: string]: string } = {who: "i"}

  @state()
  _items: Array<IfeasyItem> = [
    {
      who: "zippy",
      verb: OFFER,
      what: "shop",
      where: "price chopper",
      when: "today",
      matches: []
    },
    {
      who: "jean",
      verb: REQUEST,
      what: "ride to",
      where: "albany",
      when: "tommorow",
      matches: ["Eric can at 10:15", "zippy can at 2:30"]
    }
  ]

  @state()
  _options: IfEasyOptions =
    {
      who: ["i","zippy","jean"],
      verb: ["can", "'m offerings", OFFER, REQUEST],
      what: ["shop","baby-sit","drive to", "ride to","clean"],
      where: ["price chopper","home","chatham","troy","albany"],
      when: ["today","tommorow","this week","this month","sometime"],
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
    this._selected[type] = item
    this.requestUpdate()
  }
  resetSelected() {
    this._selected = {who: "i"}
  }
  handleEnter(event: KeyboardEvent) {
    //tab key has been pressed
    if (event.key === 'Enter') {
      const type = (event.target as HTMLInputElement).id;
      const value = (event.target as HTMLInputElement).value;
      this._options[type as keyof typeof this._options].unshift(value);
      console.log(this._options);
      this.selectItem(type, value);
      // add text as 
    }
  }

  async createIfeasy() {

    const item : IfeasyItem = {
      who: this._selected.who,
      verb: this._selected.verb,
      what: this._selected.what,
      where: this._selected.where,
      when: this._selected.when,
      matches: []
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
      item.matches.push(`${this._who} ${item.verb == OFFER ? REQUEST : OFFER} ${elem.value}`)
      this.requestUpdate()
    }
  }
  render() {
    const cols = TYPES.map((type) => {
        // @ts-ignore
        var items = this._options[type].map((item) => {
        return html`<div class='col-entry ${this._selected[type] == item ? 'selected': ''}' @click=${() => this.selectItem(type, item)}>${item}</div>`
      })
      if (!this._selected[type]) {
        items.unshift(html`<input id=${type} class='call-input' placeholder=${type} @keypress=${this.handleEnter}></input>`)
      } else {
        items.unshift(html`<div class="${this._selected[type] ? '':'not-filled'}">${this._selected[type] ? this._selected[type] : `${type}`}</div>`)
      }
      console.log(items);
      return html`<div class='column' id='${type}'>${items}</div>`
    })

    const active = this._items.map((item, i)=>{
      const words:any = TYPES.map((type) => {
        //@ts-ignore
        return html`<div class="word">${item[type]}</div>`
      })
      const matches = item.matches.map((match) => {
        return html`<div class="match">${match}</div>`
      })
      return html`<div class="active-item"><div class="words">${words}<input type="text" id="content-${i}"
      style="margin-top: 16px"
      ></input>
      <div class="match-button" @click=${() => this.match(i)}> Its Easy! </div></div><div class="matches">${matches}</div></div>`
    })

  return html`
      <h1>If Easy</h1>
      <mwc-button 
          label="If Easy"
          .disabled=${!this.isIfeasyValid()}
          @click=${() => this.createIfeasy()}
        ></mwc-button>
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
      }
      .columns {
        display: flex; flex-direction: row
      }
      .item {
        display: flex; flex-direction: row
      }
      .active-items {
        display: flex; flex-direction: column
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
