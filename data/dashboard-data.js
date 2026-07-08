// Financial Health Barometer Data
// Auto-generated: 2026-07-08T06:03:49.154Z
// Sources: BLS, FRED, Census Bureau, HUD, Harvard JCHS, Google Trends APIs

const DASHBOARD_DATA = {
  "as_of": "2026-07-08",
  "meta": {
    "generated": "2026-07-08T06:03:49.122Z",
    "version": "2.4",
    "source": "BLS, FRED, Census Bureau, HUD, Harvard JCHS, Google Trends APIs",
    "update_frequency": "daily",
    "data_sources": {
      "unemployment": "BLS LAUS",
      "housing_prices": "FRED HPI",
      "poverty": "Census SAIPE",
      "rent_burden": "Census ACS B25071",
      "fair_market_rent": "NLIHC OOR 2025 (fallback)",
      "housing_wage": "NLIHC OOR 2025 (fallback)",
      "jchs_calibration": "Harvard JCHS State of the Nation's Housing 2025",
      "trends": "Google Trends"
    },
    "augmented_at": "2026-07-08T06:03:49.153Z"
  },
  "national": {
    "financial_anxiety": {
      "value": 139.5,
      "change": 4.2,
      "trend": "up"
    },
    "food_insecurity": {
      "value": 103.4,
      "change": 0,
      "trend": "up"
    },
    "housing_stress": {
      "value": 156.5,
      "change": 15.8,
      "trend": "up"
    },
    "affordability": {
      "value": 135.2,
      "change": 0,
      "trend": "up"
    }
  },
  "states": {
    "US-AL": {
      "name": "Alabama",
      "abbr": "AL",
      "financial_anxiety": {
        "value": 139,
        "change": 3.4,
        "rank": 26
      },
      "food_insecurity": {
        "value": 145,
        "change": 0,
        "rank": 5
      },
      "housing_stress": {
        "value": 167,
        "change": 14.1,
        "rank": 13
      },
      "affordability": {
        "value": 158,
        "change": 0,
        "rank": 6
      },
      "metrics": {
        "unemployment_rate": 3,
        "poverty_rate": 15.2,
        "rent_burden_pct": 29.3,
        "rent_burden_source": "census_acs",
        "fair_market_rent_2br": 980,
        "fmr_source": "jchs_2025",
        "housing_price_change": 14.101454476367401,
        "regional_stress_multiplier": 1.25,
        "jchs_renters_cost_burdened": 47.7,
        "jchs_renters_severely_burdened": 25,
        "jchs_median_rent": 980
      },
      "rent_burden": {
        "value": 29.3,
        "source": "ACS B25071 2024"
      },
      "fmr_2br": {
        "value": 1072,
        "source": "NLIHC OOR 2025 (fallback)"
      },
      "housing_wage": {
        "value": 20.62,
        "source": "NLIHC OOR 2025 (fallback)"
      }
    },
    "US-AK": {
      "name": "Alaska",
      "abbr": "AK",
      "financial_anxiety": {
        "value": 151,
        "change": 0,
        "rank": 20
      },
      "food_insecurity": {
        "value": 94,
        "change": 0,
        "rank": 29
      },
      "housing_stress": {
        "value": 155,
        "change": 17,
        "rank": 27
      },
      "affordability": {
        "value": 131,
        "change": 0,
        "rank": 27
      },
      "metrics": {
        "unemployment_rate": 4.6,
        "poverty_rate": 10.3,
        "rent_burden_pct": 26.5,
        "rent_burden_source": "census_acs",
        "fair_market_rent_2br": 1350,
        "fmr_source": "jchs_2025",
        "housing_price_change": 17.03766718654,
        "regional_stress_multiplier": 1.08,
        "jchs_renters_cost_burdened": 41.9,
        "jchs_renters_severely_burdened": 18.4,
        "jchs_median_rent": 1350
      },
      "rent_burden": {
        "value": 26.5,
        "source": "ACS B25071 2024"
      },
      "fmr_2br": {
        "value": 1546,
        "source": "NLIHC OOR 2025 (fallback)"
      },
      "housing_wage": {
        "value": 29.73,
        "source": "NLIHC OOR 2025 (fallback)"
      }
    },
    "US-AZ": {
      "name": "Arizona",
      "abbr": "AZ",
      "financial_anxiety": {
        "value": 158,
        "change": 11.6,
        "rank": 14
      },
      "food_insecurity": {
        "value": 106,
        "change": 0,
        "rank": 21
      },
      "housing_stress": {
        "value": 160,
        "change": 10.4,
        "rank": 19
      },
      "affordability": {
        "value": 138,
        "change": 0,
        "rank": 23
      },
      "metrics": {
        "unemployment_rate": 4.8,
        "poverty_rate": 11.9,
        "rent_burden_pct": 31.2,
        "rent_burden_source": "census_acs",
        "fair_market_rent_2br": 1390,
        "fmr_source": "jchs_2025",
        "housing_price_change": 10.376918797828994,
        "regional_stress_multiplier": 1.1,
        "jchs_renters_cost_burdened": 50.9,
        "jchs_renters_severely_burdened": 24.2,
        "jchs_median_rent": 1390
      },
      "rent_burden": {
        "value": 31.2,
        "source": "ACS B25071 2024"
      },
      "fmr_2br": {
        "value": 1778,
        "source": "NLIHC OOR 2025 (fallback)"
      },
      "housing_wage": {
        "value": 34.19,
        "source": "NLIHC OOR 2025 (fallback)"
      }
    },
    "US-AR": {
      "name": "Arkansas",
      "abbr": "AR",
      "financial_anxiety": {
        "value": 162,
        "change": 5,
        "rank": 10
      },
      "food_insecurity": {
        "value": 142,
        "change": 0,
        "rank": 6
      },
      "housing_stress": {
        "value": 156,
        "change": 15.3,
        "rank": 25
      },
      "affordability": {
        "value": 150,
        "change": 0,
        "rank": 13
      },
      "metrics": {
        "unemployment_rate": 4.2,
        "poverty_rate": 15.3,
        "rent_burden_pct": 28.1,
        "rent_burden_source": "census_acs",
        "fair_market_rent_2br": 850,
        "fmr_source": "jchs_2025",
        "housing_price_change": 15.292133477894222,
        "regional_stress_multiplier": 1.22,
        "jchs_renters_cost_burdened": 46.4,
        "jchs_renters_severely_burdened": 24,
        "jchs_median_rent": 850
      },
      "rent_burden": {
        "value": 28.1,
        "source": "ACS B25071 2024"
      },
      "fmr_2br": {
        "value": 987,
        "source": "NLIHC OOR 2025 (fallback)"
      },
      "housing_wage": {
        "value": 18.98,
        "source": "NLIHC OOR 2025 (fallback)"
      }
    },
    "US-CA": {
      "name": "California",
      "abbr": "CA",
      "financial_anxiety": {
        "value": 171,
        "change": -3.6,
        "rank": 4
      },
      "food_insecurity": {
        "value": 107,
        "change": 0,
        "rank": 18
      },
      "housing_stress": {
        "value": 187,
        "change": 10.4,
        "rank": 4
      },
      "affordability": {
        "value": 155,
        "change": 0,
        "rank": 8
      },
      "metrics": {
        "unemployment_rate": 5.3,
        "poverty_rate": 11.8,
        "rent_burden_pct": 33.1,
        "rent_burden_source": "census_acs",
        "fair_market_rent_2br": 1850,
        "fmr_source": "jchs_2025",
        "housing_price_change": 10.410426251003166,
        "regional_stress_multiplier": 1.12,
        "jchs_renters_cost_burdened": 55.8,
        "jchs_renters_severely_burdened": 28.7,
        "jchs_median_rent": 1850
      },
      "rent_burden": {
        "value": 33.1,
        "source": "ACS B25071 2024"
      },
      "fmr_2br": {
        "value": 2580,
        "source": "NLIHC OOR 2025 (fallback)"
      },
      "housing_wage": {
        "value": 49.62,
        "source": "NLIHC OOR 2025 (fallback)"
      }
    },
    "US-CO": {
      "name": "Colorado",
      "abbr": "CO",
      "financial_anxiety": {
        "value": 130,
        "change": -4.9,
        "rank": 34
      },
      "food_insecurity": {
        "value": 84,
        "change": 0,
        "rank": 39
      },
      "housing_stress": {
        "value": 149,
        "change": 6.2,
        "rank": 35
      },
      "affordability": {
        "value": 123,
        "change": 0,
        "rank": 39
      },
      "metrics": {
        "unemployment_rate": 3.9,
        "poverty_rate": 9.6,
        "rent_burden_pct": 31.2,
        "rent_burden_source": "census_acs",
        "fair_market_rent_2br": 1650,
        "fmr_source": "jchs_2025",
        "housing_price_change": 6.157341875884679,
        "regional_stress_multiplier": 1.02,
        "jchs_renters_cost_burdened": 51.5,
        "jchs_renters_severely_burdened": 24,
        "jchs_median_rent": 1650
      },
      "rent_burden": {
        "value": 31.2,
        "source": "ACS B25071 2024"
      },
      "fmr_2br": {
        "value": 1913,
        "source": "NLIHC OOR 2025 (fallback)"
      },
      "housing_wage": {
        "value": 36.79,
        "source": "NLIHC OOR 2025 (fallback)"
      }
    },
    "US-CT": {
      "name": "Connecticut",
      "abbr": "CT",
      "financial_anxiety": {
        "value": 152,
        "change": 34.2,
        "rank": 19
      },
      "food_insecurity": {
        "value": 87,
        "change": 0,
        "rank": 33
      },
      "housing_stress": {
        "value": 186,
        "change": 27,
        "rank": 6
      },
      "affordability": {
        "value": 146,
        "change": 0,
        "rank": 16
      },
      "metrics": {
        "unemployment_rate": 5.1,
        "poverty_rate": 10.1,
        "rent_burden_pct": 32.1,
        "rent_burden_source": "census_acs",
        "fair_market_rent_2br": 1400,
        "fmr_source": "jchs_2025",
        "housing_price_change": 27.01030927835051,
        "regional_stress_multiplier": 1.02,
        "jchs_renters_cost_burdened": 50.5,
        "jchs_renters_severely_burdened": 27.3,
        "jchs_median_rent": 1400
      },
      "rent_burden": {
        "value": 32.1,
        "source": "ACS B25071 2024"
      },
      "fmr_2br": {
        "value": 1842,
        "source": "NLIHC OOR 2025 (fallback)"
      },
      "housing_wage": {
        "value": 35.42,
        "source": "NLIHC OOR 2025 (fallback)"
      }
    },
    "US-DE": {
      "name": "Delaware",
      "abbr": "DE",
      "financial_anxiety": {
        "value": 149,
        "change": 13.3,
        "rank": 22
      },
      "food_insecurity": {
        "value": 86,
        "change": 0,
        "rank": 36
      },
      "housing_stress": {
        "value": 152,
        "change": 17,
        "rank": 32
      },
      "affordability": {
        "value": 126,
        "change": 0,
        "rank": 36
      },
      "metrics": {
        "unemployment_rate": 5.1,
        "poverty_rate": 10.1,
        "rent_burden_pct": 30.1,
        "rent_burden_source": "census_acs",
        "fair_market_rent_2br": 1275,
        "fmr_source": "jchs_2025",
        "housing_price_change": 17.00374305723257,
        "regional_stress_multiplier": 1,
        "jchs_renters_cost_burdened": 49.7,
        "jchs_renters_severely_burdened": 24.8,
        "jchs_median_rent": 1275
      },
      "rent_burden": {
        "value": 30.1,
        "source": "ACS B25071 2024"
      },
      "fmr_2br": {
        "value": 1674,
        "source": "NLIHC OOR 2025 (fallback)"
      },
      "housing_wage": {
        "value": 32.19,
        "source": "NLIHC OOR 2025 (fallback)"
      }
    },
    "US-DC": {
      "name": "District of Columbia",
      "abbr": "DC",
      "financial_anxiety": {
        "value": 197,
        "change": 0,
        "rank": 1
      },
      "food_insecurity": {
        "value": 146,
        "change": 0,
        "rank": 4
      },
      "housing_stress": {
        "value": 159,
        "change": 2.3,
        "rank": 21
      },
      "affordability": {
        "value": 154,
        "change": 0,
        "rank": 10
      },
      "metrics": {
        "unemployment_rate": 6.1,
        "poverty_rate": 16.4,
        "rent_burden_pct": 29,
        "rent_burden_source": "census_acs",
        "fair_market_rent_2br": 1750,
        "fmr_source": "jchs_2025",
        "housing_price_change": 2.33419606862113,
        "regional_stress_multiplier": 1.18,
        "jchs_renters_cost_burdened": 46.2,
        "jchs_renters_severely_burdened": 21.5,
        "jchs_median_rent": 1750
      },
      "rent_burden": {
        "value": 29,
        "source": "ACS B25071 2024"
      },
      "fmr_2br": {
        "value": 2314,
        "source": "NLIHC OOR 2025 (fallback)"
      },
      "housing_wage": {
        "value": 44.5,
        "source": "NLIHC OOR 2025 (fallback)"
      }
    },
    "US-FL": {
      "name": "Florida",
      "abbr": "FL",
      "financial_anxiety": {
        "value": 165,
        "change": 29.7,
        "rank": 8
      },
      "food_insecurity": {
        "value": 112,
        "change": 0,
        "rank": 14
      },
      "housing_stress": {
        "value": 187,
        "change": 8.9,
        "rank": 5
      },
      "affordability": {
        "value": 157,
        "change": 0,
        "rank": 7
      },
      "metrics": {
        "unemployment_rate": 4.8,
        "poverty_rate": 12.1,
        "rent_burden_pct": 36.1,
        "rent_burden_source": "census_acs",
        "fair_market_rent_2br": 1550,
        "fmr_source": "jchs_2025",
        "housing_price_change": 8.898622785209737,
        "regional_stress_multiplier": 1.15,
        "jchs_renters_cost_burdened": 57.2,
        "jchs_renters_severely_burdened": 29.6,
        "jchs_median_rent": 1550
      },
      "rent_burden": {
        "value": 36.1,
        "source": "ACS B25071 2024"
      },
      "fmr_2br": {
        "value": 1938,
        "source": "NLIHC OOR 2025 (fallback)"
      },
      "housing_wage": {
        "value": 37.27,
        "source": "NLIHC OOR 2025 (fallback)"
      }
    },
    "US-GA": {
      "name": "Georgia",
      "abbr": "GA",
      "financial_anxiety": {
        "value": 130,
        "change": 3,
        "rank": 35
      },
      "food_insecurity": {
        "value": 112,
        "change": 0,
        "rank": 15
      },
      "housing_stress": {
        "value": 165,
        "change": 13.8,
        "rank": 16
      },
      "affordability": {
        "value": 144,
        "change": 0,
        "rank": 18
      },
      "metrics": {
        "unemployment_rate": 3.4,
        "poverty_rate": 12.8,
        "rent_burden_pct": 31.6,
        "rent_burden_source": "census_acs",
        "fair_market_rent_2br": 1275,
        "fmr_source": "jchs_2025",
        "housing_price_change": 13.82695250047275,
        "regional_stress_multiplier": 1.1,
        "jchs_renters_cost_burdened": 51.6,
        "jchs_renters_severely_burdened": 25.8,
        "jchs_median_rent": 1275
      },
      "rent_burden": {
        "value": 31.6,
        "source": "ACS B25071 2024"
      },
      "fmr_2br": {
        "value": 1532,
        "source": "NLIHC OOR 2025 (fallback)"
      },
      "housing_wage": {
        "value": 29.46,
        "source": "NLIHC OOR 2025 (fallback)"
      }
    },
    "US-HI": {
      "name": "Hawaii",
      "abbr": "HI",
      "financial_anxiety": {
        "value": 122,
        "change": 4.2,
        "rank": 40
      },
      "food_insecurity": {
        "value": 102,
        "change": 0,
        "rank": 23
      },
      "housing_stress": {
        "value": 200,
        "change": 10.9,
        "rank": 1
      },
      "affordability": {
        "value": 161,
        "change": 0,
        "rank": 5
      },
      "metrics": {
        "unemployment_rate": 2.5,
        "poverty_rate": 10,
        "rent_burden_pct": 32.6,
        "rent_burden_source": "census_acs",
        "fair_market_rent_2br": 1950,
        "fmr_source": "jchs_2025",
        "housing_price_change": 10.855570069042722,
        "regional_stress_multiplier": 1.2,
        "jchs_renters_cost_burdened": 56.5,
        "jchs_renters_severely_burdened": 29.5,
        "jchs_median_rent": 1950
      },
      "rent_burden": {
        "value": 32.6,
        "source": "ACS B25071 2024"
      },
      "fmr_2br": {
        "value": 2558,
        "source": "NLIHC OOR 2025 (fallback)"
      },
      "housing_wage": {
        "value": 49.19,
        "source": "NLIHC OOR 2025 (fallback)"
      }
    },
    "US-ID": {
      "name": "Idaho",
      "abbr": "ID",
      "financial_anxiety": {
        "value": 130,
        "change": 2.8,
        "rank": 36
      },
      "food_insecurity": {
        "value": 92,
        "change": 0,
        "rank": 30
      },
      "housing_stress": {
        "value": 141,
        "change": 10.6,
        "rank": 43
      },
      "affordability": {
        "value": 121,
        "change": 0,
        "rank": 40
      },
      "metrics": {
        "unemployment_rate": 3.7,
        "poverty_rate": 10.4,
        "rent_burden_pct": 29.3,
        "rent_burden_source": "census_acs",
        "fair_market_rent_2br": 1200,
        "fmr_source": "jchs_2025",
        "housing_price_change": 10.561285831804094,
        "regional_stress_multiplier": 1.05,
        "jchs_renters_cost_burdened": 47.8,
        "jchs_renters_severely_burdened": 21.5,
        "jchs_median_rent": 1200
      },
      "rent_burden": {
        "value": 29.3,
        "source": "ACS B25071 2024"
      },
      "fmr_2br": {
        "value": 1447,
        "source": "NLIHC OOR 2025 (fallback)"
      },
      "housing_wage": {
        "value": 27.83,
        "source": "NLIHC OOR 2025 (fallback)"
      }
    },
    "US-IL": {
      "name": "Illinois",
      "abbr": "IL",
      "financial_anxiety": {
        "value": 156,
        "change": 15.9,
        "rank": 16
      },
      "food_insecurity": {
        "value": 99,
        "change": 0,
        "rank": 26
      },
      "housing_stress": {
        "value": 166,
        "change": 23.1,
        "rank": 14
      },
      "affordability": {
        "value": 139,
        "change": 0,
        "rank": 22
      },
      "metrics": {
        "unemployment_rate": 5.1,
        "poverty_rate": 11.5,
        "rent_burden_pct": 29.4,
        "rent_burden_source": "census_acs",
        "fair_market_rent_2br": 1175,
        "fmr_source": "jchs_2025",
        "housing_price_change": 23.083796885820888,
        "regional_stress_multiplier": 1.05,
        "jchs_renters_cost_burdened": 50.2,
        "jchs_renters_severely_burdened": 25,
        "jchs_median_rent": 1175
      },
      "rent_burden": {
        "value": 29.4,
        "source": "ACS B25071 2024"
      },
      "fmr_2br": {
        "value": 1550,
        "source": "NLIHC OOR 2025 (fallback)"
      },
      "housing_wage": {
        "value": 29.81,
        "source": "NLIHC OOR 2025 (fallback)"
      }
    },
    "US-IN": {
      "name": "Indiana",
      "abbr": "IN",
      "financial_anxiety": {
        "value": 121,
        "change": -10.8,
        "rank": 41
      },
      "food_insecurity": {
        "value": 102,
        "change": 0,
        "rank": 24
      },
      "housing_stress": {
        "value": 150,
        "change": 19.2,
        "rank": 34
      },
      "affordability": {
        "value": 131,
        "change": 0,
        "rank": 28
      },
      "metrics": {
        "unemployment_rate": 3.3,
        "poverty_rate": 12.1,
        "rent_burden_pct": 29.3,
        "rent_burden_source": "census_acs",
        "fair_market_rent_2br": 975,
        "fmr_source": "jchs_2025",
        "housing_price_change": 19.17558693892238,
        "regional_stress_multiplier": 1.04,
        "jchs_renters_cost_burdened": 47.3,
        "jchs_renters_severely_burdened": 23.2,
        "jchs_median_rent": 975
      },
      "rent_burden": {
        "value": 29.3,
        "source": "ACS B25071 2024"
      },
      "fmr_2br": {
        "value": 1153,
        "source": "NLIHC OOR 2025 (fallback)"
      },
      "housing_wage": {
        "value": 22.17,
        "source": "NLIHC OOR 2025 (fallback)"
      }
    },
    "US-IA": {
      "name": "Iowa",
      "abbr": "IA",
      "financial_anxiety": {
        "value": 105,
        "change": -11.1,
        "rank": 46
      },
      "food_insecurity": {
        "value": 85,
        "change": 0,
        "rank": 37
      },
      "housing_stress": {
        "value": 115,
        "change": 14.8,
        "rank": 49
      },
      "affordability": {
        "value": 103,
        "change": 0,
        "rank": 49
      },
      "metrics": {
        "unemployment_rate": 3.2,
        "poverty_rate": 11.2,
        "rent_burden_pct": 27.2,
        "rent_burden_source": "census_acs",
        "fair_market_rent_2br": 875,
        "fmr_source": "jchs_2025",
        "housing_price_change": 14.794676994885556,
        "regional_stress_multiplier": 0.92,
        "jchs_renters_cost_burdened": 42.8,
        "jchs_renters_severely_burdened": 20.5,
        "jchs_median_rent": 875
      },
      "rent_burden": {
        "value": 27.2,
        "source": "ACS B25071 2024"
      },
      "fmr_2br": {
        "value": 1040,
        "source": "NLIHC OOR 2025 (fallback)"
      },
      "housing_wage": {
        "value": 20,
        "source": "NLIHC OOR 2025 (fallback)"
      }
    },
    "US-KS": {
      "name": "Kansas",
      "abbr": "KS",
      "financial_anxiety": {
        "value": 125,
        "change": 0,
        "rank": 38
      },
      "food_insecurity": {
        "value": 90,
        "change": 0,
        "rank": 31
      },
      "housing_stress": {
        "value": 138,
        "change": 20,
        "rank": 45
      },
      "affordability": {
        "value": 119,
        "change": 0,
        "rank": 41
      },
      "metrics": {
        "unemployment_rate": 3.8,
        "poverty_rate": 10.9,
        "rent_burden_pct": 27.1,
        "rent_burden_source": "census_acs",
        "fair_market_rent_2br": 950,
        "fmr_source": "jchs_2025",
        "housing_price_change": 19.952150725215574,
        "regional_stress_multiplier": 1,
        "jchs_renters_cost_burdened": 44.5,
        "jchs_renters_severely_burdened": 21,
        "jchs_median_rent": 950
      },
      "rent_burden": {
        "value": 27.1,
        "source": "ACS B25071 2024"
      },
      "fmr_2br": {
        "value": 1085,
        "source": "NLIHC OOR 2025 (fallback)"
      },
      "housing_wage": {
        "value": 20.87,
        "source": "NLIHC OOR 2025 (fallback)"
      }
    },
    "US-KY": {
      "name": "Kentucky",
      "abbr": "KY",
      "financial_anxiety": {
        "value": 163,
        "change": -4.3,
        "rank": 9
      },
      "food_insecurity": {
        "value": 139,
        "change": 0,
        "rank": 8
      },
      "housing_stress": {
        "value": 159,
        "change": 18,
        "rank": 22
      },
      "affordability": {
        "value": 151,
        "change": 0,
        "rank": 12
      },
      "metrics": {
        "unemployment_rate": 4.5,
        "poverty_rate": 15.4,
        "rent_burden_pct": 27.9,
        "rent_burden_source": "census_acs",
        "fair_market_rent_2br": 900,
        "fmr_source": "jchs_2025",
        "housing_price_change": 18.04229681043781,
        "regional_stress_multiplier": 1.18,
        "jchs_renters_cost_burdened": 46.8,
        "jchs_renters_severely_burdened": 24.5,
        "jchs_median_rent": 900
      },
      "rent_burden": {
        "value": 27.9,
        "source": "ACS B25071 2024"
      },
      "fmr_2br": {
        "value": 1116,
        "source": "NLIHC OOR 2025 (fallback)"
      },
      "housing_wage": {
        "value": 21.46,
        "source": "NLIHC OOR 2025 (fallback)"
      }
    },
    "US-LA": {
      "name": "Louisiana",
      "abbr": "LA",
      "financial_anxiety": {
        "value": 179,
        "change": 4.7,
        "rank": 2
      },
      "food_insecurity": {
        "value": 160,
        "change": 0,
        "rank": 1
      },
      "housing_stress": {
        "value": 166,
        "change": 6.3,
        "rank": 15
      },
      "affordability": {
        "value": 164,
        "change": 0,
        "rank": 3
      },
      "metrics": {
        "unemployment_rate": 4.5,
        "poverty_rate": 18.6,
        "rent_burden_pct": 32.5,
        "rent_burden_source": "census_acs",
        "fair_market_rent_2br": 975,
        "fmr_source": "jchs_2025",
        "housing_price_change": 6.27819124943617,
        "regional_stress_multiplier": 1.3,
        "jchs_renters_cost_burdened": 52.5,
        "jchs_renters_severely_burdened": 28.2,
        "jchs_median_rent": 975
      },
      "rent_burden": {
        "value": 32.5,
        "source": "ACS B25071 2024"
      },
      "fmr_2br": {
        "value": 1190,
        "source": "NLIHC OOR 2025 (fallback)"
      },
      "housing_wage": {
        "value": 22.88,
        "source": "NLIHC OOR 2025 (fallback)"
      }
    },
    "US-ME": {
      "name": "Maine",
      "abbr": "ME",
      "financial_anxiety": {
        "value": 107,
        "change": -6.1,
        "rank": 45
      },
      "food_insecurity": {
        "value": 84,
        "change": 0,
        "rank": 40
      },
      "housing_stress": {
        "value": 151,
        "change": 22,
        "rank": 33
      },
      "affordability": {
        "value": 124,
        "change": 0,
        "rank": 38
      },
      "metrics": {
        "unemployment_rate": 3.1,
        "poverty_rate": 10.6,
        "rent_burden_pct": 30.1,
        "rent_burden_source": "census_acs",
        "fair_market_rent_2br": 1175,
        "fmr_source": "jchs_2025",
        "housing_price_change": 21.99828018800138,
        "regional_stress_multiplier": 0.95,
        "jchs_renters_cost_burdened": 48.2,
        "jchs_renters_severely_burdened": 24.5,
        "jchs_median_rent": 1175
      },
      "rent_burden": {
        "value": 30.1,
        "source": "ACS B25071 2024"
      },
      "fmr_2br": {
        "value": 1478,
        "source": "NLIHC OOR 2025 (fallback)"
      },
      "housing_wage": {
        "value": 28.42,
        "source": "NLIHC OOR 2025 (fallback)"
      }
    },
    "US-MD": {
      "name": "Maryland",
      "abbr": "MD",
      "financial_anxiety": {
        "value": 136,
        "change": 10,
        "rank": 27
      },
      "food_insecurity": {
        "value": 80,
        "change": 0,
        "rank": 46
      },
      "housing_stress": {
        "value": 160,
        "change": 14.9,
        "rank": 20
      },
      "affordability": {
        "value": 128,
        "change": 0,
        "rank": 32
      },
      "metrics": {
        "unemployment_rate": 4.4,
        "poverty_rate": 9.2,
        "rent_burden_pct": 30.8,
        "rent_burden_source": "census_acs",
        "fair_market_rent_2br": 1600,
        "fmr_source": "jchs_2025",
        "housing_price_change": 14.861308280031277,
        "regional_stress_multiplier": 1,
        "jchs_renters_cost_burdened": 49.5,
        "jchs_renters_severely_burdened": 24.2,
        "jchs_median_rent": 1600
      },
      "rent_burden": {
        "value": 30.8,
        "source": "ACS B25071 2024"
      },
      "fmr_2br": {
        "value": 2036,
        "source": "NLIHC OOR 2025 (fallback)"
      },
      "housing_wage": {
        "value": 39.15,
        "source": "NLIHC OOR 2025 (fallback)"
      }
    },
    "US-MA": {
      "name": "Massachusetts",
      "abbr": "MA",
      "financial_anxiety": {
        "value": 141,
        "change": 2.3,
        "rank": 24
      },
      "food_insecurity": {
        "value": 85,
        "change": 0,
        "rank": 38
      },
      "housing_stress": {
        "value": 178,
        "change": 18.7,
        "rank": 9
      },
      "affordability": {
        "value": 141,
        "change": 0,
        "rank": 20
      },
      "metrics": {
        "unemployment_rate": 4.5,
        "poverty_rate": 9.8,
        "rent_burden_pct": 31.1,
        "rent_burden_source": "census_acs",
        "fair_market_rent_2br": 1750,
        "fmr_source": "jchs_2025",
        "housing_price_change": 18.712244528847897,
        "regional_stress_multiplier": 1.02,
        "jchs_renters_cost_burdened": 50.8,
        "jchs_renters_severely_burdened": 26.5,
        "jchs_median_rent": 1750
      },
      "rent_burden": {
        "value": 31.1,
        "source": "ACS B25071 2024"
      },
      "fmr_2br": {
        "value": 2387,
        "source": "NLIHC OOR 2025 (fallback)"
      },
      "housing_wage": {
        "value": 45.9,
        "source": "NLIHC OOR 2025 (fallback)"
      }
    },
    "US-MI": {
      "name": "Michigan",
      "abbr": "MI",
      "financial_anxiety": {
        "value": 161,
        "change": 0,
        "rank": 11
      },
      "food_insecurity": {
        "value": 114,
        "change": 0,
        "rank": 13
      },
      "housing_stress": {
        "value": 168,
        "change": 21.4,
        "rank": 12
      },
      "affordability": {
        "value": 146,
        "change": 0,
        "rank": 17
      },
      "metrics": {
        "unemployment_rate": 5.1,
        "poverty_rate": 13.4,
        "rent_burden_pct": 30.7,
        "rent_burden_source": "census_acs",
        "fair_market_rent_2br": 1075,
        "fmr_source": "jchs_2025",
        "housing_price_change": 21.428722526600797,
        "regional_stress_multiplier": 1.08,
        "jchs_renters_cost_burdened": 49.2,
        "jchs_renters_severely_burdened": 25,
        "jchs_median_rent": 1075
      },
      "rent_burden": {
        "value": 30.7,
        "source": "ACS B25071 2024"
      },
      "fmr_2br": {
        "value": 1272,
        "source": "NLIHC OOR 2025 (fallback)"
      },
      "housing_wage": {
        "value": 24.46,
        "source": "NLIHC OOR 2025 (fallback)"
      }
    },
    "US-MN": {
      "name": "Minnesota",
      "abbr": "MN",
      "financial_anxiety": {
        "value": 153,
        "change": 18.9,
        "rank": 18
      },
      "food_insecurity": {
        "value": 90,
        "change": 0,
        "rank": 32
      },
      "housing_stress": {
        "value": 153,
        "change": 13,
        "rank": 31
      },
      "affordability": {
        "value": 128,
        "change": 0,
        "rank": 33
      },
      "metrics": {
        "unemployment_rate": 4.4,
        "poverty_rate": 9.3,
        "rent_burden_pct": 29.1,
        "rent_burden_source": "census_acs",
        "fair_market_rent_2br": 1150,
        "fmr_source": "jchs_2025",
        "housing_price_change": 12.98980641541196,
        "regional_stress_multiplier": 1.12,
        "jchs_renters_cost_burdened": 46.5,
        "jchs_renters_severely_burdened": 22.8,
        "jchs_median_rent": 1150
      },
      "rent_burden": {
        "value": 29.1,
        "source": "ACS B25071 2024"
      },
      "fmr_2br": {
        "value": 1468,
        "source": "NLIHC OOR 2025 (fallback)"
      },
      "housing_wage": {
        "value": 28.23,
        "source": "NLIHC OOR 2025 (fallback)"
      }
    },
    "US-MS": {
      "name": "Mississippi",
      "abbr": "MS",
      "financial_anxiety": {
        "value": 169,
        "change": -2.6,
        "rank": 6
      },
      "food_insecurity": {
        "value": 160,
        "change": 0,
        "rank": 2
      },
      "housing_stress": {
        "value": 182,
        "change": 14,
        "rank": 7
      },
      "affordability": {
        "value": 173,
        "change": 0,
        "rank": 1
      },
      "metrics": {
        "unemployment_rate": 3.8,
        "poverty_rate": 17.8,
        "rent_burden_pct": 30.2,
        "rent_burden_source": "census_acs",
        "fair_market_rent_2br": 925,
        "fmr_source": "jchs_2025",
        "housing_price_change": 14.035323530202417,
        "regional_stress_multiplier": 1.35,
        "jchs_renters_cost_burdened": 52,
        "jchs_renters_severely_burdened": 29,
        "jchs_median_rent": 925
      },
      "rent_burden": {
        "value": 30.2,
        "source": "ACS B25071 2024"
      },
      "fmr_2br": {
        "value": 1081,
        "source": "NLIHC OOR 2025 (fallback)"
      },
      "housing_wage": {
        "value": 20.79,
        "source": "NLIHC OOR 2025 (fallback)"
      }
    },
    "US-MO": {
      "name": "Missouri",
      "abbr": "MO",
      "financial_anxiety": {
        "value": 132,
        "change": -5,
        "rank": 31
      },
      "food_insecurity": {
        "value": 103,
        "change": 0,
        "rank": 22
      },
      "housing_stress": {
        "value": 145,
        "change": 18.3,
        "rank": 40
      },
      "affordability": {
        "value": 128,
        "change": 0,
        "rank": 34
      },
      "metrics": {
        "unemployment_rate": 3.8,
        "poverty_rate": 12.2,
        "rent_burden_pct": 27.9,
        "rent_burden_source": "census_acs",
        "fair_market_rent_2br": 975,
        "fmr_source": "jchs_2025",
        "housing_price_change": 18.268028345143815,
        "regional_stress_multiplier": 1.05,
        "jchs_renters_cost_burdened": 46.5,
        "jchs_renters_severely_burdened": 23.5,
        "jchs_median_rent": 975
      },
      "rent_burden": {
        "value": 27.9,
        "source": "ACS B25071 2024"
      },
      "fmr_2br": {
        "value": 1124,
        "source": "NLIHC OOR 2025 (fallback)"
      },
      "housing_wage": {
        "value": 21.62,
        "source": "NLIHC OOR 2025 (fallback)"
      }
    },
    "US-MT": {
      "name": "Montana",
      "abbr": "MT",
      "financial_anxiety": {
        "value": 118,
        "change": 6.2,
        "rank": 42
      },
      "food_insecurity": {
        "value": 87,
        "change": 0,
        "rank": 34
      },
      "housing_stress": {
        "value": 133,
        "change": 15,
        "rank": 46
      },
      "affordability": {
        "value": 115,
        "change": 0,
        "rank": 45
      },
      "metrics": {
        "unemployment_rate": 3.4,
        "poverty_rate": 10.4,
        "rent_burden_pct": 27,
        "rent_burden_source": "census_acs",
        "fair_market_rent_2br": 1100,
        "fmr_source": "jchs_2025",
        "housing_price_change": 14.963719203509951,
        "regional_stress_multiplier": 1,
        "jchs_renters_cost_burdened": 47.5,
        "jchs_renters_severely_burdened": 22,
        "jchs_median_rent": 1100
      },
      "rent_burden": {
        "value": 27,
        "source": "ACS B25071 2024"
      },
      "fmr_2br": {
        "value": 1508,
        "source": "NLIHC OOR 2025 (fallback)"
      },
      "housing_wage": {
        "value": 29,
        "source": "NLIHC OOR 2025 (fallback)"
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
        "value": 84,
        "change": 0,
        "rank": 41
      },
      "housing_stress": {
        "value": 127,
        "change": 15.2,
        "rank": 47
      },
      "affordability": {
        "value": 110,
        "change": 0,
        "rank": 47
      },
      "metrics": {
        "unemployment_rate": 3,
        "poverty_rate": 10.6,
        "rent_burden_pct": 28.5,
        "rent_burden_source": "census_acs",
        "fair_market_rent_2br": 975,
        "fmr_source": "jchs_2025",
        "housing_price_change": 15.237048930955815,
        "regional_stress_multiplier": 0.95,
        "jchs_renters_cost_burdened": 43.5,
        "jchs_renters_severely_burdened": 20.5,
        "jchs_median_rent": 975
      },
      "rent_burden": {
        "value": 28.5,
        "source": "ACS B25071 2024"
      },
      "fmr_2br": {
        "value": 1122,
        "source": "NLIHC OOR 2025 (fallback)"
      },
      "housing_wage": {
        "value": 21.58,
        "source": "NLIHC OOR 2025 (fallback)"
      }
    },
    "US-NV": {
      "name": "Nevada",
      "abbr": "NV",
      "financial_anxiety": {
        "value": 169,
        "change": 0,
        "rank": 7
      },
      "food_insecurity": {
        "value": 107,
        "change": 0,
        "rank": 19
      },
      "housing_stress": {
        "value": 179,
        "change": 12.2,
        "rank": 8
      },
      "affordability": {
        "value": 150,
        "change": 0,
        "rank": 14
      },
      "metrics": {
        "unemployment_rate": 5.2,
        "poverty_rate": 11.8,
        "rent_burden_pct": 34,
        "rent_burden_source": "census_acs",
        "fair_market_rent_2br": 1450,
        "fmr_source": "jchs_2025",
        "housing_price_change": 12.236922807324987,
        "regional_stress_multiplier": 1.12,
        "jchs_renters_cost_burdened": 53.8,
        "jchs_renters_severely_burdened": 26.5,
        "jchs_median_rent": 1450
      },
      "rent_burden": {
        "value": 34,
        "source": "ACS B25071 2024"
      },
      "fmr_2br": {
        "value": 1713,
        "source": "NLIHC OOR 2025 (fallback)"
      },
      "housing_wage": {
        "value": 32.94,
        "source": "NLIHC OOR 2025 (fallback)"
      }
    },
    "US-NH": {
      "name": "New Hampshire",
      "abbr": "NH",
      "financial_anxiety": {
        "value": 98,
        "change": -6.3,
        "rank": 48
      },
      "food_insecurity": {
        "value": 61,
        "change": 0,
        "rank": 51
      },
      "housing_stress": {
        "value": 146,
        "change": 22.5,
        "rank": 38
      },
      "affordability": {
        "value": 112,
        "change": 0,
        "rank": 46
      },
      "metrics": {
        "unemployment_rate": 3,
        "poverty_rate": 7.3,
        "rent_burden_pct": 29.8,
        "rent_burden_source": "census_acs",
        "fair_market_rent_2br": 1400,
        "fmr_source": "jchs_2025",
        "housing_price_change": 22.49881748766807,
        "regional_stress_multiplier": 0.88,
        "jchs_renters_cost_burdened": 48,
        "jchs_renters_severely_burdened": 23,
        "jchs_median_rent": 1400
      },
      "rent_burden": {
        "value": 29.8,
        "source": "ACS B25071 2024"
      },
      "fmr_2br": {
        "value": 1824,
        "source": "NLIHC OOR 2025 (fallback)"
      },
      "housing_wage": {
        "value": 35.08,
        "source": "NLIHC OOR 2025 (fallback)"
      }
    },
    "US-NJ": {
      "name": "New Jersey",
      "abbr": "NJ",
      "financial_anxiety": {
        "value": 149,
        "change": -9.6,
        "rank": 23
      },
      "food_insecurity": {
        "value": 84,
        "change": 0,
        "rank": 42
      },
      "housing_stress": {
        "value": 193,
        "change": 26.9,
        "rank": 3
      },
      "affordability": {
        "value": 149,
        "change": 0,
        "rank": 15
      },
      "metrics": {
        "unemployment_rate": 4.7,
        "poverty_rate": 9.2,
        "rent_burden_pct": 31.2,
        "rent_burden_source": "census_acs",
        "fair_market_rent_2br": 1550,
        "fmr_source": "jchs_2025",
        "housing_price_change": 26.93905445969125,
        "regional_stress_multiplier": 1.05,
        "jchs_renters_cost_burdened": 55.2,
        "jchs_renters_severely_burdened": 28.5,
        "jchs_median_rent": 1550
      },
      "rent_burden": {
        "value": 31.2,
        "source": "ACS B25071 2024"
      },
      "fmr_2br": {
        "value": 2079,
        "source": "NLIHC OOR 2025 (fallback)"
      },
      "housing_wage": {
        "value": 39.98,
        "source": "NLIHC OOR 2025 (fallback)"
      }
    },
    "US-NM": {
      "name": "New Mexico",
      "abbr": "NM",
      "financial_anxiety": {
        "value": 171,
        "change": 22.5,
        "rank": 5
      },
      "food_insecurity": {
        "value": 141,
        "change": 0,
        "rank": 7
      },
      "housing_stress": {
        "value": 161,
        "change": 14.7,
        "rank": 18
      },
      "affordability": {
        "value": 153,
        "change": 0,
        "rank": 11
      },
      "metrics": {
        "unemployment_rate": 4.9,
        "poverty_rate": 15.8,
        "rent_burden_pct": 29.3,
        "rent_burden_source": "census_acs",
        "fair_market_rent_2br": 1025,
        "fmr_source": "jchs_2025",
        "housing_price_change": 14.737363113283433,
        "regional_stress_multiplier": 1.18,
        "jchs_renters_cost_burdened": 47,
        "jchs_renters_severely_burdened": 23.8,
        "jchs_median_rent": 1025
      },
      "rent_burden": {
        "value": 29.3,
        "source": "ACS B25071 2024"
      },
      "fmr_2br": {
        "value": 1205,
        "source": "NLIHC OOR 2025 (fallback)"
      },
      "housing_wage": {
        "value": 23.17,
        "source": "NLIHC OOR 2025 (fallback)"
      }
    },
    "US-NY": {
      "name": "New York",
      "abbr": "NY",
      "financial_anxiety": {
        "value": 161,
        "change": 9.5,
        "rank": 12
      },
      "food_insecurity": {
        "value": 125,
        "change": 0,
        "rank": 10
      },
      "housing_stress": {
        "value": 200,
        "change": 24,
        "rank": 2
      },
      "affordability": {
        "value": 170,
        "change": 0,
        "rank": 2
      },
      "metrics": {
        "unemployment_rate": 4.6,
        "poverty_rate": 14,
        "rent_burden_pct": 30.9,
        "rent_burden_source": "census_acs",
        "fair_market_rent_2br": 1500,
        "fmr_source": "jchs_2025",
        "housing_price_change": 23.978400154284618,
        "regional_stress_multiplier": 1.15,
        "jchs_renters_cost_burdened": 54.5,
        "jchs_renters_severely_burdened": 29.2,
        "jchs_median_rent": 1500
      },
      "rent_burden": {
        "value": 30.9,
        "source": "ACS B25071 2024"
      },
      "fmr_2br": {
        "value": 2394,
        "source": "NLIHC OOR 2025 (fallback)"
      },
      "housing_wage": {
        "value": 46.04,
        "source": "NLIHC OOR 2025 (fallback)"
      }
    },
    "US-NC": {
      "name": "North Carolina",
      "abbr": "NC",
      "financial_anxiety": {
        "value": 133,
        "change": -2.6,
        "rank": 30
      },
      "food_insecurity": {
        "value": 109,
        "change": 0,
        "rank": 17
      },
      "housing_stress": {
        "value": 158,
        "change": 14.8,
        "rank": 23
      },
      "affordability": {
        "value": 138,
        "change": 0,
        "rank": 24
      },
      "metrics": {
        "unemployment_rate": 3.7,
        "poverty_rate": 12.6,
        "rent_burden_pct": 30.8,
        "rent_burden_source": "census_acs",
        "fair_market_rent_2br": 1175,
        "fmr_source": "jchs_2025",
        "housing_price_change": 14.817779375010218,
        "regional_stress_multiplier": 1.08,
        "jchs_renters_cost_burdened": 50.5,
        "jchs_renters_severely_burdened": 25.5,
        "jchs_median_rent": 1175
      },
      "rent_burden": {
        "value": 30.8,
        "source": "ACS B25071 2024"
      },
      "fmr_2br": {
        "value": 1411,
        "source": "NLIHC OOR 2025 (fallback)"
      },
      "housing_wage": {
        "value": 27.13,
        "source": "NLIHC OOR 2025 (fallback)"
      }
    },
    "US-ND": {
      "name": "North Dakota",
      "abbr": "ND",
      "financial_anxiety": {
        "value": 85,
        "change": -7.7,
        "rank": 50
      },
      "food_insecurity": {
        "value": 76,
        "change": 0,
        "rank": 49
      },
      "housing_stress": {
        "value": 100,
        "change": 14.7,
        "rank": 51
      },
      "affordability": {
        "value": 90,
        "change": 0,
        "rank": 51
      },
      "metrics": {
        "unemployment_rate": 2.4,
        "poverty_rate": 10.8,
        "rent_burden_pct": 24.2,
        "rent_burden_source": "census_acs",
        "fair_market_rent_2br": 925,
        "fmr_source": "jchs_2025",
        "housing_price_change": 14.669530154277698,
        "regional_stress_multiplier": 0.85,
        "jchs_renters_cost_burdened": 38.5,
        "jchs_renters_severely_burdened": 16,
        "jchs_median_rent": 925
      },
      "rent_burden": {
        "value": 24.2,
        "source": "ACS B25071 2024"
      },
      "fmr_2br": {
        "value": 1012,
        "source": "NLIHC OOR 2025 (fallback)"
      },
      "housing_wage": {
        "value": 19.46,
        "source": "NLIHC OOR 2025 (fallback)"
      }
    },
    "US-OH": {
      "name": "Ohio",
      "abbr": "OH",
      "financial_anxiety": {
        "value": 131,
        "change": -21.3,
        "rank": 33
      },
      "food_insecurity": {
        "value": 107,
        "change": 0,
        "rank": 20
      },
      "housing_stress": {
        "value": 155,
        "change": 21.5,
        "rank": 28
      },
      "affordability": {
        "value": 136,
        "change": 0,
        "rank": 25
      },
      "metrics": {
        "unemployment_rate": 3.7,
        "poverty_rate": 12.6,
        "rent_burden_pct": 29,
        "rent_burden_source": "census_acs",
        "fair_market_rent_2br": 950,
        "fmr_source": "jchs_2025",
        "housing_price_change": 21.490709659117766,
        "regional_stress_multiplier": 1.06,
        "jchs_renters_cost_burdened": 48.5,
        "jchs_renters_severely_burdened": 24.5,
        "jchs_median_rent": 950
      },
      "rent_burden": {
        "value": 29,
        "source": "ACS B25071 2024"
      },
      "fmr_2br": {
        "value": 1170,
        "source": "NLIHC OOR 2025 (fallback)"
      },
      "housing_wage": {
        "value": 22.5,
        "source": "NLIHC OOR 2025 (fallback)"
      }
    },
    "US-OK": {
      "name": "Oklahoma",
      "abbr": "OK",
      "financial_anxiety": {
        "value": 150,
        "change": 32.3,
        "rank": 21
      },
      "food_insecurity": {
        "value": 131,
        "change": 0,
        "rank": 9
      },
      "housing_stress": {
        "value": 146,
        "change": 13,
        "rank": 39
      },
      "affordability": {
        "value": 140,
        "change": 0,
        "rank": 21
      },
      "metrics": {
        "unemployment_rate": 4.1,
        "poverty_rate": 14.8,
        "rent_burden_pct": 28.4,
        "rent_burden_source": "census_acs",
        "fair_market_rent_2br": 925,
        "fmr_source": "jchs_2025",
        "housing_price_change": 12.972849516087589,
        "regional_stress_multiplier": 1.15,
        "jchs_renters_cost_burdened": 46,
        "jchs_renters_severely_burdened": 23,
        "jchs_median_rent": 925
      },
      "rent_burden": {
        "value": 28.4,
        "source": "ACS B25071 2024"
      },
      "fmr_2br": {
        "value": 1091,
        "source": "NLIHC OOR 2025 (fallback)"
      },
      "housing_wage": {
        "value": 20.98,
        "source": "NLIHC OOR 2025 (fallback)"
      }
    },
    "US-OR": {
      "name": "Oregon",
      "abbr": "OR",
      "financial_anxiety": {
        "value": 158,
        "change": 0,
        "rank": 15
      },
      "food_insecurity": {
        "value": 100,
        "change": 0,
        "rank": 25
      },
      "housing_stress": {
        "value": 149,
        "change": 7.5,
        "rank": 36
      },
      "affordability": {
        "value": 129,
        "change": 0,
        "rank": 31
      },
      "metrics": {
        "unemployment_rate": 5.2,
        "poverty_rate": 11.7,
        "rent_burden_pct": 31.2,
        "rent_burden_source": "census_acs",
        "fair_market_rent_2br": 1450,
        "fmr_source": "jchs_2025",
        "housing_price_change": 7.53564412901591,
        "regional_stress_multiplier": 1.05,
        "jchs_renters_cost_burdened": 52.8,
        "jchs_renters_severely_burdened": 26,
        "jchs_median_rent": 1450
      },
      "rent_burden": {
        "value": 31.2,
        "source": "ACS B25071 2024"
      },
      "fmr_2br": {
        "value": 1717,
        "source": "NLIHC OOR 2025 (fallback)"
      },
      "housing_wage": {
        "value": 33.02,
        "source": "NLIHC OOR 2025 (fallback)"
      }
    },
    "US-PA": {
      "name": "Pennsylvania",
      "abbr": "PA",
      "financial_anxiety": {
        "value": 135,
        "change": 0,
        "rank": 29
      },
      "food_insecurity": {
        "value": 96,
        "change": 0,
        "rank": 27
      },
      "housing_stress": {
        "value": 154,
        "change": 19.8,
        "rank": 30
      },
      "affordability": {
        "value": 131,
        "change": 0,
        "rank": 29
      },
      "metrics": {
        "unemployment_rate": 4.2,
        "poverty_rate": 11.6,
        "rent_burden_pct": 29.7,
        "rent_burden_source": "census_acs",
        "fair_market_rent_2br": 1125,
        "fmr_source": "jchs_2025",
        "housing_price_change": 19.813620309416798,
        "regional_stress_multiplier": 1.02,
        "jchs_renters_cost_burdened": 48.5,
        "jchs_renters_severely_burdened": 25,
        "jchs_median_rent": 1125
      },
      "rent_burden": {
        "value": 29.7,
        "source": "ACS B25071 2024"
      },
      "fmr_2br": {
        "value": 1447,
        "source": "NLIHC OOR 2025 (fallback)"
      },
      "housing_wage": {
        "value": 27.83,
        "source": "NLIHC OOR 2025 (fallback)"
      }
    },
    "US-RI": {
      "name": "Rhode Island",
      "abbr": "RI",
      "financial_anxiety": {
        "value": 132,
        "change": -2.3,
        "rank": 32
      },
      "food_insecurity": {
        "value": 95,
        "change": 0,
        "rank": 28
      },
      "housing_stress": {
        "value": 164,
        "change": 24.3,
        "rank": 17
      },
      "affordability": {
        "value": 136,
        "change": 0,
        "rank": 26
      },
      "metrics": {
        "unemployment_rate": 4.3,
        "poverty_rate": 12,
        "rent_burden_pct": 30.5,
        "rent_burden_source": "census_acs",
        "fair_market_rent_2br": 1275,
        "fmr_source": "jchs_2025",
        "housing_price_change": 24.32254669823729,
        "regional_stress_multiplier": 0.98,
        "jchs_renters_cost_burdened": 51,
        "jchs_renters_severely_burdened": 27,
        "jchs_median_rent": 1275
      },
      "rent_burden": {
        "value": 30.5,
        "source": "ACS B25071 2024"
      },
      "fmr_2br": {
        "value": 1649,
        "source": "NLIHC OOR 2025 (fallback)"
      },
      "housing_wage": {
        "value": 31.71,
        "source": "NLIHC OOR 2025 (fallback)"
      }
    },
    "US-SC": {
      "name": "South Carolina",
      "abbr": "SC",
      "financial_anxiety": {
        "value": 161,
        "change": 7,
        "rank": 13
      },
      "food_insecurity": {
        "value": 121,
        "change": 0,
        "rank": 11
      },
      "housing_stress": {
        "value": 177,
        "change": 18.6,
        "rank": 10
      },
      "affordability": {
        "value": 155,
        "change": 0,
        "rank": 9
      },
      "metrics": {
        "unemployment_rate": 4.6,
        "poverty_rate": 13.3,
        "rent_burden_pct": 31.4,
        "rent_burden_source": "census_acs",
        "fair_market_rent_2br": 1125,
        "fmr_source": "jchs_2025",
        "housing_price_change": 18.60588215833527,
        "regional_stress_multiplier": 1.15,
        "jchs_renters_cost_burdened": 50.2,
        "jchs_renters_severely_burdened": 25.8,
        "jchs_median_rent": 1125
      },
      "rent_burden": {
        "value": 31.4,
        "source": "ACS B25071 2024"
      },
      "fmr_2br": {
        "value": 1347,
        "source": "NLIHC OOR 2025 (fallback)"
      },
      "housing_wage": {
        "value": 25.9,
        "source": "NLIHC OOR 2025 (fallback)"
      }
    },
    "US-SD": {
      "name": "South Dakota",
      "abbr": "SD",
      "financial_anxiety": {
        "value": 83,
        "change": 5,
        "rank": 51
      },
      "food_insecurity": {
        "value": 77,
        "change": 0,
        "rank": 47
      },
      "housing_stress": {
        "value": 108,
        "change": 13.8,
        "rank": 50
      },
      "affordability": {
        "value": 96,
        "change": 0,
        "rank": 50
      },
      "metrics": {
        "unemployment_rate": 2.1,
        "poverty_rate": 10.5,
        "rent_burden_pct": 26.9,
        "rent_burden_source": "census_acs",
        "fair_market_rent_2br": 875,
        "fmr_source": "jchs_2025",
        "housing_price_change": 13.849944167744905,
        "regional_stress_multiplier": 0.88,
        "jchs_renters_cost_burdened": 40.5,
        "jchs_renters_severely_burdened": 18.5,
        "jchs_median_rent": 875
      },
      "rent_burden": {
        "value": 26.9,
        "source": "ACS B25071 2024"
      },
      "fmr_2br": {
        "value": 986,
        "source": "NLIHC OOR 2025 (fallback)"
      },
      "housing_wage": {
        "value": 18.96,
        "source": "NLIHC OOR 2025 (fallback)"
      }
    },
    "US-TN": {
      "name": "Tennessee",
      "abbr": "TN",
      "financial_anxiety": {
        "value": 136,
        "change": 2.9,
        "rank": 28
      },
      "food_insecurity": {
        "value": 117,
        "change": 0,
        "rank": 12
      },
      "housing_stress": {
        "value": 158,
        "change": 14,
        "rank": 24
      },
      "affordability": {
        "value": 142,
        "change": 0,
        "rank": 19
      },
      "metrics": {
        "unemployment_rate": 3.6,
        "poverty_rate": 13.3,
        "rent_burden_pct": 30.1,
        "rent_burden_source": "census_acs",
        "fair_market_rent_2br": 1125,
        "fmr_source": "jchs_2025",
        "housing_price_change": 13.977241457453186,
        "regional_stress_multiplier": 1.12,
        "jchs_renters_cost_burdened": 49.5,
        "jchs_renters_severely_burdened": 24.8,
        "jchs_median_rent": 1125
      },
      "rent_burden": {
        "value": 30.1,
        "source": "ACS B25071 2024"
      },
      "fmr_2br": {
        "value": 1404,
        "source": "NLIHC OOR 2025 (fallback)"
      },
      "housing_wage": {
        "value": 27,
        "source": "NLIHC OOR 2025 (fallback)"
      }
    },
    "US-TX": {
      "name": "Texas",
      "abbr": "TX",
      "financial_anxiety": {
        "value": 141,
        "change": 4.9,
        "rank": 25
      },
      "food_insecurity": {
        "value": 111,
        "change": 0,
        "rank": 16
      },
      "housing_stress": {
        "value": 142,
        "change": 6.8,
        "rank": 42
      },
      "affordability": {
        "value": 130,
        "change": 0,
        "rank": 30
      },
      "metrics": {
        "unemployment_rate": 4.3,
        "poverty_rate": 13.4,
        "rent_burden_pct": 31.4,
        "rent_burden_source": "census_acs",
        "fair_market_rent_2br": 1275,
        "fmr_source": "jchs_2025",
        "housing_price_change": 6.784619109102634,
        "regional_stress_multiplier": 1.05,
        "jchs_renters_cost_burdened": 50.5,
        "jchs_renters_severely_burdened": 24.5,
        "jchs_median_rent": 1275
      },
      "rent_burden": {
        "value": 31.4,
        "source": "ACS B25071 2024"
      },
      "fmr_2br": {
        "value": 1541,
        "source": "NLIHC OOR 2025 (fallback)"
      },
      "housing_wage": {
        "value": 29.63,
        "source": "NLIHC OOR 2025 (fallback)"
      }
    },
    "US-UT": {
      "name": "Utah",
      "abbr": "UT",
      "financial_anxiety": {
        "value": 126,
        "change": 5.7,
        "rank": 37
      },
      "food_insecurity": {
        "value": 77,
        "change": 0,
        "rank": 48
      },
      "housing_stress": {
        "value": 143,
        "change": 10.9,
        "rank": 41
      },
      "affordability": {
        "value": 117,
        "change": 0,
        "rank": 43
      },
      "metrics": {
        "unemployment_rate": 3.7,
        "poverty_rate": 8.4,
        "rent_burden_pct": 29.4,
        "rent_burden_source": "census_acs",
        "fair_market_rent_2br": 1350,
        "fmr_source": "jchs_2025",
        "housing_price_change": 10.865352316477614,
        "regional_stress_multiplier": 1.02,
        "jchs_renters_cost_burdened": 48.5,
        "jchs_renters_severely_burdened": 21.5,
        "jchs_median_rent": 1350
      },
      "rent_burden": {
        "value": 29.4,
        "source": "ACS B25071 2024"
      },
      "fmr_2br": {
        "value": 1523,
        "source": "NLIHC OOR 2025 (fallback)"
      },
      "housing_wage": {
        "value": 29.29,
        "source": "NLIHC OOR 2025 (fallback)"
      }
    },
    "US-VT": {
      "name": "Vermont",
      "abbr": "VT",
      "financial_anxiety": {
        "value": 95,
        "change": 0,
        "rank": 49
      },
      "food_insecurity": {
        "value": 74,
        "change": 0,
        "rank": 50
      },
      "housing_stress": {
        "value": 148,
        "change": 22.2,
        "rank": 37
      },
      "affordability": {
        "value": 118,
        "change": 0,
        "rank": 42
      },
      "metrics": {
        "unemployment_rate": 2.6,
        "poverty_rate": 9.3,
        "rent_burden_pct": 29.5,
        "rent_burden_source": "census_acs",
        "fair_market_rent_2br": 1275,
        "fmr_source": "jchs_2025",
        "housing_price_change": 22.195707349370995,
        "regional_stress_multiplier": 0.92,
        "jchs_renters_cost_burdened": 48.5,
        "jchs_renters_severely_burdened": 24,
        "jchs_median_rent": 1275
      },
      "rent_burden": {
        "value": 29.5,
        "source": "ACS B25071 2024"
      },
      "fmr_2br": {
        "value": 1546,
        "source": "NLIHC OOR 2025 (fallback)"
      },
      "housing_wage": {
        "value": 29.73,
        "source": "NLIHC OOR 2025 (fallback)"
      }
    },
    "US-VA": {
      "name": "Virginia",
      "abbr": "VA",
      "financial_anxiety": {
        "value": 123,
        "change": 15.2,
        "rank": 39
      },
      "food_insecurity": {
        "value": 82,
        "change": 0,
        "rank": 43
      },
      "housing_stress": {
        "value": 155,
        "change": 17.9,
        "rank": 29
      },
      "affordability": {
        "value": 126,
        "change": 0,
        "rank": 37
      },
      "metrics": {
        "unemployment_rate": 3.8,
        "poverty_rate": 9.8,
        "rent_burden_pct": 29.7,
        "rent_burden_source": "census_acs",
        "fair_market_rent_2br": 1450,
        "fmr_source": "jchs_2025",
        "housing_price_change": 17.908133501182103,
        "regional_stress_multiplier": 0.98,
        "jchs_renters_cost_burdened": 47.5,
        "jchs_renters_severely_burdened": 23,
        "jchs_median_rent": 1450
      },
      "rent_burden": {
        "value": 29.7,
        "source": "ACS B25071 2024"
      },
      "fmr_2br": {
        "value": 1749,
        "source": "NLIHC OOR 2025 (fallback)"
      },
      "housing_wage": {
        "value": 33.63,
        "source": "NLIHC OOR 2025 (fallback)"
      }
    },
    "US-WA": {
      "name": "Washington",
      "abbr": "WA",
      "financial_anxiety": {
        "value": 154,
        "change": 15.6,
        "rank": 17
      },
      "food_insecurity": {
        "value": 87,
        "change": 0,
        "rank": 35
      },
      "housing_stress": {
        "value": 156,
        "change": 10.9,
        "rank": 26
      },
      "affordability": {
        "value": 128,
        "change": 0,
        "rank": 35
      },
      "metrics": {
        "unemployment_rate": 5.2,
        "poverty_rate": 10,
        "rent_burden_pct": 30.4,
        "rent_burden_source": "census_acs",
        "fair_market_rent_2br": 1650,
        "fmr_source": "jchs_2025",
        "housing_price_change": 10.909501581087193,
        "regional_stress_multiplier": 1.02,
        "jchs_renters_cost_burdened": 51.5,
        "jchs_renters_severely_burdened": 25.5,
        "jchs_median_rent": 1650
      },
      "rent_burden": {
        "value": 30.4,
        "source": "ACS B25071 2024"
      },
      "fmr_2br": {
        "value": 2138,
        "source": "NLIHC OOR 2025 (fallback)"
      },
      "housing_wage": {
        "value": 41.12,
        "source": "NLIHC OOR 2025 (fallback)"
      }
    },
    "US-WV": {
      "name": "West Virginia",
      "abbr": "WV",
      "financial_anxiety": {
        "value": 172,
        "change": 7.5,
        "rank": 3
      },
      "food_insecurity": {
        "value": 156,
        "change": 0,
        "rank": 3
      },
      "housing_stress": {
        "value": 170,
        "change": 18.1,
        "rank": 11
      },
      "affordability": {
        "value": 164,
        "change": 0,
        "rank": 4
      },
      "metrics": {
        "unemployment_rate": 4.3,
        "poverty_rate": 16.2,
        "rent_burden_pct": 28.4,
        "rent_burden_source": "census_acs",
        "fair_market_rent_2br": 800,
        "fmr_source": "jchs_2025",
        "housing_price_change": 18.0570532300755,
        "regional_stress_multiplier": 1.28,
        "jchs_renters_cost_burdened": 46.5,
        "jchs_renters_severely_burdened": 24.5,
        "jchs_median_rent": 800
      },
      "rent_burden": {
        "value": 28.4,
        "source": "ACS B25071 2024"
      },
      "fmr_2br": {
        "value": 985,
        "source": "NLIHC OOR 2025 (fallback)"
      },
      "housing_wage": {
        "value": 18.94,
        "source": "NLIHC OOR 2025 (fallback)"
      }
    },
    "US-WI": {
      "name": "Wisconsin",
      "abbr": "WI",
      "financial_anxiety": {
        "value": 112,
        "change": 9.7,
        "rank": 43
      },
      "food_insecurity": {
        "value": 82,
        "change": 0,
        "rank": 44
      },
      "housing_stress": {
        "value": 141,
        "change": 23.2,
        "rank": 44
      },
      "affordability": {
        "value": 117,
        "change": 0,
        "rank": 44
      },
      "metrics": {
        "unemployment_rate": 3.4,
        "poverty_rate": 10.3,
        "rent_burden_pct": 27.9,
        "rent_burden_source": "census_acs",
        "fair_market_rent_2br": 1000,
        "fmr_source": "jchs_2025",
        "housing_price_change": 23.23006243373778,
        "regional_stress_multiplier": 0.95,
        "jchs_renters_cost_burdened": 46,
        "jchs_renters_severely_burdened": 22.5,
        "jchs_median_rent": 1000
      },
      "rent_burden": {
        "value": 27.9,
        "source": "ACS B25071 2024"
      },
      "fmr_2br": {
        "value": 1204,
        "source": "NLIHC OOR 2025 (fallback)"
      },
      "housing_wage": {
        "value": 23.15,
        "source": "NLIHC OOR 2025 (fallback)"
      }
    },
    "US-WY": {
      "name": "Wyoming",
      "abbr": "WY",
      "financial_anxiety": {
        "value": 112,
        "change": 6.2,
        "rank": 44
      },
      "food_insecurity": {
        "value": 81,
        "change": 0,
        "rank": 45
      },
      "housing_stress": {
        "value": 122,
        "change": 15.5,
        "rank": 48
      },
      "affordability": {
        "value": 106,
        "change": 0,
        "rank": 48
      },
      "metrics": {
        "unemployment_rate": 3.4,
        "poverty_rate": 10,
        "rent_burden_pct": 26.5,
        "rent_burden_source": "census_acs",
        "fair_market_rent_2br": 975,
        "fmr_source": "jchs_2025",
        "housing_price_change": 15.485348392547463,
        "regional_stress_multiplier": 0.95,
        "jchs_renters_cost_burdened": 39.5,
        "jchs_renters_severely_burdened": 17,
        "jchs_median_rent": 975
      },
      "rent_burden": {
        "value": 26.5,
        "source": "ACS B25071 2024"
      },
      "fmr_2br": {
        "value": 1053,
        "source": "NLIHC OOR 2025 (fallback)"
      },
      "housing_wage": {
        "value": 20.25,
        "source": "NLIHC OOR 2025 (fallback)"
      }
    }
  },
  "timeseries": {
    "national": {
      "financial_anxiety": [
        {
          "date": "2026-07-01",
          "value": 140
        }
      ],
      "food_insecurity": [
        {
          "date": "2026-07-01",
          "value": 103
        }
      ],
      "housing_stress": [
        {
          "date": "2026-07-01",
          "value": 157
        }
      ],
      "affordability": [
        {
          "date": "2026-07-01",
          "value": 135
        }
      ]
    }
  }
};

if (typeof window !== 'undefined') window.DASHBOARD_DATA = DASHBOARD_DATA;
if (typeof module !== 'undefined') module.exports = DASHBOARD_DATA;
