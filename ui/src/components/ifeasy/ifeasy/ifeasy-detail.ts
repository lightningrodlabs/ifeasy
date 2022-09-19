
import { LitElement, html } from 'lit';
import { state, customElement, property } from 'lit/decorators.js';
import { InstalledCell, AppWebsocket, Record, ActionHash, InstalledAppInfo } from '@holochain/client';
import { contextProvided } from '@lit-labs/context';
import { decode } from '@msgpack/msgpack';
import { appInfoContext, appWebsocketContext } from '../../../contexts';
import { Ifeasy } from '../../../types/ifeasy/ifeasy';
import '@material/mwc-circular-progress';
import '@type-craft/content/content-detail';

@customElement('ifeasy-detail')
export class IfeasyDetail extends LitElement {
  @property()
  actionHash!: ActionHash;

  @state()
  _ifeasy: Ifeasy | undefined;

  @contextProvided({ context: appWebsocketContext })
  appWebsocket!: AppWebsocket;

  @contextProvided({ context: appInfoContext })
  appInfo!: InstalledAppInfo;

  async doLoad() {
    console.log("loading ", this.actionHash)
    const cellData = this.appInfo.cell_data.find((c: InstalledCell) => c.role_id === 'ifeasy')!;

    const record: Record | undefined = await this.appWebsocket.callZome({
      cap_secret: null,
      cell_id: cellData.cell_id,
      zome_name: 'ifeasy',
      fn_name: 'get_ifeasy',
      payload: this.actionHash,
      provenance: cellData.cell_id[1]
    });

   if (record) {
    this._ifeasy = decode((record.entry as any).Present.entry) as Ifeasy;
   }
  }

  async requestUpdate(name?: PropertyKey, oldValue?: unknown) {
    if (name && this.appInfo && name == "actionHash" && this.actionHash !== oldValue) {
        await this.doLoad()
    }
    // Proceed to schedule an update
    return super.requestUpdate(name, oldValue);
  }
  async firstUpdated() {
        this.doLoad()
  }

  render() {
    if (!this._ifeasy) {
      return html`<div style="display: flex; flex: 1; align-items: center; justify-content: center">
        <mwc-circular-progress indeterminate></mwc-circular-progress>
      </div>`;
    }

    return html`
      <div style="display: flex; flex-direction: column">
        <span style="font-size: 18px">Ifeasy</span>

        
    <content-detail
    
    .value=${this._ifeasy.content}
      style="margin-top: 16px"
    ></content-detail>

      </div>
    `;
  }
}
