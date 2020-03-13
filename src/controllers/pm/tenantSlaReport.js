//tenantSlaReport page controller
app.controller('tenantSlaReport', ['$scope', '$http', '$chartJs',function($scope, $http, $chartJs) {
	
	//initiates all tooltips
    $scope.tooltips();
    //initiates full page scroll
    $scope.fullPageScroll(); 

    $scope.sankeyToggle = true;
    
	$scope.regions = [{"region": "APJ"}, {"region": "EMEA"}, {"region": "GCR"}, {"region": "LAC"}, {"region": "MEE"}, {"region": "NA"}, {"region": ""}];
	$scope.environments = [{ENV_ID:"1",ENV_TYPE:"DEV"},{ENV_ID:"2",ENV_TYPE:"STG"},{ENV_ID:"3",ENV_TYPE:"PROD"}];
	$scope.customers = [];
	var date = new Date();
    $scope.topN = [{"val": "5","text": "Top 5"},{"val": "10","text": "Top 10"},{"val": "15","text": "Top 15"},{"val": "20","text": "Top 20"}];
    $scope.topCustomer = "20";
    
    //tour content and add info
	var tourContent = [
            {
                element: "",
                title: "Tenant SLO Dashboard Information",
                content: "<p>This page shows Tenant Onboarding details </p>" + 
                "<p>Three set of Environments are delivered to a Tenant(DEV/STG/PROD) and SLO(Service Level Objective) must be acheived</p>" + 
                "<p>To see a full tour of the controls on this page click 'next' otherwise click 'end tour'</p>"
            },
            {
                element: "#filters",
                title: "Data Filters",
                content: "use the date inputs or multi select fields to filter data"
            },
            {
                element: "#navigation",
                title: "View Navigation",
                content: "Click to navigate between different views or scroll up down",
                placement: "bottom"
            },
            {
                element: "#cview",
                title: "Current Data View",
                content: "Indicates the current view being shown",
                placement: "bottom"
            },
            {
                element: "#summaryView",
                title: "Summary View",
                content: "This tabs provides a summary of information for the current view" + 
                "<p> The number of tenants is also tabulated </p>" ,
                placement: "top"
            },
            {
                element: "#mainView",
                title: "Main View",
                content: "This is where the main data view is shown",
                placement: "top"
            }
        ];
	//define tour for this page for info button

	var tour = $scope.createTour(tourContent);
	
	//info button binding
    $scope.infoTour = function(){ 
        tour.init();
        tour.restart();
    };
    
    //default to current entire year
    $scope.startDate = new Date(date.getFullYear() - 1, 0, 1).toISOString().slice(0, 10);
    $scope.endDate = new Date(date.getFullYear(), 0, 1).toISOString().slice(0, 10);
    
    // all customers
    $http.get("./api/customers/getCodes")
        .success(function(data) {
            $scope.customers =  $.map(data.tables, function(val) {return val.VAL;});
            $scope.totalnumberofcustomers = $scope.customers.length;
        });
        	
    $scope.getTopSlaDelaysByCustomer = function(){
        var queryParams = [
            new QueryParam("top", $scope.topCustomer),
            new QueryParam("type", $scope.sloType),
            new QueryParam("startDate", $scope.startDate),
            new QueryParam("endDate", $scope.endDate),
            new QueryParam("regions", $scope.REGIONS, "region"),
            new QueryParam("customers", $scope.PROJS, { substring: [0, 3] }),
            new QueryParam("env", $scope.ENVS,"ENV_ID")
        ];
        
        var mainUrl = "/api/pm/tenantsSLO/";
        var getTopSlaDelaysByCustomerUrl = new URLBuilder(mainUrl + "getTopSlaDelaysByCustomer", queryParams).toString(); 
        
        
        $http.get(getTopSlaDelaysByCustomerUrl).success(function(data) {
            
            $scope.slaCust = $.map(data, function(value) {
                return [value];});
            //get number of customercount
            $scope.numberofCustomers = Object.keys(_.groupBy($scope.slaCust,'PROJECTCODES')).length;
            //get total hrs count
            $scope.TotalSla = _.reduce(_.pluck($scope.slaCust, 'DAYS'), function(sum, num){ return sum + num; }, 0);
            $scope.slaDelaysByCustomer = $chartJs.barChartOneSet($scope.slaCust, "SLA Delays by Customer", false);
            $scope.averagedays = Math.round( $scope.TotalSla / $scope.numberofCustomers);
            $scope.slaDelaysByCustomer.options.title.display = false;
            $scope.slaDelaysByCustomer.options.legend.display = false;
        }); 
    };
    
    $scope.drawSankeyChart = function(dcMap){

        $http.get(dcMap).success(function(data){
            
                //sankey drawing function
                var drawSankey = function(){
 
                    //determine dimensions
                    $("#sankeyChart").empty();
                    var chartHolder = d3.select("#sankeyChart");
                    var width = chartHolder.node().getBoundingClientRect().width;
            		var height = chartHolder.node().getBoundingClientRect().height;
        		
        		    //add svg element
            		d3.select("#sankeyChart").append("svg").attr("width", width).attr("height", height);
            		var svg = chartHolder.select("svg");
        		
                    var sankey = d3.sankey()
                        .nodeWidth(40)
                        .nodePadding(10)
                        .extent([[1, 1], [width - 1, height - 6]]);
                
                    var link = svg.append("g")
                        .attr("class", "links")
                        .attr("fill", "none")
                        .attr("stroke", "#000")
                        .attr("stroke-opacity", 0.2)
                        .selectAll("path");
                
                    var node = svg.append("g")
                        .attr("class", "nodes")
                        .attr("font-family", "sans-serif")
                        .attr("font-size", 16)
                        .attr("font-weight",900)
                        .attr("fill","#0000005e")
                        .selectAll("g");
              
              
                    function colorFn(name){
                        if(name === 'TENANTS'){
                            return "#F0AB00";
                        }
                        else if(name.includes('OFFTARGET')){
                            return "#E21600";
                        }
                        else if(name.includes('ONTARGET')){
                            return "#18BA00";
                        }
                        else if(name.includes('NA')){
                            return "#808080";
                        }
                        else{
                            return "#008fd3";
                        }
                    }
                    function labelFn(name){
                        if(name === 'OFFTARGET' || name === 'ONTARGET' || name === 'NA'){
                            return "";
                        }else{
                            return name;
                        }
                    }
                    function highlightLink(id,opacity){
                        d3.select("#link-" + id).style("stroke-opacity", opacity);
                    }
                
                    function highlightLinks(node,opacity){
                        var remainingNodes = [];
                        var nextNodes = [];   
                                            
                        var traverse = [
                            {linkType : "sourceLinks",nodeType : "target"},
                            {linkType : "targetLinks",nodeType : "source"}
                        ];
                    
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
                    function highlightNode(node){
                        highlightLinks(node,0.5);
                    }
                    function clearHighlightNode(node){
                         highlightLinks(node,0.2);
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
    						
    					d3.select("#treeMapToolTip #title")
    						.text(link.source.name + " TO " + link.target.name);
    					d3.select("#treeMapToolTip #value")
    						.text(link.value + " TENANTS");
    					d3.select("#treeMapToolTip #percent")
    						.text(((link.value / link.source.value) * 100).toFixed(1) + "% of " + link.source.name);
    					d3.select("#treeMapToolTip").classed("hidden", false);
                    }
                    function clearLink(link){
                        d3.select("#treeMapToolTip").classed("hidden", true);
                        d3.select(this).style("stroke-opacity", 0.2);
                    }
                    sankey(data);

                    link = link
                        .data(data.links)
                        .enter().append("path")
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
                        .attr("fill", function(d) { return colorFn(d.name); })
                        .attr("stroke", function(d) { return colorFn(d.name); })
                        .on("mouseover",highlightNode)
                        .on("mouseout",clearHighlightNode);
    
                    node.append("text")
                        .attr("x", function(d) { return d.x0 - 6; })
                        .attr("y", function(d) { return (d.y1 + d.y0) / 2; })
                        .attr("dy", "0.35em")
                        .attr("text-anchor", "start")
                        .text(function(d) { return labelFn(d.name); })
                        .attr("x", function(d) { return d.x1 + 6; });
            };
            drawSankey();
            //window size redraw
			$('#d3ChartContainer').resize(drawSankey);
			$scope.$on('$routeChangeStart', function() {
    		    $('#d3ChartContainer').removeResize(drawSankey);
	        });
        });
    };
    
    //main data load function
	$scope.loadData = function(type) {
        $scope.sloType = type ? type:$scope.sloType;
		var queryParams = [
            new QueryParam("startDate", $scope.startDate),
            new QueryParam("type", $scope.sloType),
            new QueryParam("endDate", $scope.endDate),
            new QueryParam("regions", $scope.REGIONS, "region"),
            new QueryParam("customers", $scope.PROJS, { substring: [0, 3] }),
            new QueryParam("env", $scope.ENVS,"ENV_ID")
        ];
        if($scope.ENVS !== undefined){
            $scope.showDEV = $scope.ENVS.some(function(d) {
                return d.ENV_TYPE === 'DEV';
            });

            $scope.showSTG = $scope.ENVS.some(function(d) {
                return d.ENV_TYPE === 'STG';
            });
            $scope.showPROD = $scope.ENVS.some(function(d) {
                return d.ENV_TYPE === 'PROD';
            });
        }
        var mainUrl = "/api/pm/tenantsSLO/";
        var overviewMain =  new URLBuilder(mainUrl + "getOverviewBreakdown", queryParams).toString();
        var overviewByMonth =  new URLBuilder(mainUrl + "getOverviewByMonth", queryParams).toString();
        var overviewByMonthWithTenants =  new URLBuilder(mainUrl + "getOverviewByMonthWithTenants", queryParams).toString();
        var delaysByDc =  new URLBuilder(mainUrl + "getDataByDC", queryParams).toString();
        var dcMap =  new URLBuilder(mainUrl + "getDcMap", queryParams).toString();
        var delaysByReason = new URLBuilder(mainUrl + "getSLAByReason", queryParams).toString();

        $http.get(overviewMain).success(function(data){
            $scope.slaProd = data.prod;
			$scope.slaStg = data.stg;
			$scope.slaDev = data.dev;
        });
        
        $http.get(overviewByMonthWithTenants).success(function(data){
           
            $scope.overviewByMonthChart = {
            data:{
                    labels: data.map(function (a) {
					    return a.TS;
					    
				    }),
				    datasets:[
				    	{
				            label:"On Target",
				            data:data.map(function (a) {
        					    return a.ONTARGET ;
        				    }),
        				    backgroundColor:"rgba(79, 184, 28,0.6)",
        				    borderColor:"#4FB81C"
				        },
				        {
				            label:"Off Target",
				            data:data.map(function (a) {
        					    return a.OFFTARGET ;
        				    }),
        				    backgroundColor:"rgba(226, 22, 0, 0.3)",
        				    borderColor:"#E21600"
				        },
				        {
				            label:"NA",
				            data:data.map(function (a) {
        					    return a.NA;
        				    }),
        				    backgroundColor: "rgba(128, 128, 128,0.2)",
        				    borderColor:"#808080"
				        }
				    
				    ]
                },
                options:{
                    title:{display:true, text:"SLA By Date",fontSize:18,fontColor:"#333",padding:20},
                    legend:{display:false},
                    responsive: true, 
                    maintainAspectRatio:false,
                    scales: {
                        xAxes: [{
                            stacked: true
                        }],
                        yAxes: [{
                            stacked: true,
                            ticks: {
                                min: 0,
                                max: 100,
                                callback: function(value) {
                                    return value + "%";
                                }
                            }
                        }]
                    },
                    plugins: {
        			    datalabels: {
        			        color:"white",
            				backgroundColor: function(context) {
        						return context.dataset.borderColor;
        					},
        					borderRadius: 4,
            				display: function(context) {
            					return context.dataset.data[context.dataIndex] > 5;
            				},
            				font: {weight:"bold"},
            				formatter: Math.round
        			    }
			        }
                }
                
            };

            var dataLabelsBar = {
        		color: "white",
        		anchor:"end",
        		align:"start",
        		display: function(context) {
        			return context.dataset.data[context.dataIndex] > 5;
        		},
        		font: {weight:"bold"},
        		formatter: Math.round
    		};
            $scope.overviewByMonthChartWithTenants = {
                data:{
                    labels: data.map(function (a) {
					    return a.TS;
				    }),
				    datasets:[
				        {   
				            type : 'line' ,
				            label:"Tenants Count",
				            pointStyle: 'line',
				            data:data.map(function (a) {
        					    return a.TENANTS;
        				    }),
        				    yAxisID: "TenantsCnt",
        				    borderRadius: 1,
        				    backgroundColor : "black",
        				    borderColor:"black",
        				    fill:false,
        				    datalabels: {
            					backgroundColor: function(context) {
            						return context.dataset.borderColor;
            					},
            					display:function(context) {
                    					return context.dataset.data[context.dataIndex] > 0;
                    			},
            					borderRadius: 4,
            					color: 'white',
            					font: {
            						weight: 'bold'
            					},
            					formatter: Math.round
				            }
				        },
				    	{
				            label:"% On Target",
				            data:data.map(function (a) {
        					    return a.ONTARGET;
        					    
        				    }),
        				    backgroundColor:"rgb(79, 184, 28)",
        				    borderColor:"#4FB81C",
        				    datalabels:dataLabelsBar
				        },
				        {
				            label:"% Off Target",
				            data:data.map(function (a) {
        					    return a.OFFTARGET ;
        					   
        				    }),
        				    backgroundColor:"rgb(226, 22, 0)",
        				    borderColor:"#E21600",
        				    datalabels:dataLabelsBar
				        },
				        {
				            label:"% NA",
				            data:data.map(function (a) {
        					    return a.NA;
        					   
        				    }),
        				    backgroundColor: "rgb(128, 128, 128)",
        				    borderColor:"#808080",
        				    datalabels:dataLabelsBar
				        }
				        
				        
				    ]
                },
                options:{
                    title:{display:true,fontSize:18,fontColor:"#333",padding:20},
                    legend:{display:true},
                    labels: {
                     usePointStyle: true
                     },
                    responsive: true, 
                    maintainAspectRatio:false,
                    scales: {
                        xAxes: [{
                            stacked: false
                        }],
                        yAxes: [{
                            stacked: false,
                            ticks: {
                                min: 0,
                                max: 100,
                                callback: function(value) {
                                        return value + "%";
                                    }
                                }
                        },    
                        {
                            usePointStyle: true,
                            id: 'TenantsCnt',
                            type: 'linear',
                            position: 'right',
                            scaleLabel: {
    		                    display: true,
    		                    labelString: 'Tenant Count'
		                    },
		                    gridLines:{
		                        display:false
		                    }
                      }]
                    }
                }
                
            };
        });
/*
       //bar and line type chart mixed to show the number of tenants with targets
        $http.get(overviewByMonthWithTenants).success(function(data){
            var dataLabelsBar = {
        		color: "white",
        		anchor:"end",
        		align:"start",
        		display: function(context) {
        			return context.dataset.data[context.dataIndex] > 5;
        		},
        		font: {weight:"bold"},
        		formatter: Math.round
    		};
            $scope.overviewByMonthChartWithTenants = {
                data:{
                    labels: data.map(function (a) {
					    return a.TS;
				    }),
				    datasets:[
				        {   
				            type : 'line' ,
				            label:"Tenants Count",
				            pointStyle: 'line',
				            data:data.map(function (a) {
        					    return a.TENANTS;
        				    }),
        				    yAxisID: "TenantsCnt",
        				    borderRadius: 1,
        				    backgroundColor : "black",
        				    borderColor:"black",
        				    fill:false,
        				    datalabels: {
            					backgroundColor: function(context) {
            						return context.dataset.borderColor;
            					},
            					display:function(context) {
                    					return context.dataset.data[context.dataIndex] > 0;
                    			},
            					borderRadius: 4,
            					color: 'white',
            					font: {
            						weight: 'bold'
            					},
            					formatter: Math.round
				            }
				        },
				    	{
				            label:"% On Target",
				            data:data.map(function (a) {
        					    return a.ONTARGET;
        					    
        				    }),
        				    backgroundColor:"rgb(79, 184, 28)",
        				    borderColor:"#4FB81C",
        				    datalabels:dataLabelsBar
				        },
				        {
				            label:"% Off Target",
				            data:data.map(function (a) {
        					    return a.OFFTARGET ;
        					   
        				    }),
        				    backgroundColor:"rgb(226, 22, 0)",
        				    borderColor:"#E21600",
        				    datalabels:dataLabelsBar
				        },
				        {
				            label:"% NA",
				            data:data.map(function (a) {
        					    return a.NA;
        					   
        				    }),
        				    backgroundColor: "rgb(128, 128, 128)",
        				    borderColor:"#808080",
        				    datalabels:dataLabelsBar
				        }
				        
				        
				    ]
                },
                options:{
                    title:{display:true,fontSize:18,fontColor:"#333",padding:20},
                    legend:{display:true},
                    labels: {
                     usePointStyle: true
                     },
                    responsive: true, 
                    maintainAspectRatio:false,
                    scales: {
                        xAxes: [{
                            stacked: false
                        }],
                        yAxes: [{
                            stacked: false,
                            ticks: {
                                min: 0,
                                max: 100,
                                callback: function(value) {
                                        return value + "%";
                                    }
                                }
                        },    
                        {
                            usePointStyle: true,
                            id: 'TenantsCnt',
                            type: 'linear',
                            position: 'right',
                            scaleLabel: {
    		                    display: true,
    		                    labelString: 'Tenant Count'
		                    },
		                    gridLines:{
		                        display:false
		                    }
                      }]
                    }
                }
                
            };
        });
       */
        $scope.getTopSlaDelaysByCustomer();


        //get delays by DC
		$http.get(delaysByDc).success(function(data) {
					var datasets = [
                        [], // labels
							{ //ONTARGET
								label: "ONTARGET",
								data: [],
								backgroundColor:"#4FB81C",
        				        borderColor:"#4FB81C"
                        },
							{ // OFFTARGET
								label: "OFFTARGET",
								data: [],
								backgroundColor:"#E21600",
        				        borderColor:"#E21600"
                        },
							{ // NA
								label: "NA",
								data: [],
								backgroundColor: "#808080",
        				        borderColor:"#808080"
                        }
                    ];

                    var grandTotal = 0,
						ontargetTotal = 0,
						offtargetTotal = 0,
						naTotal = 0;
						
					$.map(data, function(value, index) {
						datasets[0].push(value["DATACENTER"]);
						datasets[1].data.push(value["ONTARGET"]);
						datasets[2].data.push(value["OFFTARGET"]);
						datasets[3].data.push(value["NA"]);

						grandTotal += value["ONTARGET"] + value["OFFTARGET"] + value["NA"] ;
						ontargetTotal += value["ONTARGET"];
						offtargetTotal += value["OFFTARGET"];
						naTotal += value["NA"];
					});
                    
                    $scope.grandTotal = grandTotal;
					$scope.onTargetTotal = ontargetTotal;
					$scope.offTargetTotal = offtargetTotal;
					$scope.naTotal = naTotal;

					$scope.dcdata = $chartJs.stackedChart(datasets, "SLA Delays by DC", 'top');
				});
            
		//SLA - Reasons	
		$http.get(delaysByReason)
				.success(function(responsedata) {
						
					
					var slaReasonCountData = [];
					var slaReasonLabelData = [];

                    $.map(responsedata, function(value, index) {
						slaReasonCountData.push(value["REASON_COUNT"]);
						slaReasonLabelData.push(value["REASON_DESCRIPTION"]);
					});
					$scope.delayReasonCnt = slaReasonCountData.reduce(function(ac,i){ return ac + parseInt(i);},0);
					var data = {
                        datasets: [{
                            data: slaReasonCountData,
                            backgroundColor: colors,
                            label: 'Reason Analysis' // for legend
                        }],
                        labels: slaReasonLabelData
                    };
                $scope.delaysChart= $chartJs.pieChart(responsedata,'','left',false,true);
                var ctx = $("#slaReasonsChart");


				});
			
		$scope.drawSankeyChart(dcMap);	
		

	};
	$scope.loadData(2);
}]);