import { t } from "ttag";
import _ from "underscore";

import type { SortingOptions } from "metabase/components/ItemsTable/BaseItemsTable";
import type { CollectionEssentials, SearchResult } from "metabase-types/api";
import { SortDirection } from "metabase-types/api";

import { getCollectionName } from "../utils";

import { pathSeparatorChar } from "./constants";

export const getBreadcrumbMaxWidths = (
  collections: CollectionEssentials["effective_ancestors"],
  totalUnitsOfWidthAvailable: number,
  isPathEllipsified: boolean,
) => {
  if (!collections || collections.length < 2) {
    return [];
  }
  const lengths = collections.map(
    collection => getCollectionName(collection).length,
  );
  const ratio = lengths[0] / (lengths[0] + lengths[1]);
  const firstWidth = Math.max(
    Math.round(ratio * totalUnitsOfWidthAvailable),
    25,
  );
  const secondWidth = totalUnitsOfWidthAvailable - firstWidth;
  const padding = isPathEllipsified ? "2rem" : "1rem";
  return [
    `calc(${firstWidth}cqw - ${padding})`,
    `calc(${secondWidth}cqw - ${padding})`,
  ];
};

export const isModel = (item: SearchResult) => item.model === "dataset";

export const getModelDescription = (item: SearchResult) => {
  if (item.collection && isModel(item) && !item.description?.trim()) {
    return t`A model`;
  } else {
    return item.description;
  }
};

export const getCollectionPathString = (collection: CollectionEssentials) => {
  const ancestors: CollectionEssentials[] =
    collection.effective_ancestors || [];
  const collections = ancestors.concat(collection);
  const pathString = collections
    .map(coll => getCollectionName(coll))
    .join(` ${pathSeparatorChar} `);
  return pathString;
};

export const sortModels = (
  models: SearchResult[],
  sortingOptions: SortingOptions,
) => {
  const { sort_column, sort_direction } = sortingOptions;
  const sorted = _.sortBy(models, model => {
    if (sort_column === "collection") {
      const collection: CollectionEssentials = model.collection;
      return getCollectionPathString(collection);
    }
    if (sort_column in model) {
      return model[sort_column as keyof typeof model];
    } else {
      console.error("Invalid sort column", sort_column);
      return null;
    }
  });
  if (sort_direction === SortDirection.Desc) {
    sorted.reverse();
  }
  return sorted;
};
