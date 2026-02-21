// Young Adult Financial Health Map Data
// Auto-generated: 2026-02-21T05:24:12.365Z
// Sources: TICAS, Dept. of Education, BLS, Census ACS, Federal Reserve, JCHS, Zillow

const YOUNG_ADULT_DATA = {
    "meta": {
        "generated": "2026-02-21T05:24:12.363Z",
        "version": "3.2",
        "source": "Education Data Initiative, Experian, Census ACS, BLS (Young Adult Specific)",
        "update_frequency": "annual",
        "data_sources": {
            "student_debt": "Education Data Initiative (Bachelor's Grads 2024)",
            "auto_debt": "Experian Q3 2024 (Gen Z/Millennial Avg)",
            "rent_burden": "Census ACS / Harvard JCHS (Young Renters 2024)",
            "median_income": "BLS Q2 2025 Estimate (Ages 25-34)",
            "unemployment": "BLS (Ages 20-24) Sept 2025",
            "debt_to_income": "Calculated from student + auto debt vs median income",
            "cost_of_living": "BEA Regional Price Parities",
            "financial_stress": "FinMango weighted composite of all indicators",
            "yaai": "FinMango Research - Weighted z-score composite"
        },
        "methodology_notes": "Data specifically curated for Young Adult demographic (18-34) where available."
    },
    "national": {
        "student_debt": {
            "value": 39075,
            "change": 3.2,
            "label": "Avg. Student Debt",
            "unit": "$",
            "trend": "up",
            "source_note": "Federal Student Loan Debt per Borrower (Oct 2024)"
        },
        "auto_debt": {
            "value": 23800,
            "change": 2.8,
            "label": "Avg. Auto Loan Balance",
            "unit": "$",
            "trend": "up",
            "source_note": "Experian Q3 2024 (Gen Z/Millennial Avg)"
        },
        "rent_burden": {
            "value": 58.6,
            "change": 1.4,
            "label": "Cost Burdened Renters",
            "unit": "%",
            "trend": "up",
            "source_note": "Harvard JCHS / Zillow (Renters under 25 paying >30% income)"
        },
        "median_income": {
            "value": 55000,
            "change": 3.5,
            "label": "Median Income (25-34)",
            "unit": "$",
            "trend": "up",
            "source_note": "Census ACS 2023 Estimate"
        },
        "unemployment": {
            "value": 7.1,
            "change": -0.9,
            "label": "Youth Unemployment Rate",
            "unit": "%",
            "trend": "up",
            "source_note": "BLS (Ages 20-24) January 2026"
        },
        "debt_to_income": {
            "value": 45.2,
            "change": 2.1,
            "label": "Debt-to-Income Ratio",
            "unit": "%",
            "trend": "up",
            "source_note": "Calculated from student + auto debt"
        },
        "cost_of_living": {
            "value": 100,
            "change": 2.5,
            "label": "Cost of Living Index",
            "unit": "index",
            "trend": "up",
            "source_note": "BEA Regional Price Parities 2024 (100 = national avg)"
        },
        "financial_stress": {
            "value": 100,
            "change": 3.5,
            "label": "Financial Stress Index",
            "unit": "index",
            "trend": "up",
            "source_note": "FinMango weighted composite (100 = national avg)"
        },
        "yaai": {
            "value": 50,
            "change": 0,
            "label": "Young Adult Affordability Index",
            "unit": "score",
            "trend": "stable",
            "source_note": "FinMango weighted composite (lower = more affordable)"
        }
    },
    "states": {
        "US-AL": {
            "name": "Alabama",
            "abbr": "AL",
            "student_debt": {
                "value": 30318,
                "change": 1.8,
                "rank": 18
            },
            "auto_debt": {
                "value": 24100,
                "change": 3.5,
                "rank": 22
            },
            "rent_burden": {
                "value": 41.5,
                "change": 0.5,
                "rank": 28
            },
            "median_income": {
                "value": 42800,
                "change": 2.8,
                "rank": 42
            },
            "unemployment": {
                "value": 8.1,
                "change": 0.5,
                "rank": 35
            },
            "debt_to_income": {
                "value": 42.1,
                "change": 2.8,
                "rank": 15
            },
            "cost_of_living": {
                "value": 128,
                "change": 3.2,
                "rank": 28
            },
            "financial_stress": {
                "value": 106,
                "change": 4.5,
                "rank": 12
            },
            "average_rent": {
                "value": 1220,
                "unit": "$",
                "label": "Avg Asking Rent (Zillow)",
                "source": "Zillow Observed Rent Index (ZORI) 2024"
            },
            "yaai": {
                "value": 52.6,
                "rank": 29,
                "change": 0
            }
        },
        "US-AK": {
            "name": "Alaska",
            "abbr": "AK",
            "student_debt": {
                "value": 26719,
                "change": 2.4,
                "rank": 39
            },
            "auto_debt": {
                "value": 26500,
                "change": 4.1,
                "rank": 8
            },
            "rent_burden": {
                "value": 36,
                "change": -0.4,
                "rank": 39
            },
            "median_income": {
                "value": 54200,
                "change": 3.5,
                "rank": 12
            },
            "unemployment": {
                "value": 9.2,
                "change": 0.8,
                "rank": 45
            },
            "debt_to_income": {
                "value": 35.8,
                "change": 2.2,
                "rank": 32
            },
            "cost_of_living": {
                "value": 152,
                "change": 5.1,
                "rank": 8
            },
            "financial_stress": {
                "value": 101,
                "change": 4.8,
                "rank": 22
            },
            "average_rent": {
                "value": 1929,
                "unit": "$",
                "label": "Avg Asking Rent (Zillow)",
                "source": "Zillow Observed Rent Index (ZORI) 2024"
            },
            "yaai": {
                "value": 43.1,
                "rank": 10,
                "change": 0
            }
        },
        "US-AZ": {
            "name": "Arizona",
            "abbr": "AZ",
            "student_debt": {
                "value": 24349,
                "change": 1.5,
                "rank": 46
            },
            "auto_debt": {
                "value": 24800,
                "change": 4.5,
                "rank": 18
            },
            "rent_burden": {
                "value": 50.5,
                "change": -0.3,
                "rank": 10
            },
            "median_income": {
                "value": 47200,
                "change": 3.2,
                "rank": 28
            },
            "unemployment": {
                "value": 7.8,
                "change": 0.4,
                "rank": 32
            },
            "debt_to_income": {
                "value": 39.5,
                "change": 3,
                "rank": 22
            },
            "cost_of_living": {
                "value": 142,
                "change": 4.8,
                "rank": 15
            },
            "financial_stress": {
                "value": 118,
                "change": 5.2,
                "rank": 16
            },
            "average_rent": {
                "value": 1800,
                "unit": "$",
                "label": "Avg Asking Rent (Zillow)",
                "source": "Zillow Observed Rent Index (ZORI) 2024"
            },
            "yaai": {
                "value": 54.3,
                "rank": 36,
                "change": 0
            }
        },
        "US-AR": {
            "name": "Arkansas",
            "abbr": "AR",
            "student_debt": {
                "value": 27093,
                "change": 2,
                "rank": 37
            },
            "auto_debt": {
                "value": 23200,
                "change": 3.2,
                "rank": 28
            },
            "rent_burden": {
                "value": 37.5,
                "change": -0.2,
                "rank": 36
            },
            "median_income": {
                "value": 40500,
                "change": 2.5,
                "rank": 48
            },
            "unemployment": {
                "value": 7.5,
                "change": 0.3,
                "rank": 28
            },
            "debt_to_income": {
                "value": 44.2,
                "change": 3.1,
                "rank": 8
            },
            "cost_of_living": {
                "value": 118,
                "change": 2.8,
                "rank": 40
            },
            "financial_stress": {
                "value": 100,
                "change": 4.2,
                "rank": 8
            },
            "average_rent": {
                "value": 1189,
                "unit": "$",
                "label": "Avg Asking Rent (Zillow)",
                "source": "Zillow Observed Rent Index (ZORI) 2024"
            },
            "yaai": {
                "value": 48.8,
                "rank": 24,
                "change": 0
            }
        },
        "US-CA": {
            "name": "California",
            "abbr": "CA",
            "student_debt": {
                "value": 37819,
                "change": 2.1,
                "rank": 15
            },
            "auto_debt": {
                "value": 24500,
                "change": 2,
                "rank": 25
            },
            "rent_burden": {
                "value": 54.5,
                "change": -0.4,
                "rank": 4
            },
            "median_income": {
                "value": 58000,
                "change": 3.5,
                "rank": 8
            },
            "unemployment": {
                "value": 5.4,
                "change": 0.3,
                "rank": 48
            },
            "debt_to_income": {
                "value": 38.2,
                "change": 1.5,
                "rank": 25
            },
            "cost_of_living": {
                "value": 152,
                "change": 4.5,
                "rank": 1
            },
            "financial_stress": {
                "value": 125,
                "change": 1.8,
                "rank": 4,
                "trend": "up"
            },
            "average_rent": {
                "value": 2950,
                "unit": "$",
                "label": "Avg Asking Rent (Zillow)",
                "source": "Zillow Observed Rent Index (ZORI) 2024"
            },
            "yaai": {
                "value": 61.7,
                "rank": 48,
                "change": 0
            }
        },
        "US-CO": {
            "name": "Colorado",
            "abbr": "CO",
            "student_debt": {
                "value": 26969,
                "change": 1.8,
                "rank": 38
            },
            "auto_debt": {
                "value": 25200,
                "change": 4.2,
                "rank": 14
            },
            "rent_burden": {
                "value": 49.5,
                "change": 1.2,
                "rank": 12
            },
            "median_income": {
                "value": 55800,
                "change": 4.1,
                "rank": 8
            },
            "unemployment": {
                "value": 7.2,
                "change": 0.2,
                "rank": 22
            },
            "debt_to_income": {
                "value": 34.2,
                "change": 2,
                "rank": 38
            },
            "cost_of_living": {
                "value": 148,
                "change": 4.5,
                "rank": 12
            },
            "financial_stress": {
                "value": 115,
                "change": 4,
                "rank": 32
            },
            "average_rent": {
                "value": 2100,
                "unit": "$",
                "label": "Avg Asking Rent (Zillow)",
                "source": "Zillow Observed Rent Index (ZORI) 2024"
            },
            "yaai": {
                "value": 50.4,
                "rank": 27,
                "change": 0
            }
        },
        "US-CT": {
            "name": "Connecticut",
            "abbr": "CT",
            "student_debt": {
                "value": 35115,
                "change": 2.5,
                "rank": 4
            },
            "auto_debt": {
                "value": 24600,
                "change": 3.8,
                "rank": 20
            },
            "rent_burden": {
                "value": 47,
                "change": -0.3,
                "rank": 17
            },
            "median_income": {
                "value": 58200,
                "change": 3.5,
                "rank": 5
            },
            "unemployment": {
                "value": 8.4,
                "change": 0.5,
                "rank": 38
            },
            "debt_to_income": {
                "value": 38.5,
                "change": 2.5,
                "rank": 24
            },
            "cost_of_living": {
                "value": 155,
                "change": 5.2,
                "rank": 6
            },
            "financial_stress": {
                "value": 115,
                "change": 4.8,
                "rank": 20
            },
            "average_rent": {
                "value": 2286,
                "unit": "$",
                "label": "Avg Asking Rent (Zillow)",
                "source": "Zillow Observed Rent Index (ZORI) 2024"
            },
            "yaai": {
                "value": 55.7,
                "rank": 40,
                "change": 0
            }
        },
        "US-DE": {
            "name": "Delaware",
            "abbr": "DE",
            "student_debt": {
                "value": 33808,
                "change": 2.3,
                "rank": 8
            },
            "auto_debt": {
                "value": 24200,
                "change": 3.6,
                "rank": 21
            },
            "rent_burden": {
                "value": 44.5,
                "change": 0.4,
                "rank": 22
            },
            "median_income": {
                "value": 51200,
                "change": 3.2,
                "rank": 18
            },
            "unemployment": {
                "value": 8,
                "change": 0.4,
                "rank": 34
            },
            "debt_to_income": {
                "value": 40.2,
                "change": 2.6,
                "rank": 18
            },
            "cost_of_living": {
                "value": 140,
                "change": 4.2,
                "rank": 18
            },
            "financial_stress": {
                "value": 110,
                "change": 4.5,
                "rank": 24
            },
            "average_rent": {
                "value": 1909,
                "unit": "$",
                "label": "Avg Asking Rent (Zillow)",
                "source": "Zillow Observed Rent Index (ZORI) 2024"
            },
            "yaai": {
                "value": 54.5,
                "rank": 37,
                "change": 0
            }
        },
        "US-DC": {
            "name": "District of Columbia",
            "abbr": "DC",
            "student_debt": {
                "value": 54795,
                "change": 2.5,
                "rank": 1
            },
            "auto_debt": {
                "value": 22000,
                "change": 1.8,
                "rank": 42
            },
            "rent_burden": {
                "value": 46,
                "change": -0.4,
                "rank": 20
            },
            "median_income": {
                "value": 85000,
                "change": 4,
                "rank": 1
            },
            "unemployment": {
                "value": 5.2,
                "change": 0.2,
                "rank": 47
            },
            "debt_to_income": {
                "value": 32.1,
                "change": 1.2,
                "rank": 45
            },
            "cost_of_living": {
                "value": 150,
                "change": 4.5,
                "rank": 2
            },
            "financial_stress": {
                "value": 125,
                "change": 1.5,
                "rank": 18,
                "trend": "up"
            },
            "average_rent": {
                "value": 2700,
                "unit": "$",
                "label": "Avg Asking Rent (Zillow)",
                "source": "Zillow Observed Rent Index (ZORI) 2024"
            },
            "yaai": {
                "value": 53.8,
                "rank": 34,
                "change": 0
            }
        },
        "US-FL": {
            "name": "Florida",
            "abbr": "FL",
            "student_debt": {
                "value": 24376,
                "change": 1.6,
                "rank": 45
            },
            "auto_debt": {
                "value": 25800,
                "change": 4.8,
                "rank": 10
            },
            "rent_burden": {
                "value": 60,
                "change": -0.5,
                "rank": 1
            },
            "median_income": {
                "value": 45800,
                "change": 3,
                "rank": 35
            },
            "unemployment": {
                "value": 7,
                "change": 0.2,
                "rank": 18
            },
            "debt_to_income": {
                "value": 44.8,
                "change": 3.5,
                "rank": 6
            },
            "cost_of_living": {
                "value": 158,
                "change": 5.5,
                "rank": 4
            },
            "financial_stress": {
                "value": 130,
                "change": 6,
                "rank": 2
            },
            "average_rent": {
                "value": 2150,
                "unit": "$",
                "label": "Avg Asking Rent (Zillow)",
                "source": "Zillow Observed Rent Index (ZORI) 2024"
            },
            "yaai": {
                "value": 65.8,
                "rank": 51,
                "change": 0
            }
        },
        "US-GA": {
            "name": "Georgia",
            "abbr": "GA",
            "student_debt": {
                "value": 30502,
                "change": 2.1,
                "rank": 16
            },
            "auto_debt": {
                "value": 25400,
                "change": 4.3,
                "rank": 12
            },
            "rent_burden": {
                "value": 50,
                "change": 0.9,
                "rank": 11
            },
            "median_income": {
                "value": 46500,
                "change": 3.2,
                "rank": 32
            },
            "unemployment": {
                "value": 7.6,
                "change": 0.3,
                "rank": 30
            },
            "debt_to_income": {
                "value": 42.5,
                "change": 2.9,
                "rank": 14
            },
            "cost_of_living": {
                "value": 138,
                "change": 4,
                "rank": 20
            },
            "financial_stress": {
                "value": 117,
                "change": 5,
                "rank": 10
            },
            "average_rent": {
                "value": 1850,
                "unit": "$",
                "label": "Avg Asking Rent (Zillow)",
                "source": "Zillow Observed Rent Index (ZORI) 2024"
            },
            "yaai": {
                "value": 58.7,
                "rank": 46,
                "change": 0
            }
        },
        "US-HI": {
            "name": "Hawaii",
            "abbr": "HI",
            "student_debt": {
                "value": 24097,
                "change": 1.4,
                "rank": 47
            },
            "auto_debt": {
                "value": 23500,
                "change": 3.5,
                "rank": 26
            },
            "rent_burden": {
                "value": 55,
                "change": 0.7,
                "rank": 3
            },
            "median_income": {
                "value": 52800,
                "change": 3.5,
                "rank": 14
            },
            "unemployment": {
                "value": 6.8,
                "change": 0.1,
                "rank": 15
            },
            "debt_to_income": {
                "value": 35.2,
                "change": 2.1,
                "rank": 35
            },
            "cost_of_living": {
                "value": 165,
                "change": 5.6,
                "rank": 3
            },
            "financial_stress": {
                "value": 125,
                "change": 5.2,
                "rank": 12,
                "trend": "up"
            },
            "average_rent": {
                "value": 2900,
                "unit": "$",
                "label": "Avg Asking Rent (Zillow)",
                "source": "Zillow Observed Rent Index (ZORI) 2024"
            },
            "yaai": {
                "value": 56,
                "rank": 41,
                "change": 0
            }
        },
        "US-ID": {
            "name": "Idaho",
            "abbr": "ID",
            "student_debt": {
                "value": 27563,
                "change": 2.2,
                "rank": 34
            },
            "auto_debt": {
                "value": 24500,
                "change": 4,
                "rank": 19
            },
            "rent_burden": {
                "value": 40,
                "change": 1,
                "rank": 31
            },
            "median_income": {
                "value": 46200,
                "change": 3.5,
                "rank": 34
            },
            "unemployment": {
                "value": 5.8,
                "change": 0.1,
                "rank": 5
            },
            "debt_to_income": {
                "value": 38.8,
                "change": 2.5,
                "rank": 23
            },
            "cost_of_living": {
                "value": 130,
                "change": 3.5,
                "rank": 26
            },
            "financial_stress": {
                "value": 100,
                "change": 3.8,
                "rank": 38
            },
            "average_rent": {
                "value": 1548,
                "unit": "$",
                "label": "Avg Asking Rent (Zillow)",
                "source": "Zillow Observed Rent Index (ZORI) 2024"
            },
            "yaai": {
                "value": 47.6,
                "rank": 19,
                "change": 0
            }
        },
        "US-IL": {
            "name": "Illinois",
            "abbr": "IL",
            "student_debt": {
                "value": 30193,
                "change": 2,
                "rank": 19
            },
            "auto_debt": {
                "value": 23800,
                "change": 3.6,
                "rank": 24
            },
            "rent_burden": {
                "value": 45.5,
                "change": -0.3,
                "rank": 20
            },
            "median_income": {
                "value": 50500,
                "change": 3.2,
                "rank": 20
            },
            "unemployment": {
                "value": 9,
                "change": 0.6,
                "rank": 43
            },
            "debt_to_income": {
                "value": 39.8,
                "change": 2.6,
                "rank": 20
            },
            "cost_of_living": {
                "value": 142,
                "change": 4.3,
                "rank": 16
            },
            "financial_stress": {
                "value": 114,
                "change": 4.8,
                "rank": 15
            },
            "average_rent": {
                "value": 1900,
                "unit": "$",
                "label": "Avg Asking Rent (Zillow)",
                "source": "Zillow Observed Rent Index (ZORI) 2024"
            },
            "yaai": {
                "value": 53.4,
                "rank": 31,
                "change": 0
            }
        },
        "US-IN": {
            "name": "Indiana",
            "abbr": "IN",
            "student_debt": {
                "value": 29193,
                "change": 1.9,
                "rank": 23
            },
            "auto_debt": {
                "value": 24000,
                "change": 3.8,
                "rank": 23
            },
            "rent_burden": {
                "value": 39.5,
                "change": 0.8,
                "rank": 32
            },
            "median_income": {
                "value": 45500,
                "change": 2.8,
                "rank": 38
            },
            "unemployment": {
                "value": 6.5,
                "change": 0.2,
                "rank": 12
            },
            "debt_to_income": {
                "value": 40.8,
                "change": 2.6,
                "rank": 17
            },
            "cost_of_living": {
                "value": 122,
                "change": 3,
                "rank": 35
            },
            "financial_stress": {
                "value": 100,
                "change": 4,
                "rank": 28
            },
            "average_rent": {
                "value": 1383,
                "unit": "$",
                "label": "Avg Asking Rent (Zillow)",
                "source": "Zillow Observed Rent Index (ZORI) 2024"
            },
            "yaai": {
                "value": 48.5,
                "rank": 23,
                "change": 0
            }
        },
        "US-IA": {
            "name": "Iowa",
            "abbr": "IA",
            "student_debt": {
                "value": 29953,
                "change": 2.1,
                "rank": 20
            },
            "auto_debt": {
                "value": 22500,
                "change": 3.2,
                "rank": 35
            },
            "rent_burden": {
                "value": 32.5,
                "change": 1.5,
                "rank": 46
            },
            "median_income": {
                "value": 47800,
                "change": 2.8,
                "rank": 26
            },
            "unemployment": {
                "value": 5.2,
                "change": 0,
                "rank": 2
            },
            "debt_to_income": {
                "value": 36.2,
                "change": 2.2,
                "rank": 30
            },
            "cost_of_living": {
                "value": 108,
                "change": 2.2,
                "rank": 48
            },
            "financial_stress": {
                "value": 100,
                "change": 3,
                "rank": 48
            },
            "average_rent": {
                "value": 1243,
                "unit": "$",
                "label": "Avg Asking Rent (Zillow)",
                "source": "Zillow Observed Rent Index (ZORI) 2024"
            },
            "yaai": {
                "value": 39.4,
                "rank": 6,
                "change": 0
            }
        },
        "US-KS": {
            "name": "Kansas",
            "abbr": "KS",
            "student_debt": {
                "value": 28621,
                "change": 2,
                "rank": 26
            },
            "auto_debt": {
                "value": 23200,
                "change": 3.4,
                "rank": 29
            },
            "rent_burden": {
                "value": 36.5,
                "change": 1.3,
                "rank": 38
            },
            "median_income": {
                "value": 47500,
                "change": 2.9,
                "rank": 27
            },
            "unemployment": {
                "value": 5.6,
                "change": 0.1,
                "rank": 4
            },
            "debt_to_income": {
                "value": 37.5,
                "change": 2.3,
                "rank": 26
            },
            "cost_of_living": {
                "value": 115,
                "change": 2.5,
                "rank": 43
            },
            "financial_stress": {
                "value": 100,
                "change": 3.2,
                "rank": 44
            },
            "average_rent": {
                "value": 1348,
                "unit": "$",
                "label": "Avg Asking Rent (Zillow)",
                "source": "Zillow Observed Rent Index (ZORI) 2024"
            },
            "yaai": {
                "value": 43,
                "rank": 9,
                "change": 0
            }
        },
        "US-KY": {
            "name": "Kentucky",
            "abbr": "KY",
            "student_debt": {
                "value": 28671,
                "change": 2.2,
                "rank": 25
            },
            "auto_debt": {
                "value": 23800,
                "change": 3.7,
                "rank": 25
            },
            "rent_burden": {
                "value": 37,
                "change": 0.8,
                "rank": 37
            },
            "median_income": {
                "value": 43200,
                "change": 2.6,
                "rank": 40
            },
            "unemployment": {
                "value": 7.8,
                "change": 0.4,
                "rank": 33
            },
            "debt_to_income": {
                "value": 43.5,
                "change": 3,
                "rank": 10
            },
            "cost_of_living": {
                "value": 120,
                "change": 2.9,
                "rank": 37
            },
            "financial_stress": {
                "value": 100,
                "change": 4.5,
                "rank": 13
            },
            "average_rent": {
                "value": 1238,
                "unit": "$",
                "label": "Avg Asking Rent (Zillow)",
                "source": "Zillow Observed Rent Index (ZORI) 2024"
            },
            "yaai": {
                "value": 48.4,
                "rank": 22,
                "change": 0
            }
        },
        "US-LA": {
            "name": "Louisiana",
            "abbr": "LA",
            "student_debt": {
                "value": 27406,
                "change": 1.8,
                "rank": 35
            },
            "auto_debt": {
                "value": 25200,
                "change": 4.2,
                "rank": 15
            },
            "rent_burden": {
                "value": 52,
                "change": 0.2,
                "rank": 7
            },
            "median_income": {
                "value": 41200,
                "change": 2.4,
                "rank": 46
            },
            "unemployment": {
                "value": 9.8,
                "change": 0.7,
                "rank": 48
            },
            "debt_to_income": {
                "value": 48.5,
                "change": 3.8,
                "rank": 2
            },
            "cost_of_living": {
                "value": 132,
                "change": 3.8,
                "rank": 24
            },
            "financial_stress": {
                "value": 126,
                "change": 5.8,
                "rank": 1
            },
            "average_rent": {
                "value": 1373,
                "unit": "$",
                "label": "Avg Asking Rent (Zillow)",
                "source": "Zillow Observed Rent Index (ZORI) 2024"
            },
            "yaai": {
                "value": 62.3,
                "rank": 49,
                "change": 0
            }
        },
        "US-ME": {
            "name": "Maine",
            "abbr": "ME",
            "student_debt": {
                "value": 31888,
                "change": 2.4,
                "rank": 12
            },
            "auto_debt": {
                "value": 22800,
                "change": 3.4,
                "rank": 33
            },
            "rent_burden": {
                "value": 34.5,
                "change": 1.1,
                "rank": 42
            },
            "median_income": {
                "value": 48200,
                "change": 3,
                "rank": 24
            },
            "unemployment": {
                "value": 6.2,
                "change": 0.1,
                "rank": 9
            },
            "debt_to_income": {
                "value": 39.2,
                "change": 2.5,
                "rank": 21
            },
            "cost_of_living": {
                "value": 135,
                "change": 3.9,
                "rank": 22
            },
            "financial_stress": {
                "value": 100,
                "change": 3.8,
                "rank": 32
            },
            "average_rent": {
                "value": 1822,
                "unit": "$",
                "label": "Avg Asking Rent (Zillow)",
                "source": "Zillow Observed Rent Index (ZORI) 2024"
            },
            "yaai": {
                "value": 46.5,
                "rank": 16,
                "change": 0
            }
        },
        "US-MD": {
            "name": "Maryland",
            "abbr": "MD",
            "student_debt": {
                "value": 30854,
                "change": 2,
                "rank": 15
            },
            "auto_debt": {
                "value": 24800,
                "change": 3.9,
                "rank": 17
            },
            "rent_burden": {
                "value": 47.5,
                "change": 1.1,
                "rank": 16
            },
            "median_income": {
                "value": 62500,
                "change": 4,
                "rank": 2
            },
            "unemployment": {
                "value": 8.2,
                "change": 0.5,
                "rank": 36
            },
            "debt_to_income": {
                "value": 33.8,
                "change": 1.9,
                "rank": 40
            },
            "cost_of_living": {
                "value": 150,
                "change": 4.8,
                "rank": 10
            },
            "financial_stress": {
                "value": 115,
                "change": 3.8,
                "rank": 35
            },
            "average_rent": {
                "value": 2050,
                "unit": "$",
                "label": "Avg Asking Rent (Zillow)",
                "source": "Zillow Observed Rent Index (ZORI) 2024"
            },
            "yaai": {
                "value": 49.3,
                "rank": 25,
                "change": 0
            }
        },
        "US-MA": {
            "name": "Massachusetts",
            "abbr": "MA",
            "student_debt": {
                "value": 33350,
                "change": 2.2,
                "rank": 9
            },
            "auto_debt": {
                "value": 22200,
                "change": 3.2,
                "rank": 38
            },
            "rent_burden": {
                "value": 48.5,
                "change": 1.2,
                "rank": 14
            },
            "median_income": {
                "value": 60200,
                "change": 3.8,
                "rank": 3
            },
            "unemployment": {
                "value": 7.4,
                "change": 0.3,
                "rank": 26
            },
            "debt_to_income": {
                "value": 34.5,
                "change": 2,
                "rank": 36
            },
            "cost_of_living": {
                "value": 158,
                "change": 5.3,
                "rank": 5
            },
            "financial_stress": {
                "value": 125,
                "change": 4.2,
                "rank": 27,
                "trend": "up"
            },
            "average_rent": {
                "value": 3060,
                "unit": "$",
                "label": "Avg Asking Rent (Zillow)",
                "source": "Zillow Observed Rent Index (ZORI) 2024"
            },
            "yaai": {
                "value": 53.4,
                "rank": 32,
                "change": 0
            }
        },
        "US-MI": {
            "name": "Michigan",
            "abbr": "MI",
            "student_debt": {
                "value": 31411,
                "change": 2.3,
                "rank": 14
            },
            "auto_debt": {
                "value": 25600,
                "change": 4.5,
                "rank": 11
            },
            "rent_burden": {
                "value": 43,
                "change": 0.9,
                "rank": 25
            },
            "median_income": {
                "value": 47000,
                "change": 2.9,
                "rank": 30
            },
            "unemployment": {
                "value": 8.6,
                "change": 0.5,
                "rank": 40
            },
            "debt_to_income": {
                "value": 43.2,
                "change": 3,
                "rank": 11
            },
            "cost_of_living": {
                "value": 128,
                "change": 3.2,
                "rank": 27
            },
            "financial_stress": {
                "value": 109,
                "change": 4.6,
                "rank": 14
            },
            "average_rent": {
                "value": 1514,
                "unit": "$",
                "label": "Avg Asking Rent (Zillow)",
                "source": "Zillow Observed Rent Index (ZORI) 2024"
            },
            "yaai": {
                "value": 53.5,
                "rank": 33,
                "change": 0
            }
        },
        "US-MN": {
            "name": "Minnesota",
            "abbr": "MN",
            "student_debt": {
                "value": 32181,
                "change": 2.4,
                "rank": 11
            },
            "auto_debt": {
                "value": 23500,
                "change": 3.6,
                "rank": 27
            },
            "rent_burden": {
                "value": 35,
                "change": -0.4,
                "rank": 41
            },
            "median_income": {
                "value": 55200,
                "change": 3.5,
                "rank": 10
            },
            "unemployment": {
                "value": 6,
                "change": 0.1,
                "rank": 7
            },
            "debt_to_income": {
                "value": 36.5,
                "change": 2.2,
                "rank": 29
            },
            "cost_of_living": {
                "value": 132,
                "change": 3.6,
                "rank": 25
            },
            "financial_stress": {
                "value": 100,
                "change": 3.5,
                "rank": 40
            },
            "average_rent": {
                "value": 1701,
                "unit": "$",
                "label": "Avg Asking Rent (Zillow)",
                "source": "Zillow Observed Rent Index (ZORI) 2024"
            },
            "yaai": {
                "value": 43.1,
                "rank": 11,
                "change": 0
            }
        },
        "US-MS": {
            "name": "Mississippi",
            "abbr": "MS",
            "student_debt": {
                "value": 37208,
                "change": 2,
                "rank": 20
            },
            "auto_debt": {
                "value": 25500,
                "change": 2.5,
                "rank": 12
            },
            "rent_burden": {
                "value": 38,
                "change": 0.9,
                "rank": 35
            },
            "median_income": {
                "value": 42000,
                "change": 2.5,
                "rank": 51
            },
            "unemployment": {
                "value": 4.4,
                "change": 0.2,
                "rank": 30
            },
            "debt_to_income": {
                "value": 53,
                "change": 2,
                "rank": 1
            },
            "cost_of_living": {
                "value": 87.3,
                "change": 0.8,
                "rank": 50
            },
            "financial_stress": {
                "value": 100,
                "change": 1.5,
                "rank": 8
            },
            "average_rent": {
                "value": 1167,
                "unit": "$",
                "label": "Avg Asking Rent (Zillow)",
                "source": "Zillow Observed Rent Index (ZORI) 2024"
            },
            "yaai": {
                "value": 55.1,
                "rank": 38,
                "change": 0
            }
        },
        "US-MO": {
            "name": "Missouri",
            "abbr": "MO",
            "student_debt": {
                "value": 28225,
                "change": 2,
                "rank": 28
            },
            "auto_debt": {
                "value": 23600,
                "change": 3.7,
                "rank": 26
            },
            "rent_burden": {
                "value": 42,
                "change": 0.9,
                "rank": 27
            },
            "median_income": {
                "value": 46800,
                "change": 2.9,
                "rank": 31
            },
            "unemployment": {
                "value": 6.8,
                "change": 0.2,
                "rank": 16
            },
            "debt_to_income": {
                "value": 39,
                "change": 2.5,
                "rank": 22
            },
            "cost_of_living": {
                "value": 118,
                "change": 2.7,
                "rank": 41
            },
            "financial_stress": {
                "value": 102,
                "change": 3.6,
                "rank": 36
            },
            "average_rent": {
                "value": 1365,
                "unit": "$",
                "label": "Avg Asking Rent (Zillow)",
                "source": "Zillow Observed Rent Index (ZORI) 2024"
            },
            "yaai": {
                "value": 47.8,
                "rank": 20,
                "change": 0
            }
        },
        "US-MT": {
            "name": "Montana",
            "abbr": "MT",
            "student_debt": {
                "value": 28100,
                "change": 2.1,
                "rank": 29
            },
            "auto_debt": {
                "value": 24000,
                "change": 3.8,
                "rank": 22
            },
            "rent_burden": {
                "value": 33,
                "change": 0.2,
                "rank": 45
            },
            "median_income": {
                "value": 46500,
                "change": 3.2,
                "rank": 33
            },
            "unemployment": {
                "value": 5.4,
                "change": 0,
                "rank": 3
            },
            "debt_to_income": {
                "value": 38,
                "change": 2.4,
                "rank": 25
            },
            "cost_of_living": {
                "value": 136,
                "change": 4,
                "rank": 21
            },
            "financial_stress": {
                "value": 100,
                "change": 3.6,
                "rank": 38
            },
            "average_rent": {
                "value": 1779,
                "unit": "$",
                "label": "Avg Asking Rent (Zillow)",
                "source": "Zillow Observed Rent Index (ZORI) 2024"
            },
            "yaai": {
                "value": 43.4,
                "rank": 12,
                "change": 0
            }
        },
        "US-NE": {
            "name": "Nebraska",
            "abbr": "NE",
            "student_debt": {
                "value": 26476,
                "change": 1.8,
                "rank": 40
            },
            "auto_debt": {
                "value": 22800,
                "change": 3.4,
                "rank": 34
            },
            "rent_burden": {
                "value": 35.5,
                "change": 0.9,
                "rank": 40
            },
            "median_income": {
                "value": 49200,
                "change": 3,
                "rank": 22
            },
            "unemployment": {
                "value": 4.8,
                "change": -0.1,
                "rank": 1
            },
            "debt_to_income": {
                "value": 35.5,
                "change": 2.1,
                "rank": 33
            },
            "cost_of_living": {
                "value": 105,
                "change": 2,
                "rank": 50
            },
            "financial_stress": {
                "value": 100,
                "change": 2.8,
                "rank": 50
            },
            "average_rent": {
                "value": 1324,
                "unit": "$",
                "label": "Avg Asking Rent (Zillow)",
                "source": "Zillow Observed Rent Index (ZORI) 2024"
            },
            "yaai": {
                "value": 38.3,
                "rank": 4,
                "change": 0
            }
        },
        "US-NV": {
            "name": "Nevada",
            "abbr": "NV",
            "student_debt": {
                "value": 22383,
                "change": 1.4,
                "rank": 49
            },
            "auto_debt": {
                "value": 26200,
                "change": 4.8,
                "rank": 9
            },
            "rent_burden": {
                "value": 57,
                "change": 1.3,
                "rank": 2
            },
            "median_income": {
                "value": 48500,
                "change": 3.2,
                "rank": 25
            },
            "unemployment": {
                "value": 8.5,
                "change": 0.5,
                "rank": 39
            },
            "debt_to_income": {
                "value": 44.2,
                "change": 3.2,
                "rank": 7
            },
            "cost_of_living": {
                "value": 152,
                "change": 5.2,
                "rank": 9
            },
            "financial_stress": {
                "value": 130,
                "change": 5.5,
                "rank": 6
            },
            "average_rent": {
                "value": 1850,
                "unit": "$",
                "label": "Avg Asking Rent (Zillow)",
                "source": "Zillow Observed Rent Index (ZORI) 2024"
            },
            "yaai": {
                "value": 60.8,
                "rank": 47,
                "change": 0
            }
        },
        "US-NH": {
            "name": "New Hampshire",
            "abbr": "NH",
            "student_debt": {
                "value": 36653,
                "change": 2.8,
                "rank": 1
            },
            "auto_debt": {
                "value": 23000,
                "change": 3.4,
                "rank": 30
            },
            "rent_burden": {
                "value": 33.5,
                "change": 0.8,
                "rank": 44
            },
            "median_income": {
                "value": 57500,
                "change": 3.6,
                "rank": 6
            },
            "unemployment": {
                "value": 6,
                "change": 0.1,
                "rank": 8
            },
            "debt_to_income": {
                "value": 37.2,
                "change": 2.3,
                "rank": 27
            },
            "cost_of_living": {
                "value": 145,
                "change": 4.5,
                "rank": 14
            },
            "financial_stress": {
                "value": 100,
                "change": 4,
                "rank": 33
            },
            "average_rent": {
                "value": 2157,
                "unit": "$",
                "label": "Avg Asking Rent (Zillow)",
                "source": "Zillow Observed Rent Index (ZORI) 2024"
            },
            "yaai": {
                "value": 45.8,
                "rank": 13,
                "change": 0
            }
        },
        "US-NJ": {
            "name": "New Jersey",
            "abbr": "NJ",
            "student_debt": {
                "value": 33606,
                "change": 2.4,
                "rank": 10
            },
            "auto_debt": {
                "value": 24000,
                "change": 3.6,
                "rank": 22
            },
            "rent_burden": {
                "value": 52.5,
                "change": 1.3,
                "rank": 6
            },
            "median_income": {
                "value": 59800,
                "change": 3.8,
                "rank": 4
            },
            "unemployment": {
                "value": 9.1,
                "change": 0.6,
                "rank": 44
            },
            "debt_to_income": {
                "value": 36,
                "change": 2.2,
                "rank": 31
            },
            "cost_of_living": {
                "value": 155,
                "change": 5.1,
                "rank": 7
            },
            "financial_stress": {
                "value": 125,
                "change": 4.8,
                "rank": 18,
                "trend": "up"
            },
            "average_rent": {
                "value": 2500,
                "unit": "$",
                "label": "Avg Asking Rent (Zillow)",
                "source": "Zillow Observed Rent Index (ZORI) 2024"
            },
            "yaai": {
                "value": 56.7,
                "rank": 43,
                "change": 0
            }
        },
        "US-NM": {
            "name": "New Mexico",
            "abbr": "NM",
            "student_debt": {
                "value": 22659,
                "change": 1.3,
                "rank": 48
            },
            "auto_debt": {
                "value": 23000,
                "change": 3.5,
                "rank": 31
            },
            "rent_burden": {
                "value": 41,
                "change": 1.1,
                "rank": 29
            },
            "median_income": {
                "value": 42500,
                "change": 2.6,
                "rank": 43
            },
            "unemployment": {
                "value": 9.2,
                "change": 0.7,
                "rank": 46
            },
            "debt_to_income": {
                "value": 41.2,
                "change": 2.8,
                "rank": 16
            },
            "cost_of_living": {
                "value": 125,
                "change": 3.1,
                "rank": 31
            },
            "financial_stress": {
                "value": 108,
                "change": 4.8,
                "rank": 11
            },
            "average_rent": {
                "value": 1503,
                "unit": "$",
                "label": "Avg Asking Rent (Zillow)",
                "source": "Zillow Observed Rent Index (ZORI) 2024"
            },
            "yaai": {
                "value": 47.3,
                "rank": 18,
                "change": 0
            }
        },
        "US-NY": {
            "name": "New York",
            "abbr": "NY",
            "student_debt": {
                "value": 30877,
                "change": 1.9,
                "rank": 14
            },
            "auto_debt": {
                "value": 21800,
                "change": 3,
                "rank": 40
            },
            "rent_burden": {
                "value": 53,
                "change": 1.4,
                "rank": 5
            },
            "median_income": {
                "value": 55500,
                "change": 3.5,
                "rank": 9
            },
            "unemployment": {
                "value": 8.8,
                "change": 0.5,
                "rank": 42
            },
            "debt_to_income": {
                "value": 35,
                "change": 2,
                "rank": 34
            },
            "cost_of_living": {
                "value": 160,
                "change": 5.4,
                "rank": 4
            },
            "financial_stress": {
                "value": 125,
                "change": 4.8,
                "rank": 19,
                "trend": "up"
            },
            "average_rent": {
                "value": 2850,
                "unit": "$",
                "label": "Avg Asking Rent (Zillow)",
                "source": "Zillow Observed Rent Index (ZORI) 2024"
            },
            "yaai": {
                "value": 56.9,
                "rank": 44,
                "change": 0
            }
        },
        "US-NC": {
            "name": "North Carolina",
            "abbr": "NC",
            "student_debt": {
                "value": 27980,
                "change": 2,
                "rank": 31
            },
            "auto_debt": {
                "value": 25200,
                "change": 4.2,
                "rank": 13
            },
            "rent_burden": {
                "value": 46.5,
                "change": -0.2,
                "rank": 18
            },
            "median_income": {
                "value": 47200,
                "change": 3.1,
                "rank": 29
            },
            "unemployment": {
                "value": 7.2,
                "change": 0.3,
                "rank": 23
            },
            "debt_to_income": {
                "value": 40,
                "change": 2.6,
                "rank": 19
            },
            "cost_of_living": {
                "value": 134,
                "change": 3.8,
                "rank": 23
            },
            "financial_stress": {
                "value": 110,
                "change": 4.2,
                "rank": 23
            },
            "average_rent": {
                "value": 1700,
                "unit": "$",
                "label": "Avg Asking Rent (Zillow)",
                "source": "Zillow Observed Rent Index (ZORI) 2024"
            },
            "yaai": {
                "value": 53,
                "rank": 30,
                "change": 0
            }
        },
        "US-ND": {
            "name": "North Dakota",
            "abbr": "ND",
            "student_debt": {
                "value": 29647,
                "change": 1.8,
                "rank": 51
            },
            "auto_debt": {
                "value": 26200,
                "change": 2.8,
                "rank": 6
            },
            "rent_burden": {
                "value": 28,
                "change": 0.2,
                "rank": 49
            },
            "median_income": {
                "value": 55000,
                "change": 3.2,
                "rank": 12
            },
            "unemployment": {
                "value": 2,
                "change": -0.1,
                "rank": 1
            },
            "debt_to_income": {
                "value": 36.2,
                "change": 1.2,
                "rank": 38
            },
            "cost_of_living": {
                "value": 91.5,
                "change": 0.5,
                "rank": 45
            },
            "financial_stress": {
                "value": 100,
                "change": 0.8,
                "rank": 51
            },
            "average_rent": {
                "value": 1369,
                "unit": "$",
                "label": "Avg Asking Rent (Zillow)",
                "source": "Zillow Observed Rent Index (ZORI) 2024"
            },
            "yaai": {
                "value": 32,
                "rank": 1,
                "change": 0
            }
        },
        "US-OH": {
            "name": "Ohio",
            "abbr": "OH",
            "student_debt": {
                "value": 29615,
                "change": 2.1,
                "rank": 21
            },
            "auto_debt": {
                "value": 23500,
                "change": 3.6,
                "rank": 28
            },
            "rent_burden": {
                "value": 42.5,
                "change": 0.8,
                "rank": 26
            },
            "median_income": {
                "value": 46500,
                "change": 2.8,
                "rank": 33
            },
            "unemployment": {
                "value": 7.5,
                "change": 0.3,
                "rank": 29
            },
            "debt_to_income": {
                "value": 40.5,
                "change": 2.6,
                "rank": 18
            },
            "cost_of_living": {
                "value": 120,
                "change": 2.8,
                "rank": 38
            },
            "financial_stress": {
                "value": 105,
                "change": 4,
                "rank": 25
            },
            "average_rent": {
                "value": 1356,
                "unit": "$",
                "label": "Avg Asking Rent (Zillow)",
                "source": "Zillow Observed Rent Index (ZORI) 2024"
            },
            "yaai": {
                "value": 50,
                "rank": 26,
                "change": 0
            }
        },
        "US-OK": {
            "name": "Oklahoma",
            "abbr": "OK",
            "student_debt": {
                "value": 26215,
                "change": 1.7,
                "rank": 42
            },
            "auto_debt": {
                "value": 24200,
                "change": 4,
                "rank": 20
            },
            "rent_burden": {
                "value": 40.5,
                "change": 0.6,
                "rank": 30
            },
            "median_income": {
                "value": 44500,
                "change": 2.6,
                "rank": 39
            },
            "unemployment": {
                "value": 6.5,
                "change": 0.2,
                "rank": 13
            },
            "debt_to_income": {
                "value": 40.2,
                "change": 2.7,
                "rank": 19
            },
            "cost_of_living": {
                "value": 112,
                "change": 2.4,
                "rank": 45
            },
            "financial_stress": {
                "value": 100,
                "change": 3.8,
                "rank": 29
            },
            "average_rent": {
                "value": 1263,
                "unit": "$",
                "label": "Avg Asking Rent (Zillow)",
                "source": "Zillow Observed Rent Index (ZORI) 2024"
            },
            "yaai": {
                "value": 46.2,
                "rank": 15,
                "change": 0
            }
        },
        "US-OR": {
            "name": "Oregon",
            "abbr": "OR",
            "student_debt": {
                "value": 28052,
                "change": 2,
                "rank": 30
            },
            "auto_debt": {
                "value": 22500,
                "change": 3.4,
                "rank": 36
            },
            "rent_burden": {
                "value": 49,
                "change": 0.4,
                "rank": 13
            },
            "median_income": {
                "value": 50800,
                "change": 3.4,
                "rank": 19
            },
            "unemployment": {
                "value": 7.8,
                "change": 0.4,
                "rank": 31
            },
            "debt_to_income": {
                "value": 37,
                "change": 2.3,
                "rank": 28
            },
            "cost_of_living": {
                "value": 150,
                "change": 5,
                "rank": 11
            },
            "financial_stress": {
                "value": 116,
                "change": 4.6,
                "rank": 17
            },
            "average_rent": {
                "value": 1850,
                "unit": "$",
                "label": "Avg Asking Rent (Zillow)",
                "source": "Zillow Observed Rent Index (ZORI) 2024"
            },
            "yaai": {
                "value": 53.9,
                "rank": 35,
                "change": 0
            }
        },
        "US-PA": {
            "name": "Pennsylvania",
            "abbr": "PA",
            "student_debt": {
                "value": 36193,
                "change": 2.7,
                "rank": 2
            },
            "auto_debt": {
                "value": 22800,
                "change": 3.4,
                "rank": 32
            },
            "rent_burden": {
                "value": 43.5,
                "change": -0.3,
                "rank": 24
            },
            "median_income": {
                "value": 50200,
                "change": 3,
                "rank": 21
            },
            "unemployment": {
                "value": 8.2,
                "change": 0.5,
                "rank": 37
            },
            "debt_to_income": {
                "value": 42.8,
                "change": 2.9,
                "rank": 12
            },
            "cost_of_living": {
                "value": 138,
                "change": 4.1,
                "rank": 19
            },
            "financial_stress": {
                "value": 109,
                "change": 4.6,
                "rank": 16
            },
            "average_rent": {
                "value": 1632,
                "unit": "$",
                "label": "Avg Asking Rent (Zillow)",
                "source": "Zillow Observed Rent Index (ZORI) 2024"
            },
            "yaai": {
                "value": 56.6,
                "rank": 42,
                "change": 0
            }
        },
        "US-RI": {
            "name": "Rhode Island",
            "abbr": "RI",
            "student_debt": {
                "value": 34305,
                "change": 2.5,
                "rank": 6
            },
            "auto_debt": {
                "value": 22200,
                "change": 3.2,
                "rank": 37
            },
            "rent_burden": {
                "value": 46,
                "change": 0.4,
                "rank": 19
            },
            "median_income": {
                "value": 52200,
                "change": 3.4,
                "rank": 16
            },
            "unemployment": {
                "value": 8,
                "change": 0.4,
                "rank": 33
            },
            "debt_to_income": {
                "value": 38.2,
                "change": 2.4,
                "rank": 23
            },
            "cost_of_living": {
                "value": 148,
                "change": 4.8,
                "rank": 13
            },
            "financial_stress": {
                "value": 112,
                "change": 4.5,
                "rank": 21
            },
            "average_rent": {
                "value": 2253,
                "unit": "$",
                "label": "Avg Asking Rent (Zillow)",
                "source": "Zillow Observed Rent Index (ZORI) 2024"
            },
            "yaai": {
                "value": 55.4,
                "rank": 39,
                "change": 0
            }
        },
        "US-SC": {
            "name": "South Carolina",
            "abbr": "SC",
            "student_debt": {
                "value": 34291,
                "change": 2.5,
                "rank": 7
            },
            "auto_debt": {
                "value": 25800,
                "change": 4.5,
                "rank": 10
            },
            "rent_burden": {
                "value": 51.5,
                "change": 1,
                "rank": 8
            },
            "median_income": {
                "value": 45200,
                "change": 2.8,
                "rank": 37
            },
            "unemployment": {
                "value": 7,
                "change": 0.2,
                "rank": 19
            },
            "debt_to_income": {
                "value": 45.5,
                "change": 3.2,
                "rank": 5
            },
            "cost_of_living": {
                "value": 128,
                "change": 3.3,
                "rank": 29
            },
            "financial_stress": {
                "value": 117,
                "change": 5,
                "rank": 7
            },
            "average_rent": {
                "value": 1503,
                "unit": "$",
                "label": "Avg Asking Rent (Zillow)",
                "source": "Zillow Observed Rent Index (ZORI) 2024"
            },
            "yaai": {
                "value": 62.6,
                "rank": 50,
                "change": 0
            }
        },
        "US-SD": {
            "name": "South Dakota",
            "abbr": "SD",
            "student_debt": {
                "value": 28528,
                "change": 2.2,
                "rank": 27
            },
            "auto_debt": {
                "value": 27200,
                "change": 4.6,
                "rank": 5
            },
            "rent_burden": {
                "value": 30,
                "change": -0.1,
                "rank": 48
            },
            "median_income": {
                "value": 49500,
                "change": 3.1,
                "rank": 23
            },
            "unemployment": {
                "value": 5.8,
                "change": 0.1,
                "rank": 6
            },
            "debt_to_income": {
                "value": 40,
                "change": 2.6,
                "rank": 20
            },
            "cost_of_living": {
                "value": 108,
                "change": 2.1,
                "rank": 49
            },
            "financial_stress": {
                "value": 100,
                "change": 3,
                "rank": 46
            },
            "average_rent": {
                "value": 1313,
                "unit": "$",
                "label": "Avg Asking Rent (Zillow)",
                "source": "Zillow Observed Rent Index (ZORI) 2024"
            },
            "yaai": {
                "value": 38.4,
                "rank": 5,
                "change": 0
            }
        },
        "US-TN": {
            "name": "Tennessee",
            "abbr": "TN",
            "student_debt": {
                "value": 26345,
                "change": 1.8,
                "rank": 41
            },
            "auto_debt": {
                "value": 26000,
                "change": 4.5,
                "rank": 9
            },
            "rent_burden": {
                "value": 45,
                "change": 0.9,
                "rank": 21
            },
            "median_income": {
                "value": 45800,
                "change": 2.9,
                "rank": 36
            },
            "unemployment": {
                "value": 6.8,
                "change": 0.2,
                "rank": 17
            },
            "debt_to_income": {
                "value": 42.5,
                "change": 2.9,
                "rank": 13
            },
            "cost_of_living": {
                "value": 124,
                "change": 3,
                "rank": 32
            },
            "financial_stress": {
                "value": 107,
                "change": 4.2,
                "rank": 22
            },
            "average_rent": {
                "value": 1750,
                "unit": "$",
                "label": "Avg Asking Rent (Zillow)",
                "source": "Zillow Observed Rent Index (ZORI) 2024"
            },
            "yaai": {
                "value": 51.6,
                "rank": 28,
                "change": 0
            }
        },
        "US-TX": {
            "name": "Texas",
            "abbr": "TX",
            "student_debt": {
                "value": 37014,
                "change": 2,
                "rank": 22
            },
            "auto_debt": {
                "value": 29760,
                "change": 3.2,
                "rank": 1
            },
            "rent_burden": {
                "value": 51,
                "change": 0.1,
                "rank": 9
            },
            "median_income": {
                "value": 52000,
                "change": 3.5,
                "rank": 18
            },
            "unemployment": {
                "value": 4,
                "change": 0.1,
                "rank": 20
            },
            "debt_to_income": {
                "value": 45.8,
                "change": 1.8,
                "rank": 5
            },
            "cost_of_living": {
                "value": 97.8,
                "change": 1,
                "rank": 28
            },
            "financial_stress": {
                "value": 108,
                "change": 1.5,
                "rank": 12
            },
            "average_rent": {
                "value": 1850,
                "unit": "$",
                "label": "Avg Asking Rent (Zillow)",
                "source": "Zillow Observed Rent Index (ZORI) 2024"
            },
            "yaai": {
                "value": 58.2,
                "rank": 45,
                "change": 0
            }
        },
        "US-UT": {
            "name": "Utah",
            "abbr": "UT",
            "student_debt": {
                "value": 19592,
                "change": 1,
                "rank": 51
            },
            "auto_debt": {
                "value": 24800,
                "change": 4.2,
                "rank": 18
            },
            "rent_burden": {
                "value": 38.5,
                "change": 0.9,
                "rank": 34
            },
            "median_income": {
                "value": 55500,
                "change": 4,
                "rank": 11
            },
            "unemployment": {
                "value": 6.2,
                "change": 0.1,
                "rank": 10
            },
            "debt_to_income": {
                "value": 32,
                "change": 1.8,
                "rank": 45
            },
            "cost_of_living": {
                "value": 142,
                "change": 4.5,
                "rank": 15
            },
            "financial_stress": {
                "value": 100,
                "change": 3.2,
                "rank": 42
            },
            "average_rent": {
                "value": 1800,
                "unit": "$",
                "label": "Avg Asking Rent (Zillow)",
                "source": "Zillow Observed Rent Index (ZORI) 2024"
            },
            "yaai": {
                "value": 37.2,
                "rank": 3,
                "change": 0
            }
        },
        "US-VT": {
            "name": "Vermont",
            "abbr": "VT",
            "student_debt": {
                "value": 29469,
                "change": 2.3,
                "rank": 22
            },
            "auto_debt": {
                "value": 22000,
                "change": 3.2,
                "rank": 39
            },
            "rent_burden": {
                "value": 34,
                "change": 0.5,
                "rank": 43
            },
            "median_income": {
                "value": 51800,
                "change": 3.3,
                "rank": 17
            },
            "unemployment": {
                "value": 6.4,
                "change": 0.1,
                "rank": 11
            },
            "debt_to_income": {
                "value": 35.2,
                "change": 2.1,
                "rank": 34
            },
            "cost_of_living": {
                "value": 140,
                "change": 4.2,
                "rank": 17
            },
            "financial_stress": {
                "value": 100,
                "change": 3.6,
                "rank": 37
            },
            "average_rent": {
                "value": 1897,
                "unit": "$",
                "label": "Avg Asking Rent (Zillow)",
                "source": "Zillow Observed Rent Index (ZORI) 2024"
            },
            "yaai": {
                "value": 42.3,
                "rank": 8,
                "change": 0
            }
        },
        "US-VA": {
            "name": "Virginia",
            "abbr": "VA",
            "student_debt": {
                "value": 29106,
                "change": 2,
                "rank": 23
            },
            "auto_debt": {
                "value": 24500,
                "change": 3.8,
                "rank": 19
            },
            "rent_burden": {
                "value": 44,
                "change": -0.5,
                "rank": 23
            },
            "median_income": {
                "value": 57200,
                "change": 3.6,
                "rank": 7
            },
            "unemployment": {
                "value": 7.2,
                "change": 0.3,
                "rank": 24
            },
            "debt_to_income": {
                "value": 34,
                "change": 1.9,
                "rank": 38
            },
            "cost_of_living": {
                "value": 145,
                "change": 4.5,
                "rank": 13
            },
            "financial_stress": {
                "value": 107,
                "change": 3.8,
                "rank": 34
            },
            "average_rent": {
                "value": 1950,
                "unit": "$",
                "label": "Avg Asking Rent (Zillow)",
                "source": "Zillow Observed Rent Index (ZORI) 2024"
            },
            "yaai": {
                "value": 47.1,
                "rank": 17,
                "change": 0
            }
        },
        "US-WA": {
            "name": "Washington",
            "abbr": "WA",
            "student_debt": {
                "value": 24623,
                "change": 1.5,
                "rank": 44
            },
            "auto_debt": {
                "value": 23200,
                "change": 3.5,
                "rank": 29
            },
            "rent_burden": {
                "value": 48,
                "change": 0.3,
                "rank": 15
            },
            "median_income": {
                "value": 56800,
                "change": 3.8,
                "rank": 7
            },
            "unemployment": {
                "value": 7.4,
                "change": 0.3,
                "rank": 27
            },
            "debt_to_income": {
                "value": 32.5,
                "change": 1.8,
                "rank": 42
            },
            "cost_of_living": {
                "value": 155,
                "change": 5.2,
                "rank": 6
            },
            "financial_stress": {
                "value": 125,
                "change": 4.2,
                "rank": 26,
                "trend": "up"
            },
            "average_rent": {
                "value": 2200,
                "unit": "$",
                "label": "Avg Asking Rent (Zillow)",
                "source": "Zillow Observed Rent Index (ZORI) 2024"
            },
            "yaai": {
                "value": 47.8,
                "rank": 21,
                "change": 0
            }
        },
        "US-WV": {
            "name": "West Virginia",
            "abbr": "WV",
            "student_debt": {
                "value": 27188,
                "change": 2,
                "rank": 36
            },
            "auto_debt": {
                "value": 22500,
                "change": 3.5,
                "rank": 35
            },
            "rent_burden": {
                "value": 25,
                "change": 0.1,
                "rank": 50
            },
            "median_income": {
                "value": 40200,
                "change": 2.2,
                "rank": 49
            },
            "unemployment": {
                "value": 10.2,
                "change": 0.8,
                "rank": 50
            },
            "debt_to_income": {
                "value": 45.8,
                "change": 3.4,
                "rank": 4
            },
            "cost_of_living": {
                "value": 115,
                "change": 2.5,
                "rank": 44
            },
            "financial_stress": {
                "value": 100,
                "change": 5,
                "rank": 4
            },
            "average_rent": {
                "value": 1214,
                "unit": "$",
                "label": "Avg Asking Rent (Zillow)",
                "source": "Zillow Observed Rent Index (ZORI) 2024"
            },
            "yaai": {
                "value": 41,
                "rank": 7,
                "change": 0
            }
        },
        "US-WI": {
            "name": "Wisconsin",
            "abbr": "WI",
            "student_debt": {
                "value": 30150,
                "change": 2.1,
                "rank": 19
            },
            "auto_debt": {
                "value": 23000,
                "change": 3.4,
                "rank": 30
            },
            "rent_burden": {
                "value": 39,
                "change": -0.4,
                "rank": 33
            },
            "median_income": {
                "value": 49000,
                "change": 2.9,
                "rank": 23
            },
            "unemployment": {
                "value": 6.5,
                "change": 0.1,
                "rank": 14
            },
            "debt_to_income": {
                "value": 38.5,
                "change": 2.4,
                "rank": 24
            },
            "cost_of_living": {
                "value": 118,
                "change": 2.6,
                "rank": 42
            },
            "financial_stress": {
                "value": 100,
                "change": 3.4,
                "rank": 41
            },
            "average_rent": {
                "value": 1449,
                "unit": "$",
                "label": "Avg Asking Rent (Zillow)",
                "source": "Zillow Observed Rent Index (ZORI) 2024"
            },
            "yaai": {
                "value": 45.9,
                "rank": 14,
                "change": 0
            }
        },
        "US-WY": {
            "name": "Wyoming",
            "abbr": "WY",
            "student_debt": {
                "value": 24118,
                "change": 1.8,
                "rank": 46
            },
            "auto_debt": {
                "value": 28500,
                "change": 5.2,
                "rank": 2
            },
            "rent_burden": {
                "value": 32,
                "change": 1.2,
                "rank": 47
            },
            "median_income": {
                "value": 52000,
                "change": 3.4,
                "rank": 16
            },
            "unemployment": {
                "value": 7,
                "change": 0.2,
                "rank": 21
            },
            "debt_to_income": {
                "value": 36.5,
                "change": 2.2,
                "rank": 29
            },
            "cost_of_living": {
                "value": 110,
                "change": 2.3,
                "rank": 47
            },
            "financial_stress": {
                "value": 100,
                "change": 3,
                "rank": 45
            },
            "average_rent": {
                "value": 1447,
                "unit": "$",
                "label": "Avg Asking Rent (Zillow)",
                "source": "Zillow Observed Rent Index (ZORI) 2024"
            },
            "yaai": {
                "value": 34.9,
                "rank": 2,
                "change": 0
            }
        }
    },
    "indicators": {
        "student_debt": {
            "name": "Student Debt",
            "fullName": "Average Student Debt at Graduation",
            "description": "Average student loan balance for college graduates",
            "source": "TICAS - Student Debt and the Class of 2023",
            "sourceUrl": "https://ticas.org/our-work/student-debt/",
            "unit": "$",
            "format": "currency",
            "higherIsBad": true,
            "thresholds": {
                "low": 28000,
                "moderate": 33000,
                "elevated": 38000,
                "high": 43000
            }
        },
        "auto_debt": {
            "name": "Auto Debt",
            "fullName": "Average Auto Loan Balance",
            "description": "Average auto loan balance for young adults aged 18-34",
            "source": "Federal Reserve Consumer Credit G.19",
            "sourceUrl": "https://www.federalreserve.gov/releases/g19/current/",
            "unit": "$",
            "format": "currency",
            "higherIsBad": true,
            "thresholds": {
                "low": 20000,
                "moderate": 23000,
                "elevated": 25000,
                "high": 27000
            }
        },
        "rent_burden": {
            "name": "Cost Burdened Rate",
            "fullName": "Rent as % of Income",
            "description": "% of young renters paying >30% of income on housing",
            "source": "Census ACS 2024 / Harvard JCHS",
            "sourceUrl": "https://www.jchs.harvard.edu/",
            "unit": "%",
            "format": "percentage",
            "higherIsBad": true,
            "thresholds": {
                "low": 40,
                "moderate": 48,
                "elevated": 52,
                "high": 55
            }
        },
        "median_income": {
            "name": "Median Income",
            "fullName": "Median Income (Ages 22-34)",
            "description": "Median annual income for young adults aged 22-34",
            "source": "Census ACS S1902",
            "sourceUrl": "https://www.census.gov/programs-surveys/acs",
            "unit": "$",
            "format": "currency",
            "higherIsBad": false,
            "thresholds": {
                "low": 58000,
                "moderate": 50000,
                "elevated": 44000,
                "high": 40000
            }
        },
        "unemployment": {
            "name": "Youth Unemployment",
            "fullName": "Unemployment Rate (Ages 20-29)",
            "description": "Unemployment rate for young adults aged 20-29",
            "source": "Bureau of Labor Statistics",
            "sourceUrl": "https://www.bls.gov/cps/",
            "unit": "%",
            "format": "percentage",
            "higherIsBad": true,
            "thresholds": {
                "low": 5,
                "moderate": 7,
                "elevated": 9,
                "high": 11
            }
        },
        "debt_to_income": {
            "name": "Debt-to-Income",
            "fullName": "Total Debt-to-Income Ratio",
            "description": "Combined monthly debt payments as percentage of gross income",
            "source": "Calculated from Federal Reserve + Census data",
            "sourceUrl": "https://www.federalreserve.gov/",
            "unit": "%",
            "format": "percentage",
            "higherIsBad": true,
            "thresholds": {
                "low": 32,
                "moderate": 38,
                "elevated": 43,
                "high": 48
            }
        },
        "cost_of_living": {
            "name": "Cost of Living",
            "fullName": "Cost of Living Index",
            "description": "Overall cost of living index for young adults (100 = national average)",
            "source": "BLS + Census ACS",
            "sourceUrl": "https://www.bls.gov/",
            "unit": "index",
            "format": "index",
            "higherIsBad": true,
            "thresholds": {
                "low": 110,
                "moderate": 130,
                "elevated": 150,
                "high": 165
            }
        },
        "financial_stress": {
            "name": "Financial Stress",
            "fullName": "Young Adult Financial Stress Index",
            "description": "Weighted composite of all 7 indicators (student debt, auto debt, rent burden, income, unemployment, debt-to-income, cost of living) measuring overall financial pressure",
            "source": "FinMango Research - Weighted composite of all indicators",
            "sourceUrl": "https://finmango.org/research",
            "unit": "index",
            "format": "index",
            "higherIsBad": true,
            "thresholds": {
                "low": 110,
                "moderate": 125,
                "elevated": 135,
                "high": 145
            }
        },
        "average_rent": {
            "name": "Average Rent",
            "fullName": "Avg Asking Rent (Zillow ZORI)",
            "description": "Zillow Observed Rent Index (Asking Rent) for all homes and apartments, estimated for late 2024",
            "source": "Zillow Research (ZORI)",
            "unit": "$",
            "format": "currency",
            "higherIsBad": true,
            "thresholds": {
                "low": 1200,
                "moderate": 1600,
                "elevated": 2000,
                "high": 2400
            }
        },
        "yaai": {
            "name": "YAAI",
            "fullName": "Young Adult Affordability Index",
            "description": "Weighted composite: Rent Burden (35%), Student Debt (20%), D/I Ratio (15%), Cost of Living (15%), Income (15%). Lower scores = more affordable.",
            "source": "FinMango Research - Z-score normalized",
            "sourceUrl": "https://finmango.org/affordability-lab",
            "unit": "score",
            "format": "index",
            "higherIsBad": true,
            "thresholds": {
                "low": 35,
                "moderate": 50,
                "elevated": 65,
                "high": 80
            }
        }
    }
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = YOUNG_ADULT_DATA;
}
