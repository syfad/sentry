/**
 * This module is used to define the look and feels for charts rendered via the
 * backend chart rendering service.
 *
 * Be careful what you import into this file, as it will end up being bundled
 * into the configuration file loaded by the service
 */

import {StyleConfig, StyleDescriptor} from '@sentry-internal/chart-renderer/lib/types';
import {EChartOption} from 'echarts/lib/echarts';

import theme from 'app/utils/theme';

import Grid from './components/grid';
import Legend from './components/legend';
import XAxis from './components/xAxis';
import YAxis from './components/yAxis';
import AreaSeries from './series/areaSeries';
import {getColorPalette} from './utils/getColorPalette';

/**
 * Defines the keys which may be passed into the backend chart rendering service
 */
export enum BackendChartStyle {
  SlackDiscoverTotalPeriod = 'slack:discover.totalPeriod',
}

/**
 * All registered style descriptors
 */
const config: StyleConfig<BackendChartStyle> = new Map();

/**
 * Register a style descriptor
 */
const register = (styleDescriptor: StyleDescriptor<BackendChartStyle>) =>
  config.set(styleDescriptor.key, styleDescriptor);

/**
 * Slack unfurls for discover using the Total Period view
 */
register({
  key: BackendChartStyle.SlackDiscoverTotalPeriod,
  height: 150,
  width: 450,
  getOption: series => {
    return {
      useUTC: true,
      color: getColorPalette(theme, series.length),
      backgroundColor: '#fff',
      grid: Grid({left: 5, right: 5, bottom: 5}),
      legend: Legend({theme, itemHeight: 6, top: 2, right: 10}),
      yAxis: YAxis({
        theme,
        splitNumber: 3,
        axisLabel: {fontSize: 11},
      }),
      xAxis: XAxis({
        theme,
        isGroupedByDate: true,
        axisLabel: {fontSize: 11},
      }),
      series: series.map(s =>
        AreaSeries({
          ...s,
        } as EChartOption.SeriesLine)
      ),
    };
  },
});

export default config;
