var countByState = [];

$.get( "http://projects.chronicle.com/titleix/api/v1/cases/?status=active", function( data ) {
	
	for(var i = 0; i < data.length; i++){
		
/*
		for(var i = 0; i < countByState; i++){
			if(countByState[i].includes(data[i].state_abbrev) == false){
				num = 1;
				countByState.push({ state: data[i].state_abbrev, count: num });
			}
		}
*/
		
/*
		if(countByState.includes(data[i].state_abbrev) == false){
			num = 1;
			countByState.push({ state: data[i].state_abbrev, count: num });
		} 
*/	
	}
	
});

// console.log(countByState);

// MAP FUNCTION

var drawMap = function(){
	var width = 960;
	var height = 500;
	
	var projection = d3.geo.albersUsa()
		.translate([width/2, height/2])
		.scale([1000]);
	
	var path = d3.geo.path()
		.projection(projection);
		
	var svg = d3.select("#map")
		.append("svg")
		.attr("width", width)
		.attr("height", height);
}

var selectStateData = function(state) {
	
	var url = 'http://projects.chronicle.com/titleix/api/v1/cases/?status=active&state_abbrev=' + state;
	
	$.get( url, function( data ) {
		
		$('#cases-in-state').append(
			'<h3>Active Cases In<br><span class="large">' + data[0].state_name + '</span></h3>' + 
			'<div class="row" disabled>' +
			'<div class="col">' +  
			'<p><b>College Name</b></p>'+
			'</div>' +
			'<div class="col">' +  
			'<p><b>Sector</b></p>'+
			'</div>' +
			'<div class="col">' +  
			'<p><b>Date Opened</b></p>'+
			'</div>' +
			'</div>'
		)
		
		for(var i = 0; i < data.length; i++){
		
			$('#cases-in-state').append(
				'<div class="row" onclick="selectCollegeData(' + data[i].college_unitid + ');">' +
				'<div class="col">' +  
				'<p>' + data[i].college + '</p>'+
				'</div>' +
				'<div class="col">' +  
				'<p>' + data[i].sector + '</p>'+
				'</div>' +
				'<div class="col">' +  
				'<p>' + data[i].opened + '</p>'+
				'</div>' +
				'</div>'
			);
		}
	
		// ADD SCROLL TO #cases-in-state DIV
		
	});
}

selectStateData('NC');

var selectCollegeData = function(id) {
	
	var url = 'http://projects.chronicle.com/titleix/api/v1/colleges/?college_unitid=' + id;
	
	$.get( url, function( data ) {
		
		$('#cases-at-college').empty().append(
			'<h3>Case Stats For<br><span class="large">' + data[0].college_name + '</span></h3>' +
			'<div id="college-graph"></div>'
		)
		var cases = [];
		var resolvedCases = [];
		var active_cases = [];
		
		for(var i = 0; i < data[0].cases.length; i++){
			
			var caseUrl = 'http://projects.chronicle.com/titleix/api/v1/cases/?case_id=' + data[0].cases[i];
						
			$.get( caseUrl, function( data ){
				cases.push(data[0]);
				if(data[0].status == 'resolved'){
					resolvedCases.push(data[0]);
				} else if (data[0].status == 'active'){
					active_cases.push(data[0]);
				}
	
			});
		}
		
		var average_length = 0;

		// Calculate Case Length Average HERE
		
		
		//drawBarGraph(resolvedCases, active_cases);
		
		$('#cases-at-college').append(
			'<p><b>Total Number of Cases: </b>' + data[0].cases.length + ' <span class="divider"> </span> <b>Average Case Length: </b>' + 2 + ' Days</p>' + 
			'<a class="btn outline" target="_blank" href="https://projects.chronicle.com/titleix/campus/' + data[0].college_name.replace("&", "-and-").replace(/\s+/g, '-').replace(/[,+()$~%.'":*?<>{}]/g,'') +'">Learn More</a>'
		)
	});
}

var drawBarGraph = function(resolved, active){
}