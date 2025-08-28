'use strict';

// Global variables for prerequisite functionality
var activePrerequisiteTab = null;
var techDataCache = {};
var prerequisiteOverlay = null;

// Load all tech data into cache for fast lookup
function loadTechDataCache() {
    let loadPromises = [];
    
    research.forEach(area => {
        if (area !== 'anomaly') {
            let promise = $.getJSON(area + '.json').done(function(jsonData) {
                techDataCache[area] = jsonData;
            });
            loadPromises.push(promise);
        }
    });
    
    let anomalyPromise = $.getJSON('anomalies.json').done(function(jsonData) {
        techDataCache['anomaly'] = jsonData;
    });
    loadPromises.push(anomalyPromise);
    
    return Promise.all(loadPromises);
}

// Find a tech by key across all areas
function findTechByKey(techKey) {
    for (let area in techDataCache) {
        if (area === 'anomaly') {
            // Anomalies are stored as a flat array
            for (let tech of techDataCache[area]) {
                if (tech.key === techKey) {
                    return { tech: tech, area: area };
                }
            }
        } else {
            // Other areas are hierarchical trees
            let tech = findTechInTree(techDataCache[area], techKey);
            if (tech) {
                return { tech: tech, area: area };
            }
        }
    }
    return null;
}

// Recursively search through tech tree structure
function findTechInTree(node, techKey) {
    if (node.key === techKey) {
        return node;
    }
    if (node.children) {
        for (let child of node.children) {
            let result = findTechInTree(child, techKey);
            if (result) return result;
        }
    }
    return null;
}

// Extract all prerequisites for a given tech (recursive)
function extractAllPrerequisites(techKey, visited = new Set()) {
    if (visited.has(techKey)) {
        return []; // Avoid infinite loops
    }
    visited.add(techKey);

    let techData = findTechByKey(techKey);
    if (!techData) {
        return [];
    }

    let prerequisites = [];
    let tech = techData.tech;

    if (tech.prerequisites && tech.prerequisites.length > 0) {
        for (let prereqKey of tech.prerequisites) {
            // Add the direct prerequisite
            let prereqData = findTechByKey(prereqKey);
            if (prereqData) {
                prerequisites.push({
                    key: prereqKey,
                    tech: prereqData.tech,
                    area: prereqData.area
                });

                // Recursively get prerequisites of prerequisites
                let subPrereqs = extractAllPrerequisites(prereqKey, visited);
                prerequisites = prerequisites.concat(subPrereqs);
            }
        }
    }

    // Deduplicate prerequisites by key
    let uniquePrereqs = [];
    let seenKeys = new Set();
    
    for (let prereq of prerequisites) {
        if (!seenKeys.has(prereq.key)) {
            seenKeys.add(prereq.key);
            uniquePrereqs.push(prereq);
        }
    }

    return uniquePrereqs;
}

// Find all techs that depend on the given tech (following techs)
function extractAllFollowing(techKey, visited = new Set()) {
    if (visited.has(techKey)) {
        return []; // Avoid infinite loops
    }
    visited.add(techKey);

    let following = [];
    
    // Search through all areas for techs that have this tech as a prerequisite
    for (let area in techDataCache) {
        if (area === 'anomaly') {
            // Anomalies are stored as a flat array
            for (let tech of techDataCache[area]) {
                if (tech.prerequisites && tech.prerequisites.includes(techKey)) {
                    let techData = findTechByKey(tech.key);
                    if (techData) {
                        following.push({
                            key: tech.key,
                            tech: techData.tech,
                            area: techData.area
                        });
                        
                        // Recursively get techs that depend on this tech
                        let subFollowing = extractAllFollowing(tech.key, visited);
                        following = following.concat(subFollowing);
                    }
                }
            }
        } else {
            // Other areas are hierarchical trees
            let areaFollowing = findFollowingInTree(techDataCache[area], techKey, visited);
            following = following.concat(areaFollowing);
        }
    }

    // Deduplicate following techs by key
    let uniqueFollowing = [];
    let seenKeys = new Set();
    
    for (let followingTech of following) {
        if (!seenKeys.has(followingTech.key)) {
            seenKeys.add(followingTech.key);
            uniqueFollowing.push(followingTech);
        }
    }

    return uniqueFollowing;
}

