import { DynamicPricingRule } from './backend/src/models/index.js';
async function check() {
    const rules = await DynamicPricingRule.findAll();
    const types = new Set(rules.map(r => r.rule_type));
    console.log('Types:', Array.from(types));
    const withMultiplier = rules.filter(r => r.multiplier !== null);
    console.log('With multiplier:', withMultiplier.length);
}
check().catch(console.error).finally(() => process.exit(0));
