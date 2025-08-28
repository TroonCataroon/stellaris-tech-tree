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

    return prerequisites;
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
    $('#prerequisite-overlay .tech').each(function() {
        let prereqNode = $(this);
        let techKey = prereqNode.attr('data-tech-key');
        if (techKey) {
            syncPrerequisiteNodeWithMain(techKey);
        }
    });
}

// Show the prerequisite overlay with content
function showPrerequisiteOverlay(techKey, tech, prerequisites) {
    let overlay = createPrerequisiteOverlay();
    
    // Build prerequisite tree structure
    let prereqTree = buildPrerequisiteTree(techKey, prerequisites);
    overlay.innerHTML = `
        <div style="padding: 20px;">
            <h2 style="color: #4396E2; text-align: center; font-family: 'Arimo', Verdana; margin: 20px 0;">
                Prerequisites for: ${tech.name}
            </h2>
            <div id="prereq-tree-${techKey}">
                ${prereqTree}
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

// Build HTML structure for prerequisite tree
function buildPrerequisiteTree(targetTechKey, prerequisites) {
    let html = '<div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 20px;">';
    
    // Group prerequisites by area
    let groupedPrereqs = {};
    prerequisites.forEach(prereq => {
        if (!groupedPrereqs[prereq.area]) {
            groupedPrereqs[prereq.area] = [];
        }
        groupedPrereqs[prereq.area].push(prereq);
    });

    // Add the target tech at the end
    let targetTech = findTechByKey(targetTechKey);
    if (targetTech) {
        if (!groupedPrereqs[targetTech.area]) {
            groupedPrereqs[targetTech.area] = [];
        }
        groupedPrereqs[targetTech.area].push({
            key: targetTechKey,
            tech: targetTech.tech,
            area: targetTech.area
        });
    }

    // Create sections for each area
    for (let area in groupedPrereqs) {
        if (groupedPrereqs[area].length === 0) continue;
        
        let areaColor = getAreaColor(area);
        html += `
            <div style="border: 2px solid ${areaColor}; border-radius: 8px; padding: 15px; margin: 10px; background: rgba(0,0,0,0.7);">
                <h3 style="color: ${areaColor}; text-align: center; font-family: 'Arimo', Verdana; margin-bottom: 15px;">
                    ${area.charAt(0).toUpperCase() + area.slice(1)} Technologies
                </h3>
                <div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
        `;

        // Sort by tier for better display
        groupedPrereqs[area].sort((a, b) => (a.tech.tier || 0) - (b.tech.tier || 0));

        groupedPrereqs[area].forEach(prereq => {
            let isTarget = prereq.key === targetTechKey;
            let techClass = prereq.area + (prereq.tech.is_dangerous ? ' dangerous' : '') + 
                           (!prereq.tech.is_dangerous && prereq.tech.is_rare ? ' rare' : '') +
                           (isTarget ? ' target-tech' : '');
            
            html += createTechNodeHTML(prereq.tech, techClass, isTarget);
        });

        html += '</div></div>';
    }

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
            let mainTechNode = $('#' + techKey);
            
            console.log('Clicked prerequisite checkbox for tech:', techKey);
            
            if (mainTechNode.length > 0) {
                // Get the area for this tech by checking classes
                let area = 'anomaly'; // default
                if (mainTechNode.hasClass('physics')) area = 'physics';
                else if (mainTechNode.hasClass('society')) area = 'society';
                else if (mainTechNode.hasClass('engineering')) area = 'engineering';
                
                // Toggle the main tech tree node
                let isCurrentlyActive = mainTechNode.find('.node-status').hasClass('active');
                
                console.log('Tech area:', area, 'Currently active:', isCurrentlyActive);
                
                if (area !== 'anomaly') {
                    // Use the existing updateResearch function for regular techs
                    updateResearch(area, techKey, !isCurrentlyActive);
                } else {
                    // Handle anomaly techs differently
                    if (isCurrentlyActive) {
                        mainTechNode.find('.node-status').removeClass('active');
                        mainTechNode.removeClass('active');
                    } else {
                        mainTechNode.find('.node-status').addClass('active');
                        mainTechNode.addClass('active');
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
    let mainTechNode = $('#' + techKey);
    let prereqNode = $('#prereq-' + techKey);
    
    console.log('Syncing tech:', techKey, 'Main node found:', mainTechNode.length > 0, 'Prereq node found:', prereqNode.length > 0);
    
    if (mainTechNode.length > 0 && prereqNode.length > 0) {
        let isMainActive = mainTechNode.find('.node-status').hasClass('active');
        let prereqStatus = prereqNode.find('.node-status');
        
        console.log('Main tech active state:', isMainActive);
        
        if (isMainActive) {
            prereqStatus.addClass('active');
            prereqNode.addClass('active');
        } else {
            prereqStatus.removeClass('active');
            prereqNode.removeClass('active');
        }
        
        console.log('Prerequisite node synced for:', techKey);
    } else {
        console.warn('Could not sync - Main or prereq node missing for:', techKey);
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

    // Handle context menu item click
    $('#view-prerequisites').on('click', function() {
        if (selectedTech) {
            let techKey = selectedTech.replace('prereq-', ''); // Remove prefix if present
            createPrerequisiteTab(techKey);
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