// Recursively search through tech tree structure for following techs
function findFollowingInTree(node, targetTechKey, visited) {
    let following = [];
    
    // Check current node
    if (node.prerequisites && node.prerequisites.includes(targetTechKey)) {
        let techData = findTechByKey(node.key);
        if (techData && !visited.has(node.key)) {
            following.push({
                key: node.key,
                tech: techData.tech,
                area: techData.area
            });
            
            // Recursively get techs that depend on this tech
            let subFollowing = extractAllFollowing(node.key, visited);
            following = following.concat(subFollowing);
        }
    }
    
    // Check children
    if (node.children) {
        for (let child of node.children) {
            let childFollowing = findFollowingInTree(child, targetTechKey, visited);
            following = following.concat(childFollowing);
        }
    }
    
    return following;
}

// Select all prerequisites for a tech
function selectAllPrerequisites(techKey) {
    console.log('Selecting all prerequisites for:', techKey);
    
    let prerequisites = extractAllPrerequisites(techKey);
    console.log('Found', prerequisites.length, 'prerequisites');
    
    let selectedCount = 0;
    
    // Select each prerequisite
    prerequisites.forEach(prereq => {
        let techElement = $('#' + prereq.key);
        if (techElement.length > 0) {
            let isActive = techElement.find('.node-status').hasClass('active');
            if (!isActive) {
                if (prereq.area !== 'anomaly') {
                    updateResearch(prereq.area, prereq.key, true);
                } else {
                    // Handle anomaly techs
                    techElement.find('.node-status').addClass('active');
                    techElement.addClass('active');
                }
                selectedCount++;
            }
        }
    });
    
    console.log('Selected', selectedCount, 'prerequisite techs');
    return selectedCount;
}

// Select all following techs for a tech
function selectAllFollowing(techKey) {
    console.log('Selecting all following techs for:', techKey);
    
    let following = extractAllFollowing(techKey);
    console.log('Found', following.length, 'following techs');
    
    let selectedCount = 0;
    
    // First, make sure the current tech is selected
    let currentTech = $('#' + techKey);
    if (currentTech.length > 0) {
        let isActive = currentTech.find('.node-status').hasClass('active');
        if (!isActive) {
            let techData = findTechByKey(techKey);
            if (techData) {
                if (techData.area !== 'anomaly') {
                    updateResearch(techData.area, techKey, true);
                } else {
                    currentTech.find('.node-status').addClass('active');
                    currentTech.addClass('active');
                }
                selectedCount++;
            }
        }
    }
    
    // Select each following tech
    following.forEach(followingTech => {
        let techElement = $('#' + followingTech.key);
        if (techElement.length > 0) {
            let isActive = techElement.find('.node-status').hasClass('active');
            if (!isActive) {
                // Check if all prerequisites are met for this tech
                if (canActivateTech(followingTech.key)) {
                    if (followingTech.area !== 'anomaly') {
                        updateResearch(followingTech.area, followingTech.key, true);
                    } else {
                        techElement.find('.node-status').addClass('active');
                        techElement.addClass('active');
                    }
                    selectedCount++;
                } else {
                    console.log('Cannot activate tech', followingTech.key, '- prerequisites not met');
                }
            }
        }
    });
    
    console.log('Selected', selectedCount, 'following techs');
    return selectedCount;
}

// Check if a tech can be activated (all prerequisites are met)
function canActivateTech(techKey) {
    let techData = findTechByKey(techKey);
    if (!techData) return false;
    
    if (!techData.tech.prerequisites || techData.tech.prerequisites.length === 0) {
        return true; // No prerequisites
    }
    
    // Check if all prerequisites are active
    for (let prereqKey of techData.tech.prerequisites) {
        let prereqElement = $('#' + prereqKey);
        if (prereqElement.length === 0 || !prereqElement.find('.node-status').hasClass('active')) {
            return false;
        }
    }
    
    return true;
}

