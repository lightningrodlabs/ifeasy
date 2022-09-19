
import { DnaSource, Record, ActionHash } from "@holochain/client";
import { pause, runScenario } from "@holochain/tryorama";
import { decode } from '@msgpack/msgpack';
import pkg from 'tape-promise/tape';
const { test } = pkg;

import { ifeasyDna } from  "../../utils";


export default () => test("ifeasy CRUD tests", async (t) => {
  await runScenario(async scenario => {

    const dnas: DnaSource[] = [{path: ifeasyDna }];

    const [alice, bob]  = await scenario.addPlayersWithHapps([dnas, dnas]);

    await scenario.shareAllAgents();

    const createInput = {
  "content": "You really think you can fly that thing? A computer virus. You're obsessed with the fat lady!"
};

    // Alice creates a ifeasy
    const createActionHash: ActionHash = await alice.cells[0].callZome({
      zome_name: "ifeasy",
      fn_name: "create_ifeasy",
      payload: createInput,
    });
    t.ok(createActionHash);

    // Wait for the created entry to be propagated to the other node.
    await pause(100);

    
    // Bob gets the created ifeasy
    const createReadOutput: Record = await bob.cells[0].callZome({
      zome_name: "ifeasy",
      fn_name: "get_ifeasy",
      payload: createActionHash,
    });
    t.deepEqual(createInput, decode((createReadOutput.entry as any).Present.entry) as any);
    
    
    // Alice updates the ifeasy
    const contentUpdate = {
  "content": "I gave it a virus. I travel for work, but recently, friends said I should take major trips. Must go faster."
}

    const updateInput = {
      original_action_hash: createActionHash,
      updated_ifeasy: contentUpdate,
    };

    const updateActionHash: ActionHash = await alice.cells[0].callZome({
      zome_name: "ifeasy",
      fn_name: "update_ifeasy",
      payload: updateInput,
    });
    t.ok(updateActionHash); 

    // Wait for the updated entry to be propagated to the other node.
    await pause(100);

      
    // Bob gets the updated ifeasy
    const readUpdatedOutput: Record = await bob.cells[0].callZome({
      zome_name: "ifeasy",
      fn_name: "get_ifeasy",
      payload: updateActionHash,
    });
    t.deepEqual(contentUpdate, decode((readUpdatedOutput.entry as any).Present.entry) as any); 

    
    
    // Alice deletes the ifeasy
    const deleteActionHash = await alice.cells[0].callZome({
      zome_name: "ifeasy",
      fn_name: "delete_ifeasy",
      payload: createActionHash,
    });
    t.ok(deleteActionHash); 

      
    // Wait for the deletion action to be propagated to the other node.
    await pause(100);

    // Bob tries to get the deleted ifeasy, but he doesn't get it because it has been deleted
    const readDeletedOutput = await bob.cells[0].callZome({
      zome_name: "ifeasy",
      fn_name: "get_ifeasy",
      payload: createActionHash,
    });
    t.notOk(readDeletedOutput);

    
  });



});
