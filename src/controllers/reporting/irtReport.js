//tam time tracking dashboard
app.controller('irtReport', ['$scope', '$http', '$chartJs',
    function($scope, $http, $chartJs) {

		//initiates all tooltips
		$scope.tooltips();
		//initiates full page scroll
		$scope.fullPageScroll();  

		var date = new Date();
		$scope.startDate = new Date(date.getFullYear(), 0, 1).toISOString().slice(0, 10);
		$scope.endDate = new Date(date.getFullYear() + 1, 0, 1).toISOString().slice(0, 10);
        $scope.customers = [];
		$scope.regions = [{"region": "APJ"}, {"region": "EMEA"}, {"region": "GCR"}, {"region": "LAC"}, {"region": "MEE"}, {"region": "NA"}, {"region": ""}];

        $http.get("/api/customers/getCodes")
			.success(function(data) {
				$scope.customers =  $.map(data.tables, function(value) {return value.VAL;});
		});
		
		$scope.loadData = function() {
            var queryParams = [
                new QueryParam("startDate", $scope.startDate),
                new QueryParam("endDate", $scope.endDate),
                new QueryParam("regions", $scope.REGIONS, "region"),
                new QueryParam("customers", $scope.PROJS, { substring: [0, 3] })
            ];
            
            var mainUrl = "/api/report/irt/";
            var getIrt = new URLBuilder(mainUrl + "getIrt", queryParams).toString();
            var getIrtTotals = new URLBuilder(mainUrl + "getIrtTotals", queryParams).toString();
            var getIrtByCustTotals = new URLBuilder(mainUrl + "getIrtByCust", queryParams).toString();
            var getIrtComplianceTrend = new URLBuilder(mainUrl + "getIrtComplianceTrend", queryParams).toString();
			$http.get(getIrt)
				.success(function(data) {
				    $scope.irtData = data;
                    $scope.irtChart = $chartJs.lineChart($scope.irtData,"IRT By Month","top",false,true,true);
                    $scope.irtChart.options.legend.display = false;
				});
			$http.get(getIrtTotals)
				.success(function(data) {
				    $scope.irtTotals = data;
				    $scope.irtTotals.breachPercent = (($scope.irtTotals.avgNonCompliant / $scope.irtTotals.customers) * 100).toFixed(2);
				});
		    $http.get(getIrtComplianceTrend)
				.success(function(data) {
				    $scope.irtTrendData = data;
                    $scope.irtTrendChart = $chartJs.lineChart($scope.irtTrendData,"Compliance Trend","top",false,true,false);
                    $scope.irtTrendChart.data.datasets[0].borderColor = "#E21600";
                    $scope.irtTrendChart.data.datasets[0].backgroundColor = "rgba(226, 22, 0, 0.5)";
                    $scope.irtTrendChart.options.legend.display = false;
				});
			$http.get(getIrtByCustTotals)
				.success(function(data) {
				    $scope.customerComplianceData = data;
				    var chartHolder = d3.select("#byCustChart");
				    var vis;
				    $scope.totalSize = 0; 
				    var defLbl;
				    
				    //coloring function
				    function sunBurstColor(d){
				        var name = d.data.name;
				        //top level colors;
                        if(name === "IRT Compliant"){
                            return "#18BA00";
                        }
                        if(name === "IRT Breach"){
                           return "#E21600"; 
                        }
                        if(name !== "root"){
                        var parent = d.parent.data.name;
                        if(parent === "IRT Compliant"){
                            return "#1CDD00";
                        }
                        if(parent === "IRT Breach"){
                           return "#FF5442"; 
                        }
                            
                        }
                    }    
                    
                    //tree parse
				    var root = d3.hierarchy(data)
                        .sum(function(d) { return d.size; })
                        .sort(function(a, b) { return b.value - a.value; });
       
                    //arc calculations
                    var arc = d3.arc()
                        .startAngle(function(d) { return d.x0; })
                        .endAngle(function(d) { return d.x1; })
                        .innerRadius(function(d) { return Math.sqrt(d.y0); })
                        .outerRadius(function(d) { return Math.sqrt(d.y1); });    
   
                    //Fade everything but selection
                    function mouseover(d) {
                        var label = "";
                        
                        if(d.data.name === 'IRT Compliant' || d.data.name === 'IRT Breach'){
                           label = (100 * d.value / $scope.totalSize).toPrecision(3) + "% " + d.data.name;  
                        }else{
                           label = d.data.name + "\n" + d.data.IRT + "% IRT"; 
                        }
                    
                        d3.select("#sunburst-label").text(label);
                    
                        var sequenceArray = d.ancestors().reverse();
                        sequenceArray.shift(); // remove root node from the array

                        // Fade all the segments.
                        vis.selectAll("path").style("opacity", 0.3);
                    
                        //highlight selected
                        vis.selectAll("path")
                            .filter(function(node) {
                                return (sequenceArray.indexOf(node) >= 0);
                            })
                            .style("opacity", 1);
                    }
                    
                    // Restore everything to full opacity when moving off the visualization.
                    function mouseleave() {
                        vis.selectAll("path").on("mouseover", null);
                        
                        //full opacity activate
                        vis.selectAll("path")
                          .transition()
                          .duration(100)
                          .style("opacity", 1)
                          .on("end", function() {
                                d3.select(this).on("mouseover", mouseover);
                            });
                            
                        d3.select("#sunburst-label").text(defLbl);
                    }
                    
				    var drawSunBurst = function(){
				        $("#byCustChart").empty();
                        $("#byCustChart").append('<div id="label-holder" class="sunburst-center-label"><span id="sunburst-label"></span><br/></div>');
            
    				    var width = chartHolder.node().getBoundingClientRect().width;
    				    var height = chartHolder.node().getBoundingClientRect().height;
    				    var radius = Math.min(width, height) / 2;
    				    
    				    var partition = d3.partition()
                            .size([2 * Math.PI, radius * radius]);
                            
						//create viz root
						vis = d3.select("#byCustChart").append("svg:svg")
                            .attr("width", width)
                            .attr("height", height)
                            .append("svg:g")
                            .attr("id", "container")
                            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
                        
                        vis.append("svg:circle")
                            .attr("r", radius)
                            .style("opacity", 0);
                        
                        var nodes = partition(root).descendants();
                            
                        var path = vis.data([data]).selectAll("path")
                            .data(nodes)
                            .enter().append("svg:path")
                            .attr("display", function(d) { return d.depth ? null : "none"; })
                            .attr("d", arc)
                            .attr("stroke","#fff")
                            .attr("fill-rule", "evenodd")
                            .style("fill", function(d) { return sunBurstColor(d); })
                            .style("opacity", 1)
                            .on("mouseover", mouseover);
                        
                        d3.select("#byCustChart").on("mouseleave", mouseleave);
                        $scope.totalSize = path.datum().value;
                        defLbl = (100 * root.children[0].value / $scope.totalSize).toPrecision(3) + "% " + root.children[0].data.name;  
                        d3.select("#sunburst-label").text(defLbl);
				    };

				    //window size redraw
					$('#d3ChartContainer').resize(drawSunBurst);
				    $scope.$on('$routeChangeStart', function() {
    		            $('#d3ChartContainer').removeResize(drawSunBurst);
	                });
				});
		};
		$scope.loadData();

    }]);