// Select full chain (prerequisites and following)
function selectFullChain(techKey) {
    console.log('Selecting full tech chain for:', techKey);
    
    let prereqCount = selectAllPrerequisites(techKey);
    
    // Small delay to ensure prerequisites are processed
    setTimeout(() => {
        let followingCount = selectAllFollowing(techKey);
        
        let total = prereqCount + followingCount;
        if (total > 0) {
            alert(`Selected ${total} technologies in the chain:\n- ${prereqCount} prerequisites\n- ${followingCount} following techs`);
        } else {
            alert('No additional technologies were selected. All relevant techs may already be active.');
        }
    }, 100);
}

// Create the prerequisite overlay content
function createPrerequisiteOverlay() {
    if (!prerequisiteOverlay) {
        prerequisiteOverlay = document.createElement('div');
        prerequisiteOverlay.className = 'prerequisite-overlay';
        prerequisiteOverlay.id = 'prerequisite-overlay';
        document.body.appendChild(prerequisiteOverlay);
    }
    return prerequisiteOverlay;
}

// Create and show prerequisite tab and overlay
function createPrerequisiteTab(techKey) {
    let techData = findTechByKey(techKey);
    if (!techData) {
        console.error('Tech not found:', techKey);
        return;
    }

    let tech = techData.tech;
    let prerequisites = extractAllPrerequisites(techKey);
    
    console.log(`Found ${prerequisites.length} unique prerequisites for ${tech.name}`);
    
    if (prerequisites.length === 0) {
        alert('This technology has no prerequisites.');
        return;
    }

    // Remove existing prerequisite tab if any
    closePrerequisiteTab();

    // Find the Events tab to position after it
    let eventsTab = $('.float-Anomalies');
    
    if (eventsTab.length === 0) {
        console.error('Events tab not found');
        return;
    }
    
    // Create the prerequisite tab element with proper navigation styling
    let prereqTab = $(`
        <li class="float-Element prerequisite-tab float-Highlight">
            <a class="float-Contents">
                <h2>
                    <span class="tech-name" title="${tech.name}">📋 ${tech.name}</span>
                    <span class="close-btn">&times;</span>
                </h2>
            </a>
        </li>
    `);

    // Insert the tab between Events and Search
    eventsTab.after(prereqTab);
    console.log('Prerequisite tab inserted into navigation');

    // Add click handlers
    prereqTab.find('.close-btn').on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        closePrerequisiteTab();
    });

    prereqTab.find('.float-Contents').on('click', function(e) {
        if (!$(e.target).hasClass('close-btn')) {
            // Handle tab switching like other navigation tabs
            switchToPrerequisiteTab();
        }
    });

    // Create the overlay and populate it with content
    showPrerequisiteOverlay(techKey, tech, prerequisites);
    
    // Switch to prerequisite tab immediately
    switchToPrerequisiteTab();
    
    activePrerequisiteTab = prereqTab;
    
    // Verify tab was added
    if ($('.prerequisite-tab').length > 0) {
        console.log('Prerequisite tab successfully added to navigation bar');
    } else {
        console.error('Failed to add prerequisite tab to navigation bar');
    }
}

// Switch to prerequisite tab (like other navigation tabs)
function switchToPrerequisiteTab() {
    // Update tab highlighting like other navigation tabs
    $(".float-Element").removeClass("float-Highlight");
    $(".float-Element").addClass("float-Lowlight");
    $(".prerequisite-tab").removeClass("float-Lowlight");
    $(".prerequisite-tab").addClass("float-Highlight");
    
    // Hide all tech tree sections
    $("#tech-tree-physics").addClass("float-NoDisplay");
    $("#tech-tree-society").addClass("float-NoDisplay");
    $("#tech-tree-engineering").addClass("float-NoDisplay");
    $("#tech-tree-anomalies").addClass("float-NoDisplay");
    
    // Show prerequisite overlay
    if (prerequisiteOverlay) {
        prerequisiteOverlay.classList.add('active');
        // Sync all prerequisite nodes with main tech tree
        syncAllPrerequisiteNodes();
    }
}

