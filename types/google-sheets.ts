/**
 * Google Sheets API v4 TypeScript type definitions
 * For direct HTTP API usage (not googleapis library)
 */

export interface GoogleSheetsSpreadsheet {
  spreadsheetId: string;
  properties: SpreadsheetProperties;
  sheets: Sheet[];
  spreadsheetUrl: string;
}

export interface SpreadsheetProperties {
  title: string;
  locale: string;
  autoRecalc: string;
  timeZone: string;
  defaultFormat: CellFormat;
}

export interface Sheet {
  properties: SheetProperties;
  data?: GridData[];
  merges?: GridRange[];
  conditionalFormats?: ConditionalFormatRule[];
  filterViews?: FilterView[];
  protectedRanges?: ProtectedRange[];
  basicFilter?: BasicFilter;
  charts?: EmbeddedChart[];
  bandedRanges?: BandedRange[];
  developerMetadata?: DeveloperMetadata[];
}

export interface SheetProperties {
  sheetId: number;
  title: string;
  index: number;
  sheetType: 'GRID' | 'OBJECT';
  gridProperties?: GridProperties;
  hidden?: boolean;
  tabColor?: Color;
  rightToLeft?: boolean;
}

export interface GridProperties {
  rowCount: number;
  columnCount: number;
  frozenRowCount?: number;
  frozenColumnCount?: number;
  hideGridlines?: boolean;
  rowGroupControlAfter?: boolean;
  columnGroupControlAfter?: boolean;
}

export interface GridData {
  startRow?: number;
  startColumn?: number;
  rowData?: RowData[];
  rowMetadata?: DimensionProperties[];
  columnMetadata?: DimensionProperties[];
}

export interface RowData {
  values?: CellData[];
}

export interface CellData {
  userEnteredValue?: ExtendedValue;
  effectiveValue?: ExtendedValue;
  formattedValue?: string;
  userEnteredFormat?: CellFormat;
  effectiveFormat?: CellFormat;
  hyperlink?: string;
  note?: string;
  textFormatRuns?: TextFormatRun[];
  dataValidation?: DataValidationRule;
  pivotTable?: PivotTable;
  dataSourceTable?: DataSourceTable;
}

export interface ExtendedValue {
  numberValue?: number;
  stringValue?: string;
  boolValue?: boolean;
  formulaValue?: string;
  errorValue?: ErrorValue;
}

export interface ErrorValue {
  type:
    | 'ERROR_TYPE_UNSPECIFIED'
    | 'ERROR'
    | 'NULL_VALUE'
    | 'DIVIDE_BY_ZERO'
    | 'VALUE'
    | 'REF'
    | 'NAME'
    | 'NUM'
    | 'N_A'
    | 'LOADING';
  message?: string;
}

export interface CellFormat {
  numberFormat?: NumberFormat;
  backgroundColor?: Color;
  backgroundColorStyle?: ColorStyle;
  borders?: Borders;
  padding?: Padding;
  horizontalAlignment?:
    | 'HORIZONTAL_ALIGN_UNSPECIFIED'
    | 'LEFT'
    | 'CENTER'
    | 'RIGHT';
  verticalAlignment?:
    | 'VERTICAL_ALIGN_UNSPECIFIED'
    | 'TOP'
    | 'MIDDLE'
    | 'BOTTOM';
  wrapStrategy?:
    | 'WRAP_STRATEGY_UNSPECIFIED'
    | 'OVERFLOW_CELL'
    | 'LEGACY_WRAP'
    | 'CLIP'
    | 'WRAP';
  textDirection?:
    | 'TEXT_DIRECTION_UNSPECIFIED'
    | 'LEFT_TO_RIGHT'
    | 'RIGHT_TO_LEFT';
  textFormat?: TextFormat;
  hyperlinkDisplayType?:
    | 'HYPERLINK_DISPLAY_TYPE_UNSPECIFIED'
    | 'LINKED'
    | 'PLAIN_TEXT';
  textRotation?: TextRotation;
}

