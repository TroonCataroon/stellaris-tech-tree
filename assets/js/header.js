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
        
        // Cache the events data for consequence analysis
        window.eventsCache = eventsData;
        
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
        
        // Add expand/collapse functionality for event cards
        $('.expand-button').click(function(e) {
            e.stopPropagation();
            const card = $(this).closest('.stellaris-event-card');
            const decisions = card.find('.event-decisions');
            
            if (decisions.is(':visible')) {
                decisions.slideUp(300);
                $(this).text('📋');
                card.removeClass('expanded');
            } else {
                // Close other expanded cards
                $('.stellaris-event-card.expanded .event-decisions').slideUp(300);
                $('.stellaris-event-card.expanded .expand-button').text('📋');
                $('.stellaris-event-card').removeClass('expanded');
                
                // Expand this card
                decisions.slideDown(300);
                $(this).text('📖');
                card.addClass('expanded');
                
                // Show consequence analysis in side panel
                showConsequenceAnalysis(card.data('event-id'));
            }
        });
        
        // Click event for decision options
        $(document).on('click', '.decision-option', function() {
            $('.decision-option').removeClass('selected');
            $(this).addClass('selected');
            
            const card = $(this).closest('.stellaris-event-card');
            const eventId = card.data('event-id');
            const decisionIndex = $(this).index();
            
            highlightConsequences(eventId, decisionIndex);
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
        html += `<div class="expand-button">📋</div>`;
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
        
        if (event.chapters || event.excavation_data?.length) {
            html += `<div class="stat-item">`;
            html += `<span class="stat-icon">⛏️</span>`;
            html += `<span class="stat-value">${event.chapters || event.excavation_data?.length || 0}</span>`;
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
        
        // Collapsible decision section
        html += createDecisionSection(event);
        
        html += `</div>`;
        return html;
    }
    
    function createDecisionSection(event) {
        if (!event.decisions && !event.outcomes) {
            return '';
        }
        
        let html = `<div class="event-decisions" style="display: none;">`;
        html += `<div class="decisions-header">`;
        html += `<h4>📋 Available Options</h4>`;
        html += `</div>`;
        
        // If event has explicit decisions (like anomaly.40)
        if (event.decisions && event.decisions.length > 0) {
            event.decisions.forEach((decision, index) => {
                html += `<div class="decision-option" data-risk="${decision.risk_level?.toLowerCase() || 'unknown'}">`;
                html += `<div class="decision-header">`;
                html += `<span class="decision-title">${decision.option_text || decision.option_name}</span>`;
                html += `<span class="risk-indicator ${decision.risk_level?.toLowerCase() || 'unknown'}">${decision.risk_level || 'Unknown Risk'}</span>`;
                html += `</div>`;
                
                if (decision.outcomes && decision.outcomes.length > 0) {
                    html += `<div class="decision-outcomes">`;
                    decision.outcomes.forEach(outcome => {
                        const probability = outcome.probability || '100%';
                        html += `<div class="outcome-item">`;
                        html += `<span class="outcome-type ${outcome.type}">${getOutcomeIcon(outcome.type)}</span>`;
                        html += `<span class="outcome-text">${outcome.result}</span>`;
                        html += `<span class="outcome-probability">${probability}</span>`;
                        html += `</div>`;
                    });
                    html += `</div>`;
                }
                
                html += `</div>`;
            });
        } 
        // If event has simple outcomes (like basic anomalies)
        else if (event.outcomes && event.outcomes.length > 0) {
            html += `<div class="simple-outcomes">`;
            html += `<h5>Possible Outcomes:</h5>`;
            event.outcomes.forEach(outcome => {
                html += `<div class="outcome-item">`;
                html += `<span class="outcome-weight">Weight: ${outcome.weight}%</span>`;
                html += `<span class="outcome-result">${outcome.result}</span>`;
                html += `</div>`;
            });
            html += `</div>`;
        }
        
        html += `</div>`;
        return html;
    }
    
    function getOutcomeIcon(type) {
        const icons = {
            'resource': '💰',
            'research': '🔬',
            'artifacts': '🏺',
            'deposit': '⛏️',
            'modifier': '📊',
            'planetary': '🌍',
            'special_project': '🚀',
            'event_chain': '⛓️',
            'nothing': '❌',
            'risk': '⚠️'
        };
        return icons[type] || '❓';
    }
    
    function getResearchIcon(researchType) {
        switch(researchType) {
            case 'physics': return '🔬';
            case 'society': return '🏛️';
            case 'engineering': return '⚙️';
            default: return '🔍';
        }
    }
    
    // Consequence analysis functions
    window.showConsequenceAnalysis = function(eventId) {
        console.log("Showing consequence analysis for:", eventId);
        
        // Find the event in our data
        let eventData = null;
        let categoryData = null;
        
        Object.keys(window.eventsCache || {}).forEach(category => {
            const event = window.eventsCache[category].find(e => e.id === eventId);
            if (event) {
                eventData = event;
                categoryData = category;
            }
        });
        
        if (!eventData) return;
        
        createSidePanel();
        updateSidePanelContent(eventData, categoryData);
    };
    
    function createSidePanel() {
        if ($('#consequence-panel').length > 0) return;
        
        const panel = `
            <div id="consequence-panel" class="consequence-side-panel">
                <div class="panel-header">
                    <h3>📊 Consequence Analysis</h3>
                    <button class="close-panel">✖</button>
                </div>
                <div class="panel-content">
                    <div id="event-summary"></div>
                    <div id="decision-tree"></div>
                    <div id="risk-assessment"></div>
                    <div id="recommendations"></div>
                </div>
            </div>
        `;
        
        $('body').append(panel);
        
        $('.close-panel').click(function() {
            $('#consequence-panel').removeClass('open');
            setTimeout(() => $('#consequence-panel').remove(), 300);
        });
    }
    
    function updateSidePanelContent(event, category) {
        const panel = $('#consequence-panel');
        
        // Event Summary
        let summaryHtml = `
            <div class="analysis-section">
                <h4>📋 Event Overview</h4>
                <div class="event-meta">
                    <span class="event-id">ID: ${event.id}</span>
                    <span class="event-category">${event.category}</span>
                    <span class="event-type">${event.type || 'Standard'}</span>
                </div>
                <p class="event-desc">${event.description}</p>
            </div>
        `;
        $('#event-summary').html(summaryHtml);
        
        // Risk Assessment
        let riskHtml = `<div class="analysis-section">
            <h4>⚠️ Risk Assessment</h4>`;
        
        if (event.decisions) {
            event.decisions.forEach((decision, index) => {
                const riskClass = decision.risk_level?.toLowerCase() || 'unknown';
                riskHtml += `
                    <div class="risk-item ${riskClass}">
                        <span class="risk-label">${decision.option_text || decision.option_name}</span>
                        <span class="risk-level ${riskClass}">${decision.risk_level || 'Unknown'}</span>
                    </div>
                `;
            });
        } else if (event.outcomes) {
            riskHtml += `<div class="outcome-probabilities">`;
            event.outcomes.forEach(outcome => {
                riskHtml += `<div class="prob-item">
                    <span class="prob-weight">${outcome.weight}%</span>
                    <span class="prob-result">${outcome.result}</span>
                </div>`;
            });
            riskHtml += `</div>`;
        }
        
        riskHtml += `</div>`;
        $('#risk-assessment').html(riskHtml);
        
        // Decision Tree (simplified)
        let treeHtml = `
            <div class="analysis-section">
                <h4>🌳 Decision Flow</h4>
                <div class="decision-tree">
                    <div class="tree-node root">
                        <span class="node-title">${event.name}</span>
        `;
        
        if (event.decisions) {
            event.decisions.forEach((decision, index) => {
                treeHtml += `
                    <div class="tree-branch">
                        <div class="branch-decision">${decision.option_text || decision.option_name}</div>
                `;
                if (decision.outcomes) {
                    decision.outcomes.forEach(outcome => {
                        treeHtml += `<div class="branch-outcome">${outcome.result}</div>`;
                    });
                }
                treeHtml += `</div>`;
            });
        }
        
        treeHtml += `</div></div></div>`;
        $('#decision-tree').html(treeHtml);
        
        // Recommendations
        let recHtml = `
            <div class="analysis-section">
                <h4>💡 Recommendations</h4>
                <div class="recommendations-list">
        `;
        
        if (event.community_strategy) {
            recHtml += `<div class="rec-item community">
                <span class="rec-label">Community Strategy:</span>
                <span class="rec-text">${event.community_strategy}</span>
            </div>`;
        }
        
        // Add generic recommendations based on event type
        if (category === 'anomalies') {
            recHtml += `<div class="rec-item general">
                <span class="rec-label">General Tip:</span>
                <span class="rec-text">Anomalies are generally safe to investigate and provide valuable research or resources.</span>
            </div>`;
        } else if (category === 'crisis_events') {
            recHtml += `<div class="rec-item warning">
                <span class="rec-label">Critical:</span>
                <span class="rec-text">Crisis events require immediate galactic coordination and massive military preparation.</span>
            </div>`;
        }
        
        recHtml += `</div></div>`;
        $('#recommendations').html(recHtml);
        
        panel.addClass('open');
    }
    
    window.highlightConsequences = function(eventId, decisionIndex) {
        console.log("Highlighting consequences for decision:", decisionIndex, "of event:", eventId);
        // This function could highlight specific outcomes in the side panel
        const selectedDecision = $('.decision-option.selected');
        selectedDecision.addClass('analyzing');
    };
    
    // Store events data for later use
    window.eventsCache = {};
    
});