// Sync all prerequisite nodes with the main tech tree
function syncAllPrerequisiteNodes() {
    console.log('Syncing all prerequisite nodes with main tech tree');
    $('#prerequisite-overlay .tech[data-tech-key]').each(function() {
        let prereqNode = $(this);
        let techKey = prereqNode.attr('data-tech-key');
        if (techKey) {
            console.log('Syncing prerequisite node for tech:', techKey);
            syncPrerequisiteNodeWithMain(techKey);
        }
    });
}

// Show the prerequisite overlay with content
function showPrerequisiteOverlay(techKey, tech, prerequisites) {
    let overlay = createPrerequisiteOverlay();
    
    // Build prerequisite relationship diagram
    let prereqDiagram = buildPrerequisiteTree(techKey, prerequisites);
    overlay.innerHTML = `
        <div style="padding: 20px;">
            <div id="prereq-diagram-${techKey}">
                ${prereqDiagram}
            </div>
        </div>
    `;

    // Initialize tooltips and node status for the new content
    setTimeout(() => {
        init_tooltips_for_container('#prerequisite-overlay');
        initPrerequisiteNodeStatus();
        // Sync all nodes after a short delay to ensure main tech tree is ready
        setTimeout(() => {
            syncAllPrerequisiteNodes();
        }, 200);
    }, 100);
}

// Build HTML structure for prerequisite relationship diagram
function buildPrerequisiteTree(targetTechKey, prerequisites) {
    console.log('Building prerequisite diagram for:', targetTechKey, 'with', prerequisites.length, 'prerequisites');
    
    // Add target tech to the list
    let targetTech = findTechByKey(targetTechKey);
    let allTechs = [...prerequisites];
    if (targetTech) {
        allTechs.push({
            key: targetTechKey,
            tech: targetTech.tech,
            area: targetTech.area
        });
    }
    
    // Organize techs by tier for hierarchical display
    let techsByTier = {};
    allTechs.forEach(tech => {
        let tier = tech.tech.tier || 0;
        if (!techsByTier[tier]) {
            techsByTier[tier] = [];
        }
        techsByTier[tier].push(tech);
    });
    
    // Build prerequisite relationships map
    let relationships = buildRelationshipMap(allTechs);
    
    let html = '<div class="prerequisite-diagram">';
    
    // Add title
    html += `
        <div class="diagram-title">
            🎯 Prerequisites Chain for: ${targetTech ? targetTech.tech.name : targetTechKey}
        </div>
    `;
    
    // Sort tiers and create hierarchical display
    let sortedTiers = Object.keys(techsByTier).sort((a, b) => parseInt(a) - parseInt(b));
    
    sortedTiers.forEach((tier, tierIndex) => {
        let isTargetTier = techsByTier[tier].some(tech => tech.key === targetTechKey);
        let tierClass = isTargetTier ? 'diagram-tier target-tier' : 'diagram-tier';
        
        html += `<div class="${tierClass}" data-tier="${tier}">`;
        
        // Add tier label
        if (tier == 0) {
            html += `<div class="tier-label">Starting Techs</div>`;
        } else {
            html += `<div class="tier-label">Tier ${tier}</div>`;
        }
        
        // Add techs in this tier
        techsByTier[tier].forEach(tech => {
            let isTarget = tech.key === targetTechKey;
            let techClass = tech.area + (tech.tech.is_dangerous ? ' dangerous' : '') + 
                           (!tech.tech.is_dangerous && tech.tech.is_rare ? ' rare' : '') +
                           (isTarget ? ' target-tech' : '');
            
            let diagramTechClass = isTarget ? 'diagram-tech target' : 'diagram-tech';
            
            html += `<div class="${diagramTechClass}" data-tech-key="${tech.key}">`;
            html += createTechNodeHTML(tech.tech, techClass, isTarget);
            html += `</div>`;
        });
        
        html += `</div>`;
        
        // Add connections to next tier if not the last
        if (tierIndex < sortedTiers.length - 1) {
            html += createConnectionsHTML(techsByTier[tier], techsByTier[sortedTiers[tierIndex + 1]], relationships);
        }
    });
    
    html += '</div>';
    return html;
}

