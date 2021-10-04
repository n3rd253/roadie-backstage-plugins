/*
 * Copyright 2021 Larder Software Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import { Grid } from '@material-ui/core';
import {
  Content,
  ContentHeader,
  MissingAnnotationEmptyState,
  SupportButton,
} from '@backstage/core-components';
import { PrometheusGraph } from './PrometheusGraph';
import { useEntity } from '@backstage/plugin-catalog-react';
import {
  isPrometheusAlertAvailable,
  isPrometheusGraphAvailable,
  PROMETHEUS_ALERT_ANNOTATION,
  PROMETHEUS_RULE_ANNOTATION,
} from './util';
import { PrometheusAlertStatus } from './PrometheusAlertStatus';

const PrometheusContentWrapper = ({
  step = 14,
  range = { hours: 1 },
  graphType,
}: {
  step?: number;
  range?: { hours?: number; minutes?: number };
  graphType?: 'line' | 'area';
}) => {
  const { entity } = useEntity();
  const graphContent = isPrometheusGraphAvailable(entity);
  const alertContent = isPrometheusAlertAvailable(entity);
  if (!graphContent && !alertContent) {
    return (
      <MissingAnnotationEmptyState
        annotation={`${PROMETHEUS_RULE_ANNOTATION} or ${PROMETHEUS_ALERT_ANNOTATION}`}
      />
    );
  }
  const ruleTuples = graphContent
    ? entity.metadata
        .annotations!![PROMETHEUS_RULE_ANNOTATION].split(',')
        .map(it => it.split('|'))
    : [];

  const alerts = alertContent
    ? entity.metadata.annotations!![PROMETHEUS_ALERT_ANNOTATION].split(',')
    : [];

  return (
    <Content>
      <ContentHeader title="Prometheus">
        <SupportButton>
          Plugin to show Prometheus graphs and alerts for the project
        </SupportButton>
      </ContentHeader>
      {alertContent && (
        <Grid container spacing={3} direction="column">
          <Grid item>
            <PrometheusAlertStatus alerts={alerts} />
          </Grid>
        </Grid>
      )}
      {graphContent && ruleTuples && (
        <Grid container spacing={3} direction="column">
          {ruleTuples.map(([query, dimension]) => (
            <Grid item key={query}>
              <PrometheusGraph
                dimension={dimension}
                query={query}
                range={range}
                step={step}
                graphType={graphType}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Content>
  );
};

export default PrometheusContentWrapper;
