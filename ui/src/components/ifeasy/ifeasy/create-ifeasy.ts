
import { LitElement, html } from 'lit';
import { state, customElement } from 'lit/decorators.js';
import { InstalledCell, AppWebsocket, InstalledAppInfo } from '@holochain/client';
import { contextProvided } from '@lit-labs/context';
import { appWebsocketContext, appInfoContext } from '../../../contexts';
import { Ifeasy } from '../../../types/ifeasy/ifeasy';
import '@material/mwc-button';
import '@type-craft/content/create-content';

@customElement('create-ifeasy')
export class CreateIfeasy extends LitElement {

    @state()
  _content: string | undefined;

  isIfeasyValid() {
    return this._content;
  }

  @contextProvided({ context: appWebsocketContext })
  appWebsocket!: AppWebsocket;

  @contextProvided({ context: appInfoContext })
  appInfo!: InstalledAppInfo;

  async createIfeasy() {
    const cellData = this.appInfo.cell_data.find((c: InstalledCell) => c.role_id === 'ifeasy')!;

    const ifeasy: Ifeasy = {
      content: this._content!,
    };

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
    }));
  }

  render() {
    return html`
      <div style="display: flex; flex-direction: column">
        <span style="font-size: 18px">Create Ifeasy</span>

        <create-content 
      
      @change=${(e: Event) => this._content = (e.target as any).value}
      style="margin-top: 16px"
    ></create-content>

        <mwc-button 
          label="Create Ifeasy"
          .disabled=${!this.isIfeasyValid()}
          @click=${() => this.createIfeasy()}
        ></mwc-button>
    </div>`;
  }
}