// Build a map of prerequisite relationships
function buildRelationshipMap(allTechs) {
    let relationships = {};
    
    allTechs.forEach(tech => {
        if (tech.tech.prerequisites && tech.tech.prerequisites.length > 0) {
            relationships[tech.key] = tech.tech.prerequisites;
        }
    });
    
    return relationships;
}

// Create connection lines between tiers
function createConnectionsHTML(currentTier, nextTier, relationships) {
    if (currentTier.length === 0 || nextTier.length === 0) return '';
    
    let html = '<div class="connections-container" style="position: relative; height: 50px; margin: 20px 0;">';
    
    // Create a grid of connections showing prerequisite relationships
    let connectionsMade = new Set();
    
    nextTier.forEach((nextTech, nextIndex) => {
        if (relationships[nextTech.key]) {
            relationships[nextTech.key].forEach(prereqKey => {
                // Find if this prerequisite is in the current tier
                let prereqIndex = currentTier.findIndex(tech => tech.key === prereqKey);
                if (prereqIndex !== -1) {
                    let connectionId = `${prereqKey}-${nextTech.key}`;
                    if (!connectionsMade.has(connectionId)) {
                        connectionsMade.add(connectionId);
                        
                        // Calculate approximate positions for connections
                        let currentTechCount = currentTier.length;
                        let nextTechCount = nextTier.length;
                        
                        let fromPercent = ((prereqIndex + 0.5) / currentTechCount) * 100;
                        let toPercent = ((nextIndex + 0.5) / nextTechCount) * 100;
                        
                        // Create connection line with color based on target tech's area
                        let lineClass = `connection-line ${nextTech.area}`;
                        
                        // Vertical line from prerequisite
                        html += `
                            <div class="${lineClass} vertical" 
                                 style="height: 20px; top: 0; left: ${fromPercent}%; width: 3px; transform: translateX(-50%);"></div>
                        `;
                        
                        // Horizontal line if positions differ
                        if (Math.abs(fromPercent - toPercent) > 5) {
                            let left = Math.min(fromPercent, toPercent);
                            let width = Math.abs(fromPercent - toPercent);
                            html += `
                                <div class="${lineClass} horizontal" 
                                     style="width: ${width}%; left: ${left}%; top: 20px; height: 3px;"></div>
                            `;
                        }
                        
                        // Vertical line to target
                        html += `
                            <div class="${lineClass} vertical" 
                                 style="height: 20px; top: 20px; left: ${toPercent}%; width: 3px; transform: translateX(-50%);"></div>
                        `;
                        
                        // Arrow pointing down to target
                        html += `
                            <div class="connection-arrow down ${nextTech.area}" 
                                 style="top: 40px; left: ${toPercent}%; transform: translateX(-50%);"></div>
                        `;
                    }
                }
            });
        }
    });
    
    html += '</div>';
    return html;
}

