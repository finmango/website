/**
 * FinMango Research - Generate Exports
 * Creates CSV files for researcher download.
 */

const fs = require('fs');
const path = require('path');

async function main() {
    console.log('Generating Exports...');

    const latestFile = path.join(__dirname, '../data/latest.json');
    if (!fs.existsSync(latestFile)) {
        console.error('latest.json not found');
        return;
    }

    const data = JSON.parse(fs.readFileSync(latestFile, 'utf8'));

    // CSV Header with Metadata
    let csv = '# FinMango Financial Health Barometer Data\n';
    csv += `# Generated: ${data.meta.generated}\n`;
    csv += '# Sources: BLS (Unemployment), Census SAIPE (Poverty), Census ACS (Rent), FRED (Housing Price Index), Google Trends (Volatility Boost)\n';
    csv += '# Note: Indices are composite scores (0-100+). Raw metrics are official government statistics.\n\n';

    // Column Headers
    csv += 'date,state_code,state_name,financial_anxiety_index,unemployment_rate_pct,food_insecurity_index,poverty_rate_pct,housing_stress_index,median_rent_usd,housing_price_change_pct,affordability_index\n';

    const date = data.meta.generated.split('T')[0];

    // Rows
    for (const [code, stateData] of Object.entries(data.states)) {
        const metrics = stateData.metrics || {};
        const row = [
            date,
            code,
            `"${stateData.name}"`,
            stateData.financial_anxiety.value.toFixed(2),
            (metrics.unemployment_rate || 0).toFixed(1),
            stateData.food_insecurity.value.toFixed(2),
            (metrics.poverty_rate || 0).toFixed(1),
            stateData.housing_stress.value.toFixed(2),
            (metrics.median_rent || 0).toFixed(0),
            (metrics.housing_price_change || 0).toFixed(1),
            stateData.affordability.value.toFixed(2)
        ];
        csv += row.join(',') + '\n';
    }

    // Save CSV
    const exportFile = path.join(__dirname, '../data/finmango-financial-health-latest.csv');
    fs.writeFileSync(exportFile, csv);

    console.log(`Export generated: ${exportFile}`);
}

if (require.main === module) {
    main();
}
