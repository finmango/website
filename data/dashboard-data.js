// FinMango Research Dashboard - Sample Data
// This file provides mock data for testing. In production, this is replaced by latest.json

const DASHBOARD_DATA = {
    meta: {
        generated: "2025-12-08T00:00:00Z",
        version: "1.0",
        source: "Google Health Trends API",
        update_frequency: "daily"
    },
    national: {
        financial_anxiety: { value: 127.3, change: 3.2, trend: "up" },
        food_insecurity: { value: 89.4, change: -1.8, trend: "down" },
        housing_stress: { value: 156.7, change: 5.4, trend: "up" },
        affordability: { value: 112.1, change: 2.1, trend: "up" }
    },
    states: {
        "US-AL": { name: "Alabama", abbr: "AL", financial_anxiety: { value: 165.3, change: 4.1, rank: 5 }, food_insecurity: { value: 127.2, change: -0.5, rank: 5 }, housing_stress: { value: 169.1, change: 2.3, rank: 8 }, affordability: { value: 135.2, change: 1.2, rank: 10 } },
        "US-AK": { name: "Alaska", abbr: "AK", financial_anxiety: { value: 98.2, change: 1.2, rank: 42 }, food_insecurity: { value: 72.1, change: -2.1, rank: 45 }, housing_stress: { value: 142.8, change: 3.1, rank: 18 }, affordability: { value: 128.4, change: 2.8, rank: 15 } },
        "US-AZ": { name: "Arizona", abbr: "AZ", financial_anxiety: { value: 134.5, change: 2.8, rank: 18 }, food_insecurity: { value: 95.2, change: 1.2, rank: 22 }, housing_stress: { value: 178.4, change: 6.2, rank: 4 }, affordability: { value: 145.7, change: 4.5, rank: 5 } },
        "US-AR": { name: "Arkansas", abbr: "AR", financial_anxiety: { value: 168.9, change: 3.5, rank: 4 }, food_insecurity: { value: 129.8, change: 0.8, rank: 4 }, housing_stress: { value: 172.4, change: 1.8, rank: 6 }, affordability: { value: 138.7, change: 0.9, rank: 8 } },
        "US-CA": { name: "California", abbr: "CA", financial_anxiety: { value: 118.4, change: 2.1, rank: 28 }, food_insecurity: { value: 82.3, change: -1.2, rank: 35 }, housing_stress: { value: 195.2, change: 7.8, rank: 2 }, affordability: { value: 168.9, change: 5.2, rank: 2 } },
        "US-CO": { name: "Colorado", abbr: "CO", financial_anxiety: { value: 105.2, change: 1.8, rank: 38 }, food_insecurity: { value: 68.4, change: -2.5, rank: 48 }, housing_stress: { value: 165.3, change: 4.2, rank: 10 }, affordability: { value: 142.1, change: 3.1, rank: 7 } },
        "US-CT": { name: "Connecticut", abbr: "CT", financial_anxiety: { value: 112.8, change: 1.5, rank: 32 }, food_insecurity: { value: 75.2, change: -1.8, rank: 42 }, housing_stress: { value: 148.7, change: 2.8, rank: 15 }, affordability: { value: 125.3, change: 1.8, rank: 18 } },
        "US-DE": { name: "Delaware", abbr: "DE", financial_anxiety: { value: 121.4, change: 2.2, rank: 26 }, food_insecurity: { value: 88.5, change: 0.5, rank: 28 }, housing_stress: { value: 145.2, change: 3.2, rank: 17 }, affordability: { value: 118.7, change: 1.5, rank: 22 } },
        "US-FL": { name: "Florida", abbr: "FL", financial_anxiety: { value: 142.1, change: 3.2, rank: 12 }, food_insecurity: { value: 98.4, change: 1.8, rank: 18 }, housing_stress: { value: 185.6, change: 8.5, rank: 3 }, affordability: { value: 158.2, change: 6.1, rank: 3 } },
        "US-GA": { name: "Georgia", abbr: "GA", financial_anxiety: { value: 148.5, change: 2.8, rank: 10 }, food_insecurity: { value: 105.2, change: 1.2, rank: 12 }, housing_stress: { value: 162.4, change: 4.5, rank: 11 }, affordability: { value: 132.8, change: 2.2, rank: 12 } },
        "US-HI": { name: "Hawaii", abbr: "HI", financial_anxiety: { value: 95.4, change: 0.8, rank: 45 }, food_insecurity: { value: 62.1, change: -3.2, rank: 50 }, housing_stress: { value: 198.7, change: 5.8, rank: 1 }, affordability: { value: 175.4, change: 4.8, rank: 1 } },
        "US-ID": { name: "Idaho", abbr: "ID", financial_anxiety: { value: 108.5, change: 1.2, rank: 35 }, food_insecurity: { value: 72.8, change: -1.5, rank: 44 }, housing_stress: { value: 158.2, change: 5.2, rank: 12 }, affordability: { value: 138.5, change: 3.8, rank: 9 } },
        "US-IL": { name: "Illinois", abbr: "IL", financial_anxiety: { value: 128.4, change: 2.5, rank: 22 }, food_insecurity: { value: 92.1, change: 0.2, rank: 25 }, housing_stress: { value: 152.8, change: 3.5, rank: 14 }, affordability: { value: 122.4, change: 1.8, rank: 20 } },
        "US-IN": { name: "Indiana", abbr: "IN", financial_anxiety: { value: 135.2, change: 2.2, rank: 17 }, food_insecurity: { value: 98.7, change: 0.8, rank: 17 }, housing_stress: { value: 138.5, change: 2.1, rank: 22 }, affordability: { value: 112.8, change: 1.2, rank: 28 } },
        "US-IA": { name: "Iowa", abbr: "IA", financial_anxiety: { value: 102.5, change: 0.8, rank: 40 }, food_insecurity: { value: 68.2, change: -2.2, rank: 49 }, housing_stress: { value: 118.4, change: 1.2, rank: 35 }, affordability: { value: 95.2, change: 0.5, rank: 42 } },
        "US-KS": { name: "Kansas", abbr: "KS", financial_anxiety: { value: 115.8, change: 1.5, rank: 30 }, food_insecurity: { value: 82.5, change: -0.8, rank: 34 }, housing_stress: { value: 125.2, change: 1.8, rank: 30 }, affordability: { value: 102.4, change: 0.8, rank: 35 } },
        "US-KY": { name: "Kentucky", abbr: "KY", financial_anxiety: { value: 158.4, change: 3.2, rank: 7 }, food_insecurity: { value: 118.5, change: 1.5, rank: 8 }, housing_stress: { value: 148.2, change: 2.5, rank: 16 }, affordability: { value: 118.5, change: 1.2, rank: 23 } },
        "US-LA": { name: "Louisiana", abbr: "LA", financial_anxiety: { value: 178.4, change: 4.5, rank: 2 }, food_insecurity: { value: 138.9, change: 2.2, rank: 2 }, housing_stress: { value: 195.7, change: 5.8, rank: 2 }, affordability: { value: 149.2, change: 2.8, rank: 4 } },
        "US-ME": { name: "Maine", abbr: "ME", financial_anxiety: { value: 112.4, change: 1.2, rank: 33 }, food_insecurity: { value: 78.5, change: -1.2, rank: 40 }, housing_stress: { value: 132.5, change: 2.2, rank: 25 }, affordability: { value: 108.4, change: 1.5, rank: 30 } },
        "US-MD": { name: "Maryland", abbr: "MD", financial_anxiety: { value: 118.5, change: 1.8, rank: 27 }, food_insecurity: { value: 82.4, change: -0.5, rank: 33 }, housing_stress: { value: 155.8, change: 3.8, rank: 13 }, affordability: { value: 132.5, change: 2.5, rank: 11 } },
        "US-MA": { name: "Massachusetts", abbr: "MA", financial_anxiety: { value: 105.8, change: 1.2, rank: 37 }, food_insecurity: { value: 68.5, change: -2.8, rank: 47 }, housing_stress: { value: 168.4, change: 4.5, rank: 9 }, affordability: { value: 145.2, change: 3.2, rank: 6 } },
        "US-MI": { name: "Michigan", abbr: "MI", financial_anxiety: { value: 138.5, change: 2.8, rank: 15 }, food_insecurity: { value: 102.4, change: 1.2, rank: 14 }, housing_stress: { value: 142.8, change: 2.8, rank: 19 }, affordability: { value: 115.8, change: 1.5, rank: 25 } },
        "US-MN": { name: "Minnesota", abbr: "MN", financial_anxiety: { value: 95.2, change: 0.5, rank: 46 }, food_insecurity: { value: 62.4, change: -3.5, rank: 51 }, housing_stress: { value: 128.5, change: 2.2, rank: 28 }, affordability: { value: 108.2, change: 1.2, rank: 31 } },
        "US-MS": { name: "Mississippi", abbr: "MS", financial_anxiety: { value: 189.2, change: 5.2, rank: 1 }, food_insecurity: { value: 142.1, change: 2.8, rank: 1 }, housing_stress: { value: 201.3, change: 6.5, rank: 1 }, affordability: { value: 156.8, change: 3.2, rank: 3 } },
        "US-MO": { name: "Missouri", abbr: "MO", financial_anxiety: { value: 142.5, change: 2.5, rank: 11 }, food_insecurity: { value: 105.8, change: 0.8, rank: 11 }, housing_stress: { value: 138.2, change: 2.2, rank: 23 }, affordability: { value: 112.5, change: 1.2, rank: 29 } },
        "US-MT": { name: "Montana", abbr: "MT", financial_anxiety: { value: 102.8, change: 0.8, rank: 39 }, food_insecurity: { value: 72.5, change: -1.8, rank: 43 }, housing_stress: { value: 142.5, change: 4.2, rank: 20 }, affordability: { value: 125.8, change: 2.8, rank: 17 } },
        "US-NE": { name: "Nebraska", abbr: "NE", financial_anxiety: { value: 98.5, change: 0.5, rank: 41 }, food_insecurity: { value: 68.8, change: -2.2, rank: 46 }, housing_stress: { value: 118.2, change: 1.5, rank: 36 }, affordability: { value: 95.8, change: 0.8, rank: 41 } },
        "US-NV": { name: "Nevada", abbr: "NV", financial_anxiety: { value: 148.2, change: 3.5, rank: 9 }, food_insecurity: { value: 98.2, change: 1.5, rank: 19 }, housing_stress: { value: 178.5, change: 6.8, rank: 5 }, affordability: { value: 152.4, change: 4.8, rank: 4 } },
        "US-NH": { name: "New Hampshire", abbr: "NH", financial_anxiety: { value: 92.5, change: 0.2, rank: 48 }, food_insecurity: { value: 58.4, change: -3.8, rank: 51 }, housing_stress: { value: 138.4, change: 2.5, rank: 24 }, affordability: { value: 122.8, change: 2.2, rank: 19 } },
        "US-NJ": { name: "New Jersey", abbr: "NJ", financial_anxiety: { value: 122.5, change: 2.2, rank: 25 }, food_insecurity: { value: 85.2, change: 0.2, rank: 30 }, housing_stress: { value: 168.2, change: 4.2, rank: 10 }, affordability: { value: 142.5, change: 3.5, rank: 6 } },
        "US-NM": { name: "New Mexico", abbr: "NM", financial_anxiety: { value: 155.8, change: 3.8, rank: 8 }, food_insecurity: { value: 115.2, change: 1.8, rank: 9 }, housing_stress: { value: 158.4, change: 3.5, rank: 11 }, affordability: { value: 125.4, change: 1.8, rank: 16 } },
        "US-NY": { name: "New York", abbr: "NY", financial_anxiety: { value: 128.5, change: 2.8, rank: 21 }, food_insecurity: { value: 92.5, change: 0.5, rank: 24 }, housing_stress: { value: 172.8, change: 5.2, rank: 7 }, affordability: { value: 148.5, change: 4.2, rank: 5 } },
        "US-NC": { name: "North Carolina", abbr: "NC", financial_anxiety: { value: 138.2, change: 2.5, rank: 16 }, food_insecurity: { value: 98.5, change: 0.8, rank: 16 }, housing_stress: { value: 155.2, change: 3.8, rank: 12 }, affordability: { value: 128.4, change: 2.2, rank: 14 } },
        "US-ND": { name: "North Dakota", abbr: "ND", financial_anxiety: { value: 88.5, change: -0.2, rank: 50 }, food_insecurity: { value: 55.2, change: -4.2, rank: 51 }, housing_stress: { value: 102.4, change: 0.8, rank: 45 }, affordability: { value: 85.2, change: 0.2, rank: 48 } },
        "US-OH": { name: "Ohio", abbr: "OH", financial_anxiety: { value: 142.1, change: 4.1, rank: 12 }, food_insecurity: { value: 95.2, change: -0.5, rank: 18 }, housing_stress: { value: 134.8, change: 2.3, rank: 24 }, affordability: { value: 98.7, change: 1.2, rank: 31 } },
        "US-OK": { name: "Oklahoma", abbr: "OK", financial_anxiety: { value: 158.2, change: 3.5, rank: 6 }, food_insecurity: { value: 118.2, change: 1.2, rank: 7 }, housing_stress: { value: 148.5, change: 2.2, rank: 16 }, affordability: { value: 115.2, change: 1.2, rank: 26 } },
        "US-OR": { name: "Oregon", abbr: "OR", financial_anxiety: { value: 118.2, change: 1.8, rank: 29 }, food_insecurity: { value: 82.5, change: -1.2, rank: 32 }, housing_stress: { value: 168.5, change: 5.2, rank: 8 }, affordability: { value: 142.8, change: 3.5, rank: 7 } },
        "US-PA": { name: "Pennsylvania", abbr: "PA", financial_anxiety: { value: 125.4, change: 2.2, rank: 24 }, food_insecurity: { value: 88.2, change: 0.2, rank: 29 }, housing_stress: { value: 142.5, change: 2.8, rank: 21 }, affordability: { value: 115.4, change: 1.5, rank: 24 } },
        "US-RI": { name: "Rhode Island", abbr: "RI", financial_anxiety: { value: 115.2, change: 1.5, rank: 31 }, food_insecurity: { value: 78.2, change: -1.5, rank: 41 }, housing_stress: { value: 152.4, change: 3.2, rank: 13 }, affordability: { value: 128.5, change: 2.2, rank: 13 } },
        "US-SC": { name: "South Carolina", abbr: "SC", financial_anxiety: { value: 148.5, change: 2.8, rank: 10 }, food_insecurity: { value: 108.4, change: 1.2, rank: 10 }, housing_stress: { value: 158.2, change: 3.8, rank: 11 }, affordability: { value: 125.8, change: 1.8, rank: 15 } },
        "US-SD": { name: "South Dakota", abbr: "SD", financial_anxiety: { value: 92.4, change: 0.2, rank: 49 }, food_insecurity: { value: 58.5, change: -3.5, rank: 50 }, housing_stress: { value: 108.5, change: 1.2, rank: 42 }, affordability: { value: 88.4, change: 0.5, rank: 46 } },
        "US-TN": { name: "Tennessee", abbr: "TN", financial_anxiety: { value: 152.4, change: 3.2, rank: 9 }, food_insecurity: { value: 112.4, change: 1.5, rank: 8 }, housing_stress: { value: 155.8, change: 3.5, rank: 12 }, affordability: { value: 122.5, change: 1.8, rank: 18 } },
        "US-TX": { name: "Texas", abbr: "TX", financial_anxiety: { value: 132.5, change: 2.5, rank: 19 }, food_insecurity: { value: 95.8, change: 0.8, rank: 20 }, housing_stress: { value: 165.2, change: 5.5, rank: 9 }, affordability: { value: 135.8, change: 3.2, rank: 9 } },
        "US-UT": { name: "Utah", abbr: "UT", financial_anxiety: { value: 95.8, change: 0.5, rank: 44 }, food_insecurity: { value: 62.5, change: -2.8, rank: 49 }, housing_stress: { value: 158.4, change: 4.8, rank: 11 }, affordability: { value: 138.2, change: 3.5, rank: 10 } },
        "US-VT": { name: "Vermont", abbr: "VT", financial_anxiety: { value: 98.4, change: 0.8, rank: 43 }, food_insecurity: { value: 68.4, change: -2.5, rank: 48 }, housing_stress: { value: 128.2, change: 2.2, rank: 29 }, affordability: { value: 112.4, change: 1.5, rank: 27 } },
        "US-VA": { name: "Virginia", abbr: "VA", financial_anxiety: { value: 112.5, change: 1.5, rank: 34 }, food_insecurity: { value: 78.5, change: -0.8, rank: 39 }, housing_stress: { value: 155.4, change: 3.5, rank: 13 }, affordability: { value: 128.2, change: 2.2, rank: 14 } },
        "US-WA": { name: "Washington", abbr: "WA", financial_anxiety: { value: 108.2, change: 1.5, rank: 36 }, food_insecurity: { value: 72.4, change: -2.2, rank: 44 }, housing_stress: { value: 172.5, change: 5.5, rank: 6 }, affordability: { value: 148.2, change: 4.2, rank: 5 } },
        "US-WV": { name: "West Virginia", abbr: "WV", financial_anxiety: { value: 171.2, change: 4.2, rank: 3 }, food_insecurity: { value: 131.4, change: 2.2, rank: 3 }, housing_stress: { value: 178.2, change: 4.5, rank: 5 }, affordability: { value: 142.1, change: 2.5, rank: 7 } },
        "US-WI": { name: "Wisconsin", abbr: "WI", financial_anxiety: { value: 108.4, change: 1.2, rank: 35 }, food_insecurity: { value: 75.4, change: -1.5, rank: 41 }, housing_stress: { value: 125.4, change: 1.8, rank: 31 }, affordability: { value: 102.5, change: 1.2, rank: 34 } },
        "US-WY": { name: "Wyoming", abbr: "WY", financial_anxiety: { value: 92.1, change: 0.2, rank: 47 }, food_insecurity: { value: 62.2, change: -3.2, rank: 50 }, housing_stress: { value: 115.2, change: 1.5, rank: 38 }, affordability: { value: 98.4, change: 1.2, rank: 38 } },
        "US-DC": { name: "District of Columbia", abbr: "DC", financial_anxiety: { value: 128.2, change: 2.2, rank: 23 }, food_insecurity: { value: 85.4, change: 0.5, rank: 31 }, housing_stress: { value: 188.5, change: 6.2, rank: 3 }, affordability: { value: 165.2, change: 5.2, rank: 2 } }
    },
    timeseries: {
        national: {
            financial_anxiety: [
                { date: "2025-07-01", value: 108.2 }, { date: "2025-08-01", value: 112.5 }, { date: "2025-09-01", value: 115.8 },
                { date: "2025-10-01", value: 118.4 }, { date: "2025-11-01", value: 123.1 }, { date: "2025-12-01", value: 127.3 }
            ],
            food_insecurity: [
                { date: "2025-07-01", value: 95.2 }, { date: "2025-08-01", value: 92.8 }, { date: "2025-09-01", value: 91.2 },
                { date: "2025-10-01", value: 90.5 }, { date: "2025-11-01", value: 89.8 }, { date: "2025-12-01", value: 89.4 }
            ],
            housing_stress: [
                { date: "2025-07-01", value: 138.5 }, { date: "2025-08-01", value: 142.8 }, { date: "2025-09-01", value: 148.2 },
                { date: "2025-10-01", value: 151.5 }, { date: "2025-11-01", value: 154.2 }, { date: "2025-12-01", value: 156.7 }
            ],
            affordability: [
                { date: "2025-07-01", value: 102.4 }, { date: "2025-08-01", value: 105.2 }, { date: "2025-09-01", value: 107.8 },
                { date: "2025-10-01", value: 109.5 }, { date: "2025-11-01", value: 110.8 }, { date: "2025-12-01", value: 112.1 }
            ]
        }
    }
};

// Make available globally
if (typeof window !== 'undefined') {
    window.DASHBOARD_DATA = DASHBOARD_DATA;
}
