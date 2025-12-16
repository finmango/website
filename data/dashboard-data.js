// Financial Health Barometer Data
// Auto-generated: 2025-12-16T05:11:08.233Z
// Sources: BLS, FRED, Census Bureau, Google Trends APIs

const DASHBOARD_DATA = {
  "meta": {
    "generated": "2025-12-16T05:11:08.233Z",
    "version": "2.2",
    "source": "BLS, FRED, Census Bureau, Google Trends APIs",
    "update_frequency": "daily",
    "data_sources": {
      "unemployment": "BLS LAUS",
      "housing": "FRED HPI",
      "poverty": "estimated",
      "trends": "Google Trends"
    }
  },
  "national": {
    "financial_anxiety": {
      "value": 136.2,
      "change": 3.2,
      "trend": "up"
    },
    "food_insecurity": {
      "value": 127.5,
      "change": 6.4,
      "trend": "up"
    },
    "housing_stress": {
      "value": 227.8,
      "change": 14.2,
      "trend": "up"
    },
    "affordability": {
      "value": 177,
      "change": 6.4,
      "trend": "up"
    }
  },
  "states": {
    "US-AL": {
      "name": "Alabama",
      "abbr": "AL",
      "financial_anxiety": {
        "value": 134,
        "change": -15.2,
        "rank": 27
      },
      "food_insecurity": {
        "value": 150,
        "change": 9.4,
        "rank": 6
      },
      "housing_stress": {
        "value": 250,
        "change": 12.9,
        "rank": 1
      },
      "affordability": {
        "value": 198,
        "change": 8.6,
        "rank": 3
      },
      "metrics": {
        "unemployment_rate": 2.8,
        "poverty_rate": null,
        "median_rent": null,
        "housing_price_change": 12.896965043615507,
        "regional_stress_multiplier": 1.25
      }
    },
    "US-AK": {
      "name": "Alaska",
      "abbr": "AK",
      "financial_anxiety": {
        "value": 153,
        "change": -2.1,
        "rank": 14
      },
      "food_insecurity": {
        "value": 124,
        "change": 5.4,
        "rank": 27
      },
      "housing_stress": {
        "value": 238,
        "change": 14.3,
        "rank": 30
      },
      "affordability": {
        "value": 184,
        "change": 8.6,
        "rank": 27
      },
      "metrics": {
        "unemployment_rate": 4.7,
        "poverty_rate": null,
        "median_rent": null,
        "housing_price_change": 14.266950063286608,
        "regional_stress_multiplier": 1.08
      }
    },
    "US-AZ": {
      "name": "Arizona",
      "abbr": "AZ",
      "financial_anxiety": {
        "value": 146,
        "change": 10.5,
        "rank": 16
      },
      "food_insecurity": {
        "value": 133,
        "change": 7.2,
        "rank": 15
      },
      "housing_stress": {
        "value": 190,
        "change": 4.6,
        "rank": 43
      },
      "affordability": {
        "value": 156,
        "change": 4.3,
        "rank": 40
      },
      "metrics": {
        "unemployment_rate": 4.2,
        "poverty_rate": null,
        "median_rent": null,
        "housing_price_change": 4.626544096523976,
        "regional_stress_multiplier": 1.1
      }
    },
    "US-AR": {
      "name": "Arkansas",
      "abbr": "AR",
      "financial_anxiety": {
        "value": 155,
        "change": 11.4,
        "rank": 12
      },
      "food_insecurity": {
        "value": 151,
        "change": 8,
        "rank": 4
      },
      "housing_stress": {
        "value": 250,
        "change": 15,
        "rank": 2
      },
      "affordability": {
        "value": 196,
        "change": 5.6,
        "rank": 4
      },
      "metrics": {
        "unemployment_rate": 3.9,
        "poverty_rate": null,
        "median_rent": null,
        "housing_price_change": 15.009522879328019,
        "regional_stress_multiplier": 1.22
      }
    },
    "US-CA": {
      "name": "California",
      "abbr": "CA",
      "financial_anxiety": {
        "value": 177,
        "change": 1.8,
        "rank": 2
      },
      "food_insecurity": {
        "value": 136,
        "change": 4.2,
        "rank": 11
      },
      "housing_stress": {
        "value": 226,
        "change": 6.1,
        "rank": 33
      },
      "affordability": {
        "value": 178,
        "change": 5.7,
        "rank": 32
      },
      "metrics": {
        "unemployment_rate": 5.6,
        "poverty_rate": null,
        "median_rent": null,
        "housing_price_change": 6.12660110915435,
        "regional_stress_multiplier": 1.12
      }
    },
    "US-CO": {
      "name": "Colorado",
      "abbr": "CO",
      "financial_anxiety": {
        "value": 133,
        "change": -8.9,
        "rank": 28
      },
      "food_insecurity": {
        "value": 123,
        "change": 9.4,
        "rank": 30
      },
      "housing_stress": {
        "value": 183,
        "change": 4,
        "rank": 46
      },
      "affordability": {
        "value": 149,
        "change": 7.8,
        "rank": 46
      },
      "metrics": {
        "unemployment_rate": 4.1,
        "poverty_rate": null,
        "median_rent": null,
        "housing_price_change": 4.013893780590008,
        "regional_stress_multiplier": 1.02
      }
    },
    "US-CT": {
      "name": "Connecticut",
      "abbr": "CT",
      "financial_anxiety": {
        "value": 128,
        "change": 18.7,
        "rank": 35
      },
      "food_insecurity": {
        "value": 122,
        "change": 6.3,
        "rank": 32
      },
      "housing_stress": {
        "value": 250,
        "change": 26,
        "rank": 3
      },
      "affordability": {
        "value": 189,
        "change": 5.3,
        "rank": 16
      },
      "metrics": {
        "unemployment_rate": 3.8,
        "poverty_rate": null,
        "median_rent": null,
        "housing_price_change": 25.95093005489723,
        "regional_stress_multiplier": 1.02
      }
    },
    "US-DE": {
      "name": "Delaware",
      "abbr": "DE",
      "financial_anxiety": {
        "value": 138,
        "change": 25,
        "rank": 22
      },
      "food_insecurity": {
        "value": 119,
        "change": 2.1,
        "rank": 38
      },
      "housing_stress": {
        "value": 246,
        "change": 18.4,
        "rank": 23
      },
      "affordability": {
        "value": 186,
        "change": 3.9,
        "rank": 21
      },
      "metrics": {
        "unemployment_rate": 4.5,
        "poverty_rate": null,
        "median_rent": null,
        "housing_price_change": 18.420684835779173,
        "regional_stress_multiplier": 1
      }
    },
    "US-DC": {
      "name": "District of Columbia",
      "abbr": "DC",
      "financial_anxiety": {
        "value": 199,
        "change": 17,
        "rank": 1
      },
      "food_insecurity": {
        "value": 134,
        "change": 9.7,
        "rank": 13
      },
      "housing_stress": {
        "value": 183,
        "change": -1.6,
        "rank": 47
      },
      "affordability": {
        "value": 155,
        "change": 7.2,
        "rank": 43
      },
      "metrics": {
        "unemployment_rate": 6.2,
        "poverty_rate": null,
        "median_rent": null,
        "housing_price_change": -1.5962986516253248,
        "regional_stress_multiplier": 1.18
      }
    },
    "US-FL": {
      "name": "Florida",
      "abbr": "FL",
      "financial_anxiety": {
        "value": 146,
        "change": 11.4,
        "rank": 17
      },
      "food_insecurity": {
        "value": 133,
        "change": 8.8,
        "rank": 16
      },
      "housing_stress": {
        "value": 229,
        "change": 7.4,
        "rank": 32
      },
      "affordability": {
        "value": 181,
        "change": 8.5,
        "rank": 30
      },
      "metrics": {
        "unemployment_rate": 3.9,
        "poverty_rate": null,
        "median_rent": null,
        "housing_price_change": 7.39286839617688,
        "regional_stress_multiplier": 1.15
      }
    },
    "US-GA": {
      "name": "Georgia",
      "abbr": "GA",
      "financial_anxiety": {
        "value": 130,
        "change": -5.6,
        "rank": 32
      },
      "food_insecurity": {
        "value": 140,
        "change": 9.3,
        "rank": 8
      },
      "housing_stress": {
        "value": 239,
        "change": 13.8,
        "rank": 28
      },
      "affordability": {
        "value": 185,
        "change": 7.7,
        "rank": 24
      },
      "metrics": {
        "unemployment_rate": 3.4,
        "poverty_rate": null,
        "median_rent": null,
        "housing_price_change": 13.75140753572975,
        "regional_stress_multiplier": 1.1
      }
    },
    "US-HI": {
      "name": "Hawaii",
      "abbr": "HI",
      "financial_anxiety": {
        "value": 122,
        "change": -16.7,
        "rank": 38
      },
      "food_insecurity": {
        "value": 151,
        "change": 5.6,
        "rank": 5
      },
      "housing_stress": {
        "value": 220,
        "change": 3,
        "rank": 34
      },
      "affordability": {
        "value": 178,
        "change": 8.9,
        "rank": 33
      },
      "metrics": {
        "unemployment_rate": 2.5,
        "poverty_rate": null,
        "median_rent": null,
        "housing_price_change": 3.0459543276007883,
        "regional_stress_multiplier": 1.2
      }
    },
    "US-ID": {
      "name": "Idaho",
      "abbr": "ID",
      "financial_anxiety": {
        "value": 130,
        "change": -2.6,
        "rank": 33
      },
      "food_insecurity": {
        "value": 119,
        "change": 2.9,
        "rank": 39
      },
      "housing_stress": {
        "value": 177,
        "change": 5.5,
        "rank": 49
      },
      "affordability": {
        "value": 146,
        "change": 3.1,
        "rank": 48
      },
      "metrics": {
        "unemployment_rate": 3.7,
        "poverty_rate": null,
        "median_rent": null,
        "housing_price_change": 5.523376086057094,
        "regional_stress_multiplier": 1.05
      }
    },
    "US-IL": {
      "name": "Illinois",
      "abbr": "IL",
      "financial_anxiety": {
        "value": 143,
        "change": -12,
        "rank": 20
      },
      "food_insecurity": {
        "value": 121,
        "change": 6.5,
        "rank": 34
      },
      "housing_stress": {
        "value": 250,
        "change": 21.3,
        "rank": 4
      },
      "affordability": {
        "value": 190,
        "change": 7.7,
        "rank": 11
      },
      "metrics": {
        "unemployment_rate": 4.4,
        "poverty_rate": null,
        "median_rent": null,
        "housing_price_change": 21.342320826730354,
        "regional_stress_multiplier": 1.05
      }
    },
    "US-IN": {
      "name": "Indiana",
      "abbr": "IN",
      "financial_anxiety": {
        "value": 129,
        "change": -15.9,
        "rank": 34
      },
      "food_insecurity": {
        "value": 122,
        "change": 9.2,
        "rank": 33
      },
      "housing_stress": {
        "value": 250,
        "change": 17.6,
        "rank": 5
      },
      "affordability": {
        "value": 190,
        "change": 6.1,
        "rank": 12
      },
      "metrics": {
        "unemployment_rate": 3.7,
        "poverty_rate": null,
        "median_rent": null,
        "housing_price_change": 17.632496905592443,
        "regional_stress_multiplier": 1.04
      }
    },
    "US-IA": {
      "name": "Iowa",
      "abbr": "IA",
      "financial_anxiety": {
        "value": 114,
        "change": 12.1,
        "rank": 41
      },
      "food_insecurity": {
        "value": 111,
        "change": 2.1,
        "rank": 45
      },
      "housing_stress": {
        "value": 202,
        "change": 14,
        "rank": 39
      },
      "affordability": {
        "value": 156,
        "change": 8.7,
        "rank": 41
      },
      "metrics": {
        "unemployment_rate": 3.7,
        "poverty_rate": null,
        "median_rent": null,
        "housing_price_change": 14.04080617068923,
        "regional_stress_multiplier": 0.92
      }
    },
    "US-KS": {
      "name": "Kansas",
      "abbr": "KS",
      "financial_anxiety": {
        "value": 125,
        "change": 0,
        "rank": 36
      },
      "food_insecurity": {
        "value": 119,
        "change": 5.1,
        "rank": 40
      },
      "housing_stress": {
        "value": 239,
        "change": 17.4,
        "rank": 29
      },
      "affordability": {
        "value": 181,
        "change": 3.5,
        "rank": 31
      },
      "metrics": {
        "unemployment_rate": 3.8,
        "poverty_rate": null,
        "median_rent": null,
        "housing_price_change": 17.35895846249225,
        "regional_stress_multiplier": 1
      }
    },
    "US-KY": {
      "name": "Kentucky",
      "abbr": "KY",
      "financial_anxiety": {
        "value": 167,
        "change": -11.3,
        "rank": 6
      },
      "food_insecurity": {
        "value": 149,
        "change": 7.7,
        "rank": 7
      },
      "housing_stress": {
        "value": 250,
        "change": 18.3,
        "rank": 6
      },
      "affordability": {
        "value": 195,
        "change": 4,
        "rank": 5
      },
      "metrics": {
        "unemployment_rate": 4.7,
        "poverty_rate": null,
        "median_rent": null,
        "housing_price_change": 18.331129658705883,
        "regional_stress_multiplier": 1.18
      }
    },
    "US-LA": {
      "name": "Louisiana",
      "abbr": "LA",
      "financial_anxiety": {
        "value": 177,
        "change": -4.3,
        "rank": 3
      },
      "food_insecurity": {
        "value": 159,
        "change": 2.6,
        "rank": 2
      },
      "housing_stress": {
        "value": 209,
        "change": 4.3,
        "rank": 37
      },
      "affordability": {
        "value": 175,
        "change": 5,
        "rank": 34
      },
      "metrics": {
        "unemployment_rate": 4.4,
        "poverty_rate": null,
        "median_rent": null,
        "housing_price_change": 4.3088321310197,
        "regional_stress_multiplier": 1.3
      }
    },
    "US-ME": {
      "name": "Maine",
      "abbr": "ME",
      "financial_anxiety": {
        "value": 109,
        "change": -5.9,
        "rank": 45
      },
      "food_insecurity": {
        "value": 114,
        "change": 8,
        "rank": 42
      },
      "housing_stress": {
        "value": 250,
        "change": 22.4,
        "rank": 7
      },
      "affordability": {
        "value": 186,
        "change": 4.6,
        "rank": 22
      },
      "metrics": {
        "unemployment_rate": 3.2,
        "poverty_rate": null,
        "median_rent": null,
        "housing_price_change": 22.407507022891647,
        "regional_stress_multiplier": 0.95
      }
    },
    "US-MD": {
      "name": "Maryland",
      "abbr": "MD",
      "financial_anxiety": {
        "value": 125,
        "change": 18.7,
        "rank": 37
      },
      "food_insecurity": {
        "value": 124,
        "change": 8.8,
        "rank": 28
      },
      "housing_stress": {
        "value": 240,
        "change": 14.1,
        "rank": 26
      },
      "affordability": {
        "value": 182,
        "change": 7.4,
        "rank": 28
      },
      "metrics": {
        "unemployment_rate": 3.8,
        "poverty_rate": null,
        "median_rent": null,
        "housing_price_change": 14.08518181382646,
        "regional_stress_multiplier": 1
      }
    },
    "US-MA": {
      "name": "Massachusetts",
      "abbr": "MA",
      "financial_anxiety": {
        "value": 144,
        "change": 11.9,
        "rank": 19
      },
      "food_insecurity": {
        "value": 129,
        "change": 6.1,
        "rank": 22
      },
      "housing_stress": {
        "value": 250,
        "change": 17.3,
        "rank": 8
      },
      "affordability": {
        "value": 189,
        "change": 4.1,
        "rank": 17
      },
      "metrics": {
        "unemployment_rate": 4.7,
        "poverty_rate": null,
        "median_rent": null,
        "housing_price_change": 17.264776567102164,
        "regional_stress_multiplier": 1.02
      }
    },
    "US-MI": {
      "name": "Michigan",
      "abbr": "MI",
      "financial_anxiety": {
        "value": 161,
        "change": 0,
        "rank": 8
      },
      "food_insecurity": {
        "value": 134,
        "change": 9.1,
        "rank": 14
      },
      "housing_stress": {
        "value": 250,
        "change": 19.4,
        "rank": 9
      },
      "affordability": {
        "value": 191,
        "change": 7.3,
        "rank": 9
      },
      "metrics": {
        "unemployment_rate": 5.1,
        "poverty_rate": null,
        "median_rent": null,
        "housing_price_change": 19.438091441280775,
        "regional_stress_multiplier": 1.08
      }
    },
    "US-MN": {
      "name": "Minnesota",
      "abbr": "MN",
      "financial_anxiety": {
        "value": 111,
        "change": 19.4,
        "rank": 42
      },
      "food_insecurity": {
        "value": 107,
        "change": 8,
        "rank": 47
      },
      "housing_stress": {
        "value": 182,
        "change": 11.3,
        "rank": 48
      },
      "affordability": {
        "value": 143,
        "change": 4.5,
        "rank": 50
      },
      "metrics": {
        "unemployment_rate": 3.7,
        "poverty_rate": null,
        "median_rent": null,
        "housing_price_change": 11.295398171115467,
        "regional_stress_multiplier": 0.9
      }
    },
    "US-MS": {
      "name": "Mississippi",
      "abbr": "MS",
      "financial_anxiety": {
        "value": 169,
        "change": 11.8,
        "rank": 5
      },
      "food_insecurity": {
        "value": 166,
        "change": 3.1,
        "rank": 1
      },
      "housing_stress": {
        "value": 250,
        "change": 12.4,
        "rank": 10
      },
      "affordability": {
        "value": 200,
        "change": 8.2,
        "rank": 1
      },
      "metrics": {
        "unemployment_rate": 3.8,
        "poverty_rate": null,
        "median_rent": null,
        "housing_price_change": 12.414275340881593,
        "regional_stress_multiplier": 1.35
      }
    },
    "US-MO": {
      "name": "Missouri",
      "abbr": "MO",
      "financial_anxiety": {
        "value": 137,
        "change": 10.8,
        "rank": 23
      },
      "food_insecurity": {
        "value": 120,
        "change": 3.9,
        "rank": 36
      },
      "housing_stress": {
        "value": 250,
        "change": 17.5,
        "rank": 11
      },
      "affordability": {
        "value": 190,
        "change": 6.8,
        "rank": 13
      },
      "metrics": {
        "unemployment_rate": 4.1,
        "poverty_rate": null,
        "median_rent": null,
        "housing_price_change": 17.473542468808517,
        "regional_stress_multiplier": 1.05
      }
    },
    "US-MT": {
      "name": "Montana",
      "abbr": "MT",
      "financial_anxiety": {
        "value": 111,
        "change": 0,
        "rank": 43
      },
      "food_insecurity": {
        "value": 118,
        "change": 7.5,
        "rank": 41
      },
      "housing_stress": {
        "value": 218,
        "change": 13.9,
        "rank": 36
      },
      "affordability": {
        "value": 169,
        "change": 7.6,
        "rank": 36
      },
      "metrics": {
        "unemployment_rate": 3,
        "poverty_rate": null,
        "median_rent": null,
        "housing_price_change": 13.904959838229509,
        "regional_stress_multiplier": 1
      }
    },
    "US-NE": {
      "name": "Nebraska",
      "abbr": "NE",
      "financial_anxiety": {
        "value": 105,
        "change": 3.4,
        "rank": 47
      },
      "food_insecurity": {
        "value": 113,
        "change": 8.7,
        "rank": 44
      },
      "housing_stress": {
        "value": 220,
        "change": 16.1,
        "rank": 35
      },
      "affordability": {
        "value": 168,
        "change": 7.2,
        "rank": 37
      },
      "metrics": {
        "unemployment_rate": 3,
        "poverty_rate": null,
        "median_rent": null,
        "housing_price_change": 16.124739767776262,
        "regional_stress_multiplier": 0.95
      }
    },
    "US-NV": {
      "name": "Nevada",
      "abbr": "NV",
      "financial_anxiety": {
        "value": 171,
        "change": -7,
        "rank": 4
      },
      "food_insecurity": {
        "value": 139,
        "change": 2.9,
        "rank": 9
      },
      "housing_stress": {
        "value": 203,
        "change": 6,
        "rank": 38
      },
      "affordability": {
        "value": 164,
        "change": 8.5,
        "rank": 38
      },
      "metrics": {
        "unemployment_rate": 5.3,
        "poverty_rate": null,
        "median_rent": null,
        "housing_price_change": 6.031302960821446,
        "regional_stress_multiplier": 1.12
      }
    },
    "US-NH": {
      "name": "New Hampshire",
      "abbr": "NH",
      "financial_anxiety": {
        "value": 98,
        "change": 11.1,
        "rank": 48
      },
      "food_insecurity": {
        "value": 104,
        "change": 5.6,
        "rank": 49
      },
      "housing_stress": {
        "value": 248,
        "change": 22.9,
        "rank": 21
      },
      "affordability": {
        "value": 182,
        "change": 5.5,
        "rank": 29
      },
      "metrics": {
        "unemployment_rate": 3,
        "poverty_rate": null,
        "median_rent": null,
        "housing_price_change": 22.8635340578009,
        "regional_stress_multiplier": 0.88
      }
    },
    "US-NJ": {
      "name": "New Jersey",
      "abbr": "NJ",
      "financial_anxiety": {
        "value": 158,
        "change": 13,
        "rank": 9
      },
      "food_insecurity": {
        "value": 130,
        "change": 5.8,
        "rank": 20
      },
      "housing_stress": {
        "value": 250,
        "change": 25.2,
        "rank": 12
      },
      "affordability": {
        "value": 190,
        "change": 7.4,
        "rank": 14
      },
      "metrics": {
        "unemployment_rate": 5.2,
        "poverty_rate": null,
        "median_rent": null,
        "housing_price_change": 25.249814577574003,
        "regional_stress_multiplier": 1.05
      }
    },
    "US-NM": {
      "name": "New Mexico",
      "abbr": "NM",
      "financial_anxiety": {
        "value": 154,
        "change": -4.7,
        "rank": 13
      },
      "food_insecurity": {
        "value": 139,
        "change": 9.9,
        "rank": 10
      },
      "housing_stress": {
        "value": 250,
        "change": 15.6,
        "rank": 13
      },
      "affordability": {
        "value": 195,
        "change": 5.1,
        "rank": 6
      },
      "metrics": {
        "unemployment_rate": 4.1,
        "poverty_rate": null,
        "median_rent": null,
        "housing_price_change": 15.573787647292747,
        "regional_stress_multiplier": 1.18
      }
    },
    "US-NY": {
      "name": "New York",
      "abbr": "NY",
      "financial_anxiety": {
        "value": 146,
        "change": -4.5,
        "rank": 18
      },
      "food_insecurity": {
        "value": 130,
        "change": 6.7,
        "rank": 21
      },
      "housing_stress": {
        "value": 250,
        "change": 22.5,
        "rank": 14
      },
      "affordability": {
        "value": 192,
        "change": 6.9,
        "rank": 8
      },
      "metrics": {
        "unemployment_rate": 4.2,
        "poverty_rate": null,
        "median_rent": null,
        "housing_price_change": 22.467279368696822,
        "regional_stress_multiplier": 1.1
      }
    },
    "US-NC": {
      "name": "North Carolina",
      "abbr": "NC",
      "financial_anxiety": {
        "value": 133,
        "change": 0,
        "rank": 29
      },
      "food_insecurity": {
        "value": 131,
        "change": 7.9,
        "rank": 18
      },
      "housing_stress": {
        "value": 240,
        "change": 14.5,
        "rank": 27
      },
      "affordability": {
        "value": 185,
        "change": 4.6,
        "rank": 25
      },
      "metrics": {
        "unemployment_rate": 3.7,
        "poverty_rate": null,
        "median_rent": null,
        "housing_price_change": 14.481864859987855,
        "regional_stress_multiplier": 1.08
      }
    },
    "US-ND": {
      "name": "North Dakota",
      "abbr": "ND",
      "financial_anxiety": {
        "value": 88,
        "change": 4,
        "rank": 50
      },
      "food_insecurity": {
        "value": 101,
        "change": 3.9,
        "rank": 51
      },
      "housing_stress": {
        "value": 196,
        "change": 15.8,
        "rank": 42
      },
      "affordability": {
        "value": 150,
        "change": 7.6,
        "rank": 45
      },
      "metrics": {
        "unemployment_rate": 2.6,
        "poverty_rate": null,
        "median_rent": null,
        "housing_price_change": 15.838242107353226,
        "regional_stress_multiplier": 0.85
      }
    },
    "US-OH": {
      "name": "Ohio",
      "abbr": "OH",
      "financial_anxiety": {
        "value": 152,
        "change": 9.1,
        "rank": 15
      },
      "food_insecurity": {
        "value": 127,
        "change": 4.7,
        "rank": 26
      },
      "housing_stress": {
        "value": 250,
        "change": 20.4,
        "rank": 15
      },
      "affordability": {
        "value": 190,
        "change": 6.7,
        "rank": 15
      },
      "metrics": {
        "unemployment_rate": 4.8,
        "poverty_rate": null,
        "median_rent": null,
        "housing_price_change": 20.44975237553613,
        "regional_stress_multiplier": 1.06
      }
    },
    "US-OK": {
      "name": "Oklahoma",
      "abbr": "OK",
      "financial_anxiety": {
        "value": 132,
        "change": -3,
        "rank": 31
      },
      "food_insecurity": {
        "value": 133,
        "change": 2.3,
        "rank": 17
      },
      "housing_stress": {
        "value": 245,
        "change": 13,
        "rank": 24
      },
      "affordability": {
        "value": 191,
        "change": 6.6,
        "rank": 10
      },
      "metrics": {
        "unemployment_rate": 3.2,
        "poverty_rate": null,
        "median_rent": null,
        "housing_price_change": 12.96821629132172,
        "regional_stress_multiplier": 1.15
      }
    },
    "US-OR": {
      "name": "Oregon",
      "abbr": "OR",
      "financial_anxiety": {
        "value": 158,
        "change": 23.8,
        "rank": 10
      },
      "food_insecurity": {
        "value": 128,
        "change": 8.2,
        "rank": 24
      },
      "housing_stress": {
        "value": 177,
        "change": 3.9,
        "rank": 50
      },
      "affordability": {
        "value": 146,
        "change": 5,
        "rank": 49
      },
      "metrics": {
        "unemployment_rate": 5.2,
        "poverty_rate": null,
        "median_rent": null,
        "housing_price_change": 3.8927738927738953,
        "regional_stress_multiplier": 1.05
      }
    },
    "US-PA": {
      "name": "Pennsylvania",
      "abbr": "PA",
      "financial_anxiety": {
        "value": 133,
        "change": 10.8,
        "rank": 30
      },
      "food_insecurity": {
        "value": 123,
        "change": 7.4,
        "rank": 31
      },
      "housing_stress": {
        "value": 250,
        "change": 18.7,
        "rank": 16
      },
      "affordability": {
        "value": 189,
        "change": 5.2,
        "rank": 18
      },
      "metrics": {
        "unemployment_rate": 4.1,
        "poverty_rate": null,
        "median_rent": null,
        "housing_price_change": 18.676672126215863,
        "regional_stress_multiplier": 1.02
      }
    },
    "US-RI": {
      "name": "Rhode Island",
      "abbr": "RI",
      "financial_anxiety": {
        "value": 135,
        "change": 0,
        "rank": 26
      },
      "food_insecurity": {
        "value": 124,
        "change": 9.4,
        "rank": 29
      },
      "housing_stress": {
        "value": 250,
        "change": 22.8,
        "rank": 17
      },
      "affordability": {
        "value": 187,
        "change": 6.1,
        "rank": 20
      },
      "metrics": {
        "unemployment_rate": 4.5,
        "poverty_rate": null,
        "median_rent": null,
        "housing_price_change": 22.84826601729783,
        "regional_stress_multiplier": 0.98
      }
    },
    "US-SC": {
      "name": "South Carolina",
      "abbr": "SC",
      "financial_anxiety": {
        "value": 157,
        "change": -2.2,
        "rank": 11
      },
      "food_insecurity": {
        "value": 136,
        "change": 7.5,
        "rank": 12
      },
      "housing_stress": {
        "value": 250,
        "change": 18.8,
        "rank": 18
      },
      "affordability": {
        "value": 194,
        "change": 6.7,
        "rank": 7
      },
      "metrics": {
        "unemployment_rate": 4.4,
        "poverty_rate": null,
        "median_rent": null,
        "housing_price_change": 18.784215901290796,
        "regional_stress_multiplier": 1.15
      }
    },
    "US-SD": {
      "name": "South Dakota",
      "abbr": "SD",
      "financial_anxiety": {
        "value": 82,
        "change": 11.1,
        "rank": 51
      },
      "food_insecurity": {
        "value": 107,
        "change": 4.4,
        "rank": 48
      },
      "housing_stress": {
        "value": 189,
        "change": 13.4,
        "rank": 44
      },
      "affordability": {
        "value": 147,
        "change": 4.6,
        "rank": 47
      },
      "metrics": {
        "unemployment_rate": 2,
        "poverty_rate": null,
        "median_rent": null,
        "housing_price_change": 13.358887502228573,
        "regional_stress_multiplier": 0.88
      }
    },
    "US-TN": {
      "name": "Tennessee",
      "abbr": "TN",
      "financial_anxiety": {
        "value": 136,
        "change": -2.7,
        "rank": 25
      },
      "food_insecurity": {
        "value": 131,
        "change": 2.2,
        "rank": 19
      },
      "housing_stress": {
        "value": 242,
        "change": 13.5,
        "rank": 25
      },
      "affordability": {
        "value": 188,
        "change": 8.7,
        "rank": 19
      },
      "metrics": {
        "unemployment_rate": 3.6,
        "poverty_rate": null,
        "median_rent": null,
        "housing_price_change": 13.547883498934848,
        "regional_stress_multiplier": 1.12
      }
    },
    "US-TX": {
      "name": "Texas",
      "abbr": "TX",
      "financial_anxiety": {
        "value": 137,
        "change": -2.4,
        "rank": 24
      },
      "food_insecurity": {
        "value": 128,
        "change": 3.4,
        "rank": 25
      },
      "housing_stress": {
        "value": 186,
        "change": 5.3,
        "rank": 45
      },
      "affordability": {
        "value": 152,
        "change": 6.1,
        "rank": 44
      },
      "metrics": {
        "unemployment_rate": 4.1,
        "poverty_rate": null,
        "median_rent": null,
        "housing_price_change": 5.296665136607664,
        "regional_stress_multiplier": 1.05
      }
    },
    "US-UT": {
      "name": "Utah",
      "abbr": "UT",
      "financial_anxiety": {
        "value": 121,
        "change": 3,
        "rank": 39
      },
      "food_insecurity": {
        "value": 120,
        "change": 6.5,
        "rank": 37
      },
      "housing_stress": {
        "value": 171,
        "change": 5.4,
        "rank": 51
      },
      "affordability": {
        "value": 141,
        "change": 8.5,
        "rank": 51
      },
      "metrics": {
        "unemployment_rate": 3.4,
        "poverty_rate": null,
        "median_rent": null,
        "housing_price_change": 5.365363378044696,
        "regional_stress_multiplier": 1.02
      }
    },
    "US-VT": {
      "name": "Vermont",
      "abbr": "VT",
      "financial_anxiety": {
        "value": 94,
        "change": 0,
        "rank": 49
      },
      "food_insecurity": {
        "value": 104,
        "change": 9.2,
        "rank": 50
      },
      "housing_stress": {
        "value": 234,
        "change": 19.9,
        "rank": 31
      },
      "affordability": {
        "value": 175,
        "change": 8.7,
        "rank": 35
      },
      "metrics": {
        "unemployment_rate": 2.5,
        "poverty_rate": null,
        "median_rent": null,
        "housing_price_change": 19.89621758520069,
        "regional_stress_multiplier": 0.92
      }
    },
    "US-VA": {
      "name": "Virginia",
      "abbr": "VA",
      "financial_anxiety": {
        "value": 118,
        "change": 20.7,
        "rank": 40
      },
      "food_insecurity": {
        "value": 114,
        "change": 8,
        "rank": 43
      },
      "housing_stress": {
        "value": 247,
        "change": 17.9,
        "rank": 22
      },
      "affordability": {
        "value": 185,
        "change": 5.3,
        "rank": 26
      },
      "metrics": {
        "unemployment_rate": 3.5,
        "poverty_rate": null,
        "median_rent": null,
        "housing_price_change": 17.85631356522547,
        "regional_stress_multiplier": 0.98
      }
    },
    "US-WA": {
      "name": "Washington",
      "abbr": "WA",
      "financial_anxiety": {
        "value": 141,
        "change": 2.3,
        "rank": 21
      },
      "food_insecurity": {
        "value": 129,
        "change": 9,
        "rank": 23
      },
      "housing_stress": {
        "value": 199,
        "change": 6.6,
        "rank": 41
      },
      "affordability": {
        "value": 158,
        "change": 4.6,
        "rank": 39
      },
      "metrics": {
        "unemployment_rate": 4.5,
        "poverty_rate": null,
        "median_rent": null,
        "housing_price_change": 6.628334962257481,
        "regional_stress_multiplier": 1.02
      }
    },
    "US-WV": {
      "name": "West Virginia",
      "abbr": "WV",
      "financial_anxiety": {
        "value": 165,
        "change": -2.4,
        "rank": 7
      },
      "food_insecurity": {
        "value": 156,
        "change": 6.1,
        "rank": 3
      },
      "housing_stress": {
        "value": 250,
        "change": 18.2,
        "rank": 19
      },
      "affordability": {
        "value": 199,
        "change": 8,
        "rank": 2
      },
      "metrics": {
        "unemployment_rate": 4,
        "poverty_rate": null,
        "median_rent": null,
        "housing_price_change": 18.228352999833795,
        "regional_stress_multiplier": 1.28
      }
    },
    "US-WI": {
      "name": "Wisconsin",
      "abbr": "WI",
      "financial_anxiety": {
        "value": 107,
        "change": 3.3,
        "rank": 46
      },
      "food_insecurity": {
        "value": 121,
        "change": 3.3,
        "rank": 35
      },
      "housing_stress": {
        "value": 250,
        "change": 22.6,
        "rank": 20
      },
      "affordability": {
        "value": 186,
        "change": 7.7,
        "rank": 23
      },
      "metrics": {
        "unemployment_rate": 3.1,
        "poverty_rate": null,
        "median_rent": null,
        "housing_price_change": 22.579817672362775,
        "regional_stress_multiplier": 0.95
      }
    },
    "US-WY": {
      "name": "Wyoming",
      "abbr": "WY",
      "financial_anxiety": {
        "value": 111,
        "change": -5.7,
        "rank": 44
      },
      "food_insecurity": {
        "value": 108,
        "change": 7.9,
        "rank": 46
      },
      "housing_stress": {
        "value": 200,
        "change": 12.6,
        "rank": 40
      },
      "affordability": {
        "value": 156,
        "change": 4.7,
        "rank": 42
      },
      "metrics": {
        "unemployment_rate": 3.3,
        "poverty_rate": null,
        "median_rent": null,
        "housing_price_change": 12.63262380059556,
        "regional_stress_multiplier": 0.95
      }
    }
  },
  "timeseries": {
    "national": {
      "financial_anxiety": [
        {
          "date": "2025-07-01",
          "value": 117
        },
        {
          "date": "2025-08-01",
          "value": 120
        },
        {
          "date": "2025-09-01",
          "value": 125
        },
        {
          "date": "2025-10-01",
          "value": 129
        },
        {
          "date": "2025-11-01",
          "value": 134
        },
        {
          "date": "2025-12-01",
          "value": 139
        }
      ],
      "food_insecurity": [
        {
          "date": "2025-07-01",
          "value": 111
        },
        {
          "date": "2025-08-01",
          "value": 113
        },
        {
          "date": "2025-09-01",
          "value": 117
        },
        {
          "date": "2025-10-01",
          "value": 120
        },
        {
          "date": "2025-11-01",
          "value": 125
        },
        {
          "date": "2025-12-01",
          "value": 129
        }
      ],
      "housing_stress": [
        {
          "date": "2025-07-01",
          "value": 196
        },
        {
          "date": "2025-08-01",
          "value": 201
        },
        {
          "date": "2025-09-01",
          "value": 212
        },
        {
          "date": "2025-10-01",
          "value": 214
        },
        {
          "date": "2025-11-01",
          "value": 222
        },
        {
          "date": "2025-12-01",
          "value": 230
        }
      ],
      "affordability": [
        {
          "date": "2025-07-01",
          "value": 151
        },
        {
          "date": "2025-08-01",
          "value": 158
        },
        {
          "date": "2025-09-01",
          "value": 163
        },
        {
          "date": "2025-10-01",
          "value": 169
        },
        {
          "date": "2025-11-01",
          "value": 175
        },
        {
          "date": "2025-12-01",
          "value": 181
        }
      ]
    }
  }
};

if (typeof window !== 'undefined') window.DASHBOARD_DATA = DASHBOARD_DATA;
if (typeof module !== 'undefined') module.exports = DASHBOARD_DATA;