// Create HTML for a single tech node
function createTechNodeHTML(tech, techClass, isTarget = false) {
    let targetStyle = isTarget ? 'border: 3px solid #ff6b35; box-shadow: 0 0 10px #ff6b35;' : '';
    
    // Don't check for active state here - we'll sync it later after the DOM is ready
    // This avoids timing issues with main tech tree loading
    
    return `
        <div class="tech ${techClass}" id="prereq-${tech.key}" style="${targetStyle}" data-tech-key="${tech.key}">
            <div class="icon lozad" data-background-image="../assets/img/${tech.key}.png" style="background-image: url('../assets/img/${tech.key}.png');"></div>
            <p class="node-name" title="${tech.name}">${tech.name}</p>
            <p class="node-title">
                ${tech.tier < 1 ? 
                    `${tech.category} - <span class="tier tier-0">Starting</span>` :
                    `${tech.category} - <span class="tier tier-${tech.tier}">Tier ${tech.tier}</span>`
                }
            </p>
            <p class="node-desc">
                ${tech.tier > 0 ? `Cost: <span class="${tech.area}-research">${tech.cost}, Weight: ${tech.base_weight}</span>` : ''}
            </p>
            <div class="node-status" data-tech-key="${tech.key}"></div>
            <div class="extra-data">
                <div class="tooltip-header">Description</div>
                <div class="tooltip-content" style="max-width:320px">${tech.description}</div>
                ${tech.weight_modifiers && tech.weight_modifiers.length > 0 ? `
                    <div class="tooltip-header">Weight Modifiers</div>
                    <div class="tooltip-content"><pre>${tech.weight_modifiers.join('<br/>')}</pre></div>
                ` : ''}
                ${tech.potential && tech.potential.length > 0 ? `
                    <div class="tooltip-header">Requirements</div>
                    <div class="tooltip-content"><pre>${tech.potential.join('<br/>')}</pre></div>
                ` : ''}
                ${tech.prerequisites && tech.prerequisites.length > 1 ? `
                    <div class="tooltip-header">Required Technologies</div>
                    <div class="tooltip-content prerequisites">
                        ${tech.prerequisites.map(prereq => `<img class="left ${prereq}" height="52" width="52" src="../assets/img/${prereq}.png">`).join('')}
                        <div class="left">
                            ${tech.prerequisites_names ? tech.prerequisites_names.map(name => `<span class="node-status ${name.key}">${name.name}</span><br/>`).join('') : ''}
                        </div>
                    </div>
                ` : ''}
                ${tech.feature_unlocks && tech.feature_unlocks.length > 0 ? `
                    <div class="tooltip-header">Research Effects</div>
                    <div class="tooltip-content">${tech.feature_unlocks.join('<br/>')}</div>
                ` : ''}
            </div>
        </div>
    `;
}

// Get color for research area
function getAreaColor(area) {
    switch(area) {
        case 'physics': return '#4396E2';
        case 'society': return '#5ACA9C';
        case 'engineering': return '#E29C43';
        case 'anomaly': return '#800080';
        default: return '#ffffff';
    }
}

// Close the prerequisite tab and return to main view
function closePrerequisiteTab() {
    // Remove any existing prerequisite tab from navigation
    $('.prerequisite-tab').remove();
    
    if (activePrerequisiteTab) {
        activePrerequisiteTab = null;
    }
    
    if (prerequisiteOverlay) {
        prerequisiteOverlay.classList.remove('active');
    }
    
    // Switch back to "All" tab
    $(".float-Element").removeClass("float-Highlight");
    $(".float-Element").addClass("float-Lowlight");
    $(".float-All").removeClass("float-Lowlight");
    $(".float-All").addClass("float-Highlight");
    
    // Show all tech tree sections
    $("#tech-tree-physics").removeClass("float-NoDisplay");
    $("#tech-tree-society").removeClass("float-NoDisplay");
    $("#tech-tree-engineering").removeClass("float-NoDisplay");
    $("#tech-tree-anomalies").addClass("float-NoDisplay");
}

