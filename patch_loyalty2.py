with open('frontend/src/pages/Loyalty.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = "const handleRedeem = async (rewardId, hotelId) => {"
end_marker = "  if (!user) {"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    new_handle_redeem = '''const handleRedeem = (rewardId, hotelId) => {
    navigate(/hotel/?reward_id=);
  };

'''
    new_content = content[:start_idx] + new_handle_redeem + content[end_idx:]
    with open('frontend/src/pages/Loyalty.jsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Patched handleRedeem successfully.")
else:
    print("Could not find markers.")
