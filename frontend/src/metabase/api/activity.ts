import type {
  PopularItem,
  RecentItem,
  RecentItemsRequest,
} from "metabase-types/api";

import { Api } from "./api";
import { provideActivityItemListTags } from "./tags";

export const activityApi = Api.injectEndpoints({
  endpoints: builder => ({
    listRecentItems: builder.query<RecentItem[], RecentItemsRequest>({
      query: (params = {}) => ({
        method: "GET",
        url: "/api/activity/recent_views",
        params,
      }),
      providesTags: (items = []) => provideActivityItemListTags(items),
    }),
    listPopularItems: builder.query<PopularItem[], void>({
      query: () => ({
        method: "GET",
        url: "/api/activity/popular_items",
      }),
      providesTags: (items = []) => provideActivityItemListTags(items),
    }),
  }),
});

export const { useListRecentItemsQuery, useListPopularItemsQuery } =
  activityApi;