// Initialize node status functionality for prerequisite overlay
function initPrerequisiteNodeStatus() {
    $('#prerequisite-overlay .tech .node-status:not(.status-loaded)').each(function() {
        $(this).on('click', function(e) {
            e.stopPropagation();
            
            let techKey = $(this).attr('data-tech-key');
            let prereqNode = $(this).parent();
            // Only target tech nodes in the main tech tree, not in prerequisite overlay
            let mainTechNode = $('#tech-tree #' + techKey);
            
            console.log('Clicked prerequisite checkbox for tech:', techKey);
            console.log('Main tech nodes found:', mainTechNode.length);
            
            if (mainTechNode.length > 0) {
                // Use the first match if there are multiple
                let mainNode = mainTechNode.first();
                
                // Get the area for this tech by checking classes
                let area = 'anomaly'; // default
                if (mainNode.hasClass('physics')) area = 'physics';
                else if (mainNode.hasClass('society')) area = 'society';
                else if (mainNode.hasClass('engineering')) area = 'engineering';
                
                // Toggle the main tech tree node
                let isCurrentlyActive = mainNode.find('.node-status').hasClass('active');
                
                console.log('Tech area:', area, 'Currently active:', isCurrentlyActive);
                
                if (area !== 'anomaly') {
                    // Use the existing updateResearch function for regular techs
                    updateResearch(area, techKey, !isCurrentlyActive);
                } else {
                    // Handle anomaly techs differently
                    if (isCurrentlyActive) {
                        mainNode.find('.node-status').removeClass('active');
                        mainNode.removeClass('active');
                    } else {
                        mainNode.find('.node-status').addClass('active');
                        mainNode.addClass('active');
                    }
                }
                
                // Update the prerequisite node to match the main tech tree
                setTimeout(() => {
                    syncPrerequisiteNodeWithMain(techKey);
                }, 100);
            } else {
                console.warn('Main tech node not found for:', techKey);
                // Handle direct toggle for prerequisite node if main node not found
                let isCurrentlyActive = $(this).hasClass('active');
                if (isCurrentlyActive) {
                    $(this).removeClass('active');
                    prereqNode.removeClass('active');
                } else {
                    $(this).addClass('active');
                    prereqNode.addClass('active');
                }
            }
        });
        
        $(this).addClass('status-loaded');
    });
}

// Sync prerequisite node status with main tech tree
function syncPrerequisiteNodeWithMain(techKey) {
    // Only target tech nodes in the main tech tree, not in prerequisite overlay
    let mainTechNode = $('#tech-tree #' + techKey);
    let prereqNode = $('#prerequisite-overlay #prereq-' + techKey);
    
    console.log('Syncing tech:', techKey, 'Main node found:', mainTechNode.length, 'Prereq node found:', prereqNode.length);
    
    if (prereqNode.length > 1) {
        console.warn(`⚠️ Found ${prereqNode.length} prerequisite nodes for ${techKey} - this indicates duplicates!`);
        // List all the duplicate nodes
        prereqNode.each(function(index) {
            console.log(`  Duplicate ${index + 1}:`, this.id, 'in container:', this.parentElement.className);
        });
    }
    
    if (mainTechNode.length > 0 && prereqNode.length > 0) {
        // Use the first match if there are multiple (shouldn't happen with specific selectors)
        let mainNode = mainTechNode.first();
        let isMainActive = mainNode.find('.node-status').hasClass('active');
        let prereqStatus = prereqNode.first().find('.node-status'); // Use first prereq node
        let firstPrereqNode = prereqNode.first();
        
        console.log('Main tech active state:', isMainActive, 'for tech:', techKey);
        
        if (isMainActive) {
            prereqStatus.addClass('active');
            firstPrereqNode.addClass('active');
        } else {
            prereqStatus.removeClass('active');
            firstPrereqNode.removeClass('active');
        }
        
        console.log('Prerequisite node synced for:', techKey);
    } else {
        console.warn('Could not sync - Main or prereq node missing for:', techKey, '(Main:', mainTechNode.length, 'Prereq:', prereqNode.length, ')');
    }
}

