#!/bin/bash
# Test script to demonstrate atomic commit enforcement

echo "Testing atomic commit enforcement..."

# Create some test files
echo "test content 1" > test1.txt
echo "test content 2" > test2.txt

# Add both files (should fail with atomic commit hook)
git add test1.txt test2.txt

echo "Attempting to commit multiple files (should fail):"
git commit -m "Test commit with multiple files"

# Clean up and try with single file
git reset
git add test1.txt

echo "Attempting to commit single file (should succeed):"
git commit -m "Test commit with single file"

# Clean up
git reset --hard HEAD~1
rm -f test1.txt test2.txt

echo "Atomic commit test completed!"
