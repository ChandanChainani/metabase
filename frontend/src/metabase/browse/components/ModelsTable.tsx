import { push } from "react-router-redux";
import { t } from "ttag";

import EntityItem from "metabase/components/EntityItem";
import {
  SortableColumnHeader,
  type SortingOptions,
} from "metabase/components/ItemsTable/BaseItemsTable";
import {
  ItemCell,
  ItemLink,
  ItemNameCell,
  Table,
  TableColumn,
  TBody,
} from "metabase/components/ItemsTable/BaseItemsTable.styled";
import { Columns } from "metabase/components/ItemsTable/Columns";
import type { ResponsiveProps } from "metabase/components/ItemsTable/utils";
import { color } from "metabase/lib/colors";
import { useDispatch } from "metabase/lib/redux";
import * as Urls from "metabase/lib/urls";
import { PLUGIN_MODERATION } from "metabase/plugins";
import type { Card, SearchResult } from "metabase-types/api";

import { trackModelClick } from "../analytics";
import { getCollectionName, getIcon } from "../utils";

import { CollectionBreadcrumbsWithTooltip } from "./CollectionBreadcrumbsWithTooltip";
import { EllipsifiedWithMarkdown } from "./EllipsifiedWithMarkdown";
import { ModelTableRow } from "./ModelsTable.styled";
import { getModelDescription } from "./utils";

export interface ModelsTableProps {
  items: SearchResult[];
  sortingOptions?: SortingOptions;
  onSortingOptionsChange?: (newSortingOptions: SortingOptions) => void;
}

const descriptionProps: ResponsiveProps = {
  hideAtContainerBreakpoint: "sm",
  containerName: "ItemsTableContainer",
};

const collectionProps: ResponsiveProps = {
  hideAtContainerBreakpoint: "xs",
  containerName: "ItemsTableContainer",
};

export const ModelsTable = ({
  items,
  sortingOptions,
  onSortingOptionsChange,
}: ModelsTableProps) => {
  return (
    <Table>
      <colgroup>
        <Columns.Type.Col />

        {/* <col> for Name column */}
        <TableColumn style={{ width: "10rem" }} />

        {/* <col> for Description column */}
        <TableColumn {...descriptionProps} />

        {/* <col> for Collection column */}
        <TableColumn {...collectionProps} />

        <Columns.RightEdge.Col />
      </colgroup>
      <thead>
        <tr>
          <Columns.Type.Header title="" />
          <Columns.Name.Header
            sortingOptions={sortingOptions}
            onSortingOptionsChange={onSortingOptionsChange}
          />
          <SortableColumnHeader name="description" {...descriptionProps}>
            {t`Description`}
          </SortableColumnHeader>
          <SortableColumnHeader
            name="collection"
            sortingOptions={sortingOptions}
            onSortingOptionsChange={onSortingOptionsChange}
            {...collectionProps}
          >
            {t`Collection`}
          </SortableColumnHeader>
          <Columns.RightEdge.Header />
        </tr>
      </thead>
      <TBody>
        {items.map((item: SearchResult) => (
          <TBodyRow item={item} key={`${item.model}-${item.id}`} />
        ))}
      </TBody>
    </Table>
  );
};

const TBodyRow = ({ item }: { item: SearchResult }) => {
  const icon = getIcon(item);
  if (item.model === "card") {
    icon.color = color("text-light");
  }

  const containerName = `collections-path-for-${item.id}`;
  const dispatch = useDispatch();
  const stopClickPropagation = {
    onClick: (e: React.MouseEvent) => e.stopPropagation(),
  };

  return (
    <ModelTableRow
      onClick={(e: React.MouseEvent) => {
        const url = Urls.model(item as unknown as Partial<Card>);
        if ((e.ctrlKey || e.metaKey) && e.button === 0) {
          window.open(url, "_blank");
        } else {
          dispatch(push(url));
        }
      }}
      tabIndex={0}
      key={item.id}
    >
      {/* Type */}
      <Columns.Type.Cell icon={icon} />

      {/* Name */}
      <NameCell
        item={item}
        onClick={() => {
          trackModelClick(item.id);
        }}
      />

      {/* Description */}
      <ItemCell {...descriptionProps}>
        <EllipsifiedWithMarkdown>
          {getModelDescription(item) || ""}
        </EllipsifiedWithMarkdown>
      </ItemCell>

      {/* Collection */}
      <ItemCell
        data-testid={`path-for-collection: ${
          item.collection
            ? getCollectionName(item.collection)
            : t`Untitled collection`
        }`}
        {...collectionProps}
      >
        {item.collection && (
          <CollectionBreadcrumbsWithTooltip
            containerName={containerName}
            collection={item.collection}
            // To avoid propagating the click event to the ModelTableRow
            breadcrumbGroupProps={stopClickPropagation}
            collectionsIconProps={stopClickPropagation}
          />
        )}
      </ItemCell>

      {/* Adds a border-radius to the table */}
      <Columns.RightEdge.Cell />
    </ModelTableRow>
  );
};

const NameCell = ({
  item,
  testIdPrefix = "table",
  onClick,
}: {
  item: SearchResult;
  testIdPrefix?: string;
  onClick?: () => void;
}) => {
  // TODO: make sure I've done the icons right
  return (
    <ItemNameCell data-testid={`${testIdPrefix}-name`}>
      <ItemLink
        to={Urls.model(item as unknown as Partial<Card>)}
        onClick={onClick}
      >
        <EntityItem.Name name={item.name} variant="list" />
        <PLUGIN_MODERATION.ModerationStatusIcon
          size={16}
          status={item.moderated_status}
        />
      </ItemLink>
    </ItemNameCell>
  );
};
