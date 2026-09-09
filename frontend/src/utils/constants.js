export const BUILDING_TYPES = [
  'Residential',
  'Commercial',
  'Educational',
  'Hospital',
  'Industrial',
  'Office',
  'Other'
];

export const STRUCTURAL_MATERIALS = [
  'Reinforced Concrete',
  'Structural Steel',
  'Mass Timber / CLT',
  'Recycled Steel Frame',
  'Low-Carbon Fly Ash Concrete',
  'Load-Bearing Masonry'
];

export const WALL_MATERIALS = [
  'Standard Brick',
  'AAC Lightweight Concrete Blocks',
  'Hempcrete / Bio-composite',
  'Insulated Concrete Forms (ICF)',
  'Curtain Glass Wall',
  'Compressed Earth Block (CEB)'
];

export const FLOORING_MATERIALS = [
  'Ceramic Tiles',
  'Polished Concrete',
  'FSC Hardwood / Bamboo',
  'Recycled Terrazzo',
  'Linoleum / Bio-flooring',
  'Vinyl / Carpet Tile'
];

export const ROOF_MATERIALS = [
  'Asphalt Shingles',
  'Cool Metal Roof (Reflective)',
  'Extensive Green Roof',
  'Clay / Concrete Tile',
  'Solar Integrated Shingles (BIPV)'
];

export const INSULATION_TYPES = [
  'None / Minimal',
  'Fiberglass Batt',
  'Mineral Rockwool',
  'Expanded Polystyrene (EPS)',
  'Cellulose (Recycled Paper)',
  'Wood Fiber Insulation',
  'Aerogel High-Performance'
];

export const WINDOW_TYPES = [
  'Standard Aluminum',
  'Thermal Break Aluminum',
  'uPVC / Vinyl',
  'Wood / Timber Frame',
  'Fiberglass Composite'
];

export const GLAZING_TYPES = [
  'Single Glazed Clear',
  'Double Glazed Standard',
  'Double Glazed Low-E (Argon)',
  'Triple Glazed Low-E (Krypton)',
  'Electrochromic Smart Glass'
];

export const HVAC_SYSTEMS = [
  'Conventional Split AC + Gas Furnace',
  'High-Efficiency Air-Source Heat Pump',
  'Ground-Source Geothermal Heat Pump',
  'Variable Refrigerant Flow (VRF)',
  'Natural Ventilation Only (No Central AC)',
  'District Heating & Cooling'
];

export const ORIENTATIONS = [
  'North-Facing',
  'South-Facing',
  'East-Facing',
  'West-Facing'
];

export const ELECTRICITY_SOURCES = [
  'Municipal Grid',
  'Grid + Rooftop Solar',
  'Solar + Battery Microgrid',
  'Solar + Grid Hybrid',
  '100% Certified Green Power Tariff'
];

export const WATER_SOURCES = [
  'Municipal Supply',
  'Municipal + Reclaimed',
  'Rainwater + Municipal Backup',
  'Groundwater / Borewell',
  'Off-Grid Rainwater Harvesting'
];

export const OPTIMIZATION_PRIORITIES = [
  { id: 'Balanced', label: 'Balanced Performance', desc: 'Harmonize upfront budget with high carbon and energy gains' },
  { id: 'Lowest Carbon', label: 'Lowest Carbon (Decarbonization)', desc: 'Maximize biogenic CLT structure and eliminate lifecycle emissions' },
  { id: 'Lowest Energy', label: 'Lowest Energy (Efficiency)', desc: 'Airtight envelope, triple glazing, and maximal rooftop solar PV' },
  { id: 'Lowest Water', label: 'Lowest Water (Water Stewardship)', desc: 'Comprehensive rainwater catchment and dual-plumbing greywater reuse' },
  { id: 'Lowest Cost', label: 'Lowest Cost (Rapid ROI)', desc: 'Target highest return-on-investment green measures with low upfront cost' },
];
