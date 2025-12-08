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

    // CSV Header
    let csv = 'date,state_code,state_name,financial_anxiety_index,food_insecurity_index,housing_stress_index,affordability_index\n';

    const date = data.meta.generated.split('T')[0];

    // Rows
    for (const [code, stateData] of Object.entries(data.states)) {
        const row = [
            date,
            code,
            `"${stateData.name}"`,
            stateData.financial_anxiety.value.toFixed(2),
            stateData.food_insecurity.value.toFixed(2),
            stateData.housing_stress.value.toFixed(2),
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
