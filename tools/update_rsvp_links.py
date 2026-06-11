import os
import glob
import re

directory = "/Users/mangoscott/FinMango Website - GitHub/website"
files = glob.glob(os.path.join(directory, "**", "*.html"), recursive=True)

for file_path in files:
    try:
        with open(file_path, "r", encoding="utf-8") as file:
            content = file.read()
    except Exception:
        continue
    
    # Replace the link in the announcement bar to point directly to rsvp where it says "RSVP Now ->"
    # Previously I set it to href="barrier-breakers.html">RSVP Now →</a>
    new_content = content.replace('<a href="barrier-breakers.html">RSVP Now →</a>', '<a href="barrier-breakers-rsvp.html">RSVP Now →</a>')
    
    # Also just check if I can inject the announcement banner script/styles if it doesn't exist?
    # No, wait, if there are pages without the banner completely, I should add it?
    
    if new_content != content:
        with open(file_path, "w", encoding="utf-8") as file:
            file.write(new_content)
        
print("Successfully updated RSVP link in all HTML files.")
