import sys

with open('housing-affordability-stories.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
in_script = False
for line in lines:
    if '<script>' in line and 'const stories = [' in ''.join(lines[lines.index(line):lines.index(line)+2]):
        in_script = True
        new_lines.append(line)
        new_lines.append('  <script src="js/housing-stories.js"></script>\n')
        continue
    
    if in_script:
        if '</script>' in line:
            in_script = False
            # We already added the replacement src script, so we shouldn't add the </script> for the old block
            # Actually, let's just make the logic simpler
            pass
        continue
    
    new_lines.append(line)

# Let's do a more robust approach: Find the explicit lines 2227 to 2570
# Wait, index is better
result = lines[:2226] + ['  <script src="js/housing-stories.js"></script>\n'] + lines[2570:]

# Also add the CSS injection before </head>
for i, line in enumerate(result):
    if '</head>' in line:
        result.insert(i, '  <link rel="stylesheet" href="css/housing-stories.css">\n')
        break

with open('housing-affordability-stories.html', 'w', encoding='utf-8') as f:
    f.writelines(result)

print("Done replacing.")
