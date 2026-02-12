#!/usr/bin/env bash

# Check if correct number of arguments are provided
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <source_folder> <destination_folder>"
    exit 1
fi

# Read arguments
source_folder="$1"
destination_folder="$2"

# File rename settings
old_name="index.html"
new_name="TurbOmicsApp.html"

# Check if source folder exists
if [ ! -d "$source_folder" ]; then
    echo "Error: Source folder does not exist: $source_folder"
    exit 1
fi

# Create destination folder if it does not exist
if [ ! -d "$destination_folder" ]; then
    mkdir -p "$destination_folder" || {
        echo "Error: Could not create destination folder."
        exit 1
    }
fi

# Copy contents
cp -r "$source_folder"/* "$destination_folder"/ || {
    echo "Error: Copy failed."
    exit 1
}

# Rename file if it exists
if [ -f "$destination_folder/$old_name" ]; then
    mv "$destination_folder/$old_name" "$destination_folder/$new_name"
    echo "Renamed $old_name to $new_name"
else
    echo "Warning: $old_name not found in destination."
fi

echo "Copy and rename completed successfully."
