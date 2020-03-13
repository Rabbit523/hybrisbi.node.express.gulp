app.controller('customerAnalysis', ['$scope', '$http', '$chartJs',function($scope, $http, $chartJs) {

		//initiates all tooltips
		$scope.tooltips();
		//initiates full page scroll
		$scope.fullPageScroll();  

        $scope.customers = [];
        $scope.tams = [];
        $scope.pms = [];
        $scope.partners = [];
        $scope.datacenters = [];
        $scope.userType = 'TAM';
		$scope.regions = [{"region": "APJ"}, {"region": "EMEA"}, {"region": "GCR"}, {"region": "LAC"}, {"region": "MEE"}, {"region": "NA"}, {"region": ""}];
        $scope.editions = [{"edition":"Hybris Hosting"},{"edition":"Edge"},{"edition":"PPV"},{"edition":"Cores Standard"},{"edition":"Cores Professional"},{"edition":"Cores Enterprise"},{"edition":"Revenue Standard"},{"edition":"Revenue Professional"},{"edition":"Revenue Enterprise"},{"edition":""}];
        
        //retrieve projects
        $http.get("/api/customers/getCodes")
			.success(function(data) {
				$scope.customers =  $.map(data.tables, function(value) {return value.VAL;});
		});
		//retrieve possible pms
        $http.get("/api/users/getUsers?role=PM") 
        .success(function(data) {
            $scope.pms = $.map(data, function(value) {return {id: value.EMPLOYEE_ID,name: value.VAL};});
        });
		//retrieve possible tams
        $http.get("/api/users/getUsers?role=TAM") 
        .success(function(data) {
            $scope.tams = $.map(data, function(value) {return {id: value.EMPLOYEE_ID,name: value.VAL};});
        });
        //retrieve partners
        $http.get("/api/customers/getPartners") 
        .success(function(data) {
            $scope.partners = $.map(data, function(value, index) {return {id:index,name:value.VAL};});
        });
        //get dcs
        $http.get("/api/customers/getDCs") 
        .success(function(data) {
            $scope.datacenters = data;
        });
        
        $scope.worldMapDraw = function(countryData){
            var map = {};
            function findCountryData(d){
                return countryData.find(function(e){return e.COUNTRY === d.properties.name;});
            }
        	function color(d){
        	    var country = findCountryData(d);
                if(country !== undefined){
                    if(country.CNT < 5){
                      return "rgba(0, 143, 211,0.6)";
                    }
                    else if(country.CNT < 10){
                      return "rgba(0, 143, 211,0.7)";  
                    }
                    else if(country.CNT < 15){
                      return "rgba(0, 143, 211,0.8)";  
                    }
                    else if(country.CNT < 20){
                      return "rgba(0, 143, 211,0.9)";  
                    }
                    else{
                      return "rgba(0, 143, 211,1)";  
                    }
                }else{
                    return "rgba(128, 128, 128,0.4)";
                }

        	}
        	function mouseover(d){
                var xPosition = d3.event.pageX + 5;
                var yPosition = d3.event.pageY + 5;
    					
        	    d3.select("#treeMapToolTip")
    				.style("left", xPosition + "px")
    				.style("top", yPosition + "px")
    				.style("z-index", "1000");
    						
    			d3.select("#treeMapToolTip #title").text( d.properties.name);
    			var country = findCountryData(d);
    			if(country !== undefined){
    			    d3.select("#treeMapToolTip #value").text(country.CNT + " Customers ");
    			}else{
    			   d3.select("#treeMapToolTip #value").text("0 Customers "); 
    			}
    			d3.select("#treeMapToolTip #percent").text("");
    			d3.select("#treeMapToolTip").classed("hidden", false);
        	}
            function mouseout(){d3.select("#treeMapToolTip").classed("hidden", true);}
        	function drawMap(){
        	    //sizing + empty previous
        	    $("#map-container").empty();
                var chartHolder = d3.select("#map-container");
                var width = chartHolder.node().getBoundingClientRect().width;
            	var height = chartHolder.node().getBoundingClientRect().height;
            	
            	//create svg 
            	var svg = d3.select("#map-container")
                    .append("svg")
                    .attr("width", width)
                    .attr("height", height)
                    .append('g')
                    .attr('class', 'map');
                
                //geo projections    
                var projection = d3.geoMercator().translate( [width / 2, height / 1.5]);
            	var path = d3.geoPath().projection(projection);
            	
        	    svg.append("g")
                    .attr("class", "countries")
                .selectAll("path")
                  .data(map.features)
                .enter().append("path")
                  .attr("d", path)
                  .style("fill", function(d) { return color(d); })
                  .style('stroke', 'white')
                  .style('stroke-width', 1.5)
                  .style("opacity",0.8)
                  .on('mouseover',mouseover)
                  .on('mouseout',mouseout)
                  
            
                svg.append("path")
                  .datum(topojson.mesh(map.features, function(a, b) { return a.id !== b.id; }))
                  .attr("class", "names")
                  .attr("d", path);
        	}
        	
        	$http.get("./assets/resources/worldMap.json").success(function(data){
                map = data;
                drawMap();
                $('#d3ChartContainer').resize(drawMap);
        	});
            //window size redraw
			$scope.$on('$routeChangeStart', function() {
    		    $('#d3ChartContainer').removeResize(drawMap);
	        });
        }
        
        $scope.dcSankeyDraw = function(data){
            
            function color(name){
                if(name === 'HYBRIS'){return "#F0AB00";}
                else if(name === 'LIVE'){return "#4FB81C";}
                else if(name === 'PROJECT'){return "#E35500";}
                else{return "#008FD3";}
            }
            function label(d){
                return d.name;
            }
            function highlightNode(node){highlightLinks(node,0.5);}
            
            function clearHighlightNode(node){highlightLinks(node,0.2);}
            
            function highlightLink(id,opacity){d3.select("#link-" + id).style("stroke-opacity", opacity);}
            function highlightLinks(node,opacity){
                var remainingNodes = [];
                var nextNodes = [];   
                                            
                var traverse = [{linkType : "sourceLinks",nodeType : "target"},{linkType : "targetLinks",nodeType : "source"}];
                    
                traverse.forEach(function(step){
                    node[step.linkType].forEach(function(link) {
                        remainingNodes.push(link[step.nodeType]);
                        highlightLink(link.id, opacity);
                    });
                    
                    while (remainingNodes.length) {
                        nextNodes = [];
                        remainingNodes.forEach(function(node) {
                            node[step.linkType].forEach(function(link) {
                                nextNodes.push(link[step.nodeType]);
                                    highlightLink(link.id, opacity);
                            });
                        });
                        remainingNodes = nextNodes;
                    }
                });
            }
          
            function focusLink(link){
                //increase opactiy
                d3.select(this).style("stroke-opacity", 0.5);
                //set positions
                var xPosition = d3.event.pageX + 5;
    			var yPosition = d3.event.pageY + 5;
    			d3.select("#treeMapToolTip")
    				.style("left", xPosition + "px")
    				.style("top", yPosition + "px")
    				.style("z-index", "1000");
    						
    			d3.select("#treeMapToolTip #title").text(link.source.name + " TO " + link.target.name);
    			d3.select("#treeMapToolTip #value").text(link.value + " CUSTOMERS");
    			d3.select("#treeMapToolTip #percent").text(((link.value / link.source.value) * 100).toFixed(1) + "% of " + link.source.name);
    			d3.select("#treeMapToolTip").classed("hidden", false);
            }
            function clearLink(){d3.select("#treeMapToolTip").classed("hidden", true);d3.select(this).style("stroke-opacity", 0.2);}
            
            function drawSankey(){
 
                //determine dimensions
                $("#dcMap").empty();
                var chartHolder = d3.select("#dcMap");
                var width = chartHolder.node().getBoundingClientRect().width;
            	var height = chartHolder.node().getBoundingClientRect().height;
        		
        	    //add svg element
            	d3.select("#dcMap").append("svg").attr("width", width).attr("height", height);
            	var svg = chartHolder.select("svg");
        		
                var sankey = d3.sankey().nodeWidth(40).nodePadding(10).extent([[1, 1], [width - 1, height - 6]]);
                
                var link = svg.append("g")
                    .attr("class", "links")
                    .attr("fill", "none")
                    .attr("stroke", "#000")
                    .attr("font-size", 12)
                    .attr("font-weight",900)
                    .attr("stroke-opacity", 0.2)
                    .selectAll("path");
                
                var node = svg.append("g")
                    .attr("class", "nodes")
                    .attr("font-family", "sans-serif")
                    .attr("font-size", 16)
                    .attr("font-weight",900)
                    .attr("fill","#0000005e")
                    .selectAll("g");
                    
                sankey(data);

                link = link
                    .data(data.links)
                    .enter().append("g");

                    
                link.append("path")
                    .attr("d", d3.sankeyLinkHorizontal())
                    .attr("stroke-width", function(d) { return Math.max(1, d.width); })
                    .attr("id", function(d,i){d.id = i;return "link-" + i;})
                    .on("mousemove",focusLink)
                    .on("mouseout",clearLink);
    
                node = node
                    .data(data.nodes)
                    .enter().append("g");
            
                node.append("rect")
                    .attr("x", function(d) { return d.x0; })
                    .attr("y", function(d) { return d.y0; })
                    .attr("height", function(d) { return d.y1 - d.y0; })
                    .attr("width", function(d) { return d.x1 - d.x0; })
                    .attr("fill", function(d) { return color(d.name); })
                    .attr("stroke", function(d) { return color(d.name); })
                    .on("mouseover",highlightNode)
                    .on("mouseout",clearHighlightNode);
    
                node.append("text")
                    .attr("x", function(d) { return d.x0 - 6; })
                    .attr("y", function(d) { return (d.y1 + d.y0) / 2; })
                    .attr("dy", "0.35em")
                    .attr("text-anchor", "end")
                    .text(function(d) { return d.name; })
                   .filter(function(d) { return d.x0 < width / 2; })
                    .attr("x", function(d) { return d.x1 + 6; })
                    .attr("text-anchor", "start");
                         
            }
            
            drawSankey();
            //window size redraw
			$('#d3ChartContainer2').resize(drawSankey);
			$scope.$on('$routeChangeStart', function() {
    		    $('#d3ChartContainer2').removeResize(drawSankey);
	        });
        };
        
        $scope.byUserDisplay = function(type){

            $scope.userType = type;
            var queryParams = [
                new QueryParam("userType", $scope.userType),
                new QueryParam("regions", $scope.REGIONS, "region"),
                new QueryParam("editions", $scope.EDITIONS, "edition"),
                new QueryParam("customers", $scope.PROJS, { substring: [0, 3] }),
                new QueryParam("pms", $scope.PMS,'name'),
                new QueryParam("tams", $scope.TAMS,'name'),
                new QueryParam("partners", $scope.PARTNERS,"name"),
                new QueryParam("dc", $scope.DCS,"VAL")
            ];
            
            var mainUrl = "/api/report/customers/";
            var usersData = new URLBuilder(mainUrl + "getUsersCnt", queryParams).toString();
            $http.get(usersData).success(function(data){
                $scope.usersData = data;
                $scope.usersCnt = data.length;
                $scope.usersAvgCust = (data.map(function(x){return x.CUSTOMERS;}).reduce(function(ac,i){ return ac + parseInt(i);},0) / data.length).toFixed(1);
                $scope.usersChart = $chartJs.barChartOneSet(data,"Customers by User",false);
                $scope.usersChart.options.title.display = false;
                $scope.usersChart.options.legend.display = false;
                $scope.usersChart.options.scales = {yAxes: [{ticks: {min: 0}}]};
                $scope.usersChart.data.datasets[0].datalabels.display = true;
            });
        };
		$scope.loadData = function() {
            var queryParams = [
                new QueryParam("regions", $scope.REGIONS, "region"),
                new QueryParam("editions", $scope.EDITIONS, "edition"),
                new QueryParam("customers", $scope.PROJS, { substring: [0, 3] }),
                new QueryParam("pms", $scope.PMS,'name'),
                new QueryParam("tams", $scope.TAMS,'name'),
                new QueryParam("partners", $scope.PARTNERS,"name"),
                new QueryParam("dc", $scope.DCS,"VAL")
            ];
            
             var mainUrl = "/api/report/customers/";
            var overview = new URLBuilder(mainUrl + "getOverview", queryParams).toString();
            var countryData = new URLBuilder(mainUrl + "getCountryCnt", queryParams).toString();
            var dcMap = new URLBuilder(mainUrl + "getDcMap", queryParams).toString();
            var dcData = new URLBuilder(mainUrl + "getDcCnt", queryParams).toString();
            var editionData = new URLBuilder(mainUrl + "getEditionCnt", queryParams).toString();
            $http.get(overview).success(function(data){
                $scope.overview = data;
            });
            $http.get(countryData).success(function(data){
                $scope.countryData = data;
                $scope.worldMapDraw(data);
            });
            $http.get(dcMap).success(function(data){
                $scope.dcSankeyDraw(data);
            });
            $http.get(dcData).success(function(data){
                $scope.dcData = data;
            });
            $http.get(editionData).success(function(data){
                $scope.editionsData = data;
                $scope.editionsCnt  = data.length;
                $scope.editionsChart = $chartJs.barChartOneSet(data,"Customers by Edtion",false);
                $scope.editionsChart.options.title.display = false;
                $scope.editionsChart.options.legend.display = false;
            });
            $scope.byUserDisplay($scope.userType);
		};
		$scope.loadData();

    }]);