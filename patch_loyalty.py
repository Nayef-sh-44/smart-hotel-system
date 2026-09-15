import re

with open('frontend/src/pages/Loyalty.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace handleRedeem to navigate
old_handle_redeem = '''  const handleRedeem = async (rewardId, hotelId) => {
    try {
      const res = await loyaltyService.redeemReward(rewardId, hotelId);
      if (res.success) {
        toast.success(res.message || 'Reward redeemed successfully!');
        // Refresh both balances and hotel details
        fetchBalances();
        const detailsRes = await loyaltyService.getLoyaltyForHotel(hotelId);
        if (detailsRes.success) {
          setHotelDetails(prev => ({ ...prev, [hotelId]: detailsRes.data }));
        }
      }
    } catch (error) {
      toast.error(error.error?.message || 'Failed to redeem reward.');
    }
  };'''

new_handle_redeem = '''  const handleRedeem = (rewardId, hotelId) => {
    navigate(/hotel/?reward_id=);
  };'''

if old_handle_redeem in content:
    content = content.replace(old_handle_redeem, new_handle_redeem)
    with open('frontend/src/pages/Loyalty.jsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Replaced handleRedeem successfully.")
else:
    print("Failed to replace handleRedeem. Trying regex or line by line search.")
