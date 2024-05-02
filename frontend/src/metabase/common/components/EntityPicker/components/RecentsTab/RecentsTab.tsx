import { t } from "ttag";

import EmptyState from "metabase/components/EmptyState";
import { NoObjectError } from "metabase/components/errors/NoObjectError";
import { SearchLoadingSpinner } from "metabase/nav/components/search/SearchResults";
import { Box, Flex, Stack } from "metabase/ui";
import type { RecentItem } from "metabase-types/api";

import type { TypeWithModel } from "../../types";
import { ResultItem, ChunkyList } from "../ResultItem";

export const RecentsTab = <
  Id,
  Model extends string,
  Item extends TypeWithModel<Id, Model>,
>({
  recentItems,
  onItemSelect,
  selectedItem,
  isLoading,
}: {
  recentItems: RecentItem[] | null;
  onItemSelect: (item: Item) => void;
  selectedItem: Item | null;
  isLoading: boolean;
}) => {
  if (isLoading || !recentItems) {
    return <SearchLoadingSpinner />;
  }

  return (
    <Stack h="100%" bg="bg-light">
      {recentItems.length > 0 ? (
        <Box style={{ overflowY: "auto" }} p="xl">
          <ChunkyList>
            {recentItems?.map((item, index) => (
              <ResultItem
                key={item.model + item.model_object.id}
                item={{
                  ...item,
                  ...item.model_object,
                  collection_authority_level: item.model_object.authority_level,
                  collection: {
                    id: item.model_object.collection_id,
                    name: item.model_object.collection_name,
                    authority_level: item.model_object.authority_level,
                  },
                }}
                onClick={() => {
                  onItemSelect({
                    name: item.model_object.name,
                    id: item.model_object.id,
                    model: item.model,
                    collection_id: item.model_object.collection_id,
                  } as unknown as Item);
                }}
                isSelected={
                  selectedItem?.id === item.model_object.id &&
                  selectedItem?.model === item.model
                }
                isLast={index === recentItems.length - 1}
              />
            ))}
          </ChunkyList>
        </Box>
      ) : (
        <Flex direction="column" justify="center" h="100%">
          <EmptyState
            title={t`Didn't find anything`}
            message={t`There weren't any recent items.`}
            illustrationElement={<NoObjectError mb="-1.5rem" />}
          />
        </Flex>
      )}
    </Stack>
  );
};
