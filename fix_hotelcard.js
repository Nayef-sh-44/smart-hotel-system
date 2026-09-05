const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/HotelCard.jsx', 'utf8');

const oldLogicRegex = /const hasFlashDeal = hotel\.flashDeals && hotel\.flashDeals\.length > 0;\s*const deal = hasFlashDeal \? hotel\.flashDeals\[0\] : null;/;

const newLogic = `
  const hasFlashDeal = hotel.flashDeals && hotel.flashDeals.length > 0;
  const deal = hasFlashDeal ? hotel.flashDeals[0] : null;
  
  let dealStatus = 'none';
  if (deal) {
    const now = new Date();
    const start = new Date(deal.start_datetime);
    const end = new Date(deal.end_datetime);
    if (now > end) {
      dealStatus = 'expired';
    } else if (now < start) {
      dealStatus = 'upcoming';
    } else {
      dealStatus = 'active';
    }
  }
`;

code = code.replace(oldLogicRegex, newLogic);

const oldBadgeRegex = /\{\/\* Flash Deal Tag \*\/\}[\s\S]*?<\/div>\s*\)\}/;

const newBadge = `
          {/* Flash Deal Tag */}
          {deal && (
            <div className={"absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs shadow-md border " + 
              (dealStatus === 'active' 
                ? 'bg-rose-600 text-white border-rose-500 animate-pulse' 
                : dealStatus === 'upcoming'
                ? 'bg-amber-500 text-white border-amber-400'
                : 'bg-slate-200/90 dark:bg-slate-800/90 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700')
            }>
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {deal.discount_percentage}% OFF {dealStatus === 'expired' ? '— Expired' : dealStatus === 'upcoming' ? '— Upcoming' : 'Active Deal'}
              </span>
            </div>
          )}
`;

code = code.replace(oldBadgeRegex, newBadge.trim());

fs.writeFileSync('frontend/src/components/HotelCard.jsx', code);
console.log('SUCCESS');
