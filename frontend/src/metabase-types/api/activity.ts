import type { CollectionId } from "./collection";
import type { DatabaseId } from "./database";
import type { UserId } from "./user";

export const ACTIVITY_MODELS = [
  "table",
  "card",
  "dataset",
  "dashboard",
] as const;
export type ActivityModel = typeof ACTIVITY_MODELS[number];
export type ActivityModelId = number;

export interface ActivityModelObject {
  id: ActivityModelId;
  name: string;
  display_name?: string;
  moderated_status?: string;
  authority_level?: string;
  collection_id?: CollectionId | null;
  collection_name?: string;
  database_name?: string;
  db_id?: DatabaseId;
}

export interface RecentItem {
  cnt: number;
  max_ts: string;
  user_id: UserId;
  model: ActivityModel;
  model_id: ActivityModelId;
  model_object: ActivityModelObject;
}

export interface RecentItemsRequest {
  limit?: number;
}

export interface PopularItem {
  model: ActivityModel;
  model_id: ActivityModelId;
  model_object: ActivityModelObject;
}
