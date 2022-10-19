
import { LitElement, html, css } from 'lit';
import { state, customElement, property, query } from 'lit/decorators.js';
import { AppWebsocket, InstalledAppInfo } from '@holochain/client';
import { contextProvided } from '@lit-labs/context';
import { appWebsocketContext, appInfoContext } from '../../../contexts';
import { IfeasyItem, TYPES, OFFER, REQUEST, Detail } from '../../../types/ifeasy/ifeasy';
import '@material/mwc-button';
import '@type-craft/content/create-content';

@customElement('create-ifeasy')
export class CreateIfeasy extends LitElement {

  @property()
  _who: string = "zippy"

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
  _selected: {[key:string]: string} = {who: "i"};

  @state()
  _items: Array<IfeasyItem> = [
    {
      who: "zippy",
      call: REQUEST,
      what: {
        "dozen eggs": {wasEasyFor: 'alex'} as Detail, 
        "mushrooms": {} as Detail
      },
      where: "price chopper",
      when: "today"
    },
    {
      who: "jean",
      call: REQUEST,
      what: {"pickup": {} as Detail},
      where: "albany",
      when: "tommorow"
    },
    {
      who: "alex",
      call: REQUEST,
      what: {},
      where: "The Bee Store",
      when: "sometime"
    }
  ]

  @state()
  _options: Record<string, Array<string>> =
    {
      who: ["i"],
      call: [OFFER, REQUEST],
      what: [],
      where: ["price chopper", "home", "chatham", "troy", "albany"],
      when: ["today", "tommorow", "this week", "this month", "sometime"]
    }

  isIfeasyValid() {
    return true;
    // const cols = TYPES.map((type) => this._selected[type]).filter(e => e)
    // return cols.length > 3;
  }

  @contextProvided({ context: appWebsocketContext })
  appWebsocket!: AppWebsocket;

  @contextProvided({ context: appInfoContext })
  appInfo!: InstalledAppInfo;

  createIfeasy() {
    const whats: Record<string, Detail> = {} as Record<string, Detail>;
    this._selected.what.split(",").forEach((thing) => {
      whats[thing] = {} as Detail;
    })
    const item : IfeasyItem = {
      who: this._selected.who,
      call: this._selected.call,
      action: this._selected.action,
      where: this._selected.where,
      what: whats,
      when: this._selected.when
    }
    this._items.push(item)
    this.resetSelected()
    this.requestUpdate()
    return;
  }

  selectItem(type: string, item: string) {
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
    }
  }

  addWhat(event: KeyboardEvent, index: number) {
    // Enter key has been pressed
    if (event.key === 'Enter') {
      // get handle on element that event came from
      const elem = this.renderRoot.querySelector(`#content-${index}`) as HTMLInputElement | null;
      if (elem?.value) {
        const item = this._items[index]
        const whats = elem.value.split(',');
        whats!.forEach((what) => {
          item.what![what] = {} as Detail;
        })
        elem.value = '';
        this.requestUpdate()
      }
    }
  }

  isEasy(i: number, key: string) {
    // person adds name to list
    this._items[i].what![key]!.easyFor = [];
    this._items[i].what![key]!.easyFor?.push(this._who);
    this.requestUpdate();
  }

  wasEasy(i: number, key: string) {
    // strike through name of thing
    this._items[i].what![key]!.wasEasyFor = this._who;
    this.requestUpdate()
  }

  isComplete(item: IfeasyItem): boolean {
    let isComplete = true;
    Object.values(item.what as Record<string, Detail>).forEach((thing) => {
      if (!thing.hasOwnProperty('wasEasyFor')) {
        isComplete = false;
      }
    });
    return isComplete;
  }

  /*
  * remove easy button when done
  * Turn done into text when done
  */

  render() {
    const cols = Object.keys(this._options).map((type) => {
        // @ts-ignore
        var items = this._options[type].map((item) => {
        return html`<div class='col-entry ${this._selected[type] == item ? 'selected': ''}' @click=${() => this.selectItem(type, item)}>${item}</div>`
      })
      if (!this._selected[type]) {
        items.unshift(html`<input id=${type} class='call-input' placeholder=${type} @keypress=${this.handleEnter}></input>`)
      }
      return html`<div class='column' id='${type}'>${items}</div>`
    })

    const active = this._items.map((item, i) => {

      if (this.isComplete(item)) {return};
      
      const words:any = Object.keys(item).map((type) => {
        if (type === "who") {
          return html`<div class="word">${item["who"]}</div>`
        }
        if (type === "call") {
          return html`<div class="word">${item["call"]}s</div>`
        } 
        if (type === "what") {
          const length = Object.keys(item["what"] as Record<string, Detail>).length;
          return html`<div class="word">${length} thing${length == 1 ? '': 's'}</div>`
        }
        if (type === "where") {
          return html`<div class="word">at ${item["where"]}</div>`
        }
        if (type === "when") {
          return html`<div class="word">${item["when"]}</div>`
        }
      });

      /**
       * TODO
       * - strike through on complete
       * - render name if Easy clicked
       * - render name if Done clicked
       * - Put name for all if All Easy clicked
       * - Put name for done if All Done clicked
       */
      const whatEntries: Record<string, Detail> = item["what"]!; 

      const what: any = [];
      for (const [key, value] of Object.entries(whatEntries)) {
        const detail: Detail = value ? value : {} as Detail;

        what.push(html`
          <ul>
            <li>
              <span class="${detail.wasEasyFor ? 'done' : ''}">${key}</span>
              <span class="easy-button ${detail.wasEasyFor ? 'remove' : ''}" @click=${() => this.isEasy(i, key)}>${item.call === REQUEST ? "It's Easy": "Yes, Please"}</span>
              <span class="${detail.easyFor ? '' : 'hide'} ${detail.wasEasyFor ? 'remove' : ''}">${item.call === REQUEST ? "for": "from"} ${detail.easyFor}</span>
              <span class="easy-button ${detail.wasEasyFor ? 'remove' : ''}" @click=${() => this.wasEasy(i, key)}>Done</span>
              <span class="${detail.wasEasyFor ? '' : 'hide'}">Done by ${detail.wasEasyFor}</span>
            </li>
          </ul>
        `);
      };

      return html`
        <div class="active-item">
          <div class="words">${words}
        </div>
        <div class="detail-container">
          <div class="detail-container-column-what">
            <div class="what">${what}</div>
          </div>
        </div>
        <input class="what-input" type="text" placeholder="Add New Things" id="content-${i}" @keypress=${(event: KeyboardEvent)=>this.addWhat(event, i)}></input>
      </div>`
    })

  return html`
    <h1>If Easy - Matter Moving</h1>
    <div class="phrase">
      <p>${Object.values(this._selected).join(" ")}</p>
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
      .hide {
        visibility: hidden;
      }
      .remove {
        display: none;
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
        display: flex; flex-direction: column;
      }
      .done {
        text-decoration: line-through;
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
      .easy-button {
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
      .what {
        text-align: justify
      }
      .what-input {
        margin-left: -65%
      }
      .detail-container {
        display: flex;
        flex-direction: row
      }
      .detail-container-column-what {
        flex: 1;
        display: flex;
        flex-direction: column
      }
      .detail-container-column-match {
        flex: 2;
        display: flex;
        flex-direction: column
      }
      ul {
        list-style-type:none;
      }
    `,
  ];

}
