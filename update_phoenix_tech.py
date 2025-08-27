#!/usr/bin/env python3
"""
Script to update Stellaris tech tree for Phoenix 4.0.22
"""

import json
import os
from pathlib import Path

def load_json_file(filepath):
    """Load JSON file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json_file(filepath, data):
    """Save data to JSON file"""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Updated {filepath}")

def add_new_technologies():
    """Add new Phoenix 4.0.22 technologies"""
    
    # New Phoenix 4.0.22 technologies
    new_society_techs = [
        {
            "key": "tech_genetic_ascension_cloning",
            "name": "Genetic Ascension: Cloning",
            "description": "Advanced cloning techniques allow for the replication of perfect genetic specimens, providing unprecedented control over species evolution.",
            "area": "society",
            "base_factor": 1.0,
            "base_weight": 75,
            "category": "Biology",
            "cost": 8000,
            "feature_unlocks": [
                "<b>Policy</b>: Genetic Modification",
                "<b>Building</b>: Clone Vats",
                "<b>Species Trait</b>: Cloned Species"
            ],
            "is_dangerous": False,
            "is_rare": True,
            "is_start_tech": False,
            "prerequisites": ["tech_morphogenetic_field_mastery"],
            "tier": 4,
            "prerequisites_names": ["Morphogenetic Field Mastery"],
            "weight_modifiers": [],
            "potential": [],
            "children": []
        },
        {
            "key": "tech_genetic_ascension_purity",
            "name": "Genetic Ascension: Purity",
            "description": "Perfect genetic refinement eliminates all flaws and enhances the natural abilities of a species to their theoretical maximum.",
            "area": "society",
            "base_factor": 1.0,
            "base_weight": 75,
            "category": "Biology",
            "cost": 8000,
            "feature_unlocks": [
                "<b>Policy</b>: Genetic Purity",
                "<b>Species Trait</b>: Genetically Pure",
                "<b>Building</b>: Genetic Purification Centers"
            ],
            "is_dangerous": False,
            "is_rare": True,
            "is_start_tech": False,
            "prerequisites": ["tech_morphogenetic_field_mastery"],
            "tier": 4,
            "prerequisites_names": ["Morphogenetic Field Mastery"],
            "weight_modifiers": [],
            "potential": [],
            "children": []
        },
        {
            "key": "tech_genetic_ascension_mutation",
            "name": "Genetic Ascension: Mutation",
            "description": "Controlled genetic mutation allows for the development of entirely new biological capabilities beyond natural limitations.",
            "area": "society",
            "base_factor": 1.0,
            "base_weight": 75,
            "category": "Biology",
            "cost": 8000,
            "feature_unlocks": [
                "<b>Policy</b>: Directed Evolution",
                "<b>Species Trait</b>: Mutant Adaptability",
                "<b>Building</b>: Mutation Laboratories"
            ],
            "is_dangerous": False,
            "is_rare": True,
            "is_start_tech": False,
            "prerequisites": ["tech_morphogenetic_field_mastery"],
            "tier": 4,
            "prerequisites_names": ["Morphogenetic Field Mastery"],
            "weight_modifiers": [],
            "potential": [],
            "children": []
        },
        {
            "key": "tech_workforce_optimization",
            "name": "Workforce Optimization",
            "description": "Advanced population management techniques optimize workforce allocation and productivity across all sectors of society.",
            "area": "society",
            "base_factor": 1.0,
            "base_weight": 100,
            "category": "Statecraft",
            "cost": 2000,
            "feature_unlocks": [
                "<b>System</b>: Advanced Workforce Management",
                "<b>Building</b>: Workforce Coordination Centers"
            ],
            "is_dangerous": False,
            "is_rare": False,
            "is_start_tech": False,
            "prerequisites": ["tech_colonial_centralization"],
            "tier": 2,
            "prerequisites_names": ["Colonial Centralization"],
            "weight_modifiers": [],
            "potential": [],
            "children": []
        },
        {
            "key": "tech_empire_focus_coordination",
            "name": "Empire Focus Coordination",
            "description": "Centralized planning systems allow for empire-wide coordination of research, production, and expansion priorities.",
            "area": "society",
            "base_factor": 1.0,
            "base_weight": 85,
            "category": "Statecraft",
            "cost": 3000,
            "feature_unlocks": [
                "<b>System</b>: Empire Focus Tasks",
                "<b>System</b>: Empire Timeline",
                "<b>Building</b>: Coordination Nexus"
            ],
            "is_dangerous": False,
            "is_rare": False,
            "is_start_tech": False,
            "prerequisites": ["tech_workforce_optimization"],
            "tier": 3,
            "prerequisites_names": ["Workforce Optimization"],
            "weight_modifiers": [],
            "potential": [],
            "children": []
        }
    ]
    
    new_engineering_techs = [
        {
            "key": "tech_biological_starships",
            "name": "Biological Starships",
            "description": "Living starships that grow and evolve alongside your empire, adapting to threats and becoming more powerful over time.",
            "area": "engineering",
            "base_factor": 1.0,
            "base_weight": 50,
            "category": "Voidcraft",
            "cost": 12000,
            "feature_unlocks": [
                "<b>Ship Type</b>: Biological Corvette",
                "<b>Ship Type</b>: Biological Destroyer",
                "<b>System</b>: Ship Evolution"
            ],
            "is_dangerous": False,
            "is_rare": True,
            "is_start_tech": False,
            "prerequisites": ["tech_starbase_4"],
            "tier": 4,
            "prerequisites_names": ["Starfortress"],
            "weight_modifiers": [],
            "potential": [],
            "children": []
        },
        {
            "key": "tech_zone_development",
            "name": "Zone Development",
            "description": "Advanced planetary development techniques allow for specialized zones that modify district outputs and capabilities.",
            "area": "engineering",
            "base_factor": 1.0,
            "base_weight": 90,
            "category": "Industry",
            "cost": 1500,
            "feature_unlocks": [
                "<b>System</b>: Planetary Zones",
                "<b>Building</b>: Zone Coordinators"
            ],
            "is_dangerous": False,
            "is_rare": False,
            "is_start_tech": False,
            "prerequisites": ["tech_housing_1"],
            "tier": 2,
            "prerequisites_names": ["Powered Housing"],
            "weight_modifiers": [],
            "potential": [],
            "children": []
        },
        {
            "key": "tech_deep_space_citadel",
            "name": "Deep Space Citadel",
            "description": "Massive defensive megastructures that can be built at hyperlane choke points to control galactic traffic and provide unassailable defensive positions.",
            "area": "engineering",
            "base_factor": 1.0,
            "base_weight": 40,
            "category": "Voidcraft",
            "cost": 20000,
            "feature_unlocks": [
                "<b>Megastructure</b>: Deep Space Citadel",
                "<b>System</b>: Hyperlane Control"
            ],
            "is_dangerous": False,
            "is_rare": True,
            "is_start_tech": False,
            "prerequisites": ["tech_mega_engineering"],
            "tier": 5,
            "prerequisites_names": ["Mega-Engineering"],
            "weight_modifiers": [],
            "potential": [],
            "children": []
        }
    ]
    
    new_physics_techs = [
        {
            "key": "tech_trade_unification",
            "name": "Trade Unification",
            "description": "Advanced economic modeling unifies trade into a single standardized resource system, eliminating complex trade route management.",
            "area": "physics",
            "base_factor": 1.0,
            "base_weight": 100,
            "category": "Computing",
            "cost": 1200,
            "feature_unlocks": [
                "<b>System</b>: Unified Trade Resource",
                "<b>System</b>: Simplified Market Economy"
            ],
            "is_dangerous": False,
            "is_rare": False,
            "is_start_tech": False,
            "prerequisites": ["tech_administrative_ai"],
            "tier": 2,
            "prerequisites_names": ["Administrative AI"],
            "weight_modifiers": [],
            "potential": [],
            "children": []
        }
    ]
    
    return new_society_techs, new_engineering_techs, new_physics_techs

def insert_tech_into_tree(data, new_tech, parent_key=None):
    """Insert a new technology into the tech tree"""
    def find_and_insert(node, target_key, tech):
        if isinstance(node, dict):
            if node.get('key') == target_key:
                if 'children' not in node:
                    node['children'] = []
                node['children'].append(tech)
                return True
            elif 'children' in node:
                for child in node['children']:
                    if find_and_insert(child, target_key, tech):
                        return True
        elif isinstance(node, list):
            for item in node:
                if find_and_insert(item, target_key, tech):
                    return True
        return False
    
    if parent_key:
        return find_and_insert(data, parent_key, new_tech)
    else:
        # Add to root level
        if 'children' in data and len(data['children']) > 0:
            root_area = data['children'][0]
            if 'children' not in root_area:
                root_area['children'] = []
            root_area['children'].append(new_tech)
            return True
    return False

def update_tech_files():
    """Update all tech files with Phoenix 4.0.22 technologies"""
    new_society_techs, new_engineering_techs, new_physics_techs = add_new_technologies()
    
    # Update society.json
    society_data = load_json_file("phoenix-4.0.22/society.json")
    for tech in new_society_techs:
        if tech['key'] in ['tech_genetic_ascension_cloning', 'tech_genetic_ascension_purity', 'tech_genetic_ascension_mutation']:
            insert_tech_into_tree(society_data, tech, 'tech_morphogenetic_field_mastery')
        else:
            insert_tech_into_tree(society_data, tech)
    save_json_file("phoenix-4.0.22/society.json", society_data)
    
    # Update engineering.json
    engineering_data = load_json_file("phoenix-4.0.22/engineering.json")
    for tech in new_engineering_techs:
        insert_tech_into_tree(engineering_data, tech)
    save_json_file("phoenix-4.0.22/engineering.json", engineering_data)
    
    # Update physics.json
    physics_data = load_json_file("phoenix-4.0.22/physics.json")
    for tech in new_physics_techs:
        insert_tech_into_tree(physics_data, tech)
    save_json_file("phoenix-4.0.22/physics.json", physics_data)

if __name__ == "__main__":
    print("Updating Stellaris tech tree for Phoenix 4.0.22...")
    update_tech_files()
    print("Update complete!")
