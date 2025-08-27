#!/usr/bin/env python3
"""
Script to analyze and update Stellaris tech tree JSON files for Phoenix 4.0.22
"""

import json
import os
from pathlib import Path

def load_json_file(filepath):
    """Load and pretty-print a JSON file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return data
    except Exception as e:
        print(f"Error loading {filepath}: {e}")
        return None

def save_json_file(filepath, data):
    """Save data to JSON file with proper formatting"""
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"Saved {filepath}")
        return True
    except Exception as e:
        print(f"Error saving {filepath}: {e}")
        return False

def find_tech_by_name(data, search_term):
    """Recursively search for technologies containing search term"""
    results = []
    
    def search_recursive(node, path=""):
        if isinstance(node, dict):
            if 'name' in node and search_term.lower() in node['name'].lower():
                results.append({
                    'path': path,
                    'key': node.get('key', 'N/A'),
                    'name': node['name'],
                    'description': node.get('description', 'N/A')[:100] + '...'
                })
            if 'children' in node:
                for i, child in enumerate(node['children']):
                    search_recursive(child, f"{path}/children[{i}]")
        elif isinstance(node, list):
            for i, item in enumerate(node):
                search_recursive(item, f"{path}[{i}]")
    
    search_recursive(data)
    return results

def main():
    orion_dir = Path("orion-3.6.0")
    phoenix_dir = Path("phoenix-4.0.22")
    
    # Analyze Orion 3.6.0 files
    files_to_analyze = ["engineering.json", "physics.json", "society.json"]
    
    for filename in files_to_analyze:
        orion_file = orion_dir / filename
        phoenix_file = phoenix_dir / filename
        
        print(f"\n=== Analyzing {filename} ===")
        
        # Load Orion data
        orion_data = load_json_file(orion_file)
        if not orion_data:
            continue
            
        # Search for relevant technologies
        search_terms = ["genetic", "population", "trade", "workforce", "biological", "zone", "district"]
        
        for term in search_terms:
            results = find_tech_by_name(orion_data, term)
            if results:
                print(f"\nTechnologies containing '{term}':")
                for result in results:
                    print(f"  - {result['key']}: {result['name']}")

if __name__ == "__main__":
    main()
