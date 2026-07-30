/**

 */
export const OIL_DATA = [
  // LIGHT SWEET GRADES
  // Extraction costs: Statista 2015 CAPEX+OPEX totals (https://www.statista.com/statistics/597669/)
  { 
    country: "Saudi Arabia", 
    code: "SA", 
    capacity: 267.2, 
    quality: "Arab Light", 
    grade: "light", 
    liftingCost: 5.4,
    extractionJustification: "CAPEX $4.5 + OPEX $5.4",
    color: '#10b981', 
    coordinates: [45.0792, 23.859],
    description: "Arab Light is the kingdom's flagship and most-traded export crude."
  },
  { 
    country: "Iran", 
    code: "IR", 
    capacity: 208.6, 
    quality: "Iran Light", 
    grade: "light", 
    liftingCost: 5.7,
    extractionJustification: "CAPEX $6.9 + OPEX $5.7",
    color: '#10b981', 
    coordinates: [53.6880, 32.4279],
    description: "Premium quality, sweet crude most in demand."
  },
  { 
    country: "UAE", 
    code: "AE", 
    capacity: 113.0, 
    quality: "Murban Crude", 
    grade: "light", 
    liftingCost: 5.7,
    extractionJustification: "CAPEX $6.6 + OPEX $5.7",
    color: '#10b981', 
    coordinates: [55.3091, 24.2420],
    description: "Represents the real-time market value and is more responsive to global forces."
  },
  { 
    country: "Libya", 
    code: "LY", 
    capacity: 48.8, 
    quality: "Es Sider", 
    grade: "light", 
    liftingCost: 7.2,
    extractionJustification: "CAPEX $16.6 + OPEX $7.2",
    color: '#10b981', 
    coordinates: [17.2283, 26.3351],
    description: "Es Sider is a key light, sweet export crude."
  },
  { 
    country: "USA", 
    code: "US", 
    capacity: 45.0, 
    quality: "WTI Crude", 
    grade: "light", 
    liftingCost: 14.8,
    extractionJustification: "CAPEX $21.5 + OPEX $14.8",
    color: '#10b981', 
    coordinates: [-95.7129, 37.0902],
    description: "WTI Crude (West Texas Intermediate) is the primary U.S. and global benchmark."
  },

  // MEDIUM SOUR GRADES
  { 
    country: "Iraq", 
    code: "IQ", 
    capacity: 145.0, 
    quality: "Basrah Medium", 
    grade: "medium", 
    liftingCost: 5.1,
    extractionJustification: "CAPEX $5.6 + OPEX $5.1",
    color: '#f59e0b', 
    coordinates: [43.6793, 33.2232],
    description: "Basrah Medium represents the main export stream from its southern fields."
  },
  { 
    country: "Kuwait", 
    code: "KW", 
    capacity: 101.5, 
    quality: "Kuwait Export Blend", 
    grade: "medium", 
    liftingCost: 4.8,
    extractionJustification: "CAPEX $3.7 + OPEX $4.8",
    color: '#f59e0b', 
    coordinates: [47.4818, 29.3117],
    description: "Kuwait Export Blend is the country's sole export crude."
  },
  { 
    country: "Russia", 
    code: "RU", 
    capacity: 80.0, 
    quality: "Urals", 
    grade: "medium", 
    liftingCost: 8.4,
    extractionJustification: "CAPEX $8.9 + OPEX $8.4",
    color: '#f59e0b', 
    coordinates: [105.3188, 61.5240],
    description: "Urals is explicitly named as Russia's price benchmark and main export blend."
  },

  // HEAVY GRADES
  { 
    country: "Venezuela", 
    code: "VE", 
    capacity: 303.2, 
    quality: "Merey", 
    grade: "heavy", 
    liftingCost: 13.9,
    extractionJustification: "CAPEX $9.6 + OPEX $13.9",
    color: '#57534e', 
    coordinates: [-66.5897, 6.4238],
    description: "Merey is the country's main heavy sour export blend."
  },
  { 
    country: "Canada", 
    code: "CA", 
    capacity: 163.0, 
    quality: "Western Canadian Select", 
    grade: "heavy", 
    liftingCost: 22.4,
    extractionJustification: "CAPEX $18.7 + OPEX $22.4",
    color: '#57534e', 
    coordinates: [-106.3468, 56.1304],
    description: "Western Canadian Select (WCS) is the benchmark for Canada's heavy crude from the oil sands."
  },
];
