var countByState = [];
var case_data = [];
var resolved_cases = [];
var active_cases = [];

$.get( "http://projects.chronicle.com/titleix/api/v1/cases/", function( data ) {
	
	for(var i = 0; i < data.length; i++){
		
		case_data.push(data[i]);
		
		if(data[i].status == 'resolved') {
			resolved_cases.push(data[i]);
		} else if (data[i].status == 'active') {
			active_cases.push(data[i]);
		}
	}
	
	$('#cases-nationwide').empty().append(
		'<div class="stat"><h4><span class="num">' + case_data.length + '</span><br>Total Cases</h4></div>' +
		'<div class="stat"><h4><span class="num">' + active_cases.length + '</span><br>Total Cases</h4></div>' +
		'<div class="stat"><h4><span class="num">' + resolved_cases.length + '</span><br>Total Cases</h4></div>'
	)
	
});

// MAP FUNCTION

var drawMap = function(){

	var width = 960;
	var height = 500;

	var projection = d3.geo.albersUsa()
					   .translate([width/2, height/2])
					   .scale([1000]);
        
	var path = d3.geo.path()
					 .projection(projection); 

	var color = d3.scale.linear()
						.range(["rgb(213,222,217)","rgb(69,173,168)","rgb(84,36,55)","rgb(217,91,67)"]);

	var svg = d3.select("#inner-map")
				.append("svg")
				.attr("width", width)
				.attr("height", height);
        
/*
	var div = d3.select("body")
			    .append("div")   
	    		.attr("class", "tooltip")               
	    		.style("opacity", 0);
*/


	d3.json("_assets/us-states.json", function(json) {

		svg.selectAll("path")
			.data(json.features)
			.enter()
			.append("path")
			.attr("d", path)
			.style("stroke", "#fff")
			.style("stroke-width", "1")
			.on("click", function(d){
				selectStateData(d.properties);
			});
			
	});
}
drawMap();

var selectStateData = function(state) {
	
	var url = 'http://projects.chronicle.com/titleix/api/v1/cases/?state_abbrev=' + state.abbrev;
	
	$('#cases-at-college').empty();

	
	$.get( url, function( data ) {
		
		if(data.length > 1) {
			
			
			$('#cases-in-state').empty().append(
				'<h3>Cases In<br><span class="large">' + state.name + '</span></h3>' + 
				'<div class="row">' +
				'<div class="col">' +  
				'<p><b>College Name</b></p>'+
				'</div>' +
				'<div class="col">' +  
				'<p><b>Case Status</b></p>'+
				'</div>' +
				'<div class="col">' +  
				'<p><b>Date Opened</b></p>'+
				'</div>' +
				'</div>'
			);
			
			for(var i = 0; i < data.length; i++){
				
				$('#cases-in-state').append(
					'<div class="row" onclick="selectCollegeData(' + data[i].college_unitid + ');">' +
					'<div class="col">' +  
					'<p>' + data[i].college + '</p>'+
					'</div>' +
					'<div class="col">' +  
					'<p>' + data[i].status + '</p>'+
					'</div>' +
					'<div class="col">' +  
					'<p>' + data[i].opened + '</p>'+
					'</div>' +
					'</div>'
				);
	
			}
		
			$('html,body').animate({
	        	scrollTop: $("#cases-in-state").offset().top},
	        'slow');
	        
		} else {
			
			$('#cases-in-state').empty().append(
				'<h3>No Data For<br><span class="large">' + state.name + '</h3>' 
			);
			
			$('html,body').animate({
	        	scrollTop: $("#cases-in-state").offset().top},
	        'slow');

		}
	});
}

//selectStateData('NC');