export interface NumberFormat {
  type:
    | 'NUMBER_FORMAT_TYPE_UNSPECIFIED'
    | 'TEXT'
    | 'NUMBER'
    | 'PERCENT'
    | 'CURRENCY'
    | 'DATE'
    | 'TIME'
    | 'DATE_TIME'
    | 'SCIENTIFIC';
  pattern?: string;
}

export interface Color {
  red?: number;
  green?: number;
  blue?: number;
  alpha?: number;
}

export interface ColorStyle {
  rgbColor?: Color;
  themeColor?:
    | 'THEME_COLOR_TYPE_UNSPECIFIED'
    | 'TEXT'
    | 'BACKGROUND'
    | 'ACCENT1'
    | 'ACCENT2'
    | 'ACCENT3'
    | 'ACCENT4'
    | 'ACCENT5'
    | 'ACCENT6'
    | 'LINK';
}

export interface Borders {
  top?: Border;
  bottom?: Border;
  left?: Border;
  right?: Border;
}

export interface Border {
  style?:
    | 'STYLE_UNSPECIFIED'
    | 'DOTTED'
    | 'DASHED'
    | 'SOLID'
    | 'SOLID_MEDIUM'
    | 'SOLID_THICK'
    | 'NONE'
    | 'DOUBLE';
  width?: number;
  color?: Color;
  colorStyle?: ColorStyle;
}

