import { useMemo } from "react";
import type { InjectedRouter, Route } from "react-router";
import { withRouter } from "react-router";
import _ from "underscore";

import { StrategyForm } from "metabase/admin/performance/components/StrategyForm";
import { useCacheConfigs } from "metabase/admin/performance/hooks/useCacheConfigs";
import { useConfirmIfFormIsDirty } from "metabase/admin/performance/hooks/useConfirmIfFormIsDirty";
import { useSaveStrategy } from "metabase/admin/performance/hooks/useSaveStrategy";
import { DelayedLoadingAndErrorWrapper } from "metabase/components/LoadingAndErrorWrapper/DelayedLoadingAndErrorWrapper";
import type { DashboardSidebarPageProps } from "metabase/dashboard/components/DashboardInfoSidebar";
import { color } from "metabase/lib/colors";
import { Button, Flex, Icon, Title } from "metabase/ui";
import type { Model } from "metabase-types/api";

import { DashboardStrategySidebarBody } from "./DashboardStrategySidebar.styled";

const DashboardStrategySidebar_Base = ({
  dashboard,
  setPage,
  router,
  route,
}: DashboardSidebarPageProps & {
  router: InjectedRouter;
  route: Route;
}) => {
  if (typeof dashboard.id === "string") {
    throw new Error("This dashboard has an invalid id");
  }
  const dashboardId: number = dashboard.id;
  const configurableModels: Model[] = ["dashboard"];
  const { configs, setConfigs, loading, error } = useCacheConfigs({
    configurableModels,
    id: dashboardId,
  });
  const targetConfig = useMemo(
    () => _.findWhere(configs, { model_id: dashboardId }),
    [configs, dashboardId],
  );
  const savedStrategy = targetConfig?.strategy;
  const filteredConfigs = _.compact([targetConfig]);

  const saveStrategy = useSaveStrategy(
    dashboardId,
    filteredConfigs,
    setConfigs,
    "dashboard",
  );

  const { confirmationModal, setIsStrategyFormDirty } = useConfirmIfFormIsDirty(
    router,
    route,
  );

  return (
    <DashboardStrategySidebarBody align="flex-start" spacing="md">
      <Flex align="center">
        <Button
          lh={0}
          style={{ marginInlineStart: ".5rem" }}
          variant="subtle"
          onClick={() => setPage("default")}
        >
          <Icon name="chevronleft" color={color("text-dark")} />
        </Button>
        <Title order={2}>Caching settings</Title>
      </Flex>
      <DelayedLoadingAndErrorWrapper loading={loading} error={error}>
        <StrategyForm
          targetId={dashboardId}
          targetName={dashboard.name}
          setIsDirty={setIsStrategyFormDirty}
          saveStrategy={saveStrategy}
          savedStrategy={savedStrategy}
          shouldAllowInvalidation
          shouldShowName={false}
        />
      </DelayedLoadingAndErrorWrapper>
      {confirmationModal}
    </DashboardStrategySidebarBody>
  );
};

export const DashboardStrategySidebar = withRouter(
  DashboardStrategySidebar_Base,
);