// Initialize tooltips for a specific container
function init_tooltips_for_container(containerSelector) {
    $(containerSelector + ' .tech:not(.tooltipstered)').tooltipster({
        minWidth: 300,
        trigger: 'click',
        maxWidth: 512,
        functionInit: function(instance, helper){
            var content = $(helper.origin).find('.extra-data');
            $(content).find('img').each(function(img, el) {
                var tech = $(el)[0].classList[$(el)[0].classList.length-1];
                if(!$('#' + tech).hasClass('anomaly')) {
                    var parent = $('#' + tech)[0];
                    if(parent !== undefined && parent.classList.length > 1)
                    $(el).addClass(parent.classList[2]);
                }
            });
            instance.content($('<div class="ui-tooltip">' + $(content).html() + '</div>'));
        },
        functionReady: function(instance, helper) {
            $(helper.tooltip).find('.tooltip-content').each(function(div){
                var content = $(this).html();
                content = content.replace(new RegExp(/£(\w+)£/,'g'), '<img class="resource" src="../assets/icons/$1.png" />');
                $(this).html(content);
            });
        }
    });
}

// Initialize context menu functionality
function initContextMenu() {
    let contextMenu = document.getElementById('tech-context-menu');
    let selectedTech = null;

    // Right-click event on tech nodes
    $(document).on('contextmenu', '.tech', function(e) {
        e.preventDefault();
        selectedTech = this.id;
        
        contextMenu.style.display = 'block';
        contextMenu.style.left = e.pageX + 'px';
        contextMenu.style.top = e.pageY + 'px';
    });

    // Hide context menu on click elsewhere
    $(document).on('click', function(e) {
        if (!$(e.target).closest('#tech-context-menu').length) {
            contextMenu.style.display = 'none';
        }
    });

    // Handle context menu item clicks
    $('#view-prerequisites').on('click', function() {
        if (selectedTech) {
            let techKey = selectedTech.replace('prereq-', ''); // Remove prefix if present
            createPrerequisiteTab(techKey);
            contextMenu.style.display = 'none';
        }
    });

    $('#select-prerequisites').on('click', function() {
        if (selectedTech) {
            let techKey = selectedTech.replace('prereq-', ''); // Remove prefix if present
            let count = selectAllPrerequisites(techKey);
            if (count > 0) {
                alert(`Selected ${count} prerequisite technologies for the selected tech.`);
            } else {
                alert('No prerequisite technologies were selected. They may already be active or the tech has no prerequisites.');
            }
            contextMenu.style.display = 'none';
        }
    });

    $('#select-following').on('click', function() {
        if (selectedTech) {
            let techKey = selectedTech.replace('prereq-', ''); // Remove prefix if present
            let count = selectAllFollowing(techKey);
            if (count > 0) {
                alert(`Selected ${count} following technologies that depend on the selected tech.`);
            } else {
                alert('No following technologies were selected. They may already be active or no techs depend on this one.');
            }
            contextMenu.style.display = 'none';
        }
    });

    $('#select-chain').on('click', function() {
        if (selectedTech) {
            let techKey = selectedTech.replace('prereq-', ''); // Remove prefix if present
            selectFullChain(techKey);
            contextMenu.style.display = 'none';
        }
    });
}

// Initialize the prerequisite tabs system
function initPrerequisiteTabs() {
    loadTechDataCache().then(() => {
        console.log('Tech data cache loaded successfully');
        initContextMenu();
        
        // Add listener to main navigation tabs to hide prerequisite overlay
        $(document).on('click', '.float-Contents', function() {
            // Only handle main navigation tabs, not the prerequisite tab
            if (!$(this).closest('.prerequisite-tab').length && activePrerequisiteTab) {
                // Hide prerequisite overlay when other tabs are clicked
                if (prerequisiteOverlay) {
                    prerequisiteOverlay.classList.remove('active');
                }
                
                // Update tab highlighting to match the clicked tab
                $(".prerequisite-tab").removeClass("float-Highlight");
                $(".prerequisite-tab").addClass("float-Lowlight");
            }
        });
        
    }).catch(error => {
        console.error('Error loading tech data cache:', error);
    });
}

// Initialize when document is ready
$(document).ready(function() {
    let checkTechTreeLoaded = setInterval(() => {
        if (Object.keys(charts).length > 0) {
            clearInterval(checkTechTreeLoaded);
            initPrerequisiteTabs();
        }
    }, 500);
});