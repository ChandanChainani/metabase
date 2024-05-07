import cx from "classnames";
import type { Location } from "history";
import { assoc } from "icepick";
import { Component } from "react";
import type { ConnectedProps } from "react-redux";
import { connect } from "react-redux";
import { push } from "react-router-redux";
import _ from "underscore";

import LoadingAndErrorWrapper from "metabase/components/LoadingAndErrorWrapper";
import ColorS from "metabase/css/core/colors.module.css";
import CS from "metabase/css/core/index.css";
import DashboardS from "metabase/css/dashboard.module.css";
import {
  initialize,
  fetchDashboard,
  fetchDashboardCardData,
  fetchDashboardCardMetadata,
  cancelFetchDashboardCardData,
  setParameterValue,
  setParameterValueToDefault,
  onUpdateDashCardVisualizationSettings,
  onReplaceAllDashCardVisualizationSettings,
  fetchCardData,
  replaceCard,
  markNewCardSeen,
  setDashCardAttributes,
  setMultipleDashCardAttributes,
  removeCardFromDashboard,
  undoRemoveCardFromDashboard,
  showClickBehaviorSidebar,
} from "metabase/dashboard/actions";
import { getDashboardActions } from "metabase/dashboard/components/DashboardActions";
import { DashboardGridConnected } from "metabase/dashboard/components/DashboardGrid";
import { DashboardTabs } from "metabase/dashboard/components/DashboardTabs";
import { DashboardControls } from "metabase/dashboard/hoc/DashboardControls";
import {
  getDashboardComplete,
  getCardData,
  getSlowCards,
  getParameters,
  getParameterValues,
  getDraftParameterValues,
  getSelectedTabId,
  getClickBehaviorSidebarDashcard,
  getIsEditing,
  getIsEditingParameter,
} from "metabase/dashboard/selectors";
import { isActionDashCard } from "metabase/dashboard/utils";
import title from "metabase/hoc/Title";
import { isWithinIframe } from "metabase/lib/dom";
import ParametersS from "metabase/parameters/components/ParameterValueWidget.module.css";
import { setErrorPage } from "metabase/redux/app";
import { getMetadata } from "metabase/selectors/metadata";
import {
  setPublicDashboardEndpoints,
  setEmbedDashboardEndpoints,
} from "metabase/services";
import type { Mode } from "metabase/visualizations/click-actions/Mode";
import { PublicMode } from "metabase/visualizations/click-actions/modes/PublicMode";
import type { Dashboard, DashboardId } from "metabase-types/api";
import type { AppErrorDescriptor, State } from "metabase-types/store";

import EmbedFrame from "../../components/EmbedFrame";

import { DashboardContainer } from "./PublicDashboard.styled";

type OwnProps = {
  location: Location;
  params: {
    uuid: string;
    tabSlug?: string;
    token?: string;
    dashboardId?: string;
  };
  hasNightModeToggle: boolean;
  isFullscreen: boolean;
  isNightMode: boolean;
  onFullscreenChange: (isFullscreen: boolean) => void;
  onNightModeChange: (isNightMode: boolean) => void;
  onRefreshPeriodChange: (refreshPeriod: number | null) => void;
  refreshPeriod?: number | null;
  setRefreshElapsedHook?: (hook: () => void) => void;
};

const mapStateToProps = (state: State) => {
  return {
    metadata: getMetadata(state),
    dashboard: getDashboardComplete(state),
    dashcardData: getCardData(state),
    slowCards: getSlowCards(state),
    parameters: getParameters(state),
    parameterValues: getParameterValues(state),
    draftParameterValues: getDraftParameterValues(state),
    selectedTabId: getSelectedTabId(state),
    clickBehaviorSidebarDashcard: getClickBehaviorSidebarDashcard(state),
    isEditing: getIsEditing(state),
    isEditingParameter: getIsEditingParameter(state),
  };
};

