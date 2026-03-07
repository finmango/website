import os
import glob
import re

directory = "/Users/mangoscott/FinMango Website - GitHub/website"
files = glob.glob(os.path.join(directory, "**", "*.html"), recursive=True)
files.extend(glob.glob(os.path.join(directory, "**", "*.js"), recursive=True))

for file_path in files:
    try:
        with open(file_path, "r", encoding="utf-8") as file:
            content = file.read()
    except Exception:
        continue
    
    # Replace v4 key with v5 key to reset banner cache
    new_content = content.replace("barrierBreakersAnnouncementClosedAt_v4", "barrierBreakersAnnouncementClosedAt_v5")
    
    if new_content != content:
        with open(file_path, "w", encoding="utf-8") as file:
            file.write(new_content)
        
print("Successfully updated banner storage key to _v5.")
