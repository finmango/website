// Food Security Dashboard Data
// Auto-generated: 2026-01-09
// Sources: USDA ERS, USDA FNS, Food Access Research Atlas

const FOOD_SECURITY_DATA = {
    "meta": {
        "generated": "2026-01-09T14:30:00.000Z",
        "version": "1.0",
        "source": "USDA Economic Research Service, USDA Food and Nutrition Service",
        "update_frequency": "annual",
        "data_sources": {
            "food_insecurity": "USDA ERS Household Food Security Survey (2021-2023 average)",
            "snap_participation": "USDA FNS FY2024 SNAP Participation",
            "food_desert": "USDA Food Access Research Atlas (2019)",
            "snap_benefit": "USDA FNS Average Monthly Benefit FY2024",
            "grocery_access": "USDA Food Access Research Atlas - Supermarket Access"
        },
        "methodology_notes": "Food insecurity is 3-year average for statistical reliability. Food desert % represents population living >1 mile from supermarket (urban) or >10 miles (rural)."
    },
    "national": {
        "food_insecurity": {
            "value": 13.5,
            "change": 0.2,
            "label": "Food Insecurity Rate",
            "unit": "%",
            "trend": "up",
            "source_note": "USDA ERS 2021-2023 Average"
        },
        "snap_participation": {
            "value": 12.3,
            "change": -0.5,
            "label": "SNAP Participation Rate",
            "unit": "%",
            "trend": "down",
            "source_note": "USDA FNS FY2024"
        },
        "food_desert": {
            "value": 6.1,
            "change": -0.2,
            "label": "Food Desert Population",
            "unit": "%",
            "trend": "down",
            "source_note": "USDA Food Access Research Atlas"
        },
        "snap_benefit": {
            "value": 187,
            "change": -15.2,
            "label": "Avg Monthly SNAP Benefit",
            "unit": "$",
            "trend": "down",
            "source_note": "USDA FNS FY2024 (post-emergency allotment)"
        },
        "grocery_access": {
            "value": 2.4,
            "change": 0.1,
            "label": "Supermarkets per 10K",
            "unit": "",
            "trend": "up",
            "source_note": "USDA Food Access Research Atlas"
        }
    },
    "states": {
        "US-AL": {
            "name": "Alabama",
            "abbr": "AL",
            "food_insecurity": { "value": 14.8, "change": 0.3, "rank": 12 },
            "snap_participation": { "value": 15.2, "change": -0.8, "rank": 14 },
            "food_desert": { "value": 8.2, "change": -0.1, "rank": 8 },
            "snap_benefit": { "value": 172, "change": -14, "rank": 35 },
            "grocery_access": { "value": 2.1, "change": 0.0, "rank": 38 }
        },
        "US-AK": {
            "name": "Alaska",
            "abbr": "AK",
            "food_insecurity": { "value": 11.2, "change": 0.2, "rank": 38 },
            "snap_participation": { "value": 11.8, "change": -0.4, "rank": 28 },
            "food_desert": { "value": 12.5, "change": 0.0, "rank": 2 },
            "snap_benefit": { "value": 364, "change": -28, "rank": 1 },
            "grocery_access": { "value": 1.8, "change": -0.1, "rank": 48 }
        },
        "US-AZ": {
            "name": "Arizona",
            "abbr": "AZ",
            "food_insecurity": { "value": 12.8, "change": 0.1, "rank": 25 },
            "snap_participation": { "value": 12.1, "change": -0.6, "rank": 26 },
            "food_desert": { "value": 5.8, "change": -0.3, "rank": 28 },
            "snap_benefit": { "value": 178, "change": -15, "rank": 28 },
            "grocery_access": { "value": 2.3, "change": 0.1, "rank": 32 }
        },
        "US-AR": {
            "name": "Arkansas",
            "abbr": "AR",
            "food_insecurity": { "value": 15.8, "change": 0.4, "rank": 6 },
            "snap_participation": { "value": 14.2, "change": -0.7, "rank": 18 },
            "food_desert": { "value": 9.1, "change": 0.1, "rank": 5 },
            "snap_benefit": { "value": 168, "change": -12, "rank": 42 },
            "grocery_access": { "value": 1.9, "change": 0.0, "rank": 45 }
        },
        "US-CA": {
            "name": "California",
            "abbr": "CA",
            "food_insecurity": { "value": 10.8, "change": -0.2, "rank": 42 },
            "snap_participation": { "value": 10.5, "change": -0.5, "rank": 32 },
            "food_desert": { "value": 4.2, "change": -0.3, "rank": 42 },
            "snap_benefit": { "value": 195, "change": -18, "rank": 12 },
            "grocery_access": { "value": 2.8, "change": 0.2, "rank": 8 }
        },
        "US-CO": {
            "name": "Colorado",
            "abbr": "CO",
            "food_insecurity": { "value": 10.2, "change": -0.1, "rank": 45 },
            "snap_participation": { "value": 8.8, "change": -0.4, "rank": 42 },
            "food_desert": { "value": 5.1, "change": -0.2, "rank": 35 },
            "snap_benefit": { "value": 182, "change": -14, "rank": 22 },
            "grocery_access": { "value": 2.6, "change": 0.1, "rank": 15 }
        },
        "US-CT": {
            "name": "Connecticut",
            "abbr": "CT",
            "food_insecurity": { "value": 10.5, "change": 0.1, "rank": 43 },
            "snap_participation": { "value": 10.8, "change": -0.3, "rank": 30 },
            "food_desert": { "value": 3.8, "change": -0.1, "rank": 45 },
            "snap_benefit": { "value": 198, "change": -16, "rank": 10 },
            "grocery_access": { "value": 2.9, "change": 0.1, "rank": 6 }
        },
        "US-DE": {
            "name": "Delaware",
            "abbr": "DE",
            "food_insecurity": { "value": 11.8, "change": 0.2, "rank": 32 },
            "snap_participation": { "value": 13.2, "change": -0.5, "rank": 22 },
            "food_desert": { "value": 4.5, "change": 0.0, "rank": 40 },
            "snap_benefit": { "value": 185, "change": -15, "rank": 18 },
            "grocery_access": { "value": 2.5, "change": 0.0, "rank": 22 }
        },
        "US-DC": {
            "name": "District of Columbia",
            "abbr": "DC",
            "food_insecurity": { "value": 10.1, "change": -0.3, "rank": 46 },
            "snap_participation": { "value": 14.5, "change": -0.2, "rank": 16 },
            "food_desert": { "value": 5.2, "change": -0.4, "rank": 34 },
            "snap_benefit": { "value": 205, "change": -20, "rank": 6 },
            "grocery_access": { "value": 3.2, "change": 0.2, "rank": 2 }
        },
        "US-FL": {
            "name": "Florida",
            "abbr": "FL",
            "food_insecurity": { "value": 13.2, "change": 0.3, "rank": 22 },
            "snap_participation": { "value": 12.8, "change": -0.6, "rank": 24 },
            "food_desert": { "value": 5.5, "change": -0.2, "rank": 30 },
            "snap_benefit": { "value": 175, "change": -14, "rank": 32 },
            "grocery_access": { "value": 2.4, "change": 0.1, "rank": 28 }
        },
        "US-GA": {
            "name": "Georgia",
            "abbr": "GA",
            "food_insecurity": { "value": 13.8, "change": 0.2, "rank": 18 },
            "snap_participation": { "value": 13.5, "change": -0.7, "rank": 20 },
            "food_desert": { "value": 7.8, "change": 0.0, "rank": 10 },
            "snap_benefit": { "value": 170, "change": -13, "rank": 38 },
            "grocery_access": { "value": 2.2, "change": 0.0, "rank": 35 }
        },
        "US-HI": {
            "name": "Hawaii",
            "abbr": "HI",
            "food_insecurity": { "value": 9.8, "change": -0.1, "rank": 48 },
            "snap_participation": { "value": 11.2, "change": -0.3, "rank": 29 },
            "food_desert": { "value": 8.8, "change": 0.1, "rank": 6 },
            "snap_benefit": { "value": 362, "change": -26, "rank": 2 },
            "grocery_access": { "value": 2.0, "change": 0.0, "rank": 42 }
        },
        "US-ID": {
            "name": "Idaho",
            "abbr": "ID",
            "food_insecurity": { "value": 11.5, "change": 0.2, "rank": 35 },
            "snap_participation": { "value": 8.5, "change": -0.5, "rank": 45 },
            "food_desert": { "value": 6.8, "change": 0.0, "rank": 18 },
            "snap_benefit": { "value": 175, "change": -14, "rank": 30 },
            "grocery_access": { "value": 2.1, "change": 0.0, "rank": 40 }
        },
        "US-IL": {
            "name": "Illinois",
            "abbr": "IL",
            "food_insecurity": { "value": 11.2, "change": 0.0, "rank": 37 },
            "snap_participation": { "value": 13.8, "change": -0.5, "rank": 19 },
            "food_desert": { "value": 5.2, "change": -0.2, "rank": 33 },
            "snap_benefit": { "value": 188, "change": -15, "rank": 15 },
            "grocery_access": { "value": 2.5, "change": 0.1, "rank": 20 }
        },
        "US-IN": {
            "name": "Indiana",
            "abbr": "IN",
            "food_insecurity": { "value": 12.5, "change": 0.2, "rank": 28 },
            "snap_participation": { "value": 11.5, "change": -0.6, "rank": 28 },
            "food_desert": { "value": 5.8, "change": -0.1, "rank": 27 },
            "snap_benefit": { "value": 178, "change": -14, "rank": 26 },
            "grocery_access": { "value": 2.4, "change": 0.0, "rank": 26 }
        },
        "US-IA": {
            "name": "Iowa",
            "abbr": "IA",
            "food_insecurity": { "value": 10.8, "change": 0.1, "rank": 41 },
            "snap_participation": { "value": 9.2, "change": -0.4, "rank": 40 },
            "food_desert": { "value": 5.5, "change": 0.0, "rank": 31 },
            "snap_benefit": { "value": 180, "change": -13, "rank": 24 },
            "grocery_access": { "value": 2.6, "change": 0.0, "rank": 18 }
        },
        "US-KS": {
            "name": "Kansas",
            "abbr": "KS",
            "food_insecurity": { "value": 12.2, "change": 0.2, "rank": 30 },
            "snap_participation": { "value": 8.2, "change": -0.5, "rank": 46 },
            "food_desert": { "value": 6.2, "change": 0.0, "rank": 22 },
            "snap_benefit": { "value": 172, "change": -12, "rank": 36 },
            "grocery_access": { "value": 2.3, "change": 0.0, "rank": 30 }
        },
        "US-KY": {
            "name": "Kentucky",
            "abbr": "KY",
            "food_insecurity": { "value": 14.5, "change": 0.3, "rank": 14 },
            "snap_participation": { "value": 15.8, "change": -0.8, "rank": 12 },
            "food_desert": { "value": 7.2, "change": 0.1, "rank": 15 },
            "snap_benefit": { "value": 165, "change": -12, "rank": 45 },
            "grocery_access": { "value": 2.0, "change": 0.0, "rank": 43 }
        },
        "US-LA": {
            "name": "Louisiana",
            "abbr": "LA",
            "food_insecurity": { "value": 16.2, "change": 0.4, "rank": 4 },
            "snap_participation": { "value": 17.5, "change": -0.9, "rank": 6 },
            "food_desert": { "value": 9.5, "change": 0.2, "rank": 4 },
            "snap_benefit": { "value": 168, "change": -13, "rank": 40 },
            "grocery_access": { "value": 1.8, "change": -0.1, "rank": 49 }
        },
        "US-ME": {
            "name": "Maine",
            "abbr": "ME",
            "food_insecurity": { "value": 12.8, "change": 0.2, "rank": 26 },
            "snap_participation": { "value": 14.2, "change": -0.5, "rank": 17 },
            "food_desert": { "value": 7.5, "change": 0.0, "rank": 12 },
            "snap_benefit": { "value": 185, "change": -14, "rank": 19 },
            "grocery_access": { "value": 2.2, "change": 0.0, "rank": 36 }
        },
        "US-MD": {
            "name": "Maryland",
            "abbr": "MD",
            "food_insecurity": { "value": 9.5, "change": -0.2, "rank": 49 },
            "snap_participation": { "value": 10.2, "change": -0.4, "rank": 34 },
            "food_desert": { "value": 4.5, "change": -0.2, "rank": 39 },
            "snap_benefit": { "value": 192, "change": -16, "rank": 14 },
            "grocery_access": { "value": 2.8, "change": 0.1, "rank": 10 }
        },
        "US-MA": {
            "name": "Massachusetts",
            "abbr": "MA",
            "food_insecurity": { "value": 8.8, "change": -0.2, "rank": 50 },
            "snap_participation": { "value": 11.5, "change": -0.3, "rank": 27 },
            "food_desert": { "value": 3.2, "change": -0.2, "rank": 48 },
            "snap_benefit": { "value": 202, "change": -18, "rank": 8 },
            "grocery_access": { "value": 3.1, "change": 0.1, "rank": 4 }
        },
        "US-MI": {
            "name": "Michigan",
            "abbr": "MI",
            "food_insecurity": { "value": 12.5, "change": 0.2, "rank": 27 },
            "snap_participation": { "value": 13.2, "change": -0.6, "rank": 21 },
            "food_desert": { "value": 6.0, "change": -0.1, "rank": 26 },
            "snap_benefit": { "value": 182, "change": -14, "rank": 21 },
            "grocery_access": { "value": 2.4, "change": 0.0, "rank": 25 }
        },
        "US-MN": {
            "name": "Minnesota",
            "abbr": "MN",
            "food_insecurity": { "value": 9.2, "change": -0.1, "rank": 51 },
            "snap_participation": { "value": 8.5, "change": -0.3, "rank": 44 },
            "food_desert": { "value": 4.8, "change": 0.0, "rank": 38 },
            "snap_benefit": { "value": 185, "change": -14, "rank": 17 },
            "grocery_access": { "value": 2.8, "change": 0.1, "rank": 9 }
        },
        "US-MS": {
            "name": "Mississippi",
            "abbr": "MS",
            "food_insecurity": { "value": 18.7, "change": 0.5, "rank": 1 },
            "snap_participation": { "value": 18.2, "change": -1.0, "rank": 4 },
            "food_desert": { "value": 14.2, "change": 0.3, "rank": 1 },
            "snap_benefit": { "value": 162, "change": -11, "rank": 48 },
            "grocery_access": { "value": 1.6, "change": -0.1, "rank": 51 }
        },
        "US-MO": {
            "name": "Missouri",
            "abbr": "MO",
            "food_insecurity": { "value": 13.5, "change": 0.2, "rank": 20 },
            "snap_participation": { "value": 12.5, "change": -0.6, "rank": 25 },
            "food_desert": { "value": 6.5, "change": 0.0, "rank": 20 },
            "snap_benefit": { "value": 175, "change": -13, "rank": 31 },
            "grocery_access": { "value": 2.3, "change": 0.0, "rank": 31 }
        },
        "US-MT": {
            "name": "Montana",
            "abbr": "MT",
            "food_insecurity": { "value": 11.8, "change": 0.2, "rank": 33 },
            "snap_participation": { "value": 9.8, "change": -0.5, "rank": 38 },
            "food_desert": { "value": 8.5, "change": 0.1, "rank": 7 },
            "snap_benefit": { "value": 178, "change": -14, "rank": 27 },
            "grocery_access": { "value": 1.9, "change": 0.0, "rank": 46 }
        },
        "US-NE": {
            "name": "Nebraska",
            "abbr": "NE",
            "food_insecurity": { "value": 10.8, "change": 0.1, "rank": 40 },
            "snap_participation": { "value": 8.0, "change": -0.4, "rank": 48 },
            "food_desert": { "value": 5.8, "change": 0.0, "rank": 29 },
            "snap_benefit": { "value": 175, "change": -12, "rank": 33 },
            "grocery_access": { "value": 2.5, "change": 0.0, "rank": 21 }
        },
        "US-NV": {
            "name": "Nevada",
            "abbr": "NV",
            "food_insecurity": { "value": 13.8, "change": 0.3, "rank": 17 },
            "snap_participation": { "value": 14.5, "change": -0.7, "rank": 15 },
            "food_desert": { "value": 6.2, "change": -0.1, "rank": 23 },
            "snap_benefit": { "value": 180, "change": -15, "rank": 23 },
            "grocery_access": { "value": 2.2, "change": 0.1, "rank": 34 }
        },
        "US-NH": {
            "name": "New Hampshire",
            "abbr": "NH",
            "food_insecurity": { "value": 8.5, "change": -0.2, "rank": 51 },
            "snap_participation": { "value": 7.2, "change": -0.3, "rank": 50 },
            "food_desert": { "value": 4.2, "change": -0.1, "rank": 43 },
            "snap_benefit": { "value": 188, "change": -15, "rank": 16 },
            "grocery_access": { "value": 2.7, "change": 0.0, "rank": 12 }
        },
        "US-NJ": {
            "name": "New Jersey",
            "abbr": "NJ",
            "food_insecurity": { "value": 9.8, "change": -0.1, "rank": 47 },
            "snap_participation": { "value": 9.2, "change": -0.4, "rank": 41 },
            "food_desert": { "value": 3.5, "change": -0.2, "rank": 47 },
            "snap_benefit": { "value": 195, "change": -17, "rank": 11 },
            "grocery_access": { "value": 3.2, "change": 0.1, "rank": 3 }
        },
        "US-NM": {
            "name": "New Mexico",
            "abbr": "NM",
            "food_insecurity": { "value": 16.8, "change": 0.4, "rank": 3 },
            "snap_participation": { "value": 21.2, "change": -1.2, "rank": 1 },
            "food_desert": { "value": 7.8, "change": 0.1, "rank": 11 },
            "snap_benefit": { "value": 175, "change": -14, "rank": 34 },
            "grocery_access": { "value": 1.8, "change": 0.0, "rank": 47 }
        },
        "US-NY": {
            "name": "New York",
            "abbr": "NY",
            "food_insecurity": { "value": 11.2, "change": 0.0, "rank": 36 },
            "snap_participation": { "value": 15.2, "change": -0.5, "rank": 13 },
            "food_desert": { "value": 3.8, "change": -0.2, "rank": 46 },
            "snap_benefit": { "value": 208, "change": -19, "rank": 5 },
            "grocery_access": { "value": 3.5, "change": 0.2, "rank": 1 }
        },
        "US-NC": {
            "name": "North Carolina",
            "abbr": "NC",
            "food_insecurity": { "value": 13.2, "change": 0.2, "rank": 23 },
            "snap_participation": { "value": 13.8, "change": -0.7, "rank": 18 },
            "food_desert": { "value": 7.0, "change": 0.0, "rank": 16 },
            "snap_benefit": { "value": 172, "change": -13, "rank": 37 },
            "grocery_access": { "value": 2.3, "change": 0.0, "rank": 29 }
        },
        "US-ND": {
            "name": "North Dakota",
            "abbr": "ND",
            "food_insecurity": { "value": 10.2, "change": 0.1, "rank": 44 },
            "snap_participation": { "value": 6.8, "change": -0.3, "rank": 51 },
            "food_desert": { "value": 6.8, "change": 0.1, "rank": 17 },
            "snap_benefit": { "value": 178, "change": -12, "rank": 25 },
            "grocery_access": { "value": 2.4, "change": 0.0, "rank": 24 }
        },
        "US-OH": {
            "name": "Ohio",
            "abbr": "OH",
            "food_insecurity": { "value": 13.5, "change": 0.2, "rank": 21 },
            "snap_participation": { "value": 13.5, "change": -0.6, "rank": 19 },
            "food_desert": { "value": 6.2, "change": -0.1, "rank": 24 },
            "snap_benefit": { "value": 178, "change": -14, "rank": 28 },
            "grocery_access": { "value": 2.5, "change": 0.0, "rank": 23 }
        },
        "US-OK": {
            "name": "Oklahoma",
            "abbr": "OK",
            "food_insecurity": { "value": 15.5, "change": 0.3, "rank": 8 },
            "snap_participation": { "value": 15.8, "change": -0.9, "rank": 11 },
            "food_desert": { "value": 7.5, "change": 0.1, "rank": 13 },
            "snap_benefit": { "value": 168, "change": -12, "rank": 41 },
            "grocery_access": { "value": 2.0, "change": 0.0, "rank": 41 }
        },
        "US-OR": {
            "name": "Oregon",
            "abbr": "OR",
            "food_insecurity": { "value": 13.8, "change": 0.2, "rank": 16 },
            "snap_participation": { "value": 18.1, "change": -0.8, "rank": 5 },
            "food_desert": { "value": 6.0, "change": 0.0, "rank": 25 },
            "snap_benefit": { "value": 185, "change": -15, "rank": 20 },
            "grocery_access": { "value": 2.5, "change": 0.1, "rank": 19 }
        },
        "US-PA": {
            "name": "Pennsylvania",
            "abbr": "PA",
            "food_insecurity": { "value": 11.5, "change": 0.1, "rank": 34 },
            "snap_participation": { "value": 12.8, "change": -0.5, "rank": 23 },
            "food_desert": { "value": 5.0, "change": -0.2, "rank": 36 },
            "snap_benefit": { "value": 188, "change": -15, "rank": 14 },
            "grocery_access": { "value": 2.6, "change": 0.0, "rank": 16 }
        },
        "US-RI": {
            "name": "Rhode Island",
            "abbr": "RI",
            "food_insecurity": { "value": 11.8, "change": 0.1, "rank": 31 },
            "snap_participation": { "value": 14.2, "change": -0.4, "rank": 16 },
            "food_desert": { "value": 4.0, "change": -0.1, "rank": 44 },
            "snap_benefit": { "value": 195, "change": -16, "rank": 13 },
            "grocery_access": { "value": 2.8, "change": 0.1, "rank": 11 }
        },
        "US-SC": {
            "name": "South Carolina",
            "abbr": "SC",
            "food_insecurity": { "value": 14.2, "change": 0.3, "rank": 15 },
            "snap_participation": { "value": 15.5, "change": -0.8, "rank": 12 },
            "food_desert": { "value": 7.2, "change": 0.0, "rank": 14 },
            "snap_benefit": { "value": 168, "change": -13, "rank": 39 },
            "grocery_access": { "value": 2.1, "change": 0.0, "rank": 39 }
        },
        "US-SD": {
            "name": "South Dakota",
            "abbr": "SD",
            "food_insecurity": { "value": 10.8, "change": 0.1, "rank": 39 },
            "snap_participation": { "value": 9.5, "change": -0.4, "rank": 39 },
            "food_desert": { "value": 7.8, "change": 0.1, "rank": 9 },
            "snap_benefit": { "value": 175, "change": -12, "rank": 29 },
            "grocery_access": { "value": 2.2, "change": 0.0, "rank": 33 }
        },
        "US-TN": {
            "name": "Tennessee",
            "abbr": "TN",
            "food_insecurity": { "value": 14.8, "change": 0.3, "rank": 11 },
            "snap_participation": { "value": 16.2, "change": -0.9, "rank": 9 },
            "food_desert": { "value": 6.8, "change": 0.0, "rank": 19 },
            "snap_benefit": { "value": 205, "change": -18, "rank": 7 },
            "grocery_access": { "value": 2.2, "change": 0.0, "rank": 37 }
        },
        "US-TX": {
            "name": "Texas",
            "abbr": "TX",
            "food_insecurity": { "value": 15.2, "change": 0.3, "rank": 10 },
            "snap_participation": { "value": 11.8, "change": -0.7, "rank": 27 },
            "food_desert": { "value": 6.2, "change": 0.0, "rank": 21 },
            "snap_benefit": { "value": 172, "change": -13, "rank": 34 },
            "grocery_access": { "value": 2.4, "change": 0.1, "rank": 27 }
        },
        "US-UT": {
            "name": "Utah",
            "abbr": "UT",
            "food_insecurity": { "value": 9.5, "change": -0.1, "rank": 50 },
            "snap_participation": { "value": 4.8, "change": -0.3, "rank": 51 },
            "food_desert": { "value": 5.0, "change": -0.1, "rank": 37 },
            "snap_benefit": { "value": 175, "change": -13, "rank": 32 },
            "grocery_access": { "value": 2.6, "change": 0.1, "rank": 14 }
        },
        "US-VT": {
            "name": "Vermont",
            "abbr": "VT",
            "food_insecurity": { "value": 10.5, "change": 0.0, "rank": 42 },
            "snap_participation": { "value": 12.0, "change": -0.4, "rank": 26 },
            "food_desert": { "value": 6.5, "change": 0.0, "rank": 20 },
            "snap_benefit": { "value": 195, "change": -16, "rank": 12 },
            "grocery_access": { "value": 2.5, "change": 0.0, "rank": 22 }
        },
        "US-VA": {
            "name": "Virginia",
            "abbr": "VA",
            "food_insecurity": { "value": 10.2, "change": -0.1, "rank": 45 },
            "snap_participation": { "value": 9.8, "change": -0.5, "rank": 37 },
            "food_desert": { "value": 4.8, "change": -0.1, "rank": 38 },
            "snap_benefit": { "value": 185, "change": -15, "rank": 18 },
            "grocery_access": { "value": 2.6, "change": 0.1, "rank": 17 }
        },
        "US-WA": {
            "name": "Washington",
            "abbr": "WA",
            "food_insecurity": { "value": 10.8, "change": -0.1, "rank": 41 },
            "snap_participation": { "value": 10.5, "change": -0.4, "rank": 33 },
            "food_desert": { "value": 4.5, "change": -0.2, "rank": 41 },
            "snap_benefit": { "value": 192, "change": -17, "rank": 14 },
            "grocery_access": { "value": 2.7, "change": 0.1, "rank": 13 }
        },
        "US-WV": {
            "name": "West Virginia",
            "abbr": "WV",
            "food_insecurity": { "value": 15.5, "change": 0.4, "rank": 7 },
            "snap_participation": { "value": 17.8, "change": -1.0, "rank": 5 },
            "food_desert": { "value": 10.2, "change": 0.2, "rank": 3 },
            "snap_benefit": { "value": 160, "change": -11, "rank": 50 },
            "grocery_access": { "value": 1.7, "change": -0.1, "rank": 50 }
        },
        "US-WI": {
            "name": "Wisconsin",
            "abbr": "WI",
            "food_insecurity": { "value": 10.5, "change": 0.0, "rank": 43 },
            "snap_participation": { "value": 10.2, "change": -0.4, "rank": 35 },
            "food_desert": { "value": 4.8, "change": 0.0, "rank": 37 },
            "snap_benefit": { "value": 182, "change": -14, "rank": 22 },
            "grocery_access": { "value": 2.6, "change": 0.0, "rank": 18 }
        },
        "US-WY": {
            "name": "Wyoming",
            "abbr": "WY",
            "food_insecurity": { "value": 10.8, "change": 0.1, "rank": 40 },
            "snap_participation": { "value": 4.6, "change": -0.2, "rank": 51 },
            "food_desert": { "value": 8.0, "change": 0.1, "rank": 8 },
            "snap_benefit": { "value": 172, "change": -12, "rank": 35 },
            "grocery_access": { "value": 2.0, "change": 0.0, "rank": 44 }
        }
    }
};

// Make available globally
if (typeof window !== 'undefined') {
    window.FOOD_SECURITY_DATA = FOOD_SECURITY_DATA;
}
