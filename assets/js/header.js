console.log("🔥 HEADER.JS LOADING STARTED");

// Function taken from SO user "gpvos" , thank you!
String.prototype.format = function () {
    var args = arguments;
    return this.replace(/\{\{|\}\}|\{(\d+)\}/g, function (m, n) {
      if (m == "{{") { return "{"; }
      if (m == "}}") { return "}"; }
      return args[n];
    });
  };
$(document).ready(function(){
    console.log("header.js loaded and DOM ready");
    
    // Wait a bit to ensure all elements are in the DOM
    setTimeout(function() {
        console.log("Setting up click handlers for .float-Contents");
        
        // Check if Events tab exists
        console.log("Events tab exists:", $(".float-Events").length > 0);
        console.log("All float-Element classes:", $(".float-Element").map(function(){ return this.className; }).get());

        // Main function
        $(".float-Contents").off('click').on('click', function (e) { 
        $(".float-Element").removeClass("float-Highlight");
        $(".float-Element").addClass("float-Lowlight");
        $(this).parent().removeClass("float-Lowlight");
        $(this).parent().addClass("float-Highlight");
        
        if($(this).parent().hasClass("float-Physics"))
        {
            $("#tech-tree-physics").removeClass("float-NoDisplay");
            $("#tech-tree-society").addClass("float-NoDisplay");
            $("#tech-tree-engineering").addClass("float-NoDisplay");
            $("#tech-tree-anomalies").addClass("float-NoDisplay");
            $("#tech-tree-events").addClass("float-NoDisplay");
        }
        if($(this).parent().hasClass("float-Society"))
        {
            $("#tech-tree-physics").addClass("float-NoDisplay");
            $("#tech-tree-society").removeClass("float-NoDisplay");
            $("#tech-tree-engineering").addClass("float-NoDisplay");
            $("#tech-tree-anomalies").addClass("float-NoDisplay");
            $("#tech-tree-events").addClass("float-NoDisplay");
        }
        if($(this).parent().hasClass("float-Engineering"))
        {
            $("#tech-tree-physics").addClass("float-NoDisplay");
            $("#tech-tree-society").addClass("float-NoDisplay");
            $("#tech-tree-engineering").removeClass("float-NoDisplay");
            $("#tech-tree-anomalies").addClass("float-NoDisplay");
            $("#tech-tree-events").addClass("float-NoDisplay");
        }
        if($(this).parent().hasClass("float-All"))
        {
            $("#tech-tree-physics").removeClass("float-NoDisplay");
            $("#tech-tree-society").removeClass("float-NoDisplay");
            $("#tech-tree-engineering").removeClass("float-NoDisplay");
            $("#tech-tree-anomalies").addClass("float-NoDisplay");
            $("#tech-tree-events").addClass("float-NoDisplay");
        }
        if($(this).parent().hasClass("float-Anomalies"))
        {
            $("#tech-tree-physics").addClass("float-NoDisplay");
            $("#tech-tree-society").addClass("float-NoDisplay");
            $("#tech-tree-engineering").addClass("float-NoDisplay");
            $("#tech-tree-anomalies").removeClass("float-NoDisplay");
            $("#tech-tree-events").addClass("float-NoDisplay");
        }
        if($(this).parent().hasClass("float-Events"))
        {
            console.log("Events tab clicked!");
            $("#tech-tree-physics").addClass("float-NoDisplay");
            $("#tech-tree-society").addClass("float-NoDisplay");
            $("#tech-tree-engineering").addClass("float-NoDisplay");
            $("#tech-tree-anomalies").addClass("float-NoDisplay");
            $("#tech-tree-events").removeClass("float-NoDisplay");
            console.log("About to call loadEventsContent");
            loadEventsContent();
                 }
     });
     
     }, 100); // Wait 100ms for DOM to be fully ready

     // Make some button go to the top of the page
    $("a[data-scroll='top']").click(function() {
        window.scrollTo(0,0);
    });


    // Auto-resize header to browser body width

    // Unfortunately, Resize event on mobile are very badly supported ... and zooming is worse :(
    // I'm using CSS to set the width to 100% however

    /*var size = $(window).width() + "px";
    $(".float-Holder").css("width",size);

    $(window).resize(function(){
        var size = $(window).width() + "px";
        $(".float-Holder").css("width",size);
    });*/

    /*var handleTouchyPinch = function (e, $target, data) {
        var size = $(window).width() + "px";
        $(".float-Holder").css("width",size);
    };
    $(window).bind('touchy-pinch', handleTouchyPinch);*/

    // Cool Right-side buttons

    var bgCss = "";
    var topLeft = true; // 135deg
    var topRight = false; // 225deg
    var bottomRight = true; // 315deg
    var bottomLeft = false; // 45deg

    var backgroundColor = "#333";
    var borderColor = "#2F6458";
    var gradientTop = "#2b574e";
    var gradientBottom = "#0D1717";
    

    var borderSize = "2"; // pixels
    var borderDepth = "8"; // pixels
    
    var borderEnd = parseInt(borderDepth) + parseInt(borderSize);

    if(topLeft)
    {
        bgCss += "linear-gradient(135deg, {0} {1}px, {2} {1}px,{2} {3}px, transparent {3}px),".format(backgroundColor,borderDepth,borderColor,borderEnd);
    }
    if(topRight)
    {
        bgCss += "linear-gradient(225deg, {0} {1}px, {2} {1}px,{2} {3}px, transparent {3}px),".format(backgroundColor,borderDepth,borderColor,borderEnd);
    }
    if(bottomRight)
    {
        bgCss += "linear-gradient(315deg, {0} {1}px, {2} {1}px,{2} {3}px, transparent {3}px),".format(backgroundColor,borderDepth,borderColor,borderEnd);
    }
    if(bottomLeft)
    {
        bgCss += "linear-gradient(45deg, {0} {1}px, {2} {1}px,{2} {3}px, transparent {3}px),".format(backgroundColor,borderDepth,borderColor,borderEnd);
    }
    bgCss += "linear-gradient(to left, {0} {1}px,transparent {1}px),".format(borderColor,borderSize) +
             "linear-gradient(to right, {0} {1}px,transparent {1}px),".format(borderColor,borderSize) +
             "linear-gradient(to bottom, {0} {1}px,transparent {1}px),".format(borderColor,borderSize) +
             "linear-gradient(to top, {0} {1}px,transparent {1}px),".format(borderColor,borderSize);

    bgCss += "linear-gradient({0},{1})".format(gradientTop,gradientBottom);

    $(".float-RightElement").css("background",bgCss);
    
    // Events loading functionality
    window.loadEventsContent = function() {
        console.log("loadEventsContent called");
        console.log("Current URL:", window.location.href);
        $.getJSON('./events.json', function(data) {
            console.log("events.json loaded successfully:", data);
            displayEventsData(data);
        }).fail(function(jqXHR, textStatus, errorThrown) {
            console.log("Failed to load events.json");
            console.log("Status:", textStatus, "Error:", errorThrown);
            console.log("Response:", jqXHR.responseText);
            $("#tech-tree-events").html('<div class="event-error">Failed to load events data</div>');
        });
    };
    
    function displayEventsData(eventsData) {
        console.log("displayEventsData called with:", eventsData);
        let html = '';
        
        // Create filter tabs
        html += '<div class="events-filter-tabs">';
        html += '<button class="events-filter-btn active" data-filter="all">All Events</button>';
        html += '<button class="events-filter-btn" data-filter="anomalies">Anomalies</button>';
        html += '<button class="events-filter-btn" data-filter="archaeological_sites">Archaeological Sites</button>';
        html += '<button class="events-filter-btn" data-filter="dig_sites">Dig Sites</button>';
        html += '<button class="events-filter-btn" data-filter="special_events">Special Events</button>';
        html += '<button class="events-filter-btn" data-filter="crisis_events">Crisis Events</button>';
        html += '</div>';
        
        html += '<div class="events-container">';
        
        // Display each category
        Object.keys(eventsData).forEach(category => {
            html += `<div class="events-category" data-category="${category}">`;
            html += `<h2 class="events-category-title">${formatCategoryName(category)}</h2>`;
            html += '<div class="events-grid">';
            
            eventsData[category].forEach(event => {
                html += createEventCard(event, category);
            });
            
            html += '</div></div>';
        });
        
        html += '</div>';
        
        $("#tech-tree-events").html(html);
        
        // Add filter functionality
        $('.events-filter-btn').click(function() {
            $('.events-filter-btn').removeClass('active');
            $(this).addClass('active');
            
            const filter = $(this).data('filter');
            if (filter === 'all') {
                $('.events-category').show();
            } else {
                $('.events-category').hide();
                $(`.events-category[data-category="${filter}"]`).show();
            }
        });
    }
    
    function formatCategoryName(category) {
        return category.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
    
    function createEventCard(event, category) {
        const eventTypeClass = category.replace('_', '-');
        let html = `<div class="stellaris-event-card ${eventTypeClass}" data-event-id="${event.id}">`;
        
        // Header with event type indicator
        html += `<div class="event-header">`;
        html += `<div class="event-type-indicator">${event.category}</div>`;
        html += `<div class="event-rarity ${event.type || 'standard'}">${event.type || 'Standard'}</div>`;
        html += `</div>`;
        
        // Main content area
        html += `<div class="event-main-content">`;
        html += `<div class="event-icon-container">`;
        html += `<div class="event-icon-frame">`;
        html += `<img class="event-icon-img" src="../assets/icons/${event.image || 'event_default'}.png" loading="lazy" alt="${event.name}">`;
        html += `</div>`;
        html += `</div>`;
        
        html += `<div class="event-text-content">`;
        html += `<h3 class="stellaris-event-name">${event.name}</h3>`;
        html += `<div class="event-description-text">${event.description}</div>`;
        html += `</div>`;
        html += `</div>`;
        
        // Decision Preview Area
        if (event.decisions && event.decisions.length > 0) {
            html += `<div class="decision-preview">`;
            html += `<div class="decision-count">${event.decisions.length} Decision${event.decisions.length > 1 ? 's' : ''} Available</div>`;
            html += `<div class="risk-indicators">`;
            event.decisions.forEach(decision => {
                const riskColor = getRiskColor(decision.risk_level);
                html += `<span class="risk-badge" style="background-color: ${riskColor}">${decision.risk_level}</span>`;
            });
            html += `</div>`;
            html += `</div>`;
        }
        
        // Stats/details area
        html += `<div class="event-stats">`;
        
        if (event.research_cost) {
            const researchIcon = getResearchIcon(event.research_type);
            html += `<div class="stat-item">`;
            html += `<span class="stat-icon">${researchIcon}</span>`;
            html += `<span class="stat-value ${event.research_type}-research">${event.research_cost}</span>`;
            html += `<span class="stat-label">Research Cost</span>`;
            html += `</div>`;
        }
        
        if (event.chapters) {
            html += `<div class="stat-item">`;
            html += `<span class="stat-icon">⛏️</span>`;
            html += `<span class="stat-value">${event.chapters}</span>`;
            html += `<span class="stat-label">Chapters</span>`;
            html += `</div>`;
        }
        
        if (event.dig_sites) {
            html += `<div class="stat-item">`;
            html += `<span class="stat-icon">🏛️</span>`;
            html += `<span class="stat-value">${event.dig_sites}</span>`;
            html += `<span class="stat-label">Dig Sites</span>`;
            html += `</div>`;
        }
        
        if (event.chain_length) {
            html += `<div class="stat-item">`;
            html += `<span class="stat-icon">⛓️</span>`;
            html += `<span class="stat-value">${event.chain_length}</span>`;
            html += `<span class="stat-label">Chain Length</span>`;
            html += `</div>`;
        }
        
        html += `</div>`;
        
        // Analyze Button
        html += `<div class="event-actions">`;
        html += `<button class="analyze-event-btn" onclick="openEventAnalyzer('${event.id}')">`;
        html += `📊 Analyze Decisions & Outcomes`;
        html += `</button>`;
        html += `</div>`;
        
        html += `</div>`;
        return html;
    }
    
    function getRiskColor(riskLevel) {
        switch(riskLevel) {
            case 'Safe': return '#28a745';
            case 'Low': return '#17a2b8';
            case 'Medium': return '#ffc107';
            case 'High': return '#fd7e14';
            case 'Extreme': return '#dc3545';
            default: return '#6c757d';
        }
    }
    
    // Global variable to store events data for analyzer
    window.currentEventsData = {};
    
    // Update displayEventsData to store data globally
    const originalDisplayEventsData = displayEventsData;
    displayEventsData = function(eventsData) {
        window.currentEventsData = eventsData;
        originalDisplayEventsData(eventsData);
        
        // Add click handlers for event cards
        $('.stellaris-event-card').click(function(e) {
            if (!$(e.target).hasClass('analyze-event-btn')) {
                const eventId = $(this).data('event-id');
                openEventAnalyzer(eventId);
            }
        });
    };
    
    // Event Analyzer Modal
    window.openEventAnalyzer = function(eventId) {
        const event = findEventById(eventId);
        if (!event) return;
        
        let html = createEventAnalyzer(event);
        
        // Create modal overlay
        const modalOverlay = $('<div class="event-analyzer-overlay"></div>');
        const modalContent = $('<div class="event-analyzer-modal"></div>');
        modalContent.html(html);
        modalOverlay.append(modalContent);
        
        // Add to body
        $('body').append(modalOverlay);
        
        // Show modal
        modalOverlay.fadeIn(300);
        
        // Close handlers
        modalOverlay.click(function(e) {
            if (e.target === this) {
                closeEventAnalyzer();
            }
        });
        
        $('.close-analyzer').click(closeEventAnalyzer);
    };
    
    window.closeEventAnalyzer = function() {
        $('.event-analyzer-overlay').fadeOut(300, function() {
            $(this).remove();
        });
    };
    
    function findEventById(eventId) {
        for (const category in window.currentEventsData) {
            const event = window.currentEventsData[category].find(e => e.id === eventId);
            if (event) return event;
        }
        return null;
    }
    
    function createEventAnalyzer(event) {
        let html = `<div class="analyzer-header">`;
        html += `<h2 class="analyzer-title">${event.name}</h2>`;
        html += `<button class="close-analyzer">✕</button>`;
        html += `</div>`;
        
        html += `<div class="analyzer-content">`;
        
        // Left Panel - Event Details & Decisions
        html += `<div class="analyzer-left">`;
        html += `<div class="event-full-description">`;
        html += `<h3>Event Description</h3>`;
        html += `<p>${event.description}</p>`;
        html += `</div>`;
        
        if (event.decisions) {
            html += `<div class="decision-analysis">`;
            html += `<h3>Decision Options</h3>`;
            event.decisions.forEach((decision, index) => {
                html += createDecisionOption(decision, index);
            });
            html += `</div>`;
        }
        html += `</div>`;
        
        // Right Panel - Consequences & Relationships
        html += `<div class="analyzer-right">`;
        html += createConsequencesSummary(event);
        html += createRelationshipTree(event);
        html += `</div>`;
        
        html += `</div>`;
        return html;
    }
    
    function createDecisionOption(decision, index) {
        const riskColor = getRiskColor(decision.risk_level);
        
        let html = `<div class="decision-option" data-risk="${decision.risk_level}">`;
        html += `<div class="decision-header">`;
        html += `<h4>Option ${index + 1}: ${decision.option_text}</h4>`;
        html += `<span class="risk-level" style="background-color: ${riskColor}">${decision.risk_level}</span>`;
        html += `</div>`;
        
        if (decision.warning) {
            html += `<div class="decision-warning">⚠️ ${decision.warning}</div>`;
        }
        
        if (decision.wiki_notes) {
            html += `<div class="wiki-notes">📚 Wiki Notes: ${decision.wiki_notes}</div>`;
        }
        
        html += `<div class="outcomes-list">`;
        html += `<h5>Possible Outcomes:</h5>`;
        decision.outcomes.forEach(outcome => {
            html += `<div class="outcome-item">`;
            html += `<div class="outcome-header">`;
            html += `<span class="outcome-type">${outcome.type}:</span>`;
            html += `<span class="outcome-result">${outcome.result}</span>`;
            if (outcome.probability) {
                html += `<span class="outcome-probability">${outcome.probability}</span>`;
            }
            html += `</div>`;
            if (outcome.description) {
                html += `<div class="outcome-description">${outcome.description}</div>`;
            }
            html += `</div>`;
        });
        html += `</div>`;
        
        html += `</div>`;
        return html;
    }
    
    function createConsequencesSummary(event) {
        let html = `<div class="consequences-summary">`;
        html += `<h3>Overall Consequences Analysis</h3>`;
        
        if (event.consequences) {
            if (event.consequences.positive) {
                html += `<div class="consequence-category positive">`;
                html += `<h4>✅ Positive Outcomes</h4>`;
                event.consequences.positive.forEach(item => {
                    html += `<div class="consequence-item">${item}</div>`;
                });
                html += `</div>`;
            }
            
            if (event.consequences.negative) {
                html += `<div class="consequence-category negative">`;
                html += `<h4>⚠️ Negative Outcomes</h4>`;
                event.consequences.negative.forEach(item => {
                    html += `<div class="consequence-item">${item}</div>`;
                });
                html += `</div>`;
            }
            
            if (event.consequences.catastrophic) {
                html += `<div class="consequence-category catastrophic">`;
                html += `<h4>💀 Catastrophic Risks</h4>`;
                event.consequences.catastrophic.forEach(item => {
                    html += `<div class="consequence-item">${item}</div>`;
                });
                html += `</div>`;
            }
        }
        
        html += `</div>`;
        return html;
    }
    
    function createRelationshipTree(event) {
        let html = `<div class="relationship-tree">`;
        html += `<h3>Event Relationships</h3>`;
        
        // Wiki-style technical information
        if (event.mtth_factors || event.dlc_requirements || event.wiki_categories) {
            html += `<div class="tree-section wiki-technical">`;
            html += `<h4>📚 Wiki Information</h4>`;
            
            if (event.dlc_requirements) {
                html += `<div class="tree-item technical">DLC: ${event.dlc_requirements}</div>`;
            }
            
            if (event.mtth_factors) {
                html += `<div class="tree-item technical">MTTH: ${event.mtth_factors}</div>`;
            }
            
            if (event.wiki_categories) {
                html += `<div class="tree-item technical">Categories: ${event.wiki_categories.join(', ')}</div>`;
            }
            
            html += `</div>`;
        }
        
        if (event.prerequisites && event.prerequisites.length > 0) {
            html += `<div class="tree-section">`;
            html += `<h4>⬆️ Prerequisites</h4>`;
            event.prerequisites.forEach(req => {
                html += `<div class="tree-item prerequisite">${req}</div>`;
            });
            html += `</div>`;
        }
        
        if (event.followup_events && event.followup_events.length > 0) {
            html += `<div class="tree-section">`;
            html += `<h4>⬇️ Follow-up Events</h4>`;
            event.followup_events.forEach(followup => {
                html += `<div class="tree-item followup">${followup}</div>`;
            });
            html += `</div>`;
        }
        
        if (event.event_chain) {
            html += `<div class="tree-section">`;
            html += `<h4>🔗 Event Chain</h4>`;
            html += `<div class="tree-item chain">${event.event_chain}</div>`;
            html += `</div>`;
        }
        
        // Community strategy notes
        if (event.community_strategy) {
            html += `<div class="tree-section">`;
            html += `<h4>🎯 Community Strategy</h4>`;
            html += `<div class="tree-item strategy">${event.community_strategy}</div>`;
            html += `</div>`;
        }
        
        html += `</div>`;
        return html;
    }
    
    function getResearchIcon(researchType) {
        switch(researchType) {
            case 'physics': return '🔬';
            case 'society': return '🏛️';
            case 'engineering': return '⚙️';
            default: return '🔍';
        }
    }
    
});