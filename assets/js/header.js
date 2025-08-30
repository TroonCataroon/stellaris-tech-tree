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
        let html = `<div class="stellaris-event-card ${eventTypeClass}">`;
        
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