#!/bin/bash

# FinMango Website Template Updater
# Helps manage code duplication across HTML files

set -e  # Exit on error

echo "🥭 FinMango Template Updater"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}!${NC} $1"
}

# Count HTML files
HTML_COUNT=$(find . -maxdepth 1 -name "*.html" | wc -l)
echo "Found $HTML_COUNT HTML files in current directory"
echo ""

# Main menu
echo "What would you like to update?"
echo "1) Navigation (desktop + mobile)"
echo "2) Footer"
echo "3) CSS styles (full <style> block)"
echo "4) Analytics code"
echo "5) Custom find & replace"
echo "6) Exit"
echo ""
read -p "Enter choice [1-6]: " choice

case $choice in
    1)
        echo ""
        echo "Updating Navigation..."
        echo "⚠️  This will update both desktop and mobile navigation"
        echo ""
        read -p "Have you updated navigation in index.html? (y/n): " confirm

        if [ "$confirm" = "y" ]; then
            # Extract navigation from index.html
            # This is a simplified example - in practice, you'd need more complex extraction
            print_warning "Feature not yet implemented - use VS Code Find & Replace"
            print_warning "Instructions:"
            echo "  1. Open VS Code"
            echo "  2. Press Cmd+Shift+H (Mac) or Ctrl+Shift+H (Windows)"
            echo "  3. Find: <nav id=\"nav\"> through </nav>"
            echo "  4. Replace with updated nav from index.html"
            echo "  5. Replace in all *.html files"
        else
            print_error "Please update navigation in index.html first"
        fi
        ;;

    2)
        echo ""
        echo "Updating Footer..."
        read -p "Have you updated footer in index.html? (y/n): " confirm

        if [ "$confirm" = "y" ]; then
            print_warning "Feature not yet implemented - use VS Code Find & Replace"
            print_warning "Instructions:"
            echo "  1. Open VS Code"
            echo "  2. Press Cmd+Shift+H (Mac) or Ctrl+Shift+H (Windows)"
            echo "  3. Find: <footer> through </footer>"
            echo "  4. Replace with updated footer from index.html"
            echo "  5. Replace in all *.html files"
        else
            print_error "Please update footer in index.html first"
        fi
        ;;

    3)
        echo ""
        echo "Updating CSS Styles..."
        read -p "Have you updated styles in index.html? (y/n): " confirm

        if [ "$confirm" = "y" ]; then
            print_warning "Feature not yet implemented - use VS Code Find & Replace"
            print_warning "Instructions:"
            echo "  1. Open VS Code"
            echo "  2. Press Cmd+Shift+H (Mac) or Ctrl+Shift+H (Windows)"
            echo "  3. Find: <style> through </style>"
            echo "  4. Replace with updated styles from index.html"
            echo "  5. Replace in all *.html files"
        else
            print_error "Please update styles in index.html first"
        fi
        ;;

    4)
        echo ""
        echo "Updating Analytics Code..."
        read -p "Have you updated analytics in index.html? (y/n): " confirm

        if [ "$confirm" = "y" ]; then
            print_warning "Feature not yet implemented - use VS Code Find & Replace"
        else
            print_error "Please update analytics in index.html first"
        fi
        ;;

    5)
        echo ""
        echo "Custom Find & Replace"
        echo ""
        read -p "Enter text to find: " find_text
        read -p "Enter replacement text: " replace_text
        read -p "Preview in test file first? (y/n): " preview

        if [ "$preview" = "y" ]; then
            # Create a test file
            cp index.html index.test.html
            sed -i.bak "s|$find_text|$replace_text|g" index.test.html
            print_success "Test file created: index.test.html"
            print_warning "Review the changes, then delete if OK: rm index.test.html index.test.html.bak"
        else
            read -p "Apply to all HTML files? This cannot be undone easily. (yes/no): " final_confirm

            if [ "$final_confirm" = "yes" ]; then
                # Backup first
                mkdir -p .backups
                cp *.html .backups/
                print_success "Backup created in .backups/"

                # Apply replacement
                sed -i.bak "s|$find_text|$replace_text|g" *.html
                print_success "Replacement applied to all HTML files"
                print_warning "Original files backed up with .bak extension"
            else
                print_error "Operation cancelled"
            fi
        fi
        ;;

    6)
        echo "Exiting..."
        exit 0
        ;;

    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "=========================================="
echo "For complex updates, use VS Code Find & Replace:"
echo "  Cmd/Ctrl + Shift + H"
echo "  Files to include: *.html"
echo "=========================================="
