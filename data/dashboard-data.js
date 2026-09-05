// Financial Health Barometer Data
// Auto-generated: 2026-09-05T05:16:48.840Z
// Sources: BLS, FRED, Census Bureau, HUD, Harvard JCHS, Google Trends APIs

const DASHBOARD_DATA = {
  "as_of": "2026-09-05",
  "meta": {
    "generated": "2026-09-05T05:16:48.811Z",
    "version": "2.5",
    "source": "BLS, FRED, Census Bureau, HUD, Harvard JCHS, Google Trends APIs",
    "update_frequency": "daily",
    "data_sources": {
      "unemployment": "BLS LAUS",
      "housing_prices": "FRED HPI",
      "poverty": "Census SAIPE",
      "rent_burden": "Census ACS B25071",
      "fair_market_rent": "NLIHC OOR 2025 (fallback)",
      "housing_wage": "Derived from NLIHC OOR 2025 fallback FMR (NLIHC formula)",
      "jchs_calibration": "Harvard JCHS State of the Nation's Housing 2025",
      "trends": "Google Health Trends API (NOT WORKING - 36 requests returned no data, no successful fetch on record; boost withheld)"
    },
    "carried_forward": {},
    "unemployment_observed": "2026-09-05",
    "trends_coverage": {
      "financial_anxiety": {
        "states_covered": 0,
        "states_total": 51,
        "complete": false,
        "oldest_reading": null,
        "newest_reading": null
      },
      "food_insecurity": {
        "states_covered": 0,
        "states_total": 51,
        "complete": false,
        "oldest_reading": null,
        "newest_reading": null
      },
      "housing_stress": {
        "states_covered": 0,
        "states_total": 51,
        "complete": false,
        "oldest_reading": null,
        "newest_reading": null
      },
      "affordability": {
        "states_covered": 0,
        "states_total": 51,
        "complete": false,
        "oldest_reading": null,
        "newest_reading": null
      }
    },
    "trends_run": {
      "state_requests": 36,
      "state_readings": 0,
      "attempted": true
    },
    "trends_terms": {
      "financial_anxiety": "debt help",
      "food_insecurity": "food stamps",
      "housing_stress": "eviction help",
      "affordability": "cost of living"
    },
    "trends_cache": {
      "states": {
        "financial_anxiety": {},
        "food_insecurity": {},
        "housing_stress": {},
        "affordability": {}
      },
      "cursor": 36,
      "updated": "2026-09-05",
      "last_successful_fetch": null
    },
    "tier_estimates": {
      "note": "Author-assigned fallback bands, not measurements. Used only when a component has no live read and nothing to carry forward. states_scored counts how many states are affected in this reading.",
      "states_scored": {
        "rent_burden": 0,
        "fmr_score": 0
      },
      "rent_burden_tiers": {
        "tier1": {
          "states": [
            "CA",
            "NY",
            "MA",
            "HI",
            "DC",
            "NJ"
          ],
          "assumed_pct": 32,
          "score": 21
        },
        "tier2": {
          "states": [
            "WA",
            "CO",
            "FL",
            "MD",
            "MN",
            "CT",
            "OR"
          ],
          "assumed_pct": 29,
          "score": 12
        },
        "tier3": {
          "states": [
            "NH",
            "VA",
            "AZ",
            "NV",
            "TX",
            "IL",
            "RI",
            "VT",
            "AK"
          ],
          "assumed_pct": 27,
          "score": 6
        }
      },
      "fmr_high_cost_tier": {
        "states": [
          "CA",
          "NY",
          "MA",
          "HI",
          "DC",
          "NJ",
          "WA",
          "CO",
          "MD",
          "CT"
        ],
        "score": 15
      }
    },
    "regional_multipliers": {
      "note": "Author-assigned priors, not measured or fitted. Every index value is multiplied by the state's multiplier. Divide by it to recover the purely data-driven index.",
      "range": [
        0.85,
        1.35
      ],
      "values": {
        "MS": 1.35,
        "LA": 1.3,
        "AL": 1.25,
        "AR": 1.22,
        "WV": 1.28,
        "KY": 1.18,
        "TN": 1.12,
        "SC": 1.15,
        "GA": 1.1,
        "NC": 1.08,
        "OK": 1.15,
        "NM": 1.18,
        "AZ": 1.1,
        "CA": 1.12,
        "NY": 1.15,
        "HI": 1.2,
        "FL": 1.15,
        "NV": 1.12,
        "NJ": 1.05,
        "MA": 1.02,
        "CT": 1.02,
        "DC": 1.18,
        "TX": 1.05,
        "CO": 1.02,
        "OR": 1.05,
        "WA": 1.02,
        "ID": 1.05,
        "MT": 1,
        "WY": 0.95,
        "UT": 1.02,
        "AK": 1.08,
        "MI": 1.08,
        "OH": 1.06,
        "IN": 1.04,
        "IL": 1.05,
        "PA": 1.02,
        "MO": 1.05,
        "KS": 1,
        "NE": 0.95,
        "IA": 0.92,
        "MN": 1.12,
        "VT": 0.92,
        "NH": 0.88,
        "ME": 0.95,
        "WI": 0.95,
        "ND": 0.85,
        "SD": 0.88,
        "RI": 0.98,
        "DE": 1,
        "MD": 1,
        "VA": 0.98
      }
    },
    "index_bounds": {
      "financial_anxiety": [
        80,
        200
      ],
      "food_insecurity": [
        55,
        160
      ],
      "housing_stress": [
        80,
        200
      ],
      "affordability": [
        80,
        200
      ]
    },
    "data_age": {
      "oldest_observation": "2026-09-05",
      "oldest_source": "unemployment",
      "age_days": 0
    },
    "augmented_at": "2026-09-05T05:16:48.840Z"
  },
  "national": {
    "financial_anxiety": {
      "value": 137.4,
      "change": 0.9,
      "change_coverage": {
        "states_with_change": 51,
        "states_total": 51
      },
      "trend": "up"
    },
    "food_insecurity": {
      "value": 103.4,
      "change": null,
      "change_coverage": {
        "states_with_change": 0,
        "states_total": 51
      },
      "trend": null
    },
    "housing_stress": {
      "value": 152.5,
      "change": 13.8,
      "change_coverage": {
        "states_with_change": 51,
        "states_total": 51
      },
      "trend": "up"
    },
    "affordability": {
      "value": 132.8,
      "change": null,
      "change_coverage": {
        "states_with_change": 0,
        "states_total": 51
      },
      "trend": null
    }
  },
  "states": {
    "US-AL": {
      "name": "Alabama",
      "abbr": "AL",
      "financial_anxiety": {
        "value": 148,
        "change": 21.4,
        "change_basis": "year-over-year unemployment rate",
        "rank": 21
      },
      "food_insecurity": {
        "value": 145,
        "change": null,
        "change_basis": "not available - SAIPE poverty data is annual",
        "rank": 5
      },
      "housing_stress": {
        "value": 167,
        "change": 14,
        "change_basis": "year-over-year FHFA house price index (FRED)",
        "rank": 12
      },
      "affordability": {
        "value": 158,
        "change": null,
        "change_basis": "not available - derived index, no independent change series",
        "rank": 6
      },
      "metrics": {
        "unemployment_rate": 3.4,
        "unemployment_period": "2026-07",
        "poverty_rate": 15.2,
        "rent_burden_pct": 29.3,
        "rent_burden_source": "census_acs",
        "rent_burden_pct_observed": "2026-09-05",
        "fair_market_rent_2br": null,
        "fair_market_rent_source": null,
        "fair_market_rent_2br_observed": null,
        "median_rent_2br": 980,
        "median_rent_source": "Harvard JCHS 2025",
        "fmr_score_source": "jchs_2025",
        "housing_price_change": 13.970848148379181,
        "housing_price_change_source": "FRED FHFA HPI",
        "housing_price_change_observed": "2026-09-05",
        "regional_stress_multiplier": 1.25,
        "trends_boost": {
          "financial_anxiety": {
            "value": null,
            "applied": false
          },
          "food_insecurity": {
            "value": null,
            "applied": false
          },
          "housing_stress": {
            "value": null,
            "applied": false
          },
          "affordability": {
            "value": null,
            "applied": false
          }
        },
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
        "source": "Derived from NLIHC OOR 2025 fallback FMR (NLIHC formula)"
      }
    },
    "US-AK": {
      "name": "Alaska",
      "abbr": "AK",
      "financial_anxiety": {
        "value": 145,
        "change": -6.5,
        "change_basis": "year-over-year unemployment rate",
        "rank": 22
      },
      "food_insecurity": {
        "value": 94,
        "change": null,
        "change_basis": "not available - SAIPE poverty data is annual",
        "rank": 29
      },
      "housing_stress": {
        "value": 149,
        "change": 14.2,
        "change_basis": "year-over-year FHFA house price index (FRED)",
        "rank": 30
      },
      "affordability": {
        "value": 127,
        "change": null,
        "change_basis": "not available - derived index, no independent change series",
        "rank": 30
      },
      "metrics": {
        "unemployment_rate": 4.3,
        "unemployment_period": "2026-07",
        "poverty_rate": 10.3,
        "rent_burden_pct": 26.5,
        "rent_burden_source": "census_acs",
        "rent_burden_pct_observed": "2026-09-05",
        "fair_market_rent_2br": null,
        "fair_market_rent_source": null,
        "fair_market_rent_2br_observed": null,
        "median_rent_2br": 1350,
        "median_rent_source": "Harvard JCHS 2025",
        "fmr_score_source": "jchs_2025",
        "housing_price_change": 14.1546920482373,
        "housing_price_change_source": "FRED FHFA HPI",
        "housing_price_change_observed": "2026-09-05",
        "regional_stress_multiplier": 1.08,
        "trends_boost": {
          "financial_anxiety": {
            "value": null,
            "applied": false
          },
          "food_insecurity": {
            "value": null,
            "applied": false
          },
          "housing_stress": {
            "value": null,
            "applied": false
          },
          "affordability": {
            "value": null,
            "applied": false
          }
        },
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
        "source": "Derived from NLIHC OOR 2025 fallback FMR (NLIHC formula)"
      }
    },
    "US-AZ": {
      "name": "Arizona",
      "abbr": "AZ",
      "financial_anxiety": {
        "value": 160,
        "change": 14,
        "change_basis": "year-over-year unemployment rate",
        "rank": 10
      },
      "food_insecurity": {
        "value": 106,
        "change": null,
        "change_basis": "not available - SAIPE poverty data is annual",
        "rank": 21
      },
      "housing_stress": {
        "value": 156,
        "change": 8.2,
        "change_basis": "year-over-year FHFA house price index (FRED)",
        "rank": 19
      },
      "affordability": {
        "value": 136,
        "change": null,
        "change_basis": "not available - derived index, no independent change series",
        "rank": 23
      },
      "metrics": {
        "unemployment_rate": 4.9,
        "unemployment_period": "2026-07",
        "poverty_rate": 11.9,
        "rent_burden_pct": 31.2,
        "rent_burden_source": "census_acs",
        "rent_burden_pct_observed": "2026-09-05",
        "fair_market_rent_2br": null,
        "fair_market_rent_source": null,
        "fair_market_rent_2br_observed": null,
        "median_rent_2br": 1390,
        "median_rent_source": "Harvard JCHS 2025",
        "fmr_score_source": "jchs_2025",
        "housing_price_change": 8.215184253366877,
        "housing_price_change_source": "FRED FHFA HPI",
        "housing_price_change_observed": "2026-09-05",
        "regional_stress_multiplier": 1.1,
        "trends_boost": {
          "financial_anxiety": {
            "value": null,
            "applied": false
          },
          "food_insecurity": {
            "value": null,
            "applied": false
          },
          "housing_stress": {
            "value": null,
            "applied": false
          },
          "affordability": {
            "value": null,
            "applied": false
          }
        },
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
        "source": "Derived from NLIHC OOR 2025 fallback FMR (NLIHC formula)"
      }
    },
    "US-AR": {
      "name": "Arkansas",
      "abbr": "AR",
      "financial_anxiety": {
        "value": 157,
        "change": -2.4,
        "change_basis": "year-over-year unemployment rate",
        "rank": 12
      },
      "food_insecurity": {
        "value": 142,
        "change": null,
        "change_basis": "not available - SAIPE poverty data is annual",
        "rank": 6
      },
      "housing_stress": {
        "value": 150,
        "change": 12.7,
        "change_basis": "year-over-year FHFA house price index (FRED)",
        "rank": 29
      },
      "affordability": {
        "value": 147,
        "change": null,
        "change_basis": "not available - derived index, no independent change series",
        "rank": 14
      },
      "metrics": {
        "unemployment_rate": 4,
        "unemployment_period": "2026-07",
        "poverty_rate": 15.3,
        "rent_burden_pct": 28.1,
        "rent_burden_source": "census_acs",
        "rent_burden_pct_observed": "2026-09-05",
        "fair_market_rent_2br": null,
        "fair_market_rent_source": null,
        "fair_market_rent_2br_observed": null,
        "median_rent_2br": 850,
        "median_rent_source": "Harvard JCHS 2025",
        "fmr_score_source": "jchs_2025",
        "housing_price_change": 12.67016199186515,
        "housing_price_change_source": "FRED FHFA HPI",
        "housing_price_change_observed": "2026-09-05",
        "regional_stress_multiplier": 1.22,
        "trends_boost": {
          "financial_anxiety": {
            "value": null,
            "applied": false
          },
          "food_insecurity": {
            "value": null,
            "applied": false
          },
          "housing_stress": {
            "value": null,
            "applied": false
          },
          "affordability": {
            "value": null,
            "applied": false
          }
        },
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
        "source": "Derived from NLIHC OOR 2025 fallback FMR (NLIHC formula)"
      }
    },
    "US-CA": {
      "name": "California",
      "abbr": "CA",
      "financial_anxiety": {
        "value": 167,
        "change": -7.3,
        "change_basis": "year-over-year unemployment rate",
        "rank": 4
      },
      "food_insecurity": {
        "value": 107,
        "change": null,
        "change_basis": "not available - SAIPE poverty data is annual",
        "rank": 18
      },
      "housing_stress": {
        "value": 181,
        "change": 7.7,
        "change_basis": "year-over-year FHFA house price index (FRED)",
        "rank": 6
      },
      "affordability": {
        "value": 151,
        "change": null,
        "change_basis": "not available - derived index, no independent change series",
        "rank": 10
      },
      "metrics": {
        "unemployment_rate": 5.1,
        "unemployment_period": "2026-07",
        "poverty_rate": 11.8,
        "rent_burden_pct": 33.1,
        "rent_burden_source": "census_acs",
        "rent_burden_pct_observed": "2026-09-05",
        "fair_market_rent_2br": null,
        "fair_market_rent_source": null,
        "fair_market_rent_2br_observed": null,
        "median_rent_2br": 1850,
        "median_rent_source": "Harvard JCHS 2025",
        "fmr_score_source": "jchs_2025",
        "housing_price_change": 7.6767609833675685,
        "housing_price_change_source": "FRED FHFA HPI",
        "housing_price_change_observed": "2026-09-05",
        "regional_stress_multiplier": 1.12,
        "trends_boost": {
          "financial_anxiety": {
            "value": null,
            "applied": false
          },
          "food_insecurity": {
            "value": null,
            "applied": false
          },
          "housing_stress": {
            "value": null,
            "applied": false
          },
          "affordability": {
            "value": null,
            "applied": false
          }
        },
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
        "source": "Derived from NLIHC OOR 2025 fallback FMR (NLIHC formula)"
      }
    },
    "US-CO": {
      "name": "Colorado",
      "abbr": "CO",
      "financial_anxiety": {
        "value": 130,
        "change": 0,
        "change_basis": "year-over-year unemployment rate",
        "rank": 30
      },
      "food_insecurity": {
        "value": 84,
        "change": null,
        "change_basis": "not available - SAIPE poverty data is annual",
        "rank": 39
      },
      "housing_stress": {
        "value": 143,
        "change": 3.4,
        "change_basis": "year-over-year FHFA house price index (FRED)",
        "rank": 34
      },
      "affordability": {
        "value": 119,
        "change": null,
        "change_basis": "not available - derived index, no independent change series",
        "rank": 39
      },
      "metrics": {
        "unemployment_rate": 3.9,
        "unemployment_period": "2026-07",
        "poverty_rate": 9.6,
        "rent_burden_pct": 31.2,
        "rent_burden_source": "census_acs",
        "rent_burden_pct_observed": "2026-09-05",
        "fair_market_rent_2br": null,
        "fair_market_rent_source": null,
        "fair_market_rent_2br_observed": null,
        "median_rent_2br": 1650,
        "median_rent_source": "Harvard JCHS 2025",
        "fmr_score_source": "jchs_2025",
        "housing_price_change": 3.4006762570746503,
        "housing_price_change_source": "FRED FHFA HPI",
        "housing_price_change_observed": "2026-09-05",
        "regional_stress_multiplier": 1.02,
        "trends_boost": {
          "financial_anxiety": {
            "value": null,
            "applied": false
          },
          "food_insecurity": {
            "value": null,
            "applied": false
          },
          "housing_stress": {
            "value": null,
            "applied": false
          },
          "affordability": {
            "value": null,
            "applied": false
          }
        },
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
        "source": "Derived from NLIHC OOR 2025 fallback FMR (NLIHC formula)"
      }
    },
    "US-CT": {
      "name": "Connecticut",
      "abbr": "CT",
      "financial_anxiety": {
        "value": 154,
        "change": 33.3,
        "change_basis": "year-over-year unemployment rate",
        "rank": 16
      },
      "food_insecurity": {
        "value": 87,
        "change": null,
        "change_basis": "not available - SAIPE poverty data is annual",
        "rank": 33
      },
      "housing_stress": {
        "value": 179,
        "change": 23.6,
        "change_basis": "year-over-year FHFA house price index (FRED)",
        "rank": 8
      },
      "affordability": {
        "value": 142,
        "change": null,
        "change_basis": "not available - derived index, no independent change series",
        "rank": 16
      },
      "metrics": {
        "unemployment_rate": 5.2,
        "unemployment_period": "2026-07",
        "poverty_rate": 10.1,
        "rent_burden_pct": 32.1,
        "rent_burden_source": "census_acs",
        "rent_burden_pct_observed": "2026-09-05",
        "fair_market_rent_2br": null,
        "fair_market_rent_source": null,
        "fair_market_rent_2br_observed": null,
        "median_rent_2br": 1400,
        "median_rent_source": "Harvard JCHS 2025",
        "fmr_score_source": "jchs_2025",
        "housing_price_change": 23.62775707523416,
        "housing_price_change_source": "FRED FHFA HPI",
        "housing_price_change_observed": "2026-09-05",
        "regional_stress_multiplier": 1.02,
        "trends_boost": {
          "financial_anxiety": {
            "value": null,
            "applied": false
          },
          "food_insecurity": {
            "value": null,
            "applied": false
          },
          "housing_stress": {
            "value": null,
            "applied": false
          },
          "affordability": {
            "value": null,
            "applied": false
          }
        },
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
        "source": "Derived from NLIHC OOR 2025 fallback FMR (NLIHC formula)"
      }
    },
    "US-DE": {
      "name": "Delaware",
      "abbr": "DE",
      "financial_anxiety": {
        "value": 143,
        "change": 0,
        "change_basis": "year-over-year unemployment rate",
        "rank": 24
      },
      "food_insecurity": {
        "value": 86,
        "change": null,
        "change_basis": "not available - SAIPE poverty data is annual",
        "rank": 36
      },
      "housing_stress": {
        "value": 151,
        "change": 16.6,
        "change_basis": "year-over-year FHFA house price index (FRED)",
        "rank": 25
      },
      "affordability": {
        "value": 125,
        "change": null,
        "change_basis": "not available - derived index, no independent change series",
        "rank": 32
      },
      "metrics": {
        "unemployment_rate": 4.8,
        "unemployment_period": "2026-07",
        "poverty_rate": 10.1,
        "rent_burden_pct": 30.1,
        "rent_burden_source": "census_acs",
        "rent_burden_pct_observed": "2026-09-05",
        "fair_market_rent_2br": null,
        "fair_market_rent_source": null,
        "fair_market_rent_2br_observed": null,
        "median_rent_2br": 1275,
        "median_rent_source": "Harvard JCHS 2025",
        "fmr_score_source": "jchs_2025",
        "housing_price_change": 16.62293908947258,
        "housing_price_change_source": "FRED FHFA HPI",
        "housing_price_change_observed": "2026-09-05",
        "regional_stress_multiplier": 1,
        "trends_boost": {
          "financial_anxiety": {
            "value": null,
            "applied": false
          },
          "food_insecurity": {
            "value": null,
            "applied": false
          },
          "housing_stress": {
            "value": null,
            "applied": false
          },
          "affordability": {
            "value": null,
            "applied": false
          }
        },
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
        "source": "Derived from NLIHC OOR 2025 fallback FMR (NLIHC formula)"
      }
    },
    "US-DC": {
      "name": "District of Columbia",
      "abbr": "DC",
      "financial_anxiety": {
        "value": 193,
        "change": -6.3,
        "change_basis": "year-over-year unemployment rate",
        "rank": 1
      },
      "food_insecurity": {
        "value": 146,
        "change": null,
        "change_basis": "not available - SAIPE poverty data is annual",
        "rank": 4
      },
      "housing_stress": {
        "value": 156,
        "change": 0.9,
        "change_basis": "year-over-year FHFA house price index (FRED)",
        "rank": 20
      },
      "affordability": {
        "value": 152,
        "change": null,
        "change_basis": "not available - derived index, no independent change series",
        "rank": 8
      },
      "metrics": {
        "unemployment_rate": 5.9,
        "unemployment_period": "2026-07",
        "poverty_rate": 16.4,
        "rent_burden_pct": 29,
        "rent_burden_source": "census_acs",
        "rent_burden_pct_observed": "2026-09-05",
        "fair_market_rent_2br": null,
        "fair_market_rent_source": null,
        "fair_market_rent_2br_observed": null,
        "median_rent_2br": 1750,
        "median_rent_source": "Harvard JCHS 2025",
        "fmr_score_source": "jchs_2025",
        "housing_price_change": 0.8856612321482514,
        "housing_price_change_source": "FRED FHFA HPI",
        "housing_price_change_observed": "2026-09-05",
        "regional_stress_multiplier": 1.18,
        "trends_boost": {
          "financial_anxiety": {
            "value": null,
            "applied": false
          },
          "food_insecurity": {
            "value": null,
            "applied": false
          },
          "housing_stress": {
            "value": null,
            "applied": false
          },
          "affordability": {
            "value": null,
            "applied": false
          }
        },
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
        "source": "Derived from NLIHC OOR 2025 fallback FMR (NLIHC formula)"
      }
    },
    "US-FL": {
      "name": "Florida",
      "abbr": "FL",
      "financial_anxiety": {
        "value": 161,
        "change": 17.9,
        "change_basis": "year-over-year unemployment rate",
        "rank": 9
      },
      "food_insecurity": {
        "value": 112,
        "change": null,
        "change_basis": "not available - SAIPE poverty data is annual",
        "rank": 14
      },
      "housing_stress": {
        "value": 182,
        "change": 6.6,
        "change_basis": "year-over-year FHFA house price index (FRED)",
        "rank": 4
      },
      "affordability": {
        "value": 154,
        "change": null,
        "change_basis": "not available - derived index, no independent change series",
        "rank": 7
      },
      "metrics": {
        "unemployment_rate": 4.6,
        "unemployment_period": "2026-07",
        "poverty_rate": 12.1,
        "rent_burden_pct": 36.1,
        "rent_burden_source": "census_acs",
        "rent_burden_pct_observed": "2026-09-05",
        "fair_market_rent_2br": null,
        "fair_market_rent_source": null,
        "fair_market_rent_2br_observed": null,
        "median_rent_2br": 1550,
        "median_rent_source": "Harvard JCHS 2025",
        "fmr_score_source": "jchs_2025",
        "housing_price_change": 6.610716591349264,
        "housing_price_change_source": "FRED FHFA HPI",
        "housing_price_change_observed": "2026-09-05",
        "regional_stress_multiplier": 1.15,
        "trends_boost": {
          "financial_anxiety": {
            "value": null,
            "applied": false
          },
          "food_insecurity": {
            "value": null,
            "applied": false
          },
          "housing_stress": {
            "value": null,
            "applied": false
          },
          "affordability": {
            "value": null,
            "applied": false
          }
        },
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
        "source": "Derived from NLIHC OOR 2025 fallback FMR (NLIHC formula)"
      }
    },
    "US-GA": {
      "name": "Georgia",
      "abbr": "GA",
      "financial_anxiety": {
        "value": 128,
        "change": 0,
        "change_basis": "year-over-year unemployment rate",
        "rank": 32
      },
      "food_insecurity": {
        "value": 112,
        "change": null,
        "change_basis": "not available - SAIPE poverty data is annual",
        "rank": 15
      },
      "housing_stress": {
        "value": 159,
        "change": 10.9,
        "change_basis": "year-over-year FHFA house price index (FRED)",
        "rank": 17
      },
      "affordability": {
        "value": 140,
        "change": null,
        "change_basis": "not available - derived index, no independent change series",
        "rank": 18
      },
      "metrics": {
        "unemployment_rate": 3.3,
        "unemployment_period": "2026-07",
        "poverty_rate": 12.8,
        "rent_burden_pct": 31.6,
        "rent_burden_source": "census_acs",
        "rent_burden_pct_observed": "2026-09-05",
        "fair_market_rent_2br": null,
        "fair_market_rent_source": null,
        "fair_market_rent_2br_observed": null,
        "median_rent_2br": 1275,
        "median_rent_source": "Harvard JCHS 2025",
        "fmr_score_source": "jchs_2025",
        "housing_price_change": 10.895599886102888,
        "housing_price_change_source": "FRED FHFA HPI",
        "housing_price_change_observed": "2026-09-05",
        "regional_stress_multiplier": 1.1,
        "trends_boost": {
          "financial_anxiety": {
            "value": null,
            "applied": false
          },
          "food_insecurity": {
            "value": null,
            "applied": false
          },
          "housing_stress": {
            "value": null,
            "applied": false
          },
          "affordability": {
            "value": null,
            "applied": false
          }
        },
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
        "source": "Derived from NLIHC OOR 2025 fallback FMR (NLIHC formula)"
      }
    },
    "US-HI": {
      "name": "Hawaii",
      "abbr": "HI",
      "financial_anxiety": {
        "value": 127,
        "change": 22.7,
        "change_basis": "year-over-year unemployment rate",
        "rank": 35
      },
      "food_insecurity": {
        "value": 102,
        "change": null,
        "change_basis": "not available - SAIPE poverty data is annual",
        "rank": 23
      },
      "housing_stress": {
        "value": 200,
        "change": 10.6,
        "change_basis": "year-over-year FHFA house price index (FRED)",
        "rank": 1,
        "clamped": "ceiling"
      },
      "affordability": {
        "value": 161,
        "change": null,
        "change_basis": "not available - derived index, no independent change series",
        "rank": 5
      },
      "metrics": {
        "unemployment_rate": 2.7,
        "unemployment_period": "2026-07",
        "poverty_rate": 10,
        "rent_burden_pct": 32.6,
        "rent_burden_source": "census_acs",
        "rent_burden_pct_observed": "2026-09-05",
        "fair_market_rent_2br": null,
        "fair_market_rent_source": null,
        "fair_market_rent_2br_observed": null,
        "median_rent_2br": 1950,
        "median_rent_source": "Harvard JCHS 2025",
        "fmr_score_source": "jchs_2025",
        "housing_price_change": 10.56137547681471,
        "housing_price_change_source": "FRED FHFA HPI",
        "housing_price_change_observed": "2026-09-05",
        "regional_stress_multiplier": 1.2,
        "trends_boost": {
          "financial_anxiety": {
            "value": null,
            "applied": false
          },
          "food_insecurity": {
            "value": null,
            "applied": false
          },
          "housing_stress": {
            "value": null,
            "applied": false
          },
          "affordability": {
            "value": null,
            "applied": false
          }
        },
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
        "source": "Derived from NLIHC OOR 2025 fallback FMR (NLIHC formula)"
      }
    },
    "US-ID": {
      "name": "Idaho",
      "abbr": "ID",
      "financial_anxiety": {
        "value": 128,
        "change": 0,
        "change_basis": "year-over-year unemployment rate",
        "rank": 33
      },
      "food_insecurity": {
        "value": 92,
        "change": null,
        "change_basis": "not available - SAIPE poverty data is annual",
        "rank": 30
      },
      "housing_stress": {
        "value": 143,
        "change": 11.5,
        "change_basis": "year-over-year FHFA house price index (FRED)",
        "rank": 35
      },
      "affordability": {
        "value": 123,
        "change": null,
        "change_basis": "not available - derived index, no independent change series",
        "rank": 36
      },
      "metrics": {
        "unemployment_rate": 3.6,
        "unemployment_period": "2026-07",
        "poverty_rate": 10.4,
        "rent_burden_pct": 29.3,
        "rent_burden_source": "census_acs",
        "rent_burden_pct_observed": "2026-09-05",
        "fair_market_rent_2br": null,
        "fair_market_rent_source": null,
        "fair_market_rent_2br_observed": null,
        "median_rent_2br": 1200,
        "median_rent_source": "Harvard JCHS 2025",
        "fmr_score_source": "jchs_2025",
        "housing_price_change": 11.49636889949724,
        "housing_price_change_source": "FRED FHFA HPI",
        "housing_price_change_observed": "2026-09-05",
        "regional_stress_multiplier": 1.05,
        "trends_boost": {
          "financial_anxiety": {
            "value": null,
            "applied": false
          },
          "food_insecurity": {
            "value": null,
            "applied": false
          },
          "housing_stress": {
            "value": null,
            "applied": false
          },
          "affordability": {
            "value": null,
            "applied": false
          }
        },
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
        "source": "Derived from NLIHC OOR 2025 fallback FMR (NLIHC formula)"
      }
    },
    "US-IL": {
      "name": "Illinois",
      "abbr": "IL",
      "financial_anxiety": {
        "value": 152,
        "change": 14,
        "change_basis": "year-over-year unemployment rate",
        "rank": 17
      },
      "food_insecurity": {
        "value": 99,
        "change": null,
        "change_basis": "not available - SAIPE poverty data is annual",
        "rank": 26
      },
      "housing_stress": {
        "value": 164,
        "change": 21.8,
        "change_basis": "year-over-year FHFA house price index (FRED)",
        "rank": 14
      },
      "affordability": {
        "value": 138,
        "change": null,
        "change_basis": "not available - derived index, no independent change series",
        "rank": 20
      },
      "metrics": {
        "unemployment_rate": 4.9,
        "unemployment_period": "2026-07",
        "poverty_rate": 11.5,
        "rent_burden_pct": 29.4,
        "rent_burden_source": "census_acs",
        "rent_burden_pct_observed": "2026-09-05",
        "fair_market_rent_2br": null,
        "fair_market_rent_source": null,
        "fair_market_rent_2br_observed": null,
        "median_rent_2br": 1175,
        "median_rent_source": "Harvard JCHS 2025",
        "fmr_score_source": "jchs_2025",
        "housing_price_change": 21.75531457096136,
        "housing_price_change_source": "FRED FHFA HPI",
        "housing_price_change_observed": "2026-09-05",
        "regional_stress_multiplier": 1.05,
        "trends_boost": {
          "financial_anxiety": {
            "value": null,
            "applied": false
          },
          "food_insecurity": {
            "value": null,
            "applied": false
          },
          "housing_stress": {
            "value": null,
            "applied": false
          },
          "affordability": {
            "value": null,
            "applied": false
          }
        },
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
        "source": "Derived from NLIHC OOR 2025 fallback FMR (NLIHC formula)"
      }
    },
    "US-IN": {
      "name": "Indiana",
      "abbr": "IN",
      "financial_anxiety": {
        "value": 121,
        "change": -10.8,
        "change_basis": "year-over-year unemployment rate",
        "rank": 40
      },
      "food_insecurity": {
        "value": 102,
        "change": null,
        "change_basis": "not available - SAIPE poverty data is annual",
        "rank": 24
      },
      "housing_stress": {
        "value": 143,
        "change": 16.2,
        "change_basis": "year-over-year FHFA house price index (FRED)",
        "rank": 36
      },
      "affordability": {
        "value": 127,
        "change": null,
        "change_basis": "not available - derived index, no independent change series",
        "rank": 31
      },
      "metrics": {
        "unemployment_rate": 3.3,
        "unemployment_period": "2026-07",
        "poverty_rate": 12.1,
        "rent_burden_pct": 29.3,
        "rent_burden_source": "census_acs",
        "rent_burden_pct_observed": "2026-09-05",
        "fair_market_rent_2br": null,
        "fair_market_rent_source": null,
        "fair_market_rent_2br_observed": null,
        "median_rent_2br": 975,
        "median_rent_source": "Harvard JCHS 2025",
        "fmr_score_source": "jchs_2025",
        "housing_price_change": 16.226537216828486,
        "housing_price_change_source": "FRED FHFA HPI",
        "housing_price_change_observed": "2026-09-05",
        "regional_stress_multiplier": 1.04,
        "trends_boost": {
          "financial_anxiety": {
            "value": null,
            "applied": false
          },
          "food_insecurity": {
            "value": null,
            "applied": false
          },
          "housing_stress": {
            "value": null,
            "applied": false
          },
          "affordability": {
            "value": null,
            "applied": false
          }
        },
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
        "source": "Derived from NLIHC OOR 2025 fallback FMR (NLIHC formula)"
      }
    },
    "US-IA": {
      "name": "Iowa",
      "abbr": "IA",
      "financial_anxiety": {
        "value": 105,
        "change": -8.6,
        "change_basis": "year-over-year unemployment rate",
        "rank": 45
      },
      "food_insecurity": {
        "value": 85,
        "change": null,
        "change_basis": "not available - SAIPE poverty data is annual",
        "rank": 37
      },
      "housing_stress": {
        "value": 112,
        "change": 13.1,
        "change_basis": "year-over-year FHFA house price index (FRED)",
        "rank": 49
      },
      "affordability": {
        "value": 101,
        "change": null,
        "change_basis": "not available - derived index, no independent change series",
        "rank": 49
      },
      "metrics": {
        "unemployment_rate": 3.2,
        "unemployment_period": "2026-07",
        "poverty_rate": 11.2,
        "rent_burden_pct": 27.2,
        "rent_burden_source": "census_acs",
        "rent_burden_pct_observed": "2026-09-05",
        "fair_market_rent_2br": null,
        "fair_market_rent_source": null,
        "fair_market_rent_2br_observed": null,
        "median_rent_2br": 875,
        "median_rent_source": "Harvard JCHS 2025",
        "fmr_score_source": "jchs_2025",
        "housing_price_change": 13.143807870370367,
        "housing_price_change_source": "FRED FHFA HPI",
        "housing_price_change_observed": "2026-09-05",
        "regional_stress_multiplier": 0.92,
        "trends_boost": {
          "financial_anxiety": {
            "value": null,
            "applied": false
          },
          "food_insecurity": {
            "value": null,
            "applied": false
          },
          "housing_stress": {
            "value": null,
            "applied": false
          },
          "affordability": {
            "value": null,
            "applied": false
          }
        },
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
        "source": "Derived from NLIHC OOR 2025 fallback FMR (NLIHC formula)"
      }
    },
    "US-KS": {
      "name": "Kansas",
      "abbr": "KS",
      "financial_anxiety": {
        "value": 125,
        "change": 2.7,
        "change_basis": "year-over-year unemployment rate",
        "rank": 36
      },
      "food_insecurity": {
        "value": 90,
        "change": null,
        "change_basis": "not available - SAIPE poverty data is annual",
        "rank": 31
      },
      "housing_stress": {
        "value": 129,
        "change": 15.6,
        "change_basis": "year-over-year FHFA house price index (FRED)",
        "rank": 45
      },
      "affordability": {
        "value": 113,
        "change": null,
        "change_basis": "not available - derived index, no independent change series",
        "rank": 44
      },
      "metrics": {
        "unemployment_rate": 3.8,
        "unemployment_period": "2026-07",
        "poverty_rate": 10.9,
        "rent_burden_pct": 27.1,
        "rent_burden_source": "census_acs",
        "rent_burden_pct_observed": "2026-09-05",
        "fair_market_rent_2br": null,
        "fair_market_rent_source": null,
        "fair_market_rent_2br_observed": null,
        "median_rent_2br": 950,
        "median_rent_source": "Harvard JCHS 2025",
        "fmr_score_source": "jchs_2025",
        "housing_price_change": 15.578271722334492,
        "housing_price_change_source": "FRED FHFA HPI",
        "housing_price_change_observed": "2026-09-05",
        "regional_stress_multiplier": 1,
        "trends_boost": {
          "financial_anxiety": {
            "value": null,
            "applied": false
          },
          "food_insecurity": {
            "value": null,
            "applied": false
          },
          "housing_stress": {
            "value": null,
            "applied": false
          },
          "affordability": {
            "value": null,
            "applied": false
          }
        },
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
        "source": "Derived from NLIHC OOR 2025 fallback FMR (NLIHC formula)"
      }
    },
    "US-KY": {
      "name": "Kentucky",
      "abbr": "KY",
      "financial_anxiety": {
        "value": 167,
        "change": 2.2,
        "change_basis": "year-over-year unemployment rate",
        "rank": 5
      },
      "food_insecurity": {
        "value": 139,
        "change": null,
        "change_basis": "not available - SAIPE poverty data is annual",
        "rank": 8
      },
      "housing_stress": {
        "value": 155,
        "change": 16.2,
        "change_basis": "year-over-year FHFA house price index (FRED)",
        "rank": 21
      },
      "affordability": {
        "value": 149,
        "change": null,
        "change_basis": "not available - derived index, no independent change series",
        "rank": 13
      },
      "metrics": {
        "unemployment_rate": 4.7,
        "unemployment_period": "2026-07",
        "poverty_rate": 15.4,
        "rent_burden_pct": 27.9,
        "rent_burden_source": "census_acs",
        "rent_burden_pct_observed": "2026-09-05",
        "fair_market_rent_2br": null,
        "fair_market_rent_source": null,
        "fair_market_rent_2br_observed": null,
        "median_rent_2br": 900,
        "median_rent_source": "Harvard JCHS 2025",
        "fmr_score_source": "jchs_2025",
        "housing_price_change": 16.20879663460589,
        "housing_price_change_source": "FRED FHFA HPI",
        "housing_price_change_observed": "2026-09-05",
        "regional_stress_multiplier": 1.18,
        "trends_boost": {
          "financial_anxiety": {
            "value": null,
            "applied": false
          },
          "food_insecurity": {
            "value": null,
            "applied": false
          },
          "housing_stress": {
            "value": null,
            "applied": false
          },
          "affordability": {
            "value": null,
            "applied": false
          }
        },
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
        "source": "Derived from NLIHC OOR 2025 fallback FMR (NLIHC formula)"
      }
    },
    "US-LA": {
      "name": "Louisiana",
      "abbr": "LA",
      "financial_anxiety": {
        "value": 177,
        "change": 2.3,
        "change_basis": "year-over-year unemployment rate",
        "rank": 2
      },
      "food_insecurity": {
        "value": 160,
        "change": null,
        "change_basis": "not available - SAIPE poverty data is annual",
        "rank": 1,
        "clamped": "ceiling"
      },
      "housing_stress": {
        "value": 166,
        "change": 6.3,
        "change_basis": "year-over-year FHFA house price index (FRED)",
        "rank": 13
      },
      "affordability": {
        "value": 164,
        "change": null,
        "change_basis": "not available - derived index, no independent change series",
        "rank": 4
      },
      "metrics": {
        "unemployment_rate": 4.4,
        "unemployment_period": "2026-07",
        "poverty_rate": 18.6,
        "rent_burden_pct": 32.5,
        "rent_burden_source": "census_acs",
        "rent_burden_pct_observed": "2026-09-05",
        "fair_market_rent_2br": null,
        "fair_market_rent_source": null,
        "fair_market_rent_2br_observed": null,
        "median_rent_2br": 975,
        "median_rent_source": "Harvard JCHS 2025",
        "fmr_score_source": "jchs_2025",
        "housing_price_change": 6.334122892573488,
        "housing_price_change_source": "FRED FHFA HPI",
        "housing_price_change_observed": "2026-09-05",
        "regional_stress_multiplier": 1.3,
        "trends_boost": {
          "financial_anxiety": {
            "value": null,
            "applied": false
          },
          "food_insecurity": {
            "value": null,
            "applied": false
          },
          "housing_stress": {
            "value": null,
            "applied": false
          },
          "affordability": {
            "value": null,
            "applied": false
          }
        },
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
        "source": "Derived from NLIHC OOR 2025 fallback FMR (NLIHC formula)"
      }
    },
    "US-ME": {
      "name": "Maine",
      "abbr": "ME",
      "financial_anxiety": {
        "value": 107,
        "change": -6.1,
        "change_basis": "year-over-year unemployment rate",
        "rank": 44
      },
      "food_insecurity": {
        "value": 84,
        "change": null,
        "change_basis": "not available - SAIPE poverty data is annual",
        "rank": 40
      },
      "housing_stress": {
        "value": 141,
        "change": 17,
        "change_basis": "year-over-year FHFA house price index (FRED)",
        "rank": 38
      },
      "affordability": {
        "value": 118,
        "change": null,
        "change_basis": "not available - derived index, no independent change series",
        "rank": 40
      },
      "metrics": {
        "unemployment_rate": 3.1,
        "unemployment_period": "2026-07",
        "poverty_rate": 10.6,
        "rent_burden_pct": 30.1,
        "rent_burden_source": "census_acs",
        "rent_burden_pct_observed": "2026-09-05",
        "fair_market_rent_2br": null,
        "fair_market_rent_source": null,
        "fair_market_rent_2br_observed": null,
        "median_rent_2br": 1175,
        "median_rent_source": "Harvard JCHS 2025",
        "fmr_score_source": "jchs_2025",
        "housing_price_change": 16.967456449896368,
        "housing_price_change_source": "FRED FHFA HPI",
        "housing_price_change_observed": "2026-09-05",
        "regional_stress_multiplier": 0.95,
        "trends_boost": {
          "financial_anxiety": {
            "value": null,
            "applied": false
          },
          "food_insecurity": {
            "value": null,
            "applied": false
          },
          "housing_stress": {
            "value": null,
            "applied": false
          },
          "affordability": {
            "value": null,
            "applied": false
          }
        },
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
        "source": "Derived from NLIHC OOR 2025 fallback FMR (NLIHC formula)"
      }
    },
    "US-MD": {
      "name": "Maryland",
      "abbr": "MD",
      "financial_anxiety": {
        "value": 133,
        "change": 0,
        "change_basis": "year-over-year unemployment rate",
        "rank": 27
      },
      "food_insecurity": {
        "value": 80,
        "change": null,
        "change_basis": "not available - SAIPE poverty data is annual",
        "rank": 46
      },
      "housing_stress": {
        "value": 153,
        "change": 11.2,
        "change_basis": "year-over-year FHFA house price index (FRED)",
        "rank": 22
      },
      "affordability": {
        "value": 124,
        "change": null,
        "change_basis": "not available - derived index, no independent change series",
        "rank": 34
      },
      "metrics": {
        "unemployment_rate": 4.2,
        "unemployment_period": "2026-07",
        "poverty_rate": 9.2,
        "rent_burden_pct": 30.8,
        "rent_burden_source": "census_acs",
        "rent_burden_pct_observed": "2026-09-05",
        "fair_market_rent_2br": null,
        "fair_market_rent_source": null,
        "fair_market_rent_2br_observed": null,
        "median_rent_2br": 1600,
        "median_rent_source": "Harvard JCHS 2025",
        "fmr_score_source": "jchs_2025",
        "housing_price_change": 11.236387720838522,
        "housing_price_change_source": "FRED FHFA HPI",
        "housing_price_change_observed": "2026-09-05",
        "regional_stress_multiplier": 1,
        "trends_boost": {
          "financial_anxiety": {
            "value": null,
            "applied": false
          },
          "food_insecurity": {
            "value": null,
            "applied": false
          },
          "housing_stress": {
            "value": null,
            "applied": false
          },
          "affordability": {
            "value": null,
            "applied": false
          }
        },
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
        "source": "Derived from NLIHC OOR 2025 fallback FMR (NLIHC formula)"
      }
    },
    "US-MA": {
      "name": "Massachusetts",
      "abbr": "MA",
      "financial_anxiety": {
        "value": 139,
        "change": -2.2,
        "change_basis": "year-over-year unemployment rate",
        "rank": 26
      },
      "food_insecurity": {
        "value": 85,
        "change": null,
        "change_basis": "not available - SAIPE poverty data is annual",
        "rank": 38
      },
      "housing_stress": {
        "value": 172,
        "change": 16.1,
        "change_basis": "year-over-year FHFA house price index (FRED)",
        "rank": 10
      },
      "affordability": {
        "value": 137,
        "change": null,
        "change_basis": "not available - derived index, no independent change series",
        "rank": 22
      },
      "metrics": {
        "unemployment_rate": 4.4,
        "unemployment_period": "2026-07",
        "poverty_rate": 9.8,
        "rent_burden_pct": 31.1,
        "rent_burden_source": "census_acs",
        "rent_burden_pct_observed": "2026-09-05",
        "fair_market_rent_2br": null,
        "fair_market_rent_source": null,
        "fair_market_rent_2br_observed": null,
        "median_rent_2br": 1750,
        "median_rent_source": "Harvard JCHS 2025",
        "fmr_score_source": "jchs_2025",
        "housing_price_change": 16.05314022337085,
        "housing_price_change_source": "FRED FHFA HPI",
        "housing_price_change_observed": "2026-09-05",
        "regional_stress_multiplier": 1.02,
        "trends_boost": {
          "financial_anxiety": {
            "value": null,
            "applied": false
          },
          "food_insecurity": {
            "value": null,
            "applied": false
          },
          "housing_stress": {
            "value": null,
            "applied": false
          },
          "affordability": {
            "value": null,
            "applied": false
          }
        },
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
        "source": "Derived from NLIHC OOR 2025 fallback FMR (NLIHC formula)"
      }
    },
    "US-MI": {
      "name": "Michigan",
      "abbr": "MI",
      "financial_anxiety": {
        "value": 157,
        "change": 0,
        "change_basis": "year-over-year unemployment rate",
        "rank": 13
      },
      "food_insecurity": {
        "value": 114,
        "change": null,
        "change_basis": "not available - SAIPE poverty data is annual",
        "rank": 13
      },
      "housing_stress": {
        "value": 161,
        "change": 18,
        "change_basis": "year-over-year FHFA house price index (FRED)",
        "rank": 15
      },
      "affordability": {
        "value": 142,
        "change": null,
        "change_basis": "not available - derived index, no independent change series",
        "rank": 17
      },
      "metrics": {
        "unemployment_rate": 4.9,
        "unemployment_period": "2026-07",
        "poverty_rate": 13.4,
        "rent_burden_pct": 30.7,
        "rent_burden_source": "census_acs",
        "rent_burden_pct_observed": "2026-09-05",
        "fair_market_rent_2br": null,
        "fair_market_rent_source": null,
        "fair_market_rent_2br_observed": null,
        "median_rent_2br": 1075,
        "median_rent_source": "Harvard JCHS 2025",
        "fmr_score_source": "jchs_2025",
        "housing_price_change": 17.975715034894513,
        "housing_price_change_source": "FRED FHFA HPI",
        "housing_price_change_observed": "2026-09-05",
        "regional_stress_multiplier": 1.08,
        "trends_boost": {
          "financial_anxiety": {
            "value": null,
            "applied": false
          },
          "food_insecurity": {
            "value": null,
            "applied": false
          },
          "housing_stress": {
            "value": null,
            "applied": false
          },
          "affordability": {
            "value": null,
            "applied": false
          }
        },
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
        "source": "Derived from NLIHC OOR 2025 fallback FMR (NLIHC formula)"
      }
    },
    "US-MN": {
      "name": "Minnesota",
      "abbr": "MN",
      "financial_anxiety": {
        "value": 151,
        "change": 13.2,
        "change_basis": "year-over-year unemployment rate",
        "rank": 19
      },
      "food_insecurity": {
        "value": 90,
        "change": null,
        "change_basis": "not available - SAIPE poverty data is annual",
        "rank": 32
      },
      "housing_stress": {
        "value": 147,
        "change": 10.3,
        "change_basis": "year-over-year FHFA house price index (FRED)",
        "rank": 32
      },
      "affordability": {
        "value": 124,
        "change": null,
        "change_basis": "not available - derived index, no independent change series",
        "rank": 35
      },
      "metrics": {
        "unemployment_rate": 4.3,
        "unemployment_period": "2026-07",
        "poverty_rate": 9.3,
        "rent_burden_pct": 29.1,
        "rent_burden_source": "census_acs",
        "rent_burden_pct_observed": "2026-09-05",
        "fair_market_rent_2br": null,
        "fair_market_rent_source": null,
        "fair_market_rent_2br_observed": null,
        "median_rent_2br": 1150,
        "median_rent_source": "Harvard JCHS 2025",
        "fmr_score_source": "jchs_2025",
        "housing_price_change": 10.330184435447588,
        "housing_price_change_source": "FRED FHFA HPI",
        "housing_price_change_observed": "2026-09-05",
        "regional_stress_multiplier": 1.12,
        "trends_boost": {
          "financial_anxiety": {
            "value": null,
            "applied": false
          },
          "food_insecurity": {
            "value": null,
            "applied": false
          },
          "housing_stress": {
            "value": null,
            "applied": false
          },
          "affordability": {
            "value": null,
            "applied": false
          }
        },
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
        "source": "Derived from NLIHC OOR 2025 fallback FMR (NLIHC formula)"
      }
    },
    "US-MS": {
      "name": "Mississippi",
      "abbr": "MS",
      "financial_anxiety": {
        "value": 164,
        "change": -5.3,
        "change_basis": "year-over-year unemployment rate",
        "rank": 8
      },
      "food_insecurity": {
        "value": 160,
        "change": null,
        "change_basis": "not available - SAIPE poverty data is annual",
        "rank": 2,
        "clamped": "ceiling"
      },
      "housing_stress": {
        "value": 182,
        "change": 14.2,
        "change_basis": "year-over-year FHFA house price index (FRED)",
        "rank": 5
      },
      "affordability": {
        "value": 173,
        "change": null,
        "change_basis": "not available - derived index, no independent change series",
        "rank": 1
      },
      "metrics": {
        "unemployment_rate": 3.6,
        "unemployment_period": "2026-07",
        "poverty_rate": 17.8,
        "rent_burden_pct": 30.2,
        "rent_burden_source": "census_acs",
        "rent_burden_pct_observed": "2026-09-05",
        "fair_market_rent_2br": null,
        "fair_market_rent_source": null,
        "fair_market_rent_2br_observed": null,
        "median_rent_2br": 925,
        "median_rent_source": "Harvard JCHS 2025",
        "fmr_score_source": "jchs_2025",
        "housing_price_change": 14.166401527203295,
        "housing_price_change_source": "FRED FHFA HPI",
        "housing_price_change_observed": "2026-09-05",
        "regional_stress_multiplier": 1.35,
        "trends_boost": {
          "financial_anxiety": {
            "value": null,
            "applied": false
          },
          "food_insecurity": {
            "value": null,
            "applied": false
          },
          "housing_stress": {
            "value": null,
            "applied": false
          },
          "affordability": {
            "value": null,
            "applied": false
          }
        },
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
        "source": "Derived from NLIHC OOR 2025 fallback FMR (NLIHC formula)"
      }
    },
    "US-MO": {
      "name": "Missouri",
      "abbr": "MO",
      "financial_anxiety": {
        "value": 128,
        "change": -10,
        "change_basis": "year-over-year unemployment rate",
        "rank": 34
      },
      "food_insecurity": {
        "value": 103,
        "change": null,
        "change_basis": "not available - SAIPE poverty data is annual",
        "rank": 22
      },
      "housing_stress": {
        "value": 137,
        "change": 14.8,
        "change_basis": "year-over-year FHFA house price index (FRED)",
        "rank": 43
      },
      "affordability": {
        "value": 123,
        "change": null,
        "change_basis": "not available - derived index, no independent change series",
        "rank": 37
      },
      "metrics": {
        "unemployment_rate": 3.6,
        "unemployment_period": "2026-07",
        "poverty_rate": 12.2,
        "rent_burden_pct": 27.9,
        "rent_burden_source": "census_acs",
        "rent_burden_pct_observed": "2026-09-05",
        "fair_market_rent_2br": null,
        "fair_market_rent_source": null,
        "fair_market_rent_2br_observed": null,
        "median_rent_2br": 975,
        "median_rent_source": "Harvard JCHS 2025",
        "fmr_score_source": "jchs_2025",
        "housing_price_change": 14.83530803311881,
        "housing_price_change_source": "FRED FHFA HPI",
        "housing_price_change_observed": "2026-09-05",
        "regional_stress_multiplier": 1.05,
        "trends_boost": {
          "financial_anxiety": {
            "value": null,
            "applied": false
          },
          "food_insecurity": {
            "value": null,
            "applied": false
          },
          "housing_stress": {
            "value": null,
            "applied": false
          },
          "affordability": {
            "value": null,
            "applied": false
          }
        },
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
        "source": "Derived from NLIHC OOR 2025 fallback FMR (NLIHC formula)"
      }
    },
    "US-MT": {
      "name": "Montana",
      "abbr": "MT",
      "financial_anxiety": {
        "value": 115,
        "change": -3,
        "change_basis": "year-over-year unemployment rate",
        "rank": 42
      },
      "food_insecurity": {
        "value": 87,
        "change": null,
        "change_basis": "not available - SAIPE poverty data is annual",
        "rank": 34
      },
      "housing_stress": {
        "value": 125,
        "change": 11.3,
        "change_basis": "year-over-year FHFA house price index (FRED)",
        "rank": 46
      },
      "affordability": {
        "value": 110,
        "change": null,
        "change_basis": "not available - derived index, no independent change series",
        "rank": 45
      },
      "metrics": {
        "unemployment_rate": 3.2,
        "unemployment_period": "2026-07",
        "poverty_rate": 10.4,
        "rent_burden_pct": 27,
        "rent_burden_source": "census_acs",
        "rent_burden_pct_observed": "2026-09-05",
        "fair_market_rent_2br": null,
        "fair_market_rent_source": null,
        "fair_market_rent_2br_observed": null,
        "median_rent_2br": 1100,
        "median_rent_source": "Harvard JCHS 2025",
        "fmr_score_source": "jchs_2025",
        "housing_price_change": 11.271801538294877,
        "housing_price_change_source": "FRED FHFA HPI",
        "housing_price_change_observed": "2026-09-05",
        "regional_stress_multiplier": 1,
        "trends_boost": {
          "financial_anxiety": {
            "value": null,
            "applied": false
          },
          "food_insecurity": {
            "value": null,
            "applied": false
          },
          "housing_stress": {
            "value": null,
            "applied": false
          },
          "affordability": {
            "value": null,
            "applied": false
          }
        },
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
        "source": "Derived from NLIHC OOR 2025 fallback FMR (NLIHC formula)"
      }
    },
    "US-NE": {
      "name": "Nebraska",
      "abbr": "NE",
      "financial_anxiety": {
        "value": 104,
        "change": 0,
        "change_basis": "year-over-year unemployment rate",
        "rank": 47
      },
      "food_insecurity": {
        "value": 84,
        "change": null,
        "change_basis": "not available - SAIPE poverty data is annual",
        "rank": 41
      },
      "housing_stress": {
        "value": 122,
        "change": 12.7,
        "change_basis": "year-over-year FHFA house price index (FRED)",
        "rank": 47
      },
      "affordability": {
        "value": 107,
        "change": null,
        "change_basis": "not available - derived index, no independent change series",
        "rank": 47
      },
      "metrics": {
        "unemployment_rate": 2.9,
        "unemployment_period": "2026-07",
        "poverty_rate": 10.6,
        "rent_burden_pct": 28.5,
        "rent_burden_source": "census_acs",
        "rent_burden_pct_observed": "2026-09-05",
        "fair_market_rent_2br": null,
        "fair_market_rent_source": null,
        "fair_market_rent_2br_observed": null,
        "median_rent_2br": 975,
        "median_rent_source": "Harvard JCHS 2025",
        "fmr_score_source": "jchs_2025",
        "housing_price_change": 12.668287401172648,
        "housing_price_change_source": "FRED FHFA HPI",
        "housing_price_change_observed": "2026-09-05",
        "regional_stress_multiplier": 0.95,
        "trends_boost": {
          "financial_anxiety": {
            "value": null,
            "applied": false
          },
          "food_insecurity": {
            "value": null,
            "applied": false
          },
          "housing_stress": {
            "value": null,
            "applied": false
          },
          "affordability": {
            "value": null,
            "applied": false
          }
        },
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
        "source": "Derived from NLIHC OOR 2025 fallback FMR (NLIHC formula)"
      }
    },
    "US-NV": {
      "name": "Nevada",
      "abbr": "NV",
      "financial_anxiety": {
        "value": 165,
        "change": -3.8,
        "change_basis": "year-over-year unemployment rate",
        "rank": 7
      },
      "food_insecurity": {
        "value": 107,
        "change": null,
        "change_basis": "not available - SAIPE poverty data is annual",
        "rank": 19
      },
      "housing_stress": {
        "value": 179,
        "change": 12.3,
        "change_basis": "year-over-year FHFA house price index (FRED)",
        "rank": 9
      },
      "affordability": {
        "value": 150,
        "change": null,
        "change_basis": "not available - derived index, no independent change series",
        "rank": 12
      },
      "metrics": {
        "unemployment_rate": 5,
        "unemployment_period": "2026-07",
        "poverty_rate": 11.8,
        "rent_burden_pct": 34,
        "rent_burden_source": "census_acs",
        "rent_burden_pct_observed": "2026-09-05",
        "fair_market_rent_2br": null,
        "fair_market_rent_source": null,
        "fair_market_rent_2br_observed": null,
        "median_rent_2br": 1450,
        "median_rent_source": "Harvard JCHS 2025",
        "fmr_score_source": "jchs_2025",
        "housing_price_change": 12.306465315463706,
        "housing_price_change_source": "FRED FHFA HPI",
        "housing_price_change_observed": "2026-09-05",
        "regional_stress_multiplier": 1.12,
        "trends_boost": {
          "financial_anxiety": {
            "value": null,
            "applied": false
          },
          "food_insecurity": {
            "value": null,
            "applied": false
          },
          "housing_stress": {
            "value": null,
            "applied": false
          },
          "affordability": {
            "value": null,
            "applied": false
          }
        },
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
        "source": "Derived from NLIHC OOR 2025 fallback FMR (NLIHC formula)"
      }
    },
    "US-NH": {
      "name": "New Hampshire",
      "abbr": "NH",
      "financial_anxiety": {
        "value": 95,
        "change": -9.7,
        "change_basis": "year-over-year unemployment rate",
        "rank": 48
      },
      "food_insecurity": {
        "value": 61,
        "change": null,
        "change_basis": "not available - SAIPE poverty data is annual",
        "rank": 51
      },
      "housing_stress": {
        "value": 140,
        "change": 19.3,
        "change_basis": "year-over-year FHFA house price index (FRED)",
        "rank": 40
      },
      "affordability": {
        "value": 108,
        "change": null,
        "change_basis": "not available - derived index, no independent change series",
        "rank": 46
      },
      "metrics": {
        "unemployment_rate": 2.8,
        "unemployment_period": "2026-07",
        "poverty_rate": 7.3,
        "rent_burden_pct": 29.8,
        "rent_burden_source": "census_acs",
        "rent_burden_pct_observed": "2026-09-05",
        "fair_market_rent_2br": null,
        "fair_market_rent_source": null,
        "fair_market_rent_2br_observed": null,
        "median_rent_2br": 1400,
        "median_rent_source": "Harvard JCHS 2025",
        "fmr_score_source": "jchs_2025",
        "housing_price_change": 19.265615076536232,
        "housing_price_change_source": "FRED FHFA HPI",
        "housing_price_change_observed": "2026-09-05",
        "regional_stress_multiplier": 0.88,
        "trends_boost": {
          "financial_anxiety": {
            "value": null,
            "applied": false
          },
          "food_insecurity": {
            "value": null,
            "applied": false
          },
          "housing_stress": {
            "value": null,
            "applied": false
          },
          "affordability": {
            "value": null,
            "applied": false
          }
        },
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
        "source": "Derived from NLIHC OOR 2025 fallback FMR (NLIHC formula)"
      }
    },
    "US-NJ": {
      "name": "New Jersey",
      "abbr": "NJ",
      "financial_anxiety": {
        "value": 143,
        "change": -20,
        "change_basis": "year-over-year unemployment rate",
        "rank": 25
      },
      "food_insecurity": {
        "value": 84,
        "change": null,
        "change_basis": "not available - SAIPE poverty data is annual",
        "rank": 42
      },
      "housing_stress": {
        "value": 188,
        "change": 24.2,
        "change_basis": "year-over-year FHFA house price index (FRED)",
        "rank": 3
      },
      "affordability": {
        "value": 146,
        "change": null,
        "change_basis": "not available - derived index, no independent change series",
        "rank": 15
      },
      "metrics": {
        "unemployment_rate": 4.4,
        "unemployment_period": "2026-07",
        "poverty_rate": 9.2,
        "rent_burden_pct": 31.2,
        "rent_burden_source": "census_acs",
        "rent_burden_pct_observed": "2026-09-05",
        "fair_market_rent_2br": null,
        "fair_market_rent_source": null,
        "fair_market_rent_2br_observed": null,
        "median_rent_2br": 1550,
        "median_rent_source": "Harvard JCHS 2025",
        "fmr_score_source": "jchs_2025",
        "housing_price_change": 24.200960131440468,
        "housing_price_change_source": "FRED FHFA HPI",
        "housing_price_change_observed": "2026-09-05",
        "regional_stress_multiplier": 1.05,
        "trends_boost": {
          "financial_anxiety": {
            "value": null,
            "applied": false
          },
          "food_insecurity": {
            "value": null,
            "applied": false
          },
          "housing_stress": {
            "value": null,
            "applied": false
          },
          "affordability": {
            "value": null,
            "applied": false
          }
        },
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
        "source": "Derived from NLIHC OOR 2025 fallback FMR (NLIHC formula)"
      }
    },
    "US-NM": {
      "name": "New Mexico",
      "abbr": "NM",
      "financial_anxiety": {
        "value": 169,
        "change": 20,
        "change_basis": "year-over-year unemployment rate",
        "rank": 3
      },
      "food_insecurity": {
        "value": 141,
        "change": null,
        "change_basis": "not available - SAIPE poverty data is annual",
        "rank": 7
      },
      "housing_stress": {
        "value": 158,
        "change": 13.5,
        "change_basis": "year-over-year FHFA house price index (FRED)",
        "rank": 18
      },
      "affordability": {
        "value": 151,
        "change": null,
        "change_basis": "not available - derived index, no independent change series",
        "rank": 11
      },
      "metrics": {
        "unemployment_rate": 4.8,
        "unemployment_period": "2026-07",
        "poverty_rate": 15.8,
        "rent_burden_pct": 29.3,
        "rent_burden_source": "census_acs",
        "rent_burden_pct_observed": "2026-09-05",
        "fair_market_rent_2br": null,
        "fair_market_rent_source": null,
        "fair_market_rent_2br_observed": null,
        "median_rent_2br": 1025,
        "median_rent_source": "Harvard JCHS 2025",
        "fmr_score_source": "jchs_2025",
        "housing_price_change": 13.496734660969128,
        "housing_price_change_source": "FRED FHFA HPI",
        "housing_price_change_observed": "2026-09-05",
        "regional_stress_multiplier": 1.18,
        "trends_boost": {
          "financial_anxiety": {
            "value": null,
            "applied": false
          },
          "food_insecurity": {
            "value": null,
            "applied": false
          },
          "housing_stress": {
            "value": null,
            "applied": false
          },
          "affordability": {
            "value": null,
            "applied": false
          }
        },
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
        "source": "Derived from NLIHC OOR 2025 fallback FMR (NLIHC formula)"
      }
    },
    "US-NY": {
      "name": "New York",
      "abbr": "NY",
      "financial_anxiety": {
        "value": 157,
        "change": 0,
        "change_basis": "year-over-year unemployment rate",
        "rank": 14
      },
      "food_insecurity": {
        "value": 125,
        "change": null,
        "change_basis": "not available - SAIPE poverty data is annual",
        "rank": 10
      },
      "housing_stress": {
        "value": 198,
        "change": 22.4,
        "change_basis": "year-over-year FHFA house price index (FRED)",
        "rank": 2
      },
      "affordability": {
        "value": 169,
        "change": null,
        "change_basis": "not available - derived index, no independent change series",
        "rank": 3
      },
      "metrics": {
        "unemployment_rate": 4.4,
        "unemployment_period": "2026-07",
        "poverty_rate": 14,
        "rent_burden_pct": 30.9,
        "rent_burden_source": "census_acs",
        "rent_burden_pct_observed": "2026-09-05",
        "fair_market_rent_2br": null,
        "fair_market_rent_source": null,
        "fair_market_rent_2br_observed": null,
        "median_rent_2br": 1500,
        "median_rent_source": "Harvard JCHS 2025",
        "fmr_score_source": "jchs_2025",
        "housing_price_change": 22.396543883583455,
        "housing_price_change_source": "FRED FHFA HPI",
        "housing_price_change_observed": "2026-09-05",
        "regional_stress_multiplier": 1.15,
        "trends_boost": {
          "financial_anxiety": {
            "value": null,
            "applied": false
          },
          "food_insecurity": {
            "value": null,
            "applied": false
          },
          "housing_stress": {
            "value": null,
            "applied": false
          },
          "affordability": {
            "value": null,
            "applied": false
          }
        },
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
        "source": "Derived from NLIHC OOR 2025 fallback FMR (NLIHC formula)"
      }
    },
    "US-NC": {
      "name": "North Carolina",
      "abbr": "NC",
      "financial_anxiety": {
        "value": 132,
        "change": -7.7,
        "change_basis": "year-over-year unemployment rate",
        "rank": 28
      },
      "food_insecurity": {
        "value": 109,
        "change": null,
        "change_basis": "not available - SAIPE poverty data is annual",
        "rank": 17
      },
      "housing_stress": {
        "value": 153,
        "change": 12.3,
        "change_basis": "year-over-year FHFA house price index (FRED)",
        "rank": 23
      },
      "affordability": {
        "value": 135,
        "change": null,
        "change_basis": "not available - derived index, no independent change series",
        "rank": 24
      },
      "metrics": {
        "unemployment_rate": 3.6,
        "unemployment_period": "2026-07",
        "poverty_rate": 12.6,
        "rent_burden_pct": 30.8,
        "rent_burden_source": "census_acs",
        "rent_burden_pct_observed": "2026-09-05",
        "fair_market_rent_2br": null,
        "fair_market_rent_source": null,
        "fair_market_rent_2br_observed": null,
        "median_rent_2br": 1175,
        "median_rent_source": "Harvard JCHS 2025",
        "fmr_score_source": "jchs_2025",
        "housing_price_change": 12.32622357646162,
        "housing_price_change_source": "FRED FHFA HPI",
        "housing_price_change_observed": "2026-09-05",
        "regional_stress_multiplier": 1.08,
        "trends_boost": {
          "financial_anxiety": {
            "value": null,
            "applied": false
          },
          "food_insecurity": {
            "value": null,
            "applied": false
          },
          "housing_stress": {
            "value": null,
            "applied": false
          },
          "affordability": {
            "value": null,
            "applied": false
          }
        },
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
        "source": "Derived from NLIHC OOR 2025 fallback FMR (NLIHC formula)"
      }
    },
    "US-ND": {
      "name": "North Dakota",
      "abbr": "ND",
      "financial_anxiety": {
        "value": 82,
        "change": -15.4,
        "change_basis": "year-over-year unemployment rate",
        "rank": 50
      },
      "food_insecurity": {
        "value": 76,
        "change": null,
        "change_basis": "not available - SAIPE poverty data is annual",
        "rank": 49
      },
      "housing_stress": {
        "value": 100,
        "change": 14.8,
        "change_basis": "year-over-year FHFA house price index (FRED)",
        "rank": 51
      },
      "affordability": {
        "value": 90,
        "change": null,
        "change_basis": "not available - derived index, no independent change series",
        "rank": 51
      },
      "metrics": {
        "unemployment_rate": 2.2,
        "unemployment_period": "2026-07",
        "poverty_rate": 10.8,
        "rent_burden_pct": 24.2,
        "rent_burden_source": "census_acs",
        "rent_burden_pct_observed": "2026-09-05",
        "fair_market_rent_2br": null,
        "fair_market_rent_source": null,
        "fair_market_rent_2br_observed": null,
        "median_rent_2br": 925,
        "median_rent_source": "Harvard JCHS 2025",
        "fmr_score_source": "jchs_2025",
        "housing_price_change": 14.842703082126215,
        "housing_price_change_source": "FRED FHFA HPI",
        "housing_price_change_observed": "2026-09-05",
        "regional_stress_multiplier": 0.85,
        "trends_boost": {
          "financial_anxiety": {
            "value": null,
            "applied": false
          },
          "food_insecurity": {
            "value": null,
            "applied": false
          },
          "housing_stress": {
            "value": null,
            "applied": false
          },
          "affordability": {
            "value": null,
            "applied": false
          }
        },
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
        "source": "Derived from NLIHC OOR 2025 fallback FMR (NLIHC formula)"
      }
    },
    "US-OH": {
      "name": "Ohio",
      "abbr": "OH",
      "financial_anxiety": {
        "value": 125,
        "change": -24.4,
        "change_basis": "year-over-year unemployment rate",
        "rank": 37
      },
      "food_insecurity": {
        "value": 107,
        "change": null,
        "change_basis": "not available - SAIPE poverty data is annual",
        "rank": 20
      },
      "housing_stress": {
        "value": 149,
        "change": 18.3,
        "change_basis": "year-over-year FHFA house price index (FRED)",
        "rank": 31
      },
      "affordability": {
        "value": 132,
        "change": null,
        "change_basis": "not available - derived index, no independent change series",
        "rank": 26
      },
      "metrics": {
        "unemployment_rate": 3.4,
        "unemployment_period": "2026-07",
        "poverty_rate": 12.6,
        "rent_burden_pct": 29,
        "rent_burden_source": "census_acs",
        "rent_burden_pct_observed": "2026-09-05",
        "fair_market_rent_2br": null,
        "fair_market_rent_source": null,
        "fair_market_rent_2br_observed": null,
        "median_rent_2br": 950,
        "median_rent_source": "Harvard JCHS 2025",
        "fmr_score_source": "jchs_2025",
        "housing_price_change": 18.262110197703656,
        "housing_price_change_source": "FRED FHFA HPI",
        "housing_price_change_observed": "2026-09-05",
        "regional_stress_multiplier": 1.06,
        "trends_boost": {
          "financial_anxiety": {
            "value": null,
            "applied": false
          },
          "food_insecurity": {
            "value": null,
            "applied": false
          },
          "housing_stress": {
            "value": null,
            "applied": false
          },
          "affordability": {
            "value": null,
            "applied": false
          }
        },
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
        "source": "Derived from NLIHC OOR 2025 fallback FMR (NLIHC formula)"
      }
    },
    "US-OK": {
      "name": "Oklahoma",
      "abbr": "OK",
      "financial_anxiety": {
        "value": 155,
        "change": 30.3,
        "change_basis": "year-over-year unemployment rate",
        "rank": 15
      },
      "food_insecurity": {
        "value": 131,
        "change": null,
        "change_basis": "not available - SAIPE poverty data is annual",
        "rank": 9
      },
      "housing_stress": {
        "value": 143,
        "change": 11.6,
        "change_basis": "year-over-year FHFA house price index (FRED)",
        "rank": 37
      },
      "affordability": {
        "value": 138,
        "change": null,
        "change_basis": "not available - derived index, no independent change series",
        "rank": 21
      },
      "metrics": {
        "unemployment_rate": 4.3,
        "unemployment_period": "2026-07",
        "poverty_rate": 14.8,
        "rent_burden_pct": 28.4,
        "rent_burden_source": "census_acs",
        "rent_burden_pct_observed": "2026-09-05",
        "fair_market_rent_2br": null,
        "fair_market_rent_source": null,
        "fair_market_rent_2br_observed": null,
        "median_rent_2br": 925,
        "median_rent_source": "Harvard JCHS 2025",
        "fmr_score_source": "jchs_2025",
        "housing_price_change": 11.586452762923342,
        "housing_price_change_source": "FRED FHFA HPI",
        "housing_price_change_observed": "2026-09-05",
        "regional_stress_multiplier": 1.15,
        "trends_boost": {
          "financial_anxiety": {
            "value": null,
            "applied": false
          },
          "food_insecurity": {
            "value": null,
            "applied": false
          },
          "housing_stress": {
            "value": null,
            "applied": false
          },
          "affordability": {
            "value": null,
            "applied": false
          }
        },
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
        "source": "Derived from NLIHC OOR 2025 fallback FMR (NLIHC formula)"
      }
    },
    "US-OR": {
      "name": "Oregon",
      "abbr": "OR",
      "financial_anxiety": {
        "value": 158,
        "change": -1.9,
        "change_basis": "year-over-year unemployment rate",
        "rank": 11
      },
      "food_insecurity": {
        "value": 100,
        "change": null,
        "change_basis": "not available - SAIPE poverty data is annual",
        "rank": 25
      },
      "housing_stress": {
        "value": 146,
        "change": 6,
        "change_basis": "year-over-year FHFA house price index (FRED)",
        "rank": 33
      },
      "affordability": {
        "value": 128,
        "change": null,
        "change_basis": "not available - derived index, no independent change series",
        "rank": 29
      },
      "metrics": {
        "unemployment_rate": 5.2,
        "unemployment_period": "2026-07",
        "poverty_rate": 11.7,
        "rent_burden_pct": 31.2,
        "rent_burden_source": "census_acs",
        "rent_burden_pct_observed": "2026-09-05",
        "fair_market_rent_2br": null,
        "fair_market_rent_source": null,
        "fair_market_rent_2br_observed": null,
        "median_rent_2br": 1450,
        "median_rent_source": "Harvard JCHS 2025",
        "fmr_score_source": "jchs_2025",
        "housing_price_change": 5.985701718519612,
        "housing_price_change_source": "FRED FHFA HPI",
        "housing_price_change_observed": "2026-09-05",
        "regional_stress_multiplier": 1.05,
        "trends_boost": {
          "financial_anxiety": {
            "value": null,
            "applied": false
          },
          "food_insecurity": {
            "value": null,
            "applied": false
          },
          "housing_stress": {
            "value": null,
            "applied": false
          },
          "affordability": {
            "value": null,
            "applied": false
          }
        },
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
        "source": "Derived from NLIHC OOR 2025 fallback FMR (NLIHC formula)"
      }
    },
    "US-PA": {
      "name": "Pennsylvania",
      "abbr": "PA",
      "financial_anxiety": {
        "value": 130,
        "change": -11.4,
        "change_basis": "year-over-year unemployment rate",
        "rank": 31
      },
      "food_insecurity": {
        "value": 96,
        "change": null,
        "change_basis": "not available - SAIPE poverty data is annual",
        "rank": 27
      },
      "housing_stress": {
        "value": 151,
        "change": 18.1,
        "change_basis": "year-over-year FHFA house price index (FRED)",
        "rank": 26
      },
      "affordability": {
        "value": 129,
        "change": null,
        "change_basis": "not available - derived index, no independent change series",
        "rank": 27
      },
      "metrics": {
        "unemployment_rate": 3.9,
        "unemployment_period": "2026-07",
        "poverty_rate": 11.6,
        "rent_burden_pct": 29.7,
        "rent_burden_source": "census_acs",
        "rent_burden_pct_observed": "2026-09-05",
        "fair_market_rent_2br": null,
        "fair_market_rent_source": null,
        "fair_market_rent_2br_observed": null,
        "median_rent_2br": 1125,
        "median_rent_source": "Harvard JCHS 2025",
        "fmr_score_source": "jchs_2025",
        "housing_price_change": 18.06222021835047,
        "housing_price_change_source": "FRED FHFA HPI",
        "housing_price_change_observed": "2026-09-05",
        "regional_stress_multiplier": 1.02,
        "trends_boost": {
          "financial_anxiety": {
            "value": null,
            "applied": false
          },
          "food_insecurity": {
            "value": null,
            "applied": false
          },
          "housing_stress": {
            "value": null,
            "applied": false
          },
          "affordability": {
            "value": null,
            "applied": false
          }
        },
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
        "source": "Derived from NLIHC OOR 2025 fallback FMR (NLIHC formula)"
      }
    },
    "US-RI": {
      "name": "Rhode Island",
      "abbr": "RI",
      "financial_anxiety": {
        "value": 125,
        "change": -7.1,
        "change_basis": "year-over-year unemployment rate",
        "rank": 38
      },
      "food_insecurity": {
        "value": 95,
        "change": null,
        "change_basis": "not available - SAIPE poverty data is annual",
        "rank": 28
      },
      "housing_stress": {
        "value": 160,
        "change": 22.1,
        "change_basis": "year-over-year FHFA house price index (FRED)",
        "rank": 16
      },
      "affordability": {
        "value": 134,
        "change": null,
        "change_basis": "not available - derived index, no independent change series",
        "rank": 25
      },
      "metrics": {
        "unemployment_rate": 3.9,
        "unemployment_period": "2026-07",
        "poverty_rate": 12,
        "rent_burden_pct": 30.5,
        "rent_burden_source": "census_acs",
        "rent_burden_pct_observed": "2026-09-05",
        "fair_market_rent_2br": null,
        "fair_market_rent_source": null,
        "fair_market_rent_2br_observed": null,
        "median_rent_2br": 1275,
        "median_rent_source": "Harvard JCHS 2025",
        "fmr_score_source": "jchs_2025",
        "housing_price_change": 22.076373683064112,
        "housing_price_change_source": "FRED FHFA HPI",
        "housing_price_change_observed": "2026-09-05",
        "regional_stress_multiplier": 0.98,
        "trends_boost": {
          "financial_anxiety": {
            "value": null,
            "applied": false
          },
          "food_insecurity": {
            "value": null,
            "applied": false
          },
          "housing_stress": {
            "value": null,
            "applied": false
          },
          "affordability": {
            "value": null,
            "applied": false
          }
        },
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
        "source": "Derived from NLIHC OOR 2025 fallback FMR (NLIHC formula)"
      }
    },
    "US-SC": {
      "name": "South Carolina",
      "abbr": "SC",
      "financial_anxiety": {
        "value": 152,
        "change": -4.5,
        "change_basis": "year-over-year unemployment rate",
        "rank": 18
      },
      "food_insecurity": {
        "value": 121,
        "change": null,
        "change_basis": "not available - SAIPE poverty data is annual",
        "rank": 11
      },
      "housing_stress": {
        "value": 172,
        "change": 16.6,
        "change_basis": "year-over-year FHFA house price index (FRED)",
        "rank": 11
      },
      "affordability": {
        "value": 152,
        "change": null,
        "change_basis": "not available - derived index, no independent change series",
        "rank": 9
      },
      "metrics": {
        "unemployment_rate": 4.2,
        "unemployment_period": "2026-07",
        "poverty_rate": 13.3,
        "rent_burden_pct": 31.4,
        "rent_burden_source": "census_acs",
        "rent_burden_pct_observed": "2026-09-05",
        "fair_market_rent_2br": null,
        "fair_market_rent_source": null,
        "fair_market_rent_2br_observed": null,
        "median_rent_2br": 1125,
        "median_rent_source": "Harvard JCHS 2025",
        "fmr_score_source": "jchs_2025",
        "housing_price_change": 16.57771204424153,
        "housing_price_change_source": "FRED FHFA HPI",
        "housing_price_change_observed": "2026-09-05",
        "regional_stress_multiplier": 1.15,
        "trends_boost": {
          "financial_anxiety": {
            "value": null,
            "applied": false
          },
          "food_insecurity": {
            "value": null,
            "applied": false
          },
          "housing_stress": {
            "value": null,
            "applied": false
          },
          "affordability": {
            "value": null,
            "applied": false
          }
        },
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
        "source": "Derived from NLIHC OOR 2025 fallback FMR (NLIHC formula)"
      }
    },
    "US-SD": {
      "name": "South Dakota",
      "abbr": "SD",
      "financial_anxiety": {
        "value": 82,
        "change": 0,
        "change_basis": "year-over-year unemployment rate",
        "rank": 51
      },
      "food_insecurity": {
        "value": 77,
        "change": null,
        "change_basis": "not available - SAIPE poverty data is annual",
        "rank": 47
      },
      "housing_stress": {
        "value": 103,
        "change": 11.4,
        "change_basis": "year-over-year FHFA house price index (FRED)",
        "rank": 50
      },
      "affordability": {
        "value": 93,
        "change": null,
        "change_basis": "not available - derived index, no independent change series",
        "rank": 50
      },
      "metrics": {
        "unemployment_rate": 2,
        "unemployment_period": "2026-07",
        "poverty_rate": 10.5,
        "rent_burden_pct": 26.9,
        "rent_burden_source": "census_acs",
        "rent_burden_pct_observed": "2026-09-05",
        "fair_market_rent_2br": null,
        "fair_market_rent_source": null,
        "fair_market_rent_2br_observed": null,
        "median_rent_2br": 875,
        "median_rent_source": "Harvard JCHS 2025",
        "fmr_score_source": "jchs_2025",
        "housing_price_change": 11.36340000693312,
        "housing_price_change_source": "FRED FHFA HPI",
        "housing_price_change_observed": "2026-09-05",
        "regional_stress_multiplier": 0.88,
        "trends_boost": {
          "financial_anxiety": {
            "value": null,
            "applied": false
          },
          "food_insecurity": {
            "value": null,
            "applied": false
          },
          "housing_stress": {
            "value": null,
            "applied": false
          },
          "affordability": {
            "value": null,
            "applied": false
          }
        },
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
        "source": "Derived from NLIHC OOR 2025 fallback FMR (NLIHC formula)"
      }
    },
    "US-TN": {
      "name": "Tennessee",
      "abbr": "TN",
      "financial_anxiety": {
        "value": 132,
        "change": -2.9,
        "change_basis": "year-over-year unemployment rate",
        "rank": 29
      },
      "food_insecurity": {
        "value": 117,
        "change": null,
        "change_basis": "not available - SAIPE poverty data is annual",
        "rank": 12
      },
      "housing_stress": {
        "value": 153,
        "change": 11.9,
        "change_basis": "year-over-year FHFA house price index (FRED)",
        "rank": 24
      },
      "affordability": {
        "value": 139,
        "change": null,
        "change_basis": "not available - derived index, no independent change series",
        "rank": 19
      },
      "metrics": {
        "unemployment_rate": 3.4,
        "unemployment_period": "2026-07",
        "poverty_rate": 13.3,
        "rent_burden_pct": 30.1,
        "rent_burden_source": "census_acs",
        "rent_burden_pct_observed": "2026-09-05",
        "fair_market_rent_2br": null,
        "fair_market_rent_source": null,
        "fair_market_rent_2br_observed": null,
        "median_rent_2br": 1125,
        "median_rent_source": "Harvard JCHS 2025",
        "fmr_score_source": "jchs_2025",
        "housing_price_change": 11.851640423068996,
        "housing_price_change_source": "FRED FHFA HPI",
        "housing_price_change_observed": "2026-09-05",
        "regional_stress_multiplier": 1.12,
        "trends_boost": {
          "financial_anxiety": {
            "value": null,
            "applied": false
          },
          "food_insecurity": {
            "value": null,
            "applied": false
          },
          "housing_stress": {
            "value": null,
            "applied": false
          },
          "affordability": {
            "value": null,
            "applied": false
          }
        },
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
        "source": "Derived from NLIHC OOR 2025 fallback FMR (NLIHC formula)"
      }
    },
    "US-TX": {
      "name": "Texas",
      "abbr": "TX",
      "financial_anxiety": {
        "value": 145,
        "change": 7.1,
        "change_basis": "year-over-year unemployment rate",
        "rank": 23
      },
      "food_insecurity": {
        "value": 111,
        "change": null,
        "change_basis": "not available - SAIPE poverty data is annual",
        "rank": 16
      },
      "housing_stress": {
        "value": 141,
        "change": 6.2,
        "change_basis": "year-over-year FHFA house price index (FRED)",
        "rank": 39
      },
      "affordability": {
        "value": 129,
        "change": null,
        "change_basis": "not available - derived index, no independent change series",
        "rank": 28
      },
      "metrics": {
        "unemployment_rate": 4.5,
        "unemployment_period": "2026-07",
        "poverty_rate": 13.4,
        "rent_burden_pct": 31.4,
        "rent_burden_source": "census_acs",
        "rent_burden_pct_observed": "2026-09-05",
        "fair_market_rent_2br": null,
        "fair_market_rent_source": null,
        "fair_market_rent_2br_observed": null,
        "median_rent_2br": 1275,
        "median_rent_source": "Harvard JCHS 2025",
        "fmr_score_source": "jchs_2025",
        "housing_price_change": 6.204649489275784,
        "housing_price_change_source": "FRED FHFA HPI",
        "housing_price_change_observed": "2026-09-05",
        "regional_stress_multiplier": 1.05,
        "trends_boost": {
          "financial_anxiety": {
            "value": null,
            "applied": false
          },
          "food_insecurity": {
            "value": null,
            "applied": false
          },
          "housing_stress": {
            "value": null,
            "applied": false
          },
          "affordability": {
            "value": null,
            "applied": false
          }
        },
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
        "source": "Derived from NLIHC OOR 2025 fallback FMR (NLIHC formula)"
      }
    },
    "US-UT": {
      "name": "Utah",
      "abbr": "UT",
      "financial_anxiety": {
        "value": 124,
        "change": 2.9,
        "change_basis": "year-over-year unemployment rate",
        "rank": 39
      },
      "food_insecurity": {
        "value": 77,
        "change": null,
        "change_basis": "not available - SAIPE poverty data is annual",
        "rank": 48
      },
      "housing_stress": {
        "value": 140,
        "change": 9.6,
        "change_basis": "year-over-year FHFA house price index (FRED)",
        "rank": 41
      },
      "affordability": {
        "value": 115,
        "change": null,
        "change_basis": "not available - derived index, no independent change series",
        "rank": 41
      },
      "metrics": {
        "unemployment_rate": 3.6,
        "unemployment_period": "2026-07",
        "poverty_rate": 8.4,
        "rent_burden_pct": 29.4,
        "rent_burden_source": "census_acs",
        "rent_burden_pct_observed": "2026-09-05",
        "fair_market_rent_2br": null,
        "fair_market_rent_source": null,
        "fair_market_rent_2br_observed": null,
        "median_rent_2br": 1350,
        "median_rent_source": "Harvard JCHS 2025",
        "fmr_score_source": "jchs_2025",
        "housing_price_change": 9.590360224522628,
        "housing_price_change_source": "FRED FHFA HPI",
        "housing_price_change_observed": "2026-09-05",
        "regional_stress_multiplier": 1.02,
        "trends_boost": {
          "financial_anxiety": {
            "value": null,
            "applied": false
          },
          "food_insecurity": {
            "value": null,
            "applied": false
          },
          "housing_stress": {
            "value": null,
            "applied": false
          },
          "affordability": {
            "value": null,
            "applied": false
          }
        },
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
        "source": "Derived from NLIHC OOR 2025 fallback FMR (NLIHC formula)"
      }
    },
    "US-VT": {
      "name": "Vermont",
      "abbr": "VT",
      "financial_anxiety": {
        "value": 95,
        "change": 0,
        "change_basis": "year-over-year unemployment rate",
        "rank": 49
      },
      "food_insecurity": {
        "value": 74,
        "change": null,
        "change_basis": "not available - SAIPE poverty data is annual",
        "rank": 50
      },
      "housing_stress": {
        "value": 140,
        "change": 18.1,
        "change_basis": "year-over-year FHFA house price index (FRED)",
        "rank": 42
      },
      "affordability": {
        "value": 114,
        "change": null,
        "change_basis": "not available - derived index, no independent change series",
        "rank": 43
      },
      "metrics": {
        "unemployment_rate": 2.6,
        "unemployment_period": "2026-07",
        "poverty_rate": 9.3,
        "rent_burden_pct": 29.5,
        "rent_burden_source": "census_acs",
        "rent_burden_pct_observed": "2026-09-05",
        "fair_market_rent_2br": null,
        "fair_market_rent_source": null,
        "fair_market_rent_2br_observed": null,
        "median_rent_2br": 1275,
        "median_rent_source": "Harvard JCHS 2025",
        "fmr_score_source": "jchs_2025",
        "housing_price_change": 18.079650417353527,
        "housing_price_change_source": "FRED FHFA HPI",
        "housing_price_change_observed": "2026-09-05",
        "regional_stress_multiplier": 0.92,
        "trends_boost": {
          "financial_anxiety": {
            "value": null,
            "applied": false
          },
          "food_insecurity": {
            "value": null,
            "applied": false
          },
          "housing_stress": {
            "value": null,
            "applied": false
          },
          "affordability": {
            "value": null,
            "applied": false
          }
        },
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
        "source": "Derived from NLIHC OOR 2025 fallback FMR (NLIHC formula)"
      }
    },
    "US-VA": {
      "name": "Virginia",
      "abbr": "VA",
      "financial_anxiety": {
        "value": 121,
        "change": 12.1,
        "change_basis": "year-over-year unemployment rate",
        "rank": 41
      },
      "food_insecurity": {
        "value": 82,
        "change": null,
        "change_basis": "not available - SAIPE poverty data is annual",
        "rank": 43
      },
      "housing_stress": {
        "value": 151,
        "change": 16,
        "change_basis": "year-over-year FHFA house price index (FRED)",
        "rank": 27
      },
      "affordability": {
        "value": 123,
        "change": null,
        "change_basis": "not available - derived index, no independent change series",
        "rank": 38
      },
      "metrics": {
        "unemployment_rate": 3.7,
        "unemployment_period": "2026-07",
        "poverty_rate": 9.8,
        "rent_burden_pct": 29.7,
        "rent_burden_source": "census_acs",
        "rent_burden_pct_observed": "2026-09-05",
        "fair_market_rent_2br": null,
        "fair_market_rent_source": null,
        "fair_market_rent_2br_observed": null,
        "median_rent_2br": 1450,
        "median_rent_source": "Harvard JCHS 2025",
        "fmr_score_source": "jchs_2025",
        "housing_price_change": 15.954445566312279,
        "housing_price_change_source": "FRED FHFA HPI",
        "housing_price_change_observed": "2026-09-05",
        "regional_stress_multiplier": 0.98,
        "trends_boost": {
          "financial_anxiety": {
            "value": null,
            "applied": false
          },
          "food_insecurity": {
            "value": null,
            "applied": false
          },
          "housing_stress": {
            "value": null,
            "applied": false
          },
          "affordability": {
            "value": null,
            "applied": false
          }
        },
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
        "source": "Derived from NLIHC OOR 2025 fallback FMR (NLIHC formula)"
      }
    },
    "US-WA": {
      "name": "Washington",
      "abbr": "WA",
      "financial_anxiety": {
        "value": 150,
        "change": 8.7,
        "change_basis": "year-over-year unemployment rate",
        "rank": 20
      },
      "food_insecurity": {
        "value": 87,
        "change": null,
        "change_basis": "not available - SAIPE poverty data is annual",
        "rank": 35
      },
      "housing_stress": {
        "value": 151,
        "change": 8.2,
        "change_basis": "year-over-year FHFA house price index (FRED)",
        "rank": 28
      },
      "affordability": {
        "value": 125,
        "change": null,
        "change_basis": "not available - derived index, no independent change series",
        "rank": 33
      },
      "metrics": {
        "unemployment_rate": 5,
        "unemployment_period": "2026-07",
        "poverty_rate": 10,
        "rent_burden_pct": 30.4,
        "rent_burden_source": "census_acs",
        "rent_burden_pct_observed": "2026-09-05",
        "fair_market_rent_2br": null,
        "fair_market_rent_source": null,
        "fair_market_rent_2br_observed": null,
        "median_rent_2br": 1650,
        "median_rent_source": "Harvard JCHS 2025",
        "fmr_score_source": "jchs_2025",
        "housing_price_change": 8.238362592701218,
        "housing_price_change_source": "FRED FHFA HPI",
        "housing_price_change_observed": "2026-09-05",
        "regional_stress_multiplier": 1.02,
        "trends_boost": {
          "financial_anxiety": {
            "value": null,
            "applied": false
          },
          "food_insecurity": {
            "value": null,
            "applied": false
          },
          "housing_stress": {
            "value": null,
            "applied": false
          },
          "affordability": {
            "value": null,
            "applied": false
          }
        },
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
        "source": "Derived from NLIHC OOR 2025 fallback FMR (NLIHC formula)"
      }
    },
    "US-WV": {
      "name": "West Virginia",
      "abbr": "WV",
      "financial_anxiety": {
        "value": 167,
        "change": -2.4,
        "change_basis": "year-over-year unemployment rate",
        "rank": 6
      },
      "food_insecurity": {
        "value": 156,
        "change": null,
        "change_basis": "not available - SAIPE poverty data is annual",
        "rank": 3
      },
      "housing_stress": {
        "value": 180,
        "change": 21.8,
        "change_basis": "year-over-year FHFA house price index (FRED)",
        "rank": 7
      },
      "affordability": {
        "value": 170,
        "change": null,
        "change_basis": "not available - derived index, no independent change series",
        "rank": 2
      },
      "metrics": {
        "unemployment_rate": 4.1,
        "unemployment_period": "2026-07",
        "poverty_rate": 16.2,
        "rent_burden_pct": 28.4,
        "rent_burden_source": "census_acs",
        "rent_burden_pct_observed": "2026-09-05",
        "fair_market_rent_2br": null,
        "fair_market_rent_source": null,
        "fair_market_rent_2br_observed": null,
        "median_rent_2br": 800,
        "median_rent_source": "Harvard JCHS 2025",
        "fmr_score_source": "jchs_2025",
        "housing_price_change": 21.801153218011542,
        "housing_price_change_source": "FRED FHFA HPI",
        "housing_price_change_observed": "2026-09-05",
        "regional_stress_multiplier": 1.28,
        "trends_boost": {
          "financial_anxiety": {
            "value": null,
            "applied": false
          },
          "food_insecurity": {
            "value": null,
            "applied": false
          },
          "housing_stress": {
            "value": null,
            "applied": false
          },
          "affordability": {
            "value": null,
            "applied": false
          }
        },
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
        "source": "Derived from NLIHC OOR 2025 fallback FMR (NLIHC formula)"
      }
    },
    "US-WI": {
      "name": "Wisconsin",
      "abbr": "WI",
      "financial_anxiety": {
        "value": 111,
        "change": 10,
        "change_basis": "year-over-year unemployment rate",
        "rank": 43
      },
      "food_insecurity": {
        "value": 82,
        "change": null,
        "change_basis": "not available - SAIPE poverty data is annual",
        "rank": 44
      },
      "housing_stress": {
        "value": 137,
        "change": 20.9,
        "change_basis": "year-over-year FHFA house price index (FRED)",
        "rank": 44
      },
      "affordability": {
        "value": 115,
        "change": null,
        "change_basis": "not available - derived index, no independent change series",
        "rank": 42
      },
      "metrics": {
        "unemployment_rate": 3.3,
        "unemployment_period": "2026-07",
        "poverty_rate": 10.3,
        "rent_burden_pct": 27.9,
        "rent_burden_source": "census_acs",
        "rent_burden_pct_observed": "2026-09-05",
        "fair_market_rent_2br": null,
        "fair_market_rent_source": null,
        "fair_market_rent_2br_observed": null,
        "median_rent_2br": 1000,
        "median_rent_source": "Harvard JCHS 2025",
        "fmr_score_source": "jchs_2025",
        "housing_price_change": 20.920752458955086,
        "housing_price_change_source": "FRED FHFA HPI",
        "housing_price_change_observed": "2026-09-05",
        "regional_stress_multiplier": 0.95,
        "trends_boost": {
          "financial_anxiety": {
            "value": null,
            "applied": false
          },
          "food_insecurity": {
            "value": null,
            "applied": false
          },
          "housing_stress": {
            "value": null,
            "applied": false
          },
          "affordability": {
            "value": null,
            "applied": false
          }
        },
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
        "source": "Derived from NLIHC OOR 2025 fallback FMR (NLIHC formula)"
      }
    },
    "US-WY": {
      "name": "Wyoming",
      "abbr": "WY",
      "financial_anxiety": {
        "value": 105,
        "change": -9.1,
        "change_basis": "year-over-year unemployment rate",
        "rank": 46
      },
      "food_insecurity": {
        "value": 81,
        "change": null,
        "change_basis": "not available - SAIPE poverty data is annual",
        "rank": 45
      },
      "housing_stress": {
        "value": 119,
        "change": 14.3,
        "change_basis": "year-over-year FHFA house price index (FRED)",
        "rank": 48
      },
      "affordability": {
        "value": 104,
        "change": null,
        "change_basis": "not available - derived index, no independent change series",
        "rank": 48
      },
      "metrics": {
        "unemployment_rate": 3,
        "unemployment_period": "2026-07",
        "poverty_rate": 10,
        "rent_burden_pct": 26.5,
        "rent_burden_source": "census_acs",
        "rent_burden_pct_observed": "2026-09-05",
        "fair_market_rent_2br": null,
        "fair_market_rent_source": null,
        "fair_market_rent_2br_observed": null,
        "median_rent_2br": 975,
        "median_rent_source": "Harvard JCHS 2025",
        "fmr_score_source": "jchs_2025",
        "housing_price_change": 14.335307774089273,
        "housing_price_change_source": "FRED FHFA HPI",
        "housing_price_change_observed": "2026-09-05",
        "regional_stress_multiplier": 0.95,
        "trends_boost": {
          "financial_anxiety": {
            "value": null,
            "applied": false
          },
          "food_insecurity": {
            "value": null,
            "applied": false
          },
          "housing_stress": {
            "value": null,
            "applied": false
          },
          "affordability": {
            "value": null,
            "applied": false
          }
        },
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
        "source": "Derived from NLIHC OOR 2025 fallback FMR (NLIHC formula)"
      }
    }
  },
  "timeseries": {
    "national": {
      "financial_anxiety": [
        {
          "date": "2016-10-01",
          "value": 43
        },
        {
          "date": "2016-11-01",
          "value": 45
        },
        {
          "date": "2016-12-01",
          "value": 43
        },
        {
          "date": "2017-01-01",
          "value": 44
        },
        {
          "date": "2017-02-01",
          "value": 45
        },
        {
          "date": "2017-03-01",
          "value": 46
        },
        {
          "date": "2017-04-01",
          "value": 45
        },
        {
          "date": "2017-05-01",
          "value": 45
        },
        {
          "date": "2017-06-01",
          "value": 45
        },
        {
          "date": "2017-07-01",
          "value": 45
        },
        {
          "date": "2017-08-01",
          "value": 44
        },
        {
          "date": "2017-09-01",
          "value": 47
        },
        {
          "date": "2017-10-01",
          "value": 48
        },
        {
          "date": "2017-11-01",
          "value": 47
        },
        {
          "date": "2017-12-01",
          "value": 43
        },
        {
          "date": "2018-01-01",
          "value": 39
        },
        {
          "date": "2018-02-01",
          "value": 41
        },
        {
          "date": "2018-03-01",
          "value": 42
        },
        {
          "date": "2018-04-01",
          "value": 44
        },
        {
          "date": "2018-05-01",
          "value": 43
        },
        {
          "date": "2018-06-01",
          "value": 42
        },
        {
          "date": "2018-07-01",
          "value": 39
        },
        {
          "date": "2018-08-01",
          "value": 39
        },
        {
          "date": "2018-09-01",
          "value": 39
        },
        {
          "date": "2018-10-01",
          "value": 41
        },
        {
          "date": "2018-11-01",
          "value": 43
        },
        {
          "date": "2018-12-01",
          "value": 42
        },
        {
          "date": "2019-01-01",
          "value": 44
        },
        {
          "date": "2019-02-01",
          "value": 44
        },
        {
          "date": "2019-03-01",
          "value": 47
        },
        {
          "date": "2019-04-01",
          "value": 46
        },
        {
          "date": "2019-05-01",
          "value": 45
        },
        {
          "date": "2019-06-01",
          "value": 43
        },
        {
          "date": "2019-07-01",
          "value": 41
        },
        {
          "date": "2019-08-01",
          "value": 41
        },
        {
          "date": "2019-09-01",
          "value": 43
        },
        {
          "date": "2019-10-01",
          "value": 45
        },
        {
          "date": "2019-11-01",
          "value": 46
        },
        {
          "date": "2019-12-01",
          "value": 44
        },
        {
          "date": "2020-01-01",
          "value": 45
        },
        {
          "date": "2020-02-01",
          "value": 48
        },
        {
          "date": "2020-03-01",
          "value": 50
        },
        {
          "date": "2020-04-01",
          "value": 47
        },
        {
          "date": "2020-05-01",
          "value": 43
        },
        {
          "date": "2020-06-01",
          "value": 40
        },
        {
          "date": "2020-07-01",
          "value": 38
        },
        {
          "date": "2020-08-01",
          "value": 36
        },
        {
          "date": "2020-09-01",
          "value": 39
        },
        {
          "date": "2020-10-01",
          "value": 42
        },
        {
          "date": "2020-11-01",
          "value": 44
        },
        {
          "date": "2020-12-01",
          "value": 42
        },
        {
          "date": "2021-01-01",
          "value": 40
        },
        {
          "date": "2021-02-01",
          "value": 41
        },
        {
          "date": "2021-03-01",
          "value": 44
        },
        {
          "date": "2021-04-01",
          "value": 45
        },
        {
          "date": "2021-05-01",
          "value": 45
        },
        {
          "date": "2021-06-01",
          "value": 41
        },
        {
          "date": "2021-07-01",
          "value": 38
        },
        {
          "date": "2021-08-01",
          "value": 34
        },
        {
          "date": "2021-09-01",
          "value": 37
        },
        {
          "date": "2021-10-01",
          "value": 40
        },
        {
          "date": "2021-11-01",
          "value": 44
        },
        {
          "date": "2021-12-01",
          "value": 43
        },
        {
          "date": "2022-01-01",
          "value": 44
        },
        {
          "date": "2022-02-01",
          "value": 48
        },
        {
          "date": "2022-03-01",
          "value": 54
        },
        {
          "date": "2022-04-01",
          "value": 61
        },
        {
          "date": "2022-05-01",
          "value": 63
        },
        {
          "date": "2022-06-01",
          "value": 60
        },
        {
          "date": "2022-07-01",
          "value": 51
        },
        {
          "date": "2022-08-01",
          "value": 49
        },
        {
          "date": "2022-09-01",
          "value": 53
        },
        {
          "date": "2022-10-01",
          "value": 59
        },
        {
          "date": "2022-11-01",
          "value": 62
        },
        {
          "date": "2022-12-01",
          "value": 61
        },
        {
          "date": "2023-01-01",
          "value": 61
        },
        {
          "date": "2023-02-01",
          "value": 63
        },
        {
          "date": "2023-03-01",
          "value": 68
        },
        {
          "date": "2023-04-01",
          "value": 71
        },
        {
          "date": "2023-05-01",
          "value": 74
        },
        {
          "date": "2023-06-01",
          "value": 68
        },
        {
          "date": "2023-07-01",
          "value": 60
        },
        {
          "date": "2023-08-01",
          "value": 53
        },
        {
          "date": "2023-09-01",
          "value": 60
        },
        {
          "date": "2023-10-01",
          "value": 70
        },
        {
          "date": "2023-11-01",
          "value": 80
        },
        {
          "date": "2023-12-01",
          "value": 80
        },
        {
          "date": "2024-01-01",
          "value": 78
        },
        {
          "date": "2024-02-01",
          "value": 80
        },
        {
          "date": "2024-03-01",
          "value": 83
        },
        {
          "date": "2024-04-01",
          "value": 89
        },
        {
          "date": "2024-05-01",
          "value": 84
        },
        {
          "date": "2024-06-01",
          "value": 75
        },
        {
          "date": "2024-07-01",
          "value": 63
        },
        {
          "date": "2024-08-01",
          "value": 59
        },
        {
          "date": "2024-09-01",
          "value": 66
        },
        {
          "date": "2024-10-01",
          "value": 77
        },
        {
          "date": "2024-11-01",
          "value": 85
        },
        {
          "date": "2024-12-01",
          "value": 84
        },
        {
          "date": "2025-01-01",
          "value": 82
        },
        {
          "date": "2025-02-01",
          "value": 87
        },
        {
          "date": "2025-03-01",
          "value": 93
        },
        {
          "date": "2025-04-01",
          "value": 98
        },
        {
          "date": "2025-05-01",
          "value": 91
        },
        {
          "date": "2025-06-01",
          "value": 88
        },
        {
          "date": "2025-07-01",
          "value": 84
        },
        {
          "date": "2025-08-01",
          "value": 87
        },
        {
          "date": "2025-09-01",
          "value": 97
        },
        {
          "date": "2025-10-01",
          "value": 105
        },
        {
          "date": "2025-11-01",
          "value": 113
        },
        {
          "date": "2025-12-01",
          "value": 113
        },
        {
          "date": "2026-01-01",
          "value": 114
        },
        {
          "date": "2026-02-01",
          "value": 122
        },
        {
          "date": "2026-03-01",
          "value": 136
        },
        {
          "date": "2026-04-01",
          "value": 155
        },
        {
          "date": "2026-05-01",
          "value": 166
        },
        {
          "date": "2026-06-01",
          "value": 169
        },
        {
          "date": "2026-07-01",
          "value": 139
        },
        {
          "date": "2026-08-01",
          "value": 139
        },
        {
          "date": "2026-09-01",
          "value": 137
        }
      ],
      "food_insecurity": [
        {
          "date": "2016-10-01",
          "value": 100
        },
        {
          "date": "2016-11-01",
          "value": 96
        },
        {
          "date": "2016-12-01",
          "value": 92
        },
        {
          "date": "2017-01-01",
          "value": 91
        },
        {
          "date": "2017-02-01",
          "value": 90
        },
        {
          "date": "2017-03-01",
          "value": 90
        },
        {
          "date": "2017-04-01",
          "value": 82
        },
        {
          "date": "2017-05-01",
          "value": 81
        },
        {
          "date": "2017-06-01",
          "value": 87
        },
        {
          "date": "2017-07-01",
          "value": 94
        },
        {
          "date": "2017-08-01",
          "value": 99
        },
        {
          "date": "2017-09-01",
          "value": 110
        },
        {
          "date": "2017-10-01",
          "value": 122
        },
        {
          "date": "2017-11-01",
          "value": 120
        },
        {
          "date": "2017-12-01",
          "value": 103
        },
        {
          "date": "2018-01-01",
          "value": 93
        },
        {
          "date": "2018-02-01",
          "value": 96
        },
        {
          "date": "2018-03-01",
          "value": 96
        },
        {
          "date": "2018-04-01",
          "value": 91
        },
        {
          "date": "2018-05-01",
          "value": 83
        },
        {
          "date": "2018-06-01",
          "value": 86
        },
        {
          "date": "2018-07-01",
          "value": 91
        },
        {
          "date": "2018-08-01",
          "value": 99
        },
        {
          "date": "2018-09-01",
          "value": 100
        },
        {
          "date": "2018-10-01",
          "value": 98
        },
        {
          "date": "2018-11-01",
          "value": 91
        },
        {
          "date": "2018-12-01",
          "value": 88
        },
        {
          "date": "2019-01-01",
          "value": 121
        },
        {
          "date": "2019-02-01",
          "value": 128
        },
        {
          "date": "2019-03-01",
          "value": 128
        },
        {
          "date": "2019-04-01",
          "value": 91
        },
        {
          "date": "2019-05-01",
          "value": 83
        },
        {
          "date": "2019-06-01",
          "value": 85
        },
        {
          "date": "2019-07-01",
          "value": 94
        },
        {
          "date": "2019-08-01",
          "value": 100
        },
        {
          "date": "2019-09-01",
          "value": 100
        },
        {
          "date": "2019-10-01",
          "value": 93
        },
        {
          "date": "2019-11-01",
          "value": 86
        },
        {
          "date": "2019-12-01",
          "value": 85
        },
        {
          "date": "2020-01-01",
          "value": 87
        },
        {
          "date": "2020-02-01",
          "value": 89
        },
        {
          "date": "2020-03-01",
          "value": 124
        },
        {
          "date": "2020-04-01",
          "value": 194
        },
        {
          "date": "2020-05-01",
          "value": 221
        },
        {
          "date": "2020-06-01",
          "value": 207
        },
        {
          "date": "2020-07-01",
          "value": 152
        },
        {
          "date": "2020-08-01",
          "value": 142
        },
        {
          "date": "2020-09-01",
          "value": 135
        },
        {
          "date": "2020-10-01",
          "value": 136
        },
        {
          "date": "2020-11-01",
          "value": 134
        },
        {
          "date": "2020-12-01",
          "value": 136
        },
        {
          "date": "2021-01-01",
          "value": 140
        },
        {
          "date": "2021-02-01",
          "value": 145
        },
        {
          "date": "2021-03-01",
          "value": 140
        },
        {
          "date": "2021-04-01",
          "value": 127
        },
        {
          "date": "2021-05-01",
          "value": 121
        },
        {
          "date": "2021-06-01",
          "value": 128
        },
        {
          "date": "2021-07-01",
          "value": 138
        },
        {
          "date": "2021-08-01",
          "value": 153
        },
        {
          "date": "2021-09-01",
          "value": 162
        },
        {
          "date": "2021-10-01",
          "value": 162
        },
        {
          "date": "2021-11-01",
          "value": 150
        },
        {
          "date": "2021-12-01",
          "value": 137
        },
        {
          "date": "2022-01-01",
          "value": 142
        },
        {
          "date": "2022-02-01",
          "value": 146
        },
        {
          "date": "2022-03-01",
          "value": 148
        },
        {
          "date": "2022-04-01",
          "value": 138
        },
        {
          "date": "2022-05-01",
          "value": 134
        },
        {
          "date": "2022-06-01",
          "value": 143
        },
        {
          "date": "2022-07-01",
          "value": 156
        },
        {
          "date": "2022-08-01",
          "value": 167
        },
        {
          "date": "2022-09-01",
          "value": 171
        },
        {
          "date": "2022-10-01",
          "value": 172
        },
        {
          "date": "2022-11-01",
          "value": 164
        },
        {
          "date": "2022-12-01",
          "value": 152
        },
        {
          "date": "2023-01-01",
          "value": 144
        },
        {
          "date": "2023-02-01",
          "value": 137
        },
        {
          "date": "2023-03-01",
          "value": 131
        },
        {
          "date": "2023-04-01",
          "value": 119
        },
        {
          "date": "2023-05-01",
          "value": 118
        },
        {
          "date": "2023-06-01",
          "value": 123
        },
        {
          "date": "2023-07-01",
          "value": 131
        },
        {
          "date": "2023-08-01",
          "value": 138
        },
        {
          "date": "2023-09-01",
          "value": 142
        },
        {
          "date": "2023-10-01",
          "value": 137
        },
        {
          "date": "2023-11-01",
          "value": 127
        },
        {
          "date": "2023-12-01",
          "value": 115
        },
        {
          "date": "2024-01-01",
          "value": 114
        },
        {
          "date": "2024-02-01",
          "value": 113
        },
        {
          "date": "2024-03-01",
          "value": 107
        },
        {
          "date": "2024-04-01",
          "value": 99
        },
        {
          "date": "2024-05-01",
          "value": 96
        },
        {
          "date": "2024-06-01",
          "value": 104
        },
        {
          "date": "2024-07-01",
          "value": 112
        },
        {
          "date": "2024-08-01",
          "value": 119
        },
        {
          "date": "2024-09-01",
          "value": 117
        },
        {
          "date": "2024-10-01",
          "value": 117
        },
        {
          "date": "2024-11-01",
          "value": 112
        },
        {
          "date": "2024-12-01",
          "value": 106
        },
        {
          "date": "2025-01-01",
          "value": 110
        },
        {
          "date": "2025-02-01",
          "value": 112
        },
        {
          "date": "2025-03-01",
          "value": 111
        },
        {
          "date": "2025-04-01",
          "value": 99
        },
        {
          "date": "2025-05-01",
          "value": 94
        },
        {
          "date": "2025-06-01",
          "value": 98
        },
        {
          "date": "2025-07-01",
          "value": 103
        },
        {
          "date": "2025-08-01",
          "value": 109
        },
        {
          "date": "2025-09-01",
          "value": 109
        },
        {
          "date": "2025-10-01",
          "value": 160
        },
        {
          "date": "2025-11-01",
          "value": 198
        },
        {
          "date": "2025-12-01",
          "value": 196
        },
        {
          "date": "2026-01-01",
          "value": 143
        },
        {
          "date": "2026-02-01",
          "value": 100
        },
        {
          "date": "2026-03-01",
          "value": 99
        },
        {
          "date": "2026-04-01",
          "value": 98
        },
        {
          "date": "2026-05-01",
          "value": 99
        },
        {
          "date": "2026-06-01",
          "value": 105
        },
        {
          "date": "2026-07-01",
          "value": 103
        },
        {
          "date": "2026-08-01",
          "value": 103
        },
        {
          "date": "2026-09-01",
          "value": 103
        }
      ],
      "housing_stress": [
        {
          "date": "2016-10-01",
          "value": 44
        },
        {
          "date": "2016-11-01",
          "value": 44
        },
        {
          "date": "2016-12-01",
          "value": 45
        },
        {
          "date": "2017-01-01",
          "value": 46
        },
        {
          "date": "2017-02-01",
          "value": 43
        },
        {
          "date": "2017-03-01",
          "value": 43
        },
        {
          "date": "2017-04-01",
          "value": 40
        },
        {
          "date": "2017-05-01",
          "value": 43
        },
        {
          "date": "2017-06-01",
          "value": 48
        },
        {
          "date": "2017-07-01",
          "value": 54
        },
        {
          "date": "2017-08-01",
          "value": 58
        },
        {
          "date": "2017-09-01",
          "value": 57
        },
        {
          "date": "2017-10-01",
          "value": 54
        },
        {
          "date": "2017-11-01",
          "value": 50
        },
        {
          "date": "2017-12-01",
          "value": 48
        },
        {
          "date": "2018-01-01",
          "value": 48
        },
        {
          "date": "2018-02-01",
          "value": 46
        },
        {
          "date": "2018-03-01",
          "value": 45
        },
        {
          "date": "2018-04-01",
          "value": 42
        },
        {
          "date": "2018-05-01",
          "value": 45
        },
        {
          "date": "2018-06-01",
          "value": 49
        },
        {
          "date": "2018-07-01",
          "value": 54
        },
        {
          "date": "2018-08-01",
          "value": 58
        },
        {
          "date": "2018-09-01",
          "value": 58
        },
        {
          "date": "2018-10-01",
          "value": 56
        },
        {
          "date": "2018-11-01",
          "value": 51
        },
        {
          "date": "2018-12-01",
          "value": 51
        },
        {
          "date": "2019-01-01",
          "value": 50
        },
        {
          "date": "2019-02-01",
          "value": 49
        },
        {
          "date": "2019-03-01",
          "value": 47
        },
        {
          "date": "2019-04-01",
          "value": 46
        },
        {
          "date": "2019-05-01",
          "value": 48
        },
        {
          "date": "2019-06-01",
          "value": 50
        },
        {
          "date": "2019-07-01",
          "value": 53
        },
        {
          "date": "2019-08-01",
          "value": 54
        },
        {
          "date": "2019-09-01",
          "value": 56
        },
        {
          "date": "2019-10-01",
          "value": 55
        },
        {
          "date": "2019-11-01",
          "value": 54
        },
        {
          "date": "2019-12-01",
          "value": 53
        },
        {
          "date": "2020-01-01",
          "value": 53
        },
        {
          "date": "2020-02-01",
          "value": 51
        },
        {
          "date": "2020-03-01",
          "value": 49
        },
        {
          "date": "2020-04-01",
          "value": 42
        },
        {
          "date": "2020-05-01",
          "value": 38
        },
        {
          "date": "2020-06-01",
          "value": 35
        },
        {
          "date": "2020-07-01",
          "value": 41
        },
        {
          "date": "2020-08-01",
          "value": 52
        },
        {
          "date": "2020-09-01",
          "value": 62
        },
        {
          "date": "2020-10-01",
          "value": 65
        },
        {
          "date": "2020-11-01",
          "value": 59
        },
        {
          "date": "2020-12-01",
          "value": 59
        },
        {
          "date": "2021-01-01",
          "value": 62
        },
        {
          "date": "2021-02-01",
          "value": 65
        },
        {
          "date": "2021-03-01",
          "value": 61
        },
        {
          "date": "2021-04-01",
          "value": 52
        },
        {
          "date": "2021-05-01",
          "value": 50
        },
        {
          "date": "2021-06-01",
          "value": 48
        },
        {
          "date": "2021-07-01",
          "value": 53
        },
        {
          "date": "2021-08-01",
          "value": 62
        },
        {
          "date": "2021-09-01",
          "value": 66
        },
        {
          "date": "2021-10-01",
          "value": 65
        },
        {
          "date": "2021-11-01",
          "value": 59
        },
        {
          "date": "2021-12-01",
          "value": 54
        },
        {
          "date": "2022-01-01",
          "value": 59
        },
        {
          "date": "2022-02-01",
          "value": 63
        },
        {
          "date": "2022-03-01",
          "value": 69
        },
        {
          "date": "2022-04-01",
          "value": 67
        },
        {
          "date": "2022-05-01",
          "value": 65
        },
        {
          "date": "2022-06-01",
          "value": 69
        },
        {
          "date": "2022-07-01",
          "value": 78
        },
        {
          "date": "2022-08-01",
          "value": 85
        },
        {
          "date": "2022-09-01",
          "value": 84
        },
        {
          "date": "2022-10-01",
          "value": 81
        },
        {
          "date": "2022-11-01",
          "value": 80
        },
        {
          "date": "2022-12-01",
          "value": 78
        },
        {
          "date": "2023-01-01",
          "value": 77
        },
        {
          "date": "2023-02-01",
          "value": 75
        },
        {
          "date": "2023-03-01",
          "value": 75
        },
        {
          "date": "2023-04-01",
          "value": 75
        },
        {
          "date": "2023-05-01",
          "value": 74
        },
        {
          "date": "2023-06-01",
          "value": 76
        },
        {
          "date": "2023-07-01",
          "value": 79
        },
        {
          "date": "2023-08-01",
          "value": 81
        },
        {
          "date": "2023-09-01",
          "value": 81
        },
        {
          "date": "2023-10-01",
          "value": 83
        },
        {
          "date": "2023-11-01",
          "value": 84
        },
        {
          "date": "2023-12-01",
          "value": 83
        },
        {
          "date": "2024-01-01",
          "value": 81
        },
        {
          "date": "2024-02-01",
          "value": 76
        },
        {
          "date": "2024-03-01",
          "value": 75
        },
        {
          "date": "2024-04-01",
          "value": 71
        },
        {
          "date": "2024-05-01",
          "value": 71
        },
        {
          "date": "2024-06-01",
          "value": 72
        },
        {
          "date": "2024-07-01",
          "value": 77
        },
        {
          "date": "2024-08-01",
          "value": 81
        },
        {
          "date": "2024-09-01",
          "value": 83
        },
        {
          "date": "2024-10-01",
          "value": 82
        },
        {
          "date": "2024-11-01",
          "value": 81
        },
        {
          "date": "2024-12-01",
          "value": 80
        },
        {
          "date": "2025-01-01",
          "value": 79
        },
        {
          "date": "2025-02-01",
          "value": 76
        },
        {
          "date": "2025-03-01",
          "value": 73
        },
        {
          "date": "2025-04-01",
          "value": 69
        },
        {
          "date": "2025-05-01",
          "value": 68
        },
        {
          "date": "2025-06-01",
          "value": 73
        },
        {
          "date": "2025-07-01",
          "value": 81
        },
        {
          "date": "2025-08-01",
          "value": 90
        },
        {
          "date": "2025-09-01",
          "value": 94
        },
        {
          "date": "2025-10-01",
          "value": 94
        },
        {
          "date": "2025-11-01",
          "value": 95
        },
        {
          "date": "2025-12-01",
          "value": 101
        },
        {
          "date": "2026-01-01",
          "value": 111
        },
        {
          "date": "2026-02-01",
          "value": 117
        },
        {
          "date": "2026-03-01",
          "value": 123
        },
        {
          "date": "2026-04-01",
          "value": 131
        },
        {
          "date": "2026-05-01",
          "value": 147
        },
        {
          "date": "2026-06-01",
          "value": 164
        },
        {
          "date": "2026-07-01",
          "value": 157
        },
        {
          "date": "2026-08-01",
          "value": 153
        },
        {
          "date": "2026-09-01",
          "value": 153
        }
      ],
      "affordability": [
        {
          "date": "2016-10-01",
          "value": 83
        },
        {
          "date": "2016-11-01",
          "value": 83
        },
        {
          "date": "2016-12-01",
          "value": 83
        },
        {
          "date": "2017-01-01",
          "value": 86
        },
        {
          "date": "2017-02-01",
          "value": 87
        },
        {
          "date": "2017-03-01",
          "value": 93
        },
        {
          "date": "2017-04-01",
          "value": 94
        },
        {
          "date": "2017-05-01",
          "value": 94
        },
        {
          "date": "2017-06-01",
          "value": 91
        },
        {
          "date": "2017-07-01",
          "value": 93
        },
        {
          "date": "2017-08-01",
          "value": 91
        },
        {
          "date": "2017-09-01",
          "value": 89
        },
        {
          "date": "2017-10-01",
          "value": 85
        },
        {
          "date": "2017-11-01",
          "value": 85
        },
        {
          "date": "2017-12-01",
          "value": 85
        },
        {
          "date": "2018-01-01",
          "value": 90
        },
        {
          "date": "2018-02-01",
          "value": 93
        },
        {
          "date": "2018-03-01",
          "value": 99
        },
        {
          "date": "2018-04-01",
          "value": 99
        },
        {
          "date": "2018-05-01",
          "value": 99
        },
        {
          "date": "2018-06-01",
          "value": 99
        },
        {
          "date": "2018-07-01",
          "value": 100
        },
        {
          "date": "2018-08-01",
          "value": 99
        },
        {
          "date": "2018-09-01",
          "value": 95
        },
        {
          "date": "2018-10-01",
          "value": 93
        },
        {
          "date": "2018-11-01",
          "value": 93
        },
        {
          "date": "2018-12-01",
          "value": 91
        },
        {
          "date": "2019-01-01",
          "value": 93
        },
        {
          "date": "2019-02-01",
          "value": 96
        },
        {
          "date": "2019-03-01",
          "value": 101
        },
        {
          "date": "2019-04-01",
          "value": 98
        },
        {
          "date": "2019-05-01",
          "value": 96
        },
        {
          "date": "2019-06-01",
          "value": 96
        },
        {
          "date": "2019-07-01",
          "value": 98
        },
        {
          "date": "2019-08-01",
          "value": 98
        },
        {
          "date": "2019-09-01",
          "value": 95
        },
        {
          "date": "2019-10-01",
          "value": 94
        },
        {
          "date": "2019-11-01",
          "value": 93
        },
        {
          "date": "2019-12-01",
          "value": 93
        },
        {
          "date": "2020-01-01",
          "value": 98
        },
        {
          "date": "2020-02-01",
          "value": 103
        },
        {
          "date": "2020-03-01",
          "value": 96
        },
        {
          "date": "2020-04-01",
          "value": 79
        },
        {
          "date": "2020-05-01",
          "value": 67
        },
        {
          "date": "2020-06-01",
          "value": 68
        },
        {
          "date": "2020-07-01",
          "value": 75
        },
        {
          "date": "2020-08-01",
          "value": 80
        },
        {
          "date": "2020-09-01",
          "value": 82
        },
        {
          "date": "2020-10-01",
          "value": 81
        },
        {
          "date": "2020-11-01",
          "value": 79
        },
        {
          "date": "2020-12-01",
          "value": 77
        },
        {
          "date": "2021-01-01",
          "value": 79
        },
        {
          "date": "2021-02-01",
          "value": 83
        },
        {
          "date": "2021-03-01",
          "value": 85
        },
        {
          "date": "2021-04-01",
          "value": 83
        },
        {
          "date": "2021-05-01",
          "value": 79
        },
        {
          "date": "2021-06-01",
          "value": 80
        },
        {
          "date": "2021-07-01",
          "value": 81
        },
        {
          "date": "2021-08-01",
          "value": 82
        },
        {
          "date": "2021-09-01",
          "value": 82
        },
        {
          "date": "2021-10-01",
          "value": 84
        },
        {
          "date": "2021-11-01",
          "value": 83
        },
        {
          "date": "2021-12-01",
          "value": 83
        },
        {
          "date": "2022-01-01",
          "value": 89
        },
        {
          "date": "2022-02-01",
          "value": 101
        },
        {
          "date": "2022-03-01",
          "value": 114
        },
        {
          "date": "2022-04-01",
          "value": 114
        },
        {
          "date": "2022-05-01",
          "value": 111
        },
        {
          "date": "2022-06-01",
          "value": 109
        },
        {
          "date": "2022-07-01",
          "value": 110
        },
        {
          "date": "2022-08-01",
          "value": 107
        },
        {
          "date": "2022-09-01",
          "value": 105
        },
        {
          "date": "2022-10-01",
          "value": 105
        },
        {
          "date": "2022-11-01",
          "value": 105
        },
        {
          "date": "2022-12-01",
          "value": 100
        },
        {
          "date": "2023-01-01",
          "value": 96
        },
        {
          "date": "2023-02-01",
          "value": 96
        },
        {
          "date": "2023-03-01",
          "value": 99
        },
        {
          "date": "2023-04-01",
          "value": 100
        },
        {
          "date": "2023-05-01",
          "value": 100
        },
        {
          "date": "2023-06-01",
          "value": 101
        },
        {
          "date": "2023-07-01",
          "value": 101
        },
        {
          "date": "2023-08-01",
          "value": 101
        },
        {
          "date": "2023-09-01",
          "value": 102
        },
        {
          "date": "2023-10-01",
          "value": 103
        },
        {
          "date": "2023-11-01",
          "value": 102
        },
        {
          "date": "2023-12-01",
          "value": 97
        },
        {
          "date": "2024-01-01",
          "value": 99
        },
        {
          "date": "2024-02-01",
          "value": 102
        },
        {
          "date": "2024-03-01",
          "value": 106
        },
        {
          "date": "2024-04-01",
          "value": 105
        },
        {
          "date": "2024-05-01",
          "value": 104
        },
        {
          "date": "2024-06-01",
          "value": 103
        },
        {
          "date": "2024-07-01",
          "value": 103
        },
        {
          "date": "2024-08-01",
          "value": 103
        },
        {
          "date": "2024-09-01",
          "value": 103
        },
        {
          "date": "2024-10-01",
          "value": 101
        },
        {
          "date": "2024-11-01",
          "value": 103
        },
        {
          "date": "2024-12-01",
          "value": 101
        },
        {
          "date": "2025-01-01",
          "value": 103
        },
        {
          "date": "2025-02-01",
          "value": 103
        },
        {
          "date": "2025-03-01",
          "value": 106
        },
        {
          "date": "2025-04-01",
          "value": 104
        },
        {
          "date": "2025-05-01",
          "value": 99
        },
        {
          "date": "2025-06-01",
          "value": 101
        },
        {
          "date": "2025-07-01",
          "value": 114
        },
        {
          "date": "2025-08-01",
          "value": 123
        },
        {
          "date": "2025-09-01",
          "value": 123
        },
        {
          "date": "2025-10-01",
          "value": 114
        },
        {
          "date": "2025-11-01",
          "value": 128
        },
        {
          "date": "2025-12-01",
          "value": 149
        },
        {
          "date": "2026-01-01",
          "value": 174
        },
        {
          "date": "2026-02-01",
          "value": 187
        },
        {
          "date": "2026-03-01",
          "value": 191
        },
        {
          "date": "2026-04-01",
          "value": 185
        },
        {
          "date": "2026-05-01",
          "value": 171
        },
        {
          "date": "2026-06-01",
          "value": 158
        },
        {
          "date": "2026-07-01",
          "value": 135
        },
        {
          "date": "2026-08-01",
          "value": 133
        },
        {
          "date": "2026-09-01",
          "value": 133
        }
      ]
    }
  }
};

if (typeof window !== 'undefined') window.DASHBOARD_DATA = DASHBOARD_DATA;
if (typeof module !== 'undefined') module.exports = DASHBOARD_DATA;
