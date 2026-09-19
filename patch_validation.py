import re

with open("frontend/src/components/BenchmarkingView.jsx", "r", encoding="utf-8") as f:
    content = f.read()

old_logic = """    if (!s || !e) {
        toast.error('Please select both start and end dates.');
        return;
    }
    setLoading(true);"""

new_logic = """    if (!s || !e) {
        toast.error('Please select both start and end dates.');
        return;
    }
    if (new Date(e) <= new Date(s)) {
        toast.error('End date must be after start date.');
        return;
    }
    setLoading(true);"""

content = content.replace(old_logic, new_logic)

with open("frontend/src/components/BenchmarkingView.jsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Validation added.")
