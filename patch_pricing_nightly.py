with open('backend/src/services/pricingService.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove the upfront global activeDeal logic
old_global_deal_logic = '''  const now = new Date();
  let activeDeal = null;
  if (flashDeals && flashDeals.length > 0) {
    for (const deal of flashDeals) {
      if (deal.active_status) {
        const start = new Date(deal.start_datetime);
        const end = new Date(deal.end_datetime);
        if (now >= start && now <= end) {
          activeDeal = deal;
          break;
        }
      }
    }
  }'''

new_global_deal_logic = '''  let activeDeal = null; // Track if any deal was applied to at least one night'''

content = content.replace(old_global_deal_logic, new_global_deal_logic)

# 2. Add the per-night activeDeal logic inside the while loop
old_nightly_deal_logic = '''    if (activeDeal) {
      if (activeDeal.discount_type === 'percentage') {
        nightlyFinal -= nightlyFinal * (Number(activeDeal.discount_percentage) / 100);
      } else {
        nightlyFinal -= (Number(activeDeal.discount_value) * Number(numRooms));
      }
      nightlyFinal = Math.max(0, nightlyFinal);
    }'''

new_nightly_deal_logic = '''    let nightDeal = null;
    if (flashDeals && flashDeals.length > 0) {
      for (const deal of flashDeals) {
        if (deal.active_status) {
          const start = new Date(deal.start_datetime);
          const end = new Date(deal.end_datetime);
          if (currentDate >= start && currentDate <= end) {
            nightDeal = deal;
            if (!activeDeal) activeDeal = deal;
            break;
          }
        }
      }
    }

    if (nightDeal) {
      if (nightDeal.discount_type === 'percentage') {
        nightlyFinal -= nightlyFinal * (Number(nightDeal.discount_percentage) / 100);
      } else {
        nightlyFinal -= (Number(nightDeal.discount_value) * Number(numRooms));
      }
      nightlyFinal = Math.max(0, nightlyFinal);
    }'''

content = content.replace(old_nightly_deal_logic, new_nightly_deal_logic)

with open('backend/src/services/pricingService.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("pricingService patched.")
