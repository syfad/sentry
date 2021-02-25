import {Theme} from 'app/utils/theme';

/**
 * Constructs the color palette for a chart given the Theme and optionally a
 * series length
 */
export function getColorPalette(theme: Theme, seriesLength: number | undefined | null) {
  const palette = seriesLength
    ? theme.charts.getColorPalette(seriesLength)
    : theme.charts.colors;

  return (palette as unknown) as string[];
}
