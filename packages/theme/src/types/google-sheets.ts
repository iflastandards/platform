/**
 * Google Sheets API type definitions
 * These types provide better type safety for Google Sheets integration
 */

export interface SheetProperties {
  title: string;
  sheetId: number;
  index?: number;
  sheetType?: 'GRID' | 'OBJECT';
  gridProperties?: {
    rowCount: number;
    columnCount: number;
    frozenRowCount?: number;
    frozenColumnCount?: number;
  };
  hidden?: boolean;
  tabColor?: {
    red?: number;
    green?: number;
    blue?: number;
    alpha?: number;
  };
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
  rowGroups?: DimensionGroup[];
  columnGroups?: DimensionGroup[];
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

export interface DataValidationRule {
  condition?: BooleanCondition;
  inputMessage?: string;
  strict?: boolean;
  showCustomUi?: boolean;
}

export interface BooleanCondition {
  type:
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

export interface DataSourceColumnReference {
  name?: string;
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
    | 'HOUR_MINUTE_SECOND'
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
  headerColor?: Color;
  headerColorStyle?: ColorStyle;
  hideTooltips?: boolean;
  hintedLevels?: number;
  maxValue?: number;
  minValue?: number;
  textFormat?: TextFormat;
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
  description?: string;
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
  locationType?:
    | 'DEVELOPER_METADATA_LOCATION_TYPE_UNSPECIFIED'
    | 'ROW'
    | 'COLUMN'
    | 'SHEET'
    | 'SPREADSHEET';
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

export interface DimensionGroup {
  range?: DimensionRange;
  depth?: number;
  collapsed?: boolean;
}

export interface DimensionProperties {
  hiddenByFilter?: boolean;
  hiddenByUser?: boolean;
  pixelSize?: number;
  developerMetadata?: DeveloperMetadata[];
  dataSourceColumnReference?: DataSourceColumnReference;
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
    | 'HOUR_MINUTE_SECOND'
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
  rowLimit?: number;
  sortSpecs?: SortSpec[];
  dataExecutionStatus?: DataExecutionStatus;
}

export interface FilterSpec {
  columnIndex?: number;
  dataSourceColumnReference?: DataSourceColumnReference;
  filterCriteria?: FilterCriteria;
}

// Spreadsheet-level interfaces
export interface Spreadsheet {
  spreadsheetId?: string;
  properties?: SpreadsheetProperties;
  sheets?: Sheet[];
  namedRanges?: NamedRange[];
  spreadsheetUrl?: string;
  developerMetadata?: DeveloperMetadata[];
  dataSources?: DataSource[];
  dataSourceSchedules?: DataSourceRefreshSchedule[];
}

export interface SpreadsheetProperties {
  title?: string;
  locale?: string;
  autoRecalc?:
    | 'RECALCULATION_INTERVAL_UNSPECIFIED'
    | 'ON_CHANGE'
    | 'MINUTE'
    | 'HOUR';
  timeZone?: string;
  defaultFormat?: CellFormat;
  iterativeCalculationSettings?: IterativeCalculationSettings;
  spreadsheetTheme?: SpreadsheetTheme;
}

export interface IterativeCalculationSettings {
  maxIterations?: number;
  convergenceThreshold?: number;
}

export interface SpreadsheetTheme {
  primaryFontFamily?: string;
  themeColors?: ThemeColorPair[];
}

export interface ThemeColorPair {
  colorType?:
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
  color?: ColorStyle;
}

export interface NamedRange {
  namedRangeId?: string;
  name?: string;
  range?: GridRange;
}

export interface DataSource {
  dataSourceId?: string;
  spec?: DataSourceSpec;
  calculatedColumns?: DataSourceColumn[];
  sheetId?: number;
}

export interface DataSourceSpec {
  bigQuery?: BigQueryDataSourceSpec;
  parameters?: DataSourceParameter[];
}

export interface BigQueryDataSourceSpec {
  projectId?: string;
  querySpec?: BigQueryQuerySpec;
  tableSpec?: BigQueryTableSpec;
}

export interface BigQueryQuerySpec {
  rawQuery?: string;
}

export interface BigQueryTableSpec {
  tableProjectId?: string;
  tableId?: string;
  datasetId?: string;
}

export interface DataSourceParameter {
  name?: string;
  namedRangeId?: string;
  range?: GridRange;
}

export interface DataSourceColumn {
  reference?: DataSourceColumnReference;
  formula?: string;
}

export interface DataSourceRefreshSchedule {
  dataSourceId?: string;
  enabled?: boolean;
  refreshScope?: 'DATA_SOURCE_REFRESH_SCOPE_UNSPECIFIED' | 'ALL_DATA_SOURCES';
  nextRun?: Interval;
  weeklySchedule?: WeeklySchedule;
  dailySchedule?: DailySchedule;
  monthlySchedule?: MonthlySchedule;
}

export interface Interval {
  startTime?: string;
  endTime?: string;
}

export interface WeeklySchedule {
  startTime?: TimeOfDay;
  daysOfWeek?: (
    | 'DAY_OF_WEEK_UNSPECIFIED'
    | 'MONDAY'
    | 'TUESDAY'
    | 'WEDNESDAY'
    | 'THURSDAY'
    | 'FRIDAY'
    | 'SATURDAY'
    | 'SUNDAY'
  )[];
}

export interface TimeOfDay {
  hours?: number;
  minutes?: number;
  seconds?: number;
  nanos?: number;
}

export interface DailySchedule {
  startTime?: TimeOfDay;
}

export interface MonthlySchedule {
  startTime?: TimeOfDay;
  dayOfMonth?: number;
}

// API Request/Response interfaces
export interface CreateSpreadsheetRequest {
  properties?: SpreadsheetProperties;
  sheets?: Sheet[];
  namedRanges?: NamedRange[];
}

export interface GetSpreadsheetParams {
  spreadsheetId: string;
  ranges?: string[];
  includeGridData?: boolean;
}

export interface UpdateValuesParams {
  spreadsheetId: string;
  range: string;
  valueInputOption: 'RAW' | 'USER_ENTERED';
  values: unknown[][];
}

export interface BatchUpdateParams {
  spreadsheetId: string;
  requests: Request[];
  includeSpreadsheetInResponse?: boolean;
  responseRanges?: string[];
  responseIncludeGridData?: boolean;
}

export interface Request {
  updateSheetProperties?: UpdateSheetPropertiesRequest;
  updateDimensionProperties?: UpdateDimensionPropertiesRequest;
  updateNamedRange?: UpdateNamedRangeRequest;
  repeatCell?: RepeatCellRequest;
  addNamedRange?: AddNamedRangeRequest;
  deleteNamedRange?: DeleteNamedRangeRequest;
  addSheet?: AddSheetRequest;
  deleteSheet?: DeleteSheetRequest;
  autoFill?: AutoFillRequest;
  cutPaste?: CutPasteRequest;
  copyPaste?: CopyPasteRequest;
  mergeCells?: MergeCellsRequest;
  unmergeCells?: UnmergeCellsRequest;
  updateBorders?: UpdateBordersRequest;
  updateCells?: UpdateCellsRequest;
  addFilterView?: AddFilterViewRequest;
  appendCells?: AppendCellsRequest;
  clearBasicFilter?: ClearBasicFilterRequest;
  deleteDimension?: DeleteDimensionRequest;
  deleteEmbeddedObject?: DeleteEmbeddedObjectRequest;
  deleteFilterView?: DeleteFilterViewRequest;
  duplicateFilterView?: DuplicateFilterViewRequest;
  duplicateSheet?: DuplicateSheetRequest;
  findReplace?: FindReplaceRequest;
  insertDimension?: InsertDimensionRequest;
  insertRange?: InsertRangeRequest;
  moveDimension?: MoveDimensionRequest;
  updateEmbeddedObjectPosition?: UpdateEmbeddedObjectPositionRequest;
  pasteData?: PasteDataRequest;
  textToColumns?: TextToColumnsRequest;
  updateFilterView?: UpdateFilterViewRequest;
  deleteRange?: DeleteRangeRequest;
  appendDimension?: AppendDimensionRequest;
  addConditionalFormatRule?: AddConditionalFormatRuleRequest;
  updateConditionalFormatRule?: UpdateConditionalFormatRuleRequest;
  deleteConditionalFormatRule?: DeleteConditionalFormatRuleRequest;
  sortRange?: SortRangeRequest;
  setDataValidation?: SetDataValidationRequest;
  setBasicFilter?: SetBasicFilterRequest;
  addProtectedRange?: AddProtectedRangeRequest;
  updateProtectedRange?: UpdateProtectedRangeRequest;
  deleteProtectedRange?: DeleteProtectedRangeRequest;
  autoResize?: AutoResizeDimensionsRequest;
  addChart?: AddChartRequest;
  updateChartSpec?: UpdateChartSpecRequest;
  updateBanding?: UpdateBandingRequest;
  addBanding?: AddBandingRequest;
  deleteBanding?: DeleteBandingRequest;
  createDeveloperMetadata?: CreateDeveloperMetadataRequest;
  updateDeveloperMetadata?: UpdateDeveloperMetadataRequest;
  deleteDeveloperMetadata?: DeleteDeveloperMetadataRequest;
  randomizeRange?: RandomizeRangeRequest;
  addDimensionGroup?: AddDimensionGroupRequest;
  deleteDimensionGroup?: DeleteDimensionGroupRequest;
  updateDimensionGroup?: UpdateDimensionGroupRequest;
  trimWhitespace?: TrimWhitespaceRequest;
  deleteDuplicates?: DeleteDuplicatesRequest;
  updateEmbeddedObjectBorder?: UpdateEmbeddedObjectBorderRequest;
  addSlicer?: AddSlicerRequest;
  updateSlicerSpec?: UpdateSlicerSpecRequest;
  addDataSource?: AddDataSourceRequest;
  updateDataSource?: UpdateDataSourceRequest;
  deleteDataSource?: DeleteDataSourceRequest;
  refreshDataSource?: RefreshDataSourceRequest;
}

export interface UpdateSheetPropertiesRequest {
  properties?: SheetProperties;
  fields?: string;
}

export interface UpdateDimensionPropertiesRequest {
  range?: DimensionRange;
  properties?: DimensionProperties;
  fields?: string;
  dataSourceSheetRange?: DataSourceSheetDimensionRange;
}

export interface DataSourceSheetDimensionRange {
  sheetId?: number;
  columnReferences?: DataSourceColumnReference[];
}

export interface UpdateNamedRangeRequest {
  namedRange?: NamedRange;
  fields?: string;
}

export interface RepeatCellRequest {
  range?: GridRange;
  cell?: CellData;
  fields?: string;
}

export interface AddNamedRangeRequest {
  namedRange?: NamedRange;
}

export interface DeleteNamedRangeRequest {
  namedRangeId?: string;
}

export interface AddSheetRequest {
  properties?: SheetProperties;
}

export interface DeleteSheetRequest {
  sheetId?: number;
}

export interface AutoFillRequest {
  range?: GridRange;
  sourceAndDestination?: SourceAndDestination;
  useAlternateSeries?: boolean;
}

export interface SourceAndDestination {
  source?: GridRange;
  destination?: GridRange;
  fillLength?: number;
  dimension?: 'DIMENSION_UNSPECIFIED' | 'ROWS' | 'COLUMNS';
}

export interface CutPasteRequest {
  source?: GridRange;
  destination?: GridCoordinate;
}

export interface CopyPasteRequest {
  source?: GridRange;
  destination?: GridRange;
  pasteType?:
    | 'PASTE_NORMAL'
    | 'PASTE_VALUES'
    | 'PASTE_FORMAT'
    | 'PASTE_NO_BORDERS'
    | 'PASTE_FORMULA'
    | 'PASTE_DATA_VALIDATION'
    | 'PASTE_CONDITIONAL_FORMATTING';
  pasteOrientation?: 'NORMAL' | 'TRANSPOSE';
}

export interface MergeCellsRequest {
  range?: GridRange;
  mergeType?: 'MERGE_ALL' | 'MERGE_COLUMNS' | 'MERGE_ROWS';
}

export interface UnmergeCellsRequest {
  range?: GridRange;
}

export interface UpdateBordersRequest {
  range?: GridRange;
  top?: Border;
  bottom?: Border;
  left?: Border;
  right?: Border;
  innerHorizontal?: Border;
  innerVertical?: Border;
}

export interface UpdateCellsRequest {
  rows?: RowData[];
  fields?: string;
  start?: GridCoordinate;
  range?: GridRange;
}

export interface AddFilterViewRequest {
  filter?: FilterView;
}

export interface AppendCellsRequest {
  sheetId?: number;
  rows?: RowData[];
  fields?: string;
}

export interface ClearBasicFilterRequest {
  sheetId?: number;
}

export interface DeleteDimensionRequest {
  range?: DimensionRange;
}

export interface DeleteEmbeddedObjectRequest {
  objectId?: number;
}

export interface DeleteFilterViewRequest {
  filterId?: number;
}

export interface DuplicateFilterViewRequest {
  filterId?: number;
}

export interface DuplicateSheetRequest {
  sourceSheetId?: number;
  insertSheetIndex?: number;
  newSheetId?: number;
  newSheetName?: string;
}

export interface FindReplaceRequest {
  find?: string;
  replacement?: string;
  range?: GridRange;
  sheetId?: number;
  allSheets?: boolean;
  matchCase?: boolean;
  matchEntireCell?: boolean;
  searchByRegex?: boolean;
  includeFormulas?: boolean;
}

export interface InsertDimensionRequest {
  range?: DimensionRange;
  inheritFromBefore?: boolean;
}

export interface InsertRangeRequest {
  range?: GridRange;
  shiftDimension?: 'DIMENSION_UNSPECIFIED' | 'ROWS' | 'COLUMNS';
}

export interface MoveDimensionRequest {
  source?: DimensionRange;
  destinationIndex?: number;
}

export interface UpdateEmbeddedObjectPositionRequest {
  objectId?: number;
  newPosition?: EmbeddedObjectPosition;
  fields?: string;
}

export interface PasteDataRequest {
  coordinate?: GridCoordinate;
  data?: string;
  type?:
    | 'PASTE_NORMAL'
    | 'PASTE_VALUES'
    | 'PASTE_FORMAT'
    | 'PASTE_NO_BORDERS'
    | 'PASTE_FORMULA'
    | 'PASTE_DATA_VALIDATION'
    | 'PASTE_CONDITIONAL_FORMATTING';
  delimiter?: string;
  html?: boolean;
}

export interface TextToColumnsRequest {
  source?: GridRange;
  delimiter?: string;
  delimiterType?:
    | 'DELIMITER_TYPE_UNSPECIFIED'
    | 'COMMA'
    | 'SEMICOLON'
    | 'PERIOD'
    | 'SPACE'
    | 'CUSTOM'
    | 'AUTODETECT';
}

export interface UpdateFilterViewRequest {
  filter?: FilterView;
  fields?: string;
}

export interface DeleteRangeRequest {
  range?: GridRange;
  shiftDimension?: 'DIMENSION_UNSPECIFIED' | 'ROWS' | 'COLUMNS';
}

export interface AppendDimensionRequest {
  sheetId?: number;
  dimension?: 'DIMENSION_UNSPECIFIED' | 'ROWS' | 'COLUMNS';
  length?: number;
}

export interface AddConditionalFormatRuleRequest {
  rule?: ConditionalFormatRule;
  index?: number;
}

export interface UpdateConditionalFormatRuleRequest {
  index?: number;
  sheetId?: number;
  rule?: ConditionalFormatRule;
  newIndex?: number;
}

export interface DeleteConditionalFormatRuleRequest {
  index?: number;
  sheetId?: number;
}

export interface SortRangeRequest {
  range?: GridRange;
  sortSpecs?: SortSpec[];
}

export interface SetDataValidationRequest {
  range?: GridRange;
  rule?: DataValidationRule;
}

export interface SetBasicFilterRequest {
  filter?: BasicFilter;
}

export interface AddProtectedRangeRequest {
  protectedRange?: ProtectedRange;
}

export interface UpdateProtectedRangeRequest {
  protectedRange?: ProtectedRange;
  fields?: string;
}

export interface DeleteProtectedRangeRequest {
  protectedRangeId?: number;
}

export interface AutoResizeDimensionsRequest {
  dimensions?: DimensionRange;
  dataSourceSheetDimensions?: DataSourceSheetDimensionRange;
}

export interface AddChartRequest {
  chart?: EmbeddedChart;
}

export interface UpdateChartSpecRequest {
  chartId?: number;
  spec?: ChartSpec;
}

export interface UpdateBandingRequest {
  bandedRange?: BandedRange;
  fields?: string;
}

export interface AddBandingRequest {
  bandedRange?: BandedRange;
}

export interface DeleteBandingRequest {
  bandedRangeId?: number;
}

export interface CreateDeveloperMetadataRequest {
  developerMetadata?: DeveloperMetadata;
}

export interface UpdateDeveloperMetadataRequest {
  developerMetadata?: DeveloperMetadata;
  fields?: string;
  dataFilters?: DataFilter[];
}

export interface DataFilter {
  a1Range?: string;
  gridRange?: GridRange;
  developerMetadataLookup?: DeveloperMetadataLookup;
}

export interface DeveloperMetadataLookup {
  locationType?:
    | 'DEVELOPER_METADATA_LOCATION_TYPE_UNSPECIFIED'
    | 'ROW'
    | 'COLUMN'
    | 'SHEET'
    | 'SPREADSHEET';
  metadataLocation?: DeveloperMetadataLocation;
  locationMatchingStrategy?:
    | 'DEVELOPER_METADATA_LOCATION_MATCHING_STRATEGY_UNSPECIFIED'
    | 'EXACT_LOCATION'
    | 'INTERSECTING_LOCATION';
  metadataId?: number;
  metadataKey?: string;
  metadataValue?: string;
  visibility?:
    | 'DEVELOPER_METADATA_VISIBILITY_UNSPECIFIED'
    | 'DOCUMENT'
    | 'PROJECT';
}

export interface DeleteDeveloperMetadataRequest {
  dataFilter?: DataFilter;
}

export interface RandomizeRangeRequest {
  range?: GridRange;
}

export interface AddDimensionGroupRequest {
  range?: DimensionRange;
}

export interface DeleteDimensionGroupRequest {
  range?: DimensionRange;
}

export interface UpdateDimensionGroupRequest {
  dimensionGroup?: DimensionGroup;
  fields?: string;
}

export interface TrimWhitespaceRequest {
  range?: GridRange;
}

export interface DeleteDuplicatesRequest {
  range?: GridRange;
  comparisonColumns?: DimensionRange[];
}

export interface UpdateEmbeddedObjectBorderRequest {
  objectId?: number;
  border?: EmbeddedObjectBorder;
  fields?: string;
}

export interface AddSlicerRequest {
  slicer?: Slicer;
}

export interface Slicer {
  slicerId?: number;
  spec?: SlicerSpec;
  position?: EmbeddedObjectPosition;
}

export interface SlicerSpec {
  dataRange?: GridRange;
  filterCriteria?: FilterCriteria;
  columnIndex?: number;
  applyToPivotTables?: boolean;
  title?: string;
  textFormat?: TextFormat;
  backgroundColor?: Color;
  backgroundColorStyle?: ColorStyle;
  horizontalAlignment?:
    | 'HORIZONTAL_ALIGN_UNSPECIFIED'
    | 'LEFT'
    | 'CENTER'
    | 'RIGHT';
}

export interface UpdateSlicerSpecRequest {
  slicerId?: number;
  spec?: SlicerSpec;
  fields?: string;
}

export interface AddDataSourceRequest {
  dataSource?: DataSource;
}

export interface UpdateDataSourceRequest {
  dataSource?: DataSource;
  fields?: string;
}

export interface DeleteDataSourceRequest {
  dataSourceId?: string;
}

export interface RefreshDataSourceRequest {
  dataSourceId?: string;
  references?: DataSourceObjectReferences;
  force?: boolean;
}

export interface DataSourceObjectReferences {
  references?: DataSourceObjectReference[];
}

export interface DataSourceObjectReference {
  sheetId?: string;
  chartId?: number;
  dataSourceTableAnchorCell?: GridCoordinate;
  dataSourcePivotTableAnchorCell?: GridCoordinate;
  dataSourceFormulaCell?: GridCoordinate;
}

// Response interfaces
export interface SpreadsheetResponse {
  data: Spreadsheet;
}

export interface UpdateResponse {
  spreadsheetId?: string;
  updatedRows?: number;
  updatedColumns?: number;
  updatedCells?: number;
  updatedData?: ValueRange;
}

export interface ValueRange {
  range?: string;
  majorDimension?: 'DIMENSION_UNSPECIFIED' | 'ROWS' | 'COLUMNS';
  values?: unknown[][];
}

export interface BatchUpdateResponse {
  spreadsheetId?: string;
  replies?: Response[];
  updatedSpreadsheet?: Spreadsheet;
}

export interface Response {
  addSheet?: AddSheetResponse;
  addChart?: AddChartResponse;
  addFilterView?: AddFilterViewResponse;
  duplicateSheet?: DuplicateSheetResponse;
  duplicateFilterView?: DuplicateFilterViewResponse;
  updateEmbeddedObjectPosition?: UpdateEmbeddedObjectPositionResponse;
  addNamedRange?: AddNamedRangeResponse;
  addProtectedRange?: AddProtectedRangeResponse;
  updateConditionalFormatRule?: UpdateConditionalFormatRuleResponse;
  addConditionalFormatRule?: AddConditionalFormatRuleResponse;
  deleteConditionalFormatRule?: DeleteConditionalFormatRuleResponse;
  addBanding?: AddBandingResponse;
  createDeveloperMetadata?: CreateDeveloperMetadataResponse;
  updateDeveloperMetadata?: UpdateDeveloperMetadataResponse;
  deleteDeveloperMetadata?: DeleteDeveloperMetadataResponse;
  addDimensionGroup?: AddDimensionGroupResponse;
  deleteDimensionGroup?: DeleteDimensionGroupResponse;
  trimWhitespace?: TrimWhitespaceResponse;
  deleteDuplicates?: DeleteDuplicatesResponse;
  findReplace?: FindReplaceResponse;
  addSlicer?: AddSlicerResponse;
  addDataSource?: AddDataSourceResponse;
  updateDataSource?: UpdateDataSourceResponse;
  deleteDataSource?: DeleteDataSourceResponse;
  refreshDataSource?: RefreshDataSourceResponse;
}

export interface AddSheetResponse {
  properties?: SheetProperties;
}

export interface AddChartResponse {
  chart?: EmbeddedChart;
}

export interface AddFilterViewResponse {
  filter?: FilterView;
}

export interface DuplicateSheetResponse {
  properties?: SheetProperties;
}

export interface DuplicateFilterViewResponse {
  filter?: FilterView;
}

export interface UpdateEmbeddedObjectPositionResponse {
  position?: EmbeddedObjectPosition;
}

export interface AddNamedRangeResponse {
  namedRange?: NamedRange;
}

export interface AddProtectedRangeResponse {
  protectedRange?: ProtectedRange;
}

export interface UpdateConditionalFormatRuleResponse {
  index?: number;
  oldIndex?: number;
  oldRule?: ConditionalFormatRule;
  newRule?: ConditionalFormatRule;
}

export interface AddConditionalFormatRuleResponse {
  rule?: ConditionalFormatRule;
  index?: number;
}

export interface DeleteConditionalFormatRuleResponse {
  rule?: ConditionalFormatRule;
}

export interface AddBandingResponse {
  bandedRange?: BandedRange;
}

export interface CreateDeveloperMetadataResponse {
  developerMetadata?: DeveloperMetadata;
}

export interface UpdateDeveloperMetadataResponse {
  developerMetadata?: DeveloperMetadata[];
}

export interface DeleteDeveloperMetadataResponse {
  deletedDeveloperMetadata?: DeveloperMetadata[];
}

export interface AddDimensionGroupResponse {
  dimensionGroups?: DimensionGroup[];
}

export interface DeleteDimensionGroupResponse {
  dimensionGroups?: DimensionGroup[];
}

export interface TrimWhitespaceResponse {
  cellsChangedCount?: number;
}

export interface DeleteDuplicatesResponse {
  duplicatesRemovedCount?: number;
}

export interface FindReplaceResponse {
  occurrencesChanged?: number;
  valuesChanged?: number;
  formulasChanged?: number;
  rowsChanged?: number;
  sheetsChanged?: number;
}

export interface AddSlicerResponse {
  slicer?: Slicer;
}

export interface AddDataSourceResponse {
  dataSource?: DataSource;
  dataExecutionStatus?: DataExecutionStatus;
}

export interface UpdateDataSourceResponse {
  dataSource?: DataSource;
  dataExecutionStatus?: DataExecutionStatus;
}

export interface DeleteDataSourceResponse {
  dataSource?: DataSource;
}

export interface RefreshDataSourceResponse {
  statuses?: RefreshDataSourceObjectExecutionStatus[];
}

export interface RefreshDataSourceObjectExecutionStatus {
  reference?: DataSourceObjectReference;
  dataExecutionStatus?: DataExecutionStatus;
}

// Google Sheets API client interface
export interface GoogleSheetsAPI {
  spreadsheets: {
    create(params: {
      resource: CreateSpreadsheetRequest;
    }): Promise<SpreadsheetResponse>;
    get(params: GetSpreadsheetParams): Promise<SpreadsheetResponse>;
    batchUpdate(params: BatchUpdateParams): Promise<BatchUpdateResponse>;
    values: {
      get(params: {
        spreadsheetId: string;
        range: string;
      }): Promise<{ data: ValueRange }>;
      update(params: UpdateValuesParams): Promise<UpdateResponse>;
      batchUpdate(params: {
        spreadsheetId: string;
        resource: {
          valueInputOption: 'RAW' | 'USER_ENTERED';
          data: {
            range: string;
            values: unknown[][];
          }[];
        };
      }): Promise<{ data: { responses: UpdateResponse[] } }>;
      append(params: {
        spreadsheetId: string;
        range: string;
        valueInputOption: 'RAW' | 'USER_ENTERED';
        resource: {
          values: unknown[][];
        };
      }): Promise<UpdateResponse>;
      clear(params: {
        spreadsheetId: string;
        range: string;
      }): Promise<{ data: { clearedRange: string } }>;
      batchClear(params: {
        spreadsheetId: string;
        resource: {
          ranges: string[];
        };
      }): Promise<{ data: { clearedRanges: string[] } }>;
      batchGet(params: {
        spreadsheetId: string;
        ranges: string[];
        majorDimension?: 'DIMENSION_UNSPECIFIED' | 'ROWS' | 'COLUMNS';
        valueRenderOption?: 'FORMATTED_VALUE' | 'UNFORMATTED_VALUE' | 'FORMULA';
        dateTimeRenderOption?: 'SERIAL_NUMBER' | 'FORMATTED_STRING';
      }): Promise<{ data: { valueRanges: ValueRange[] } }>;
    };
  };
}

// Google Drive API interfaces for file operations
export interface GoogleDriveAPI {
  files: {
    create(params: {
      resource: {
        name: string;
        parents?: string[];
        mimeType?: string;
      };
      media?: {
        mimeType: string;
        body: string | Buffer;
      };
    }): Promise<{ data: { id: string; name: string } }>;

    copy(params: {
      fileId: string;
      resource: {
        name: string;
        parents?: string[];
      };
    }): Promise<{ data: { id: string; name: string } }>;

    get(params: {
      fileId: string;
      fields?: string;
    }): Promise<{ data: { id: string; name: string; parents?: string[] } }>;

    list(params: {
      q?: string;
      pageSize?: number;
      fields?: string;
    }): Promise<{ data: { files: { id: string; name: string }[] } }>;

    update(params: {
      fileId: string;
      resource: {
        name?: string;
        parents?: string[];
      };
    }): Promise<{ data: { id: string; name: string } }>;

    delete(params: { fileId: string }): Promise<void>;
  };

  permissions: {
    create(params: {
      fileId: string;
      resource: {
        role:
          | 'owner'
          | 'organizer'
          | 'fileOrganizer'
          | 'writer'
          | 'commenter'
          | 'reader';
        type: 'user' | 'group' | 'domain' | 'anyone';
        emailAddress?: string;
        domain?: string;
      };
    }): Promise<{ data: { id: string } }>;

    list(params: {
      fileId: string;
    }): Promise<{
      data: { permissions: Array<{ id: string; role: string; type: string }> };
    }>;

    delete(params: { fileId: string; permissionId: string }): Promise<void>;
  };
}

// Google Auth interfaces
export interface GoogleAuth {
  getAccessToken(): Promise<{ token: string }>;
  setCredentials(credentials: {
    client_email?: string;
    private_key?: string;
    access_token?: string;
    refresh_token?: string;
  }): void;
}
