import os
import glob

directory = "/Users/mangoscott/FinMango Website - GitHub/website"
files = glob.glob(os.path.join(directory, "**", "*.html"), recursive=True)

for file_path in files:
    try:
        with open(file_path, "r", encoding="utf-8") as file:
            content = file.read()
    except Exception:
        continue
    
    # Replace the RSVP link with Event Details link to the main page
    new_content = content.replace(
        '<a href="barrier-breakers-rsvp.html">RSVP Now →</a>',
        '<a href="barrier-breakers.html">Event Details →</a>'
    )
    
    # I already did this for index.html, so it will just be skipped if it already matches
    if new_content != content:
        with open(file_path, "w", encoding="utf-8") as file:
            file.write(new_content)
        
print("Successfully updated banner link to barrier-breakers.html in all HTML files.")
