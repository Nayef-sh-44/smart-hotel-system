import { DynamicPricingRule } from './backend/src/models/index.js';

async function check() {
    const rules = await DynamicPricingRule.findAll();
    const different = rules.filter(r => r.season_factor !== 1 || r.weekend_factor !== 1 || r.occupancy_factor !== 1 || r.rule_type === 'season');
    console.log('Rules with non-1 factors or season type:', different.length);
    if (different.length > 0) {
        console.log(different.map(r => r.toJSON()).slice(0, 5));
    } else {
        const any = rules.filter(r => r.multiplier !== null);
        console.log('Any with multiplier?', any.length);
    }
}
check().catch(console.error).finally(() => process.exit(0));
