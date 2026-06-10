import os
import glob
import re

directory = "/Users/mangoscott/FinMango Website - GitHub/website"
files = glob.glob(os.path.join(directory, "**", "*.html"), recursive=True)

new_banner_inner = """
    🌍 <strong>Become a FinMango Ambassador:</strong> Join our global movement!
    <a href="ambassadors.html">Apply Now →</a>
    <button class="announcement-close" id="closeAnnouncement" aria-label="Close announcement">×</button>
  """

pattern_banner = re.compile(
    r'(<div class="announcement-bar" id="announcementBar">)[\s\S]*?(</div>)',
    re.IGNORECASE
)

pattern_key = re.compile(
    r"'barrierBreakersAnnouncementClosedAt_v\d+'",
    re.IGNORECASE
)

updated_count = 0

for file_path in files:
    try:
        with open(file_path, "r", encoding="utf-8") as file:
            content = file.read()
    except Exception:
        continue
    
    if '<div class="announcement-bar" id="announcementBar">' in content:
        new_content = pattern_banner.sub(r'\1' + new_banner_inner + r'\2', content)
        new_content = pattern_key.sub("'ambassadorAnnouncementClosedAt_v1'", new_content)
        
        if new_content != content:
            with open(file_path, "w", encoding="utf-8") as file:
                file.write(new_content)
            updated_count += 1
            print(f"Updated {os.path.relpath(file_path, directory)}")

print(f"Successfully updated banners in {updated_count} files.")