export interface Padding {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export interface TextFormat {
  foregroundColor?: Color;
  foregroundColorStyle?: ColorStyle;
  fontFamily?: string;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  strikethrough?: boolean;
  underline?: boolean;
  link?: Link;
}

export interface Link {
  uri?: string;
}

export interface TextRotation {
  angle?: number;
  vertical?: boolean;
}

export interface TextFormatRun {
  startIndex?: number;
  format?: TextFormat;
}

export interface DimensionProperties {
  hiddenByFilter?: boolean;
  hiddenByUser?: boolean;
  pixelSize?: number;
  developerMetadata?: DeveloperMetadata[];
  dataSourceColumnReference?: DataSourceColumnReference;
}

export interface DeveloperMetadata {
  metadataId?: number;
  metadataKey?: string;
  metadataValue?: string;
  location?: DeveloperMetadataLocation;
  visibility?:
    | 'DEVELOPER_METADATA_VISIBILITY_UNSPECIFIED'
    | 'DOCUMENT'
    | 'PROJECT';
}

export interface DeveloperMetadataLocation {
  spreadsheet?: boolean;
  sheetId?: number;
  dimensionRange?: DimensionRange;
}

export interface DimensionRange {
  sheetId?: number;
  dimension?: 'DIMENSION_UNSPECIFIED' | 'ROWS' | 'COLUMNS';
  startIndex?: number;
  endIndex?: number;
}

export interface DataSourceColumnReference {
  name?: string;
}

export interface GridRange {
  sheetId?: number;
  startRowIndex?: number;
  endRowIndex?: number;
  startColumnIndex?: number;
  endColumnIndex?: number;
}

export interface ConditionalFormatRule {
  ranges?: GridRange[];
  booleanRule?: BooleanRule;
  gradientRule?: GradientRule;
}

export interface BooleanRule {
  condition?: BooleanCondition;
  format?: CellFormat;
}

export interface BooleanCondition {
  type?:
    | 'CONDITION_TYPE_UNSPECIFIED'
    | 'NUMBER_GREATER'
    | 'NUMBER_GREATER_THAN_EQ'
    | 'NUMBER_LESS'
    | 'NUMBER_LESS_THAN_EQ'
    | 'NUMBER_EQ'
    | 'NUMBER_NOT_EQ'
    | 'NUMBER_BETWEEN'
    | 'NUMBER_NOT_BETWEEN'
    | 'TEXT_CONTAINS'
    | 'TEXT_NOT_CONTAINS'
    | 'TEXT_STARTS_WITH'
    | 'TEXT_ENDS_WITH'
    | 'TEXT_EQ'
    | 'TEXT_IS_EMAIL'
    | 'TEXT_IS_URL'
    | 'DATE_EQ'
    | 'DATE_BEFORE'
    | 'DATE_AFTER'
    | 'DATE_ON_OR_BEFORE'
    | 'DATE_ON_OR_AFTER'
    | 'DATE_BETWEEN'
    | 'DATE_NOT_BETWEEN'
    | 'DATE_IS_VALID'
    | 'ONE_OF_RANGE'
    | 'ONE_OF_LIST'
    | 'BLANK'
    | 'NOT_BLANK'
    | 'CUSTOM_FORMULA'
    | 'BOOLEAN'
    | 'TEXT_NOT_EQ'
    | 'DATE_NOT_EQ'
    | 'FILTER_EXPRESSION';
  values?: ConditionValue[];
}

export interface ConditionValue {
  relativeDate?:
    | 'RELATIVE_DATE_UNSPECIFIED'
    | 'PAST_YEAR'
    | 'PAST_MONTH'
    | 'PAST_WEEK'
    | 'YESTERDAY'
    | 'TODAY'
    | 'TOMORROW';
  userEnteredValue?: string;
}

export interface GradientRule {
  minpoint?: InterpolationPoint;
  midpoint?: InterpolationPoint;
  maxpoint?: InterpolationPoint;
}

export interface InterpolationPoint {
  color?: Color;
  colorStyle?: ColorStyle;
  type?:
    | 'INTERPOLATION_POINT_TYPE_UNSPECIFIED'
    | 'MIN'
    | 'MAX'
    | 'NUMBER'
    | 'PERCENT'
    | 'PERCENTILE';
  value?: string;
}

export interface FilterView {
  filterViewId?: number;
  title?: string;
  range?: GridRange;
  namedRangeId?: string;
  sortSpecs?: SortSpec[];
  criteria?: { [key: string]: FilterCriteria };
}

export interface SortSpec {
  dimensionIndex?: number;
  sortOrder?: 'SORT_ORDER_UNSPECIFIED' | 'ASCENDING' | 'DESCENDING';
  foregroundColor?: Color;
  foregroundColorStyle?: ColorStyle;
  backgroundColor?: Color;
  backgroundColorStyle?: ColorStyle;
}

export interface FilterCriteria {
  hiddenValues?: string[];
  condition?: BooleanCondition;
  visibleBackgroundColor?: Color;
  visibleBackgroundColorStyle?: ColorStyle;
  visibleForegroundColor?: Color;
  visibleForegroundColorStyle?: ColorStyle;
}

export interface ProtectedRange {
  protectedRangeId?: number;
  range?: GridRange;
  namedRangeId?: string;
  description?: string;
  warningOnly?: boolean;
  requestingUserCanEdit?: boolean;
  unprotectedRanges?: GridRange[];
  editors?: Editors;
}

export interface Editors {
  users?: string[];
  groups?: string[];
  domainUsersCanEdit?: boolean;
}

export interface BasicFilter {
  range?: GridRange;
  sortSpecs?: SortSpec[];
  criteria?: { [key: string]: FilterCriteria };
}

export interface EmbeddedChart {
  chartId?: number;
  spec?: ChartSpec;
  position?: EmbeddedObjectPosition;
  border?: EmbeddedObjectBorder;
}

export interface ChartSpec {
  title?: string;
  altText?: string;
  titleTextFormat?: TextFormat;
  titleTextPosition?: TextPosition;
  subtitle?: string;
  subtitleTextFormat?: TextFormat;
  subtitleTextPosition?: TextPosition;
  fontName?: string;
  maximized?: boolean;
  backgroundColor?: Color;
  backgroundColorStyle?: ColorStyle;
  basicChart?: BasicChartSpec;
  pieChart?: PieChartSpec;
  bubbleChart?: BubbleChartSpec;
  candlestickChart?: CandlestickChartSpec;
  orgChart?: OrgChartSpec;
  histogramChart?: HistogramChartSpec;
  waterfallChart?: WaterfallChartSpec;
  treemapChart?: TreemapChartSpec;
  scorecardChart?: ScorecardChartSpec;
  hiddenDimensionStrategy?:
    | 'CHART_HIDDEN_DIMENSION_STRATEGY_UNSPECIFIED'
    | 'SKIP_HIDDEN_ROWS_AND_COLUMNS'
    | 'SKIP_HIDDEN_ROWS'
    | 'SKIP_HIDDEN_COLUMNS'
    | 'SHOW_ALL';
  dataSourceChartProperties?: DataSourceChartProperties;
}

export interface TextPosition {
  horizontalAlignment?:
    | 'HORIZONTAL_ALIGN_UNSPECIFIED'
    | 'LEFT'
    | 'CENTER'
    | 'RIGHT';
}

export interface BasicChartSpec {
  chartType?:
    | 'BASIC_CHART_TYPE_UNSPECIFIED'
    | 'BAR'
    | 'LINE'
    | 'AREA'
    | 'COLUMN'
    | 'SCATTER'
    | 'COMBO'
    | 'STEPPED_AREA';
  legendPosition?:
    | 'BASIC_CHART_LEGEND_POSITION_UNSPECIFIED'
    | 'BOTTOM_LEGEND'
    | 'LEFT_LEGEND'
    | 'RIGHT_LEGEND'
    | 'TOP_LEGEND'
    | 'NO_LEGEND';
  axis?: BasicChartAxis[];
  domains?: BasicChartDomain[];
  series?: BasicChartSeries[];
  headerCount?: number;
  threeDimensional?: boolean;
  interpolateNulls?: boolean;
  stackedType?:
    | 'BASIC_CHART_STACKED_TYPE_UNSPECIFIED'
    | 'NOT_STACKED'
    | 'STACKED'
    | 'PERCENT_STACKED';
  lineSmoothing?: boolean;
  compareMode?: 'BASIC_CHART_COMPARE_MODE_UNSPECIFIED' | 'DATUM' | 'CATEGORY';
  totalDataLabel?: DataLabel;
}

export interface BasicChartAxis {
  position?:
    | 'BASIC_CHART_AXIS_POSITION_UNSPECIFIED'
    | 'BOTTOM_AXIS'
    | 'LEFT_AXIS'
    | 'RIGHT_AXIS';
  title?: string;
  format?: TextFormat;
  titleTextPosition?: TextPosition;
  viewWindowOptions?: ChartAxisViewWindowOptions;
}

export interface ChartAxisViewWindowOptions {
  viewWindowMin?: number;
  viewWindowMax?: number;
  viewWindowMode?:
    | 'DEFAULT_VIEW_WINDOW_MODE'
    | 'VIEW_WINDOW_MODE_UNSUPPORTED'
    | 'EXPLICIT'
    | 'PRETTY';
}

export interface BasicChartDomain {
  domain?: ChartData;
  reversed?: boolean;
}

export interface ChartData {
  sourceRange?: ChartSourceRange;
  aggregateType?:
    | 'CHART_AGGREGATE_TYPE_UNSPECIFIED'
    | 'AVERAGE'
    | 'COUNT'
    | 'MAX'
    | 'MEDIAN'
    | 'MIN'
    | 'SUM';
  columnReference?: DataSourceColumnReference;
  groupRule?: ChartGroupRule;
}

export interface ChartSourceRange {
  sources?: GridRange[];
}

export interface ChartGroupRule {
  dateTimeRule?: ChartDateTimeRule;
  histogramRule?: ChartHistogramRule;
}

export interface ChartDateTimeRule {
  type?:
    | 'CHART_DATE_TIME_RULE_TYPE_UNSPECIFIED'
    | 'SECOND'
    | 'MINUTE'
    | 'HOUR'
    | 'HOUR_MINUTE'
    | 'HOUR_MINUTE_AMPM'
    | 'DAY_OF_WEEK'
    | 'DAY_OF_YEAR'
    | 'DAY_OF_MONTH'
    | 'DAY_MONTH'
    | 'MONTH'
    | 'QUARTER'
    | 'YEAR'
    | 'YEAR_MONTH'
    | 'YEAR_QUARTER'
    | 'YEAR_MONTH_DAY';
}

export interface ChartHistogramRule {
  intervalSize?: number;
  maxValue?: number;
  minValue?: number;
}

export interface BasicChartSeries {
  series?: ChartData;
  targetAxis?:
    | 'BASIC_CHART_AXIS_POSITION_UNSPECIFIED'
    | 'BOTTOM_AXIS'
    | 'LEFT_AXIS'
    | 'RIGHT_AXIS';
  type?:
    | 'BASIC_CHART_TYPE_UNSPECIFIED'
    | 'BAR'
    | 'LINE'
    | 'AREA'
    | 'COLUMN'
    | 'SCATTER'
    | 'COMBO'
    | 'STEPPED_AREA';
  lineStyle?: LineStyle;
  dataLabel?: DataLabel;
  color?: Color;
  colorStyle?: ColorStyle;
  pointStyle?: PointStyle;
  styleOverrides?: BasicSeriesDataPointStyleOverride[];
}

export interface LineStyle {
  width?: number;
  type?:
    | 'LINE_DASH_TYPE_UNSPECIFIED'
    | 'INVISIBLE'
    | 'CUSTOM'
    | 'SOLID'
    | 'DOTTED'
    | 'MEDIUM_DASHED'
    | 'MEDIUM_DASHED_DOTTED'
    | 'LONG_DASHED'
    | 'LONG_DASHED_DOTTED';
}

export interface DataLabel {
  type?: 'DATA_LABEL_TYPE_UNSPECIFIED' | 'NONE' | 'DATA' | 'CUSTOM';
  textFormat?: TextFormat;
  placement?:
    | 'DATA_LABEL_PLACEMENT_UNSPECIFIED'
    | 'CENTER'
    | 'LEFT'
    | 'RIGHT'
    | 'ABOVE'
    | 'BELOW'
    | 'INSIDE_END'
    | 'INSIDE_BASE'
    | 'OUTSIDE_END';
  customLabelData?: ChartData;
}

export interface PointStyle {
  size?: number;
  shape?:
    | 'POINT_SHAPE_UNSPECIFIED'
    | 'CIRCLE'
    | 'DIAMOND'
    | 'HEXAGON'
    | 'PENTAGON'
    | 'SQUARE'
    | 'STAR'
    | 'TRIANGLE'
    | 'X_MARK';
}

export interface BasicSeriesDataPointStyleOverride {
  index?: number;
  color?: Color;
  colorStyle?: ColorStyle;
  pointStyle?: PointStyle;
}

export interface PieChartSpec {
  legendPosition?:
    | 'PIE_CHART_LEGEND_POSITION_UNSPECIFIED'
    | 'BOTTOM_LEGEND'
    | 'LEFT_LEGEND'
    | 'RIGHT_LEGEND'
    | 'TOP_LEGEND'
    | 'NO_LEGEND'
    | 'LABELED_LEGEND';
  domain?: ChartData;
  series?: ChartData;
  threeDimensional?: boolean;
  pieHole?: number;
}

export interface BubbleChartSpec {
  legendPosition?:
    | 'BUBBLE_CHART_LEGEND_POSITION_UNSPECIFIED'
    | 'BOTTOM_LEGEND'
    | 'LEFT_LEGEND'
    | 'RIGHT_LEGEND'
    | 'TOP_LEGEND'
    | 'NO_LEGEND'
    | 'INSIDE_LEGEND';
  bubbleLabels?: ChartData;
  domain?: ChartData;
  series?: ChartData;
  groupIds?: ChartData;
  bubbleSizes?: ChartData;
  bubbleOpacity?: number;
  bubbleBorderColor?: Color;
  bubbleBorderColorStyle?: ColorStyle;
  bubbleMaxRadiusSize?: number;
  bubbleMinRadiusSize?: number;
  bubbleTextStyle?: TextFormat;
}

export interface CandlestickChartSpec {
  domain?: ChartData;
  data?: CandlestickData[];
}

export interface CandlestickData {
  lowSeries?: ChartData;
  openSeries?: ChartData;
  closeSeries?: ChartData;
  highSeries?: ChartData;
}

export interface OrgChartSpec {
  nodeColor?: Color;
  nodeColorStyle?: ColorStyle;
  nodeSize?: 'ORG_CHART_LABEL_SIZE_UNSPECIFIED' | 'SMALL' | 'MEDIUM' | 'LARGE';
  parentLabels?: ChartData;
  labels?: ChartData;
  tooltips?: ChartData;
  selectedNodeColor?: Color;
  selectedNodeColorStyle?: ColorStyle;
}

export interface HistogramChartSpec {
  series?: HistogramSeries[];
  legendPosition?:
    | 'HISTOGRAM_CHART_LEGEND_POSITION_UNSPECIFIED'
    | 'BOTTOM_LEGEND'
    | 'LEFT_LEGEND'
    | 'RIGHT_LEGEND'
    | 'TOP_LEGEND'
    | 'NO_LEGEND'
    | 'INSIDE_LEGEND';
  showItemDividers?: boolean;
  bucketSize?: number;
  outlierPercentile?: number;
}

export interface HistogramSeries {
  barColor?: Color;
  barColorStyle?: ColorStyle;
  data?: ChartData;
}

export interface WaterfallChartSpec {
  domain?: ChartData;
  series?: ChartData;
  stackedType?: 'WATERFALL_STACKED_TYPE_UNSPECIFIED' | 'STACKED' | 'SEQUENTIAL';
  firstValueIsTotal?: boolean;
  hideConnectorLines?: boolean;
  connectorLineStyle?: LineStyle;
  totalDataLabel?: DataLabel;
}

export interface TreemapChartSpec {
  labels?: ChartData;
  parentLabels?: ChartData;
  sizeData?: ChartData;
  colorData?: ChartData;
  colorScale?: TreemapChartColorScale;
  textFormat?: TextFormat;
  levels?: TreemapChartSpec[];
  hintedLevels?: number;
  headerColor?: Color;
  headerColorStyle?: ColorStyle;
}

export interface TreemapChartColorScale {
  minValueColor?: Color;
  minValueColorStyle?: ColorStyle;
  midValueColor?: Color;
  midValueColorStyle?: ColorStyle;
  maxValueColor?: Color;
  maxValueColorStyle?: ColorStyle;
  noDataColor?: Color;
  noDataColorStyle?: ColorStyle;
}

export interface ScorecardChartSpec {
  keyValueData?: ChartData;
  baselineValueData?: ChartData;
  aggregateType?:
    | 'CHART_AGGREGATE_TYPE_UNSPECIFIED'
    | 'AVERAGE'
    | 'COUNT'
    | 'MAX'
    | 'MEDIAN'
    | 'MIN'
    | 'SUM';
  keyValueFormat?: KeyValueFormat;
  baselineValueFormat?: BaselineValueFormat;
  scaleFactor?: number;
  numberFormatSource?:
    | 'CHART_NUMBER_FORMAT_SOURCE_UNDEFINED'
    | 'FROM_DATA'
    | 'CHART_NUMBER_FORMAT_SOURCE_UNSPECIFIED';
  customFormatOptions?: ChartCustomNumberFormatOptions;
}

export interface KeyValueFormat {
  textFormat?: TextFormat;
  position?: TextPosition;
}

export interface BaselineValueFormat {
  comparisonType?:
    | 'COMPARISON_TYPE_UNDEFINED'
    | 'ABSOLUTE_DIFFERENCE'
    | 'PERCENTAGE_DIFFERENCE';
  textFormat?: TextFormat;
  positiveColor?: Color;
  positiveColorStyle?: ColorStyle;
  negativeColor?: Color;
  negativeColorStyle?: ColorStyle;
  position?: TextPosition;
}

export interface ChartCustomNumberFormatOptions {
  prefix?: string;
  suffix?: string;
}

export interface DataSourceChartProperties {
  dataSourceId?: string;
  dataExecutionStatus?: DataExecutionStatus;
}

export interface DataExecutionStatus {
  state?:
    | 'DATA_EXECUTION_STATE_UNSPECIFIED'
    | 'NOT_STARTED'
    | 'RUNNING'
    | 'SUCCEEDED'
    | 'FAILED';
  errorCode?:
    | 'DATA_EXECUTION_ERROR_CODE_UNSPECIFIED'
    | 'TIMED_OUT'
    | 'TOO_MANY_ROWS'
    | 'TOO_MANY_COLUMNS'
    | 'TOO_MANY_CELLS'
    | 'ENGINE'
    | 'PARAMETER_INVALID'
    | 'UNSUPPORTED_DATA_TYPE'
    | 'DUPLICATE_COLUMN_NAMES'
    | 'INTERRUPTED'
    | 'CONCURRENT_QUERY'
    | 'OTHER'
    | 'TOO_MANY_CHARS_PER_CELL'
    | 'DATA_NOT_FOUND'
    | 'PERMISSION_DENIED'
    | 'MISSING_COLUMN_ALIAS'
    | 'OBJECT_NOT_FOUND'
    | 'OBJECT_IN_ERROR_STATE'
    | 'OBJECT_SPEC_INVALID'
    | 'DATA_EXECUTION_CANCELLED';
  errorMessage?: string;
  lastRefreshTime?: string;
}

export interface EmbeddedObjectPosition {
  sheetId?: number;
  overlayPosition?: OverlayPosition;
  newSheet?: boolean;
}

export interface OverlayPosition {
  anchorCell?: GridCoordinate;
  offsetXPixels?: number;
  offsetYPixels?: number;
  widthPixels?: number;
  heightPixels?: number;
}

export interface GridCoordinate {
  sheetId?: number;
  rowIndex?: number;
  columnIndex?: number;
}

export interface EmbeddedObjectBorder {
  color?: Color;
  colorStyle?: ColorStyle;
}

export interface BandedRange {
  bandedRangeId?: number;
  range?: GridRange;
  rowProperties?: BandingProperties;
  columnProperties?: BandingProperties;
}

export interface BandingProperties {
  headerColor?: Color;
  headerColorStyle?: ColorStyle;
  firstBandColor?: Color;
  firstBandColorStyle?: ColorStyle;
  secondBandColor?: Color;
  secondBandColorStyle?: ColorStyle;
  footerColor?: Color;
  footerColorStyle?: ColorStyle;
}

export interface DataValidationRule {
  condition?: BooleanCondition;
  inputMessage?: string;
  strict?: boolean;
  showCustomUi?: boolean;
}

export interface PivotTable {
  source?: GridRange;
  rows?: PivotGroup[];
  columns?: PivotGroup[];
  criteria?: { [key: string]: PivotFilterCriteria };
  values?: PivotValue[];
  valueLayout?: 'HORIZONTAL' | 'VERTICAL';
  dataExecutionStatus?: DataExecutionStatus;
  dataSourceId?: string;
}

export interface PivotGroup {
  sourceColumnOffset?: number;
  showTotals?: boolean;
  valueMetadata?: PivotGroupValueMetadata[];
  sortOrder?: 'SORT_ORDER_UNSPECIFIED' | 'ASCENDING' | 'DESCENDING';
  valueBucket?: PivotGroupSortValueBucket;
  repeatHeadings?: boolean;
  label?: string;
  groupRule?: PivotGroupRule;
  groupLimit?: PivotGroupLimit;
  dataSourceColumnReference?: DataSourceColumnReference;
}

export interface PivotGroupValueMetadata {
  value?: ExtendedValue;
  collapsed?: boolean;
}

export interface PivotGroupSortValueBucket {
  valuesIndex?: number;
  buckets?: ExtendedValue[];
}

export interface PivotGroupRule {
  manualRule?: ManualRule;
  histogramRule?: HistogramRule;
  dateTimeRule?: DateTimeRule;
}

export interface ManualRule {
  groups?: ManualRuleGroup[];
}

export interface ManualRuleGroup {
  groupName?: ExtendedValue;
  items?: ExtendedValue[];
}

export interface HistogramRule {
  start?: number;
  end?: number;
  interval?: number;
}

export interface DateTimeRule {
  type?:
    | 'DATE_TIME_RULE_TYPE_UNSPECIFIED'
    | 'SECOND'
    | 'MINUTE'
    | 'HOUR'
    | 'HOUR_MINUTE'
    | 'HOUR_MINUTE_AMPM'
    | 'DAY_OF_WEEK'
    | 'DAY_OF_YEAR'
    | 'DAY_OF_MONTH'
    | 'DAY_MONTH'
    | 'MONTH'
    | 'QUARTER'
    | 'YEAR'
    | 'YEAR_MONTH'
    | 'YEAR_QUARTER'
    | 'YEAR_MONTH_DAY';
}

export interface PivotGroupLimit {
  countLimit?: number;
  applyOrder?: number;
}

export interface PivotFilterCriteria {
  visibleValues?: string[];
  condition?: BooleanCondition;
  visibleByDefault?: boolean;
}

export interface PivotValue {
  sourceColumnOffset?: number;
  summarizeFunction?:
    | 'PIVOT_STANDARD_VALUE_FUNCTION_UNSPECIFIED'
    | 'SUM'
    | 'COUNTA'
    | 'COUNT'
    | 'COUNTUNIQUE'
    | 'AVERAGE'
    | 'MAX'
    | 'MIN'
    | 'MEDIAN'
    | 'PRODUCT'
    | 'STDEV'
    | 'STDEVP'
    | 'VAR'
    | 'VARP'
    | 'CUSTOM';
  name?: string;
  calculatedDisplayType?:
    | 'PIVOT_VALUE_CALCULATED_DISPLAY_TYPE_UNSPECIFIED'
    | 'PERCENT_OF_ROW_TOTAL'
    | 'PERCENT_OF_COLUMN_TOTAL'
    | 'PERCENT_OF_GRAND_TOTAL'
    | 'RUNNING_TOTAL'
    | 'PERCENT_RUNNING_TOTAL'
    | 'PERCENT_OF_PARENT_ROW_TOTAL'
    | 'PERCENT_OF_PARENT_COLUMN_TOTAL';
  formula?: string;
  dataSourceColumnReference?: DataSourceColumnReference;
}

export interface DataSourceTable {
  dataSourceId?: string;
  columnSelectionType?:
    | 'DATA_SOURCE_TABLE_COLUMN_SELECTION_TYPE_UNSPECIFIED'
    | 'SELECTED'
    | 'SYNC_ALL';
  columns?: DataSourceColumnReference[];
  filterSpecs?: FilterSpec[];
  sortSpecs?: SortSpec[];
  rowLimit?: number;
  dataExecutionStatus?: DataExecutionStatus;
}

export interface FilterSpec {
  columnIndex?: number;
  dataSourceColumnReference?: DataSourceColumnReference;
  filterCriteria?: FilterCriteria;
}

/**
 * Google Sheets API v4 Values response
 */
export interface ValueRange {
  range?: string;
  majorDimension?: 'DIMENSION_UNSPECIFIED' | 'ROWS' | 'COLUMNS';
  values?: string[][];
}

/**
 * Simplified types for common usage patterns
 */
export interface SheetInfo {
  title: string;
  sheetId: number;
}

export interface SpreadsheetMetadata {
  spreadsheetId: string;
  sheets: SheetInfo[];
}

/**
 * API Error response
 */
export interface GoogleSheetsError {
  error: {
    code: number;
    message: string;
    status: string;
    details?: Array<{
      '@type': string;
      [key: string]: unknown;
    }>;
  };
}