const mapDispatchToProps = {
  initialize,
  fetchDashboard,
  fetchDashboardCardData,
  fetchDashboardCardMetadata,
  cancelFetchDashboardCardData,
  setParameterValue,
  setParameterValueToDefault,
  onUpdateDashCardVisualizationSettings,
  onReplaceAllDashCardVisualizationSettings,
  fetchCardData,
  replaceCard,
  markNewCardSeen,
  setDashCardAttributes,
  setMultipleDashCardAttributes,
  removeCardFromDashboard,
  undoRemoveCardFromDashboard,
  showClickBehaviorSidebar,
  setErrorPage,
  onChangeLocation: push,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PublicDashboardProps = OwnProps & ConnectedProps<typeof connector>;
type PublicDashboardState = {
  dashboardId: DashboardId;
};

class PublicDashboardInner extends Component<
  PublicDashboardProps,
  PublicDashboardState
> {
  constructor(props: PublicDashboardProps) {
    super(props);
    this.state = {
      dashboardId:
        // https://legacy.reactjs.org/docs/react-component.html#constructor
        String(
          this.props.params.dashboardId ||
            this.props.params.uuid ||
            this.props.params.token,
        ),
    };
  }

  _initialize = async () => {
    const {
      initialize,
      fetchDashboard,
      fetchDashboardCardData,
      setErrorPage,
      location,
      params: { uuid, token },
    } = this.props;
    if (uuid) {
      setPublicDashboardEndpoints();
    } else if (token) {
      setEmbedDashboardEndpoints();
    }

    initialize();

    const result = await fetchDashboard({
      dashId: String(uuid || token),
      queryParams: location.query,
    });

    if ("error" in result && result.error) {
      setErrorPage(result.payload);
      return;
    }

    try {
      if (this.props.dashboard?.tabs?.length === 0) {
        await fetchDashboardCardData({ reload: false, clearCache: true });
      }
    } catch (error) {
      console.error(error);
      setErrorPage(error as AppErrorDescriptor);
    }
  };

  async componentDidMount() {
    await this._initialize();
  }

  componentWillUnmount() {
    this.props.cancelFetchDashboardCardData();
  }

  async componentDidUpdate(
    prevProps: PublicDashboardProps,
    prevState: PublicDashboardState,
  ) {
    if (this.state.dashboardId !== prevState.dashboardId) {
      return this._initialize();
    }

    if (!_.isEqual(prevProps.selectedTabId, this.props.selectedTabId)) {
      this.props.fetchDashboardCardData();
      this.props.fetchDashboardCardMetadata();
      return;
    }

    if (!_.isEqual(this.props.parameterValues, prevProps.parameterValues)) {
      await this.props.fetchDashboardCardData({
        reload: false,
        clearCache: true,
      });
    }
  }

  getCurrentTabDashcards = () => {
    const { dashboard, selectedTabId } = this.props;
    if (!Array.isArray(dashboard?.dashcards)) {
      return [];
    }
    if (!selectedTabId) {
      return dashboard?.dashcards;
    }
    return dashboard?.dashcards.filter(
      dashcard => dashcard.dashboard_tab_id === selectedTabId,
    );
  };

  getHiddenParameterSlugs = () => {
    const { parameters } = this.props;
    const currentTabParameterIds =
      this.getCurrentTabDashcards()?.flatMap(
        dashcard =>
          dashcard.parameter_mappings?.map(mapping => mapping.parameter_id) ??
          [],
      ) ?? [];
    const hiddenParameters = parameters.filter(
      parameter => !currentTabParameterIds.includes(parameter.id),
    );
    return hiddenParameters.map(parameter => parameter.slug).join(",");
  };

  render() {
    const {
      dashboard,
      parameters,
      parameterValues,
      draftParameterValues,
      setParameterValueToDefault,
      dashcardData,
      selectedTabId,
      slowCards,
      clickBehaviorSidebarDashcard,
      isEditing,
      isEditingParameter,

      fetchCardData,
      replaceCard,
      markNewCardSeen,
      setDashCardAttributes,
      setMultipleDashCardAttributes,
      removeCardFromDashboard,
      undoRemoveCardFromDashboard,
      showClickBehaviorSidebar,
      onReplaceAllDashCardVisualizationSettings,
      onUpdateDashCardVisualizationSettings,
      onChangeLocation,

      isNightMode,
      isFullscreen,
      hasNightModeToggle,
      onFullscreenChange,
      onNightModeChange,
      onRefreshPeriodChange,
      refreshPeriod,
      setRefreshElapsedHook,
    } = this.props;

    const buttons = !isWithinIframe()
      ? getDashboardActions({
          dashboard,
          hasNightModeToggle,
          isFullscreen,
          isNightMode,
          onFullscreenChange,
          onNightModeChange,
          onRefreshPeriodChange,
          refreshPeriod,
          setRefreshElapsedHook,
          isPublic: true,
        })
      : [];

    const visibleDashcards = (dashboard?.dashcards ?? []).filter(
      dashcard => !isActionDashCard(dashcard),
    );

    return (
      <EmbedFrame
        name={dashboard && dashboard.name}
        description={dashboard && dashboard.description}
        dashboard={dashboard}
        parameters={parameters}
        parameterValues={parameterValues}
        draftParameterValues={draftParameterValues}
        hiddenParameterSlugs={this.getHiddenParameterSlugs()}
        setParameterValue={this.props.setParameterValue}
        setParameterValueToDefault={setParameterValueToDefault}
        enableParameterRequiredBehavior
        actionButtons={
          buttons.length > 0 && <div className={CS.flex}>{buttons}</div>
        }
        dashboardTabs={
          dashboard?.tabs &&
          dashboard?.tabs?.length > 1 && (
            <DashboardTabs
              dashboardId={this.state.dashboardId}
              location={this.props.location}
            />
          )
        }
      >
        <LoadingAndErrorWrapper
          className={cx({
            [DashboardS.DashboardFullscreen]: isFullscreen,
            [DashboardS.DashboardNight]: isNightMode,
            [ParametersS.DashboardNight]: isNightMode,
            [ColorS.DashboardNight]: isNightMode,
          })}
          loading={!dashboard}
        >
          {() => (
            <DashboardContainer>
              <DashboardGridConnected
                dashboard={assoc(dashboard, "dashcards", visibleDashcards)}
                isPublic
                className={CS.spread}
                mode={PublicMode as unknown as Mode}
                metadata={this.props.metadata}
                navigateToNewCardFromDashboard={() => {}}
                dashcardData={dashcardData}
                selectedTabId={selectedTabId}
                parameterValues={parameterValues}
                slowCards={slowCards}
                isEditing={isEditing}
                isEditingParameter={isEditingParameter}
                isXray={false}
                isFullscreen={isFullscreen}
                isNightMode={isNightMode}
                clickBehaviorSidebarDashcard={clickBehaviorSidebarDashcard}
                fetchCardData={fetchCardData}
                replaceCard={replaceCard}
                markNewCardSeen={markNewCardSeen}
                setDashCardAttributes={setDashCardAttributes}
                setMultipleDashCardAttributes={setMultipleDashCardAttributes}
                removeCardFromDashboard={removeCardFromDashboard}
                undoRemoveCardFromDashboard={undoRemoveCardFromDashboard}
                onReplaceAllDashCardVisualizationSettings={
                  onReplaceAllDashCardVisualizationSettings
                }
                onUpdateDashCardVisualizationSettings={
                  onUpdateDashCardVisualizationSettings
                }
                onChangeLocation={onChangeLocation}
                showClickBehaviorSidebar={showClickBehaviorSidebar}
              />
            </DashboardContainer>
          )}
        </LoadingAndErrorWrapper>
      </EmbedFrame>
    );
  }
}

export const PublicDashboard = _.compose(
  connector,
  title(
    ({ dashboard }: { dashboard: Dashboard }) => dashboard && dashboard.name,
  ),
  DashboardControls,
)(PublicDashboardInner);
