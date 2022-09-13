export const mapSymbols = new Map([
  ["EWG", "DEU"],
  ["EWU", "GBR"],
  ["EWQ", "FRA"],
  ["EWI", "ITA"],
  ["EWL", "CHE"],
  ["EWJ", "JPN"],
  ["MCHI", "CHN"],
  ["EWA", "AUS"],
  ["EWH", "HKG"],
  ["EWT", "TWN"],
  ["EWS", "SGP"],
  ["EWY", "KOR"],
  ["INDA", "IND"],
  ["EWC", "CAN"],
  ["EWP", "ESP"],
  ["EWZ", "BRA"],
  ["EWK", "BEL"],
  ["EWD", "SWE"],
  ["EWN", "NLD"],
  ["EWO", "AUT"],
  ["EWW", "MEX"],
  ["EWM", "MYS"],
  ["EZA", "ZAF"],
  ["EIRL", "IRL"],
  ["EIS", "ISR"],
  ["EPU", "PER"],
  ["EDEN", "DNK"],
  ["EIDO", "IDN"],
  ["ENOR", "NOR"],
  ["ENZL", "NZL"],
  ["EPHE", "PHL"],
  ["PGAL", "PRT"],
  ["ARGT", "ARG"],
  ["SPY", "USA"],
  ["TUR", "TUR"],
  ["EFNL", "FIN"],
  ["GREK", "GRC"],
  ["KSA", "SAU"],
  ["MKUW", "KWT"],
  ["EPOL", "POL"],
  ["UAE", "ARE"],
  ["EGPT", "EGY"],
  ["PAK", "PAK"],
  ["ECH", "CHL"],
]);

export const codeToTicker = new Map(
  Array.from(mapSymbols.entries()).map(([k, v]) => [v, k])
);
