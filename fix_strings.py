
import re

with open("backend/src/controllers/managerController.js", "r", encoding="utf-8") as f:
    content = f.read()

content = re.sub(
    r"priceInsights = Your average room price is % below.*?;",
    r"priceInsights = `Your average room price is ${Math.abs(priceDiffPercent)}% below the competitor average for this period. Consider raising prices to capture more revenue if occupancy allows.`;",
    content
)
content = re.sub(
    r"priceInsights = Your average room price is % above.*?;",
    r"priceInsights = `Your average room price is ${priceDiffPercent}% above the competitor average for this period. Ensure your amenities justify the premium.`;",
    content
)
content = re.sub(
    r"priceInsights = Your average room price is aligned.*?;",
    r"priceInsights = `Your average room price is aligned with the competitor average for this period.`;",
    content
)
content = re.sub(
    r"occInsights = Your occupancy is  percentage points below.*?;",
    r"occInsights = `Your occupancy is ${Math.abs(occupancyDiff)} percentage points below the competitor average for this period. Consider running a Flash Deal.`;",
    content
)
content = re.sub(
    r"occInsights = Your occupancy is  percentage points above.*?;",
    r"occInsights = `Your occupancy is ${occupancyDiff} percentage points above the competitor average for this period! Great job capturing demand.`;",
    content
)
content = re.sub(
    r"occInsights = Your occupancy matches.*?;",
    r"occInsights = `Your occupancy matches the competitor average for this period.`;",
    content
)
content = re.sub(
    r"ratInsights = Your hotel rating is below.*?;",
    r"ratInsights = `Your hotel rating is below the competitor average. Focus on improving guest satisfaction.`;",
    content
)
content = re.sub(
    r"ratInsights = Your hotel rating is above.*?;",
    r"ratInsights = `Your hotel rating is above the competitor average. Keep up the excellent service!`;",
    content
)
content = re.sub(
    r"ratInsights = Your hotel rating is on par.*?;",
    r"ratInsights = `Your hotel rating is on par with the competitor average.`;",
    content
)

with open("backend/src/controllers/managerController.js", "w", encoding="utf-8") as f:
    f.write(content)

