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

# If destination exists, rename it with .bak prefix
if [ -d "$destination_folder" ]; then
    parent_dir="$(dirname "$destination_folder")"
    base_name="$(basename "$destination_folder")"
    backup_folder="$parent_dir/${base_name}.bak"

    # If backup already exists, remove it (optional behavior)
    if [ -d "$backup_folder" ]; then
        rm -rf "$backup_folder" || {
            echo "Error: Could not remove existing backup folder."
            exit 1
        }
    fi

    mv "$destination_folder" "$backup_folder" || {
        echo "Error: Could not rename existing destination folder."
        exit 1
    }

    echo "Previous destination renamed to $backup_folder"
fi

# Create destination folder
mkdir -p "$destination_folder" || {
    echo "Error: Could not create destination folder."
    exit 1
}

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
