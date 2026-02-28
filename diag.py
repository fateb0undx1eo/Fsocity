import re, sys

path = r"c:\Users\SMART\Downloads\iot-dashboard\frontend\src\pages\LandingPage.jsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

print(f"File loaded. Size: {len(content)} chars")

# Check if Our Mission section exists
if "OUR AIM" in content:
    print("Found OUR AIM section")
elif "Our Mission" in content:
    print("Found Our Mission heading")
else:
    print("WARNING: Neither OUR AIM nor Our Mission found")

# Check for insertion marker
if "const footerTitle =" in content:
    print("Found insertion marker: const footerTitle =")
else:
    print("WARNING: insertion marker not found")

# Find line numbers for the Our Mission section
lines = content.split("\n")
for i, line in enumerate(lines, 1):
    if "OUR AIM" in line or "Our Mission" in line or "footerTitle" in line:
        print(f"Line {i}: {line[:80]}")
