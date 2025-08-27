'use strict';

// Global variables for prerequisite functionality
var prerequisiteTabs = [];
var activePrerequisiteTab = null;
var techDataCache = {};

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

// Create a new prerequisite tab
function createPrerequisiteTab(techKey) {
    let techData = findTechByKey(techKey);
    if (!techData) {
        console.error('Tech not found:', techKey);
        return;
    }

    let tabId = 'prereq-tab-' + techKey;
    
    // Check if tab already exists
    if (document.getElementById(tabId)) {
        switchToPrerequisiteTab(tabId);
        return;
    }

    let tech = techData.tech;
    let prerequisites = extractAllPrerequisites(techKey);
    
    if (prerequisites.length === 0) {
        alert('This technology has no prerequisites.');
        return;
    }

    // Create tab element
    let tabsContainer = document.getElementById('prerequisite-tabs');
    let tab = document.createElement('div');
    tab.className = 'prerequisite-tab';
    tab.id = tabId;
    tab.innerHTML = `
        <span title="${tech.name}">${tech.name}</span>
        <span class="close-btn" onclick="closePrerequisiteTab('${tabId}')">&times;</span>
    `;
    
    tab.onclick = function(e) {
        if (e.target.className !== 'close-btn') {
            switchToPrerequisiteTab(tabId);
        }
    };

    tabsContainer.appendChild(tab);

    // Create content container
    let contentContainer = document.createElement('div');
    contentContainer.className = 'prerequisite-content';
    contentContainer.id = 'content-' + tabId;
    
    // Build prerequisite tree structure
    let prereqTree = buildPrerequisiteTree(techKey, prerequisites);
    contentContainer.innerHTML = `
        <div style="margin-top:50px">
            <h2 style="color: #4396E2; text-align: center; font-family: 'Arimo', Verdana; margin: 20px;">
                Prerequisites for: ${tech.name}
            </h2>
            <div id="prereq-tree-${techKey}">
                ${prereqTree}
            </div>
        </div>
    `;

    document.body.appendChild(contentContainer);

    // Add to tabs array
    prerequisiteTabs.push({
        id: tabId,
        techKey: techKey,
        tech: tech
    });

    // Show tabs container if hidden
    tabsContainer.style.display = 'block';
    document.getElementById('main-header').classList.add('with-prereq-tabs');

    // Switch to new tab
    switchToPrerequisiteTab(tabId);

    // Initialize tooltips for the new content
    setTimeout(() => {
        init_tooltips_for_container('#content-' + tabId);
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
    
    return `
        <div class="tech ${techClass}" id="prereq-${tech.key}" style="${targetStyle}">
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

// Switch to a specific prerequisite tab
function switchToPrerequisiteTab(tabId) {
    // Hide all content
    document.querySelectorAll('.prerequisite-content').forEach(content => {
        content.classList.remove('active');
    });

    // Show selected content
    let contentId = 'content-' + tabId;
    let content = document.getElementById(contentId);
    if (content) {
        content.classList.add('active');
    } else {
        // Show main tech tree if no prerequisite content
        document.getElementById('main-tech-tree').classList.add('active');
    }

    // Update tab styles
    document.querySelectorAll('.prerequisite-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active');

    activePrerequisiteTab = tabId;
}

// Close a prerequisite tab
function closePrerequisiteTab(tabId) {
    // Remove tab element
    let tab = document.getElementById(tabId);
    if (tab) {
        tab.remove();
    }

    // Remove content element
    let content = document.getElementById('content-' + tabId);
    if (content) {
        content.remove();
    }

    // Remove from tabs array
    prerequisiteTabs = prerequisiteTabs.filter(t => t.id !== tabId);

    // If no more prerequisite tabs, hide the container
    if (prerequisiteTabs.length === 0) {
        document.getElementById('prerequisite-tabs').style.display = 'none';
        document.getElementById('main-header').classList.remove('with-prereq-tabs');
        document.getElementById('main-tech-tree').classList.add('active');
        activePrerequisiteTab = null;
    } else {
        // Switch to first available tab
        if (activePrerequisiteTab === tabId) {
            switchToPrerequisiteTab(prerequisiteTabs[0].id);
        }
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
        
        // Add click handler to main tab area to return to main view
        $(document).on('click', '.float-Contents', function() {
            if (prerequisiteTabs.length > 0) {
                document.getElementById('main-tech-tree').classList.add('active');
                document.querySelectorAll('.prerequisite-content').forEach(content => {
                    if (content.id !== 'main-tech-tree') {
                        content.classList.remove('active');
                    }
                });
                document.querySelectorAll('.prerequisite-tab').forEach(tab => {
                    tab.classList.remove('active');
                });
                activePrerequisiteTab = null;
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
