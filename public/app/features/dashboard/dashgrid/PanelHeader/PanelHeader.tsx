import React, { FC } from 'react';
import { css, cx } from '@emotion/css';
import { DataLink, GrafanaTheme2, PanelData } from '@grafana/data';
import { Icon, useStyles2 } from '@grafana/ui';
import { selectors } from '@grafana/e2e-selectors';

import PanelHeaderCorner from './PanelHeaderCorner';
import { DashboardModel } from 'app/features/dashboard/state/DashboardModel';
import { PanelModel } from 'app/features/dashboard/state/PanelModel';
import { getPanelLinksSupplier } from 'app/features/panel/panellinks/linkSuppliers';
import { PanelHeaderNotices } from './PanelHeaderNotices';
import { PanelHeaderMenuTrigger } from './PanelHeaderMenuTrigger';
import { PanelHeaderLoadingIndicator } from './PanelHeaderLoadingIndicator';
import { PanelHeaderMenuWrapper } from './PanelHeaderMenuWrapper';

import config from 'app/core/config';

export interface Props {
  panel: PanelModel;
  dashboard: DashboardModel;
  title?: string;
  description?: string;
  links?: DataLink[];
  error?: string;
  alertState?: string;
  isViewing: boolean;
  isEditing: boolean;
  data: PanelData;
}

export const PanelHeader: FC<Props> = ({ panel, error, isViewing, isEditing, data, alertState, dashboard }) => {
  const onCancelQuery = () => panel.getQueryRunner().cancelQuery();
  const title = panel.getDisplayTitle();
  const className = cx('panel-header', !(isViewing || isEditing) ? 'grid-drag-handle' : '');
  const styles = useStyles2(panelStyles);
  const isAdmin = config.bootData.user.isGrafanaAdmin;

  return (
    <>
      <PanelHeaderLoadingIndicator state={data.state} onClick={onCancelQuery} />
      <PanelHeaderCorner
        panel={panel}
        title={panel.title}
        description={panel.description}
        scopedVars={panel.scopedVars}
        links={getPanelLinksSupplier(panel)}
        error={error}
      />
      <div className={className}>
        <PanelHeaderMenuTrigger data-testid={selectors.components.Panels.Panel.title(title)}>
          {({ closeMenu, panelMenuOpen }) => {
            return (
              <div className="panel-title">
                <PanelHeaderNotices frames={data.series} panelId={panel.id} />
                {alertState ? (
                  <Icon
                    name={alertState === 'alerting' ? 'heart-break' : 'heart'}
                    className="icon-gf panel-alert-icon"
                    style={{ marginRight: '4px' }}
                    size="sm"
                  />
                ) : null}
                <h2 className={styles.titleText}>{title}</h2>
                {(() => {
                  if (isAdmin) {
                    return (
                      <span>
                        <Icon name="angle-down" className="panel-menu-toggle" />
                        <PanelHeaderMenuWrapper
                          panel={panel}
                          dashboard={dashboard}
                          show={panelMenuOpen}
                          onClose={closeMenu}
                        />
                        {data.request && data.request.timeInfo && (
                          <span className="panel-time-info">
                            <Icon name="clock-nine" size="sm" /> {data.request.timeInfo}
                          </span>
                        )}
                      </span>
                    );
                  } else {
                    return (
                      <span className={styles.isView}>
                        <Icon name="angle-down" className="panel-menu-toggle" />
                        <PanelHeaderMenuWrapper
                          panel={panel}
                          dashboard={dashboard}
                          show={panelMenuOpen}
                          onClose={closeMenu}
                        />
                        {data.request && data.request.timeInfo && (
                          <span className="panel-time-info">
                            <Icon name="clock-nine" size="sm" /> {data.request.timeInfo}
                          </span>
                        )}
                      </span>
                    );
                  }
                })()}
              </div>
            );
          }}
        </PanelHeaderMenuTrigger>
      </div>
    </>
  );
};

const panelStyles = (theme: GrafanaTheme2) => {
  return {
    titleText: css`
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      max-width: calc(100% - 38px);
      cursor: pointer;
      font-weight: ${theme.typography.fontWeightMedium};
      font-size: ${theme.typography.body.fontSize};
      margin: 0;

      &:hover {
        color: ${theme.colors.text.primary};
      }
      .panel-has-alert & {
        max-width: calc(100% - 54px);
      }
    `,
    isView: css`
      display: none;
    `,
  };
};