var selectCollegeData = function(id) {
	
	var url = 'http://projects.chronicle.com/titleix/api/v1/colleges/?college_unitid=' + id;
	
	var active_cases_state = [];
	var resolved_cases_state = [];
	
	$.get( url, function( data ) {
		
		$('#cases-at-college').empty().append(
			'<h3>Case Stats For<br><span class="large">' + data[0].college_name + '</span></h3>' +
			'<div id="college-graph"><div id="inner-college-graph"></div>'
		)
		
		for(var i = 0; i < active_cases.length; i++){
			if(active_cases[i].college_unitid == id) {
				active_cases_state.push(active_cases[i]);
			}
		}
		
		for(var i = 0; i < resolved_cases.length; i++){
			if(resolved_cases[i].college_unitid == id) {
				resolved_cases_state.push(resolved_cases[i]);
			}
		}
		
		var average_case_length;
		
		if(resolved_cases_state.length !== 0) {
			var total_case_length = 0;
		
			for(var i = 0; i < resolved_cases_state.length; i++) {
				
				var start = Date.parse(resolved_cases_state[i].opened);
				var end = Date.parse(resolved_cases_state[i].closed);
				
				var difference =  Math.round((end - start) / (1000*60*60*24));
				total_case_length += difference;
			}
			
			average_case_length = total_case_length / resolved_cases_state.length + ' Days';
		} else {
			average_case_length = '<i>No Resolved Case Data</i>'
		}
		
/*
		var cases = [];
				
		for(var i = 0; i < data[0].cases.length; i++){
			
			var caseUrl = 'http://projects.chronicle.com/titleix/api/v1/cases/?case_id=' + data[0].cases[i];
						
			$.get( caseUrl, function( data ){
				
				cases.push(data[0]);
				
			});
		}
		
		var average_length = 0;

		// Calculate Case Length Average HERE
		
		console.log(active);
*/			
		drawBarGraph(resolved_cases_state.length, active_cases_state.length);
	
		$('#cases-at-college').append(
			'<p>Total Number of Cases: ' + data[0].cases.length + ' <span class="divider"> </span>Average Case Length: ' + average_case_length + '</p>' + 
			'<a class="btn outline" target="_blank" href="https://projects.chronicle.com/titleix/campus/' + data[0].college_name.replace("&", "-and-").replace(/\s+/g, '-').replace(/[,+()$~%.'":*?<>{}]/g,'') +'">Learn More</a>'
		)
		
		$('html,body').animate({
        	scrollTop: $("#cases-at-college").offset().top},
        'slow');

	});
}

var drawBarGraph = function(value1, value2){
	var data = [
		{
			"name": "Resolved Cases",
            "value": value1,
        },
        {
            "name": "Active Cases",
            "value": value2,
        }];

    //sort bars based on value
    data = data.sort(function (a, b) {
        return d3.ascending(a.value, b.value);
    })

        //set up svg using margin conventions - we'll need plenty of room on the left for labels
    var margin = {
        top: 15,
        right: 25,
        bottom: 15,
        left: 100
    };

    var width = parseInt(d3.select("#inner-college-graph").style("width")) - margin.left - margin.right,
    	height = (parseInt(d3.select("#inner-college-graph").style("width")) * .3) - margin.top - margin.bottom;

    var svg = d3.select("#inner-college-graph").append("svg")
        //.attr("width", width + margin.left + margin.right)
        //.attr("height", height + margin.top + margin.bottom)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .attr("viewBox", "0 0 750 225")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scale.linear()
        .range([0, width])
        .domain([0, d3.max(data, function (d) {
            return d.value;
        })]);

    var y = d3.scale.ordinal()
        .rangeRoundBands([height, 0], .1)
        .domain(data.map(function (d) {
            return d.name;
        }));

    //make y axis to show bar names
    var yAxis = d3.svg.axis()
        .scale(y)
        .tickSize(0)
        .orient("left");

    var gy = svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)

    var bars = svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("g")

    //append rects
    bars.append("rect")
        .attr("class", "bar")
        .attr("y", function (d) {
            return y(d.name);
        })
        .attr("height", y.rangeBand())
        .attr("x", 0)
        .attr("width", 0)
        .transition()
        .duration(1500)
        .attr("width", function (d) {
            return x(d.value);
        });

    //add a value label to the right of each bar
    bars.append("text")
        .attr("class", function (d) { if(d.value == 0){ return "label zero"; } else { return "label"; } })
        //y position of the label is halfway down the bar
        .attr("y", function (d) {
            return y(d.name) + y.rangeBand() / 2 + 15;
        })
        //x position is 3 pixels to the right of the bar
        .attr("x", function (d) {
	        if(d.value == 0){ return x(d.value) + 35; }
	        else { return x(d.value) - 15; }
            
        })
        .text(function (d) {
            return d.value;
        });
        
	function resize() { }
	
	d3.select(window).on('resize', resize);
}