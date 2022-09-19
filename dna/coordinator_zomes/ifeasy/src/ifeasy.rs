use hdk::prelude::*;
use ifeasy_integrity::Ifeasy;
use ifeasy_integrity::EntryTypes;

#[hdk_extern]
pub fn get_ifeasy(action_hash: ActionHash) -> ExternResult<Option<Record>> {
  get(action_hash, GetOptions::default())
}


#[hdk_extern]
pub fn create_ifeasy(ifeasy: Ifeasy) -> ExternResult<ActionHash> {
  create_entry(&EntryTypes::Ifeasy(ifeasy.clone()))
}


#[derive(Serialize, Deserialize, Debug)]
pub struct UpdateIfeasyInput {
  original_action_hash: ActionHash,
  updated_ifeasy: Ifeasy
}

#[hdk_extern]
pub fn update_ifeasy(input: UpdateIfeasyInput) -> ExternResult<ActionHash> {
  update_entry(input.original_action_hash, &input.updated_ifeasy)
}


#[hdk_extern]
pub fn delete_ifeasy(action_hash: ActionHash) -> ExternResult<ActionHash> {
  delete_entry(action_hash)
}

