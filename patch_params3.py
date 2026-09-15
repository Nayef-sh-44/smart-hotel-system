with open('frontend/src/pages/Hotels.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = "params.target_price = targetPrice;"

if target in content:
    idx = content.find(target)
    # just find the closing brace after it
    brace_idx = content.find("}", idx)
    
    insert_str = "\n        if (guests) params.guests = guests;\n        if (rooms) params.rooms = rooms;\n        if (checkInDate) params.check_in_date = checkInDate;\n        if (checkOutDate) params.check_out_date = checkOutDate;"
    
    new_content = content[:brace_idx+1] + insert_str + content[brace_idx+1:]
    with open('frontend/src/pages/Hotels.jsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Patched params successfully.")
