import { useMemo } from "react";
import { t } from "ttag";
import _ from "underscore";

import { useCacheConfigs } from "metabase/admin/performance/hooks/useCacheConfigs";
import { getShortStrategyLabel } from "metabase/admin/performance/strategies";
import { DelayedLoadingAndErrorWrapper } from "metabase/components/LoadingAndErrorWrapper/DelayedLoadingAndErrorWrapper";
import type { DashboardSidebarPageProps } from "metabase/dashboard/components/DashboardInfoSidebar";
import { Flex } from "metabase/ui";

import { CacheSectionRoot } from "../CacheSection/CacheSection.styled";
import { PolicyToken } from "../StrategyFormLauncher.styled";
import { getDashboardId } from "../utils";

export const DashboardCacheSection = ({
  dashboard,
  setPage,
}: DashboardSidebarPageProps) => {
  const dashboardId = getDashboardId(dashboard);

  const { configs, loading, error } = useCacheConfigs({
    configurableModels: ["dashboard"],
    id: dashboardId,
  });

  const targetConfig = useMemo(
    () => _.findWhere(configs, { model_id: dashboardId }),
    [configs, dashboardId],
  );
  const savedStrategy = targetConfig?.strategy;

  const shortStrategyLabel =
    getShortStrategyLabel(savedStrategy) || t`Use default`;

  return (
    <DelayedLoadingAndErrorWrapper loading={loading} error={error}>
      <CacheSectionRoot>
        <Flex align="center" justify="space-between">
          {t`Caching policy`}
          <PolicyToken
            onClick={() => setPage("caching")}
            variant="subtle"
            radius={0}
            p={0}
            style={{ border: "none" }}
          >
            {shortStrategyLabel}
          </PolicyToken>
        </Flex>
      </CacheSectionRoot>
    </DelayedLoadingAndErrorWrapper>
  );
};
