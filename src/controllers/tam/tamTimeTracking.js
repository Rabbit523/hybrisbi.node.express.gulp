//tam time tracking dashboard
app.controller('tamTimeTracking', ['$scope', '$http', '$chartJs',
    function($scope, $http, $chartJs) {
    
		//initiates all tooltips
    	$scope.tooltips();
    	//initiates full page scroll
    	$scope.fullPageScroll(); 
		$scope.tams = [];
		$scope.projects = [];

		$scope.regions = [
			{
			"region": "APJ"
        }, {
			"region": "EMEA"
        }, {
			"region": "GCR"
        }, {
			"region": "LAC"
        }, {
			"region": "MEE"
        }, {
			"region": "NA"
        }, {
			"region": ""
        }];

        var dashboardTour = {
          id: "tamDashboardTour",
          steps: [
            {
              title: "My Header",
              content: "test",
              target: "#filters",
              placement: "right"
            },
            {
              title: "My content",
              content: "Here is where I put my content.",
              target: document.querySelector("#content p"),
              placement: "bottom"
            }
          ]
        };
    
        // Start the tour!
        $scope.infoTour = function(){
            hopscotch.startTour(dashboardTour); 
        }

        
		$scope.topN = [
			{
				"val": "All",
				"text": "All"
			},
			{
				"val": "5",
				"text": "Top 5"
			},
			{
				"val": "10",
				"text": "Top 10"
			},
			{
				"val": "15",
				"text": "Top 15"
			}
        ];
		//normal var not working for this specific case ?????
		$scope.top = {};
		$scope.top.val = "5";
		// 
		$scope.getTopTotalHours = function() {

			var queryParams = [
                new QueryParam("top", $scope.top.val),
                new QueryParam("startDate", $scope.startDate),
                new QueryParam("endDate", $scope.endDate),
                new QueryParam("tams", $scope.TAMS, "id"),
                new QueryParam("projects", $scope.PROJS, {substring: [0, 3]}),
                new QueryParam("regions", $scope.REGIONS, "region")
            ],
				getTopTotalHoursByProjectUrl = new URLBuilder("/api/tam/timeTracking/getTopTotalHoursByProject", queryParams).toString();

			//project hours by project
			$http.get(getTopTotalHoursByProjectUrl)
				.success(function(data) {
					var datasets = [
                        [], // labels
							{ //ADMs
								label: "ADM",
								data: [],
								borderColor: colors[0],
								backgroundColor: colors[0]
                        },
							{ // INCs
								label: "INC",
								data: [],
								borderColor: "#808080",
								backgroundColor: "#808080"
                        }
                    ],
						datasets2 = [
							{
								name: 'ADM',
								labels: [],
								values: []
                            },
							{
								name: 'INC',
								labels: [],
								values: []
                            }
                        ];
                        
                    $scope.projectHrsBreakdownData = [];

					$.map(data, function(value, index) {
						datasets[0].push(value["PROJECT"]);
						datasets[1].data.push(value["ADM"]);
						datasets[2].data.push(value["INC"]);

						datasets2[0].labels.push(value["PROJECT"]);
						datasets2[1].labels.push(value["PROJECT"]);
						datasets2[0].values.push(value["ADM"]);
						datasets2[1].values.push(value["INC"]);
						
						$scope.projectHrsBreakdownData.push({
						    project: value["PROJECT"],
						    adm: value["ADM"],
						    inc: value["INC"]
						});
					});

					var customerHours = 0,
						admHours = 0,
						incHours = 0;
					$.map(data, function(value, index) {
						customerHours += value["GRAND_TOTAL"];
						admHours += value["ADM"];
						incHours += value["INC"];
					});

					$scope.customerHours = customerHours;
					$scope.admHours = admHours;
					$scope.incHours = incHours;

					$scope.projectHrsBreakdown = datasets2;
					$scope.projectHrsChart = $chartJs.stackedChart(datasets, 'Project Hours By Project', 'left');
				});
		};

		$scope.loadData = function() {
			var queryParams = [
                new QueryParam("startDate", $scope.startDate),
                new QueryParam("endDate", $scope.endDate),
                new QueryParam("tams", $scope.TAMS, "id"),
                new QueryParam("projects", $scope.PROJS, {
						substring: [0, 3]
					}),
                new QueryParam("regions", $scope.REGIONS, "region")
            ],
				mainUrl = "/api/tam/timeTracking/",
				getFullTimeBreakdownUrl = new URLBuilder(mainUrl + "getFullTimeBreakdown", queryParams).toString(),
				getUsersUrl = new URLBuilder(
					"/api/users/getUsers",
					queryParams.concat(new QueryParam("role", "TAM"))).toString(),
				getOverallAdministrativeByTypeOfActivityUrl = new URLBuilder(mainUrl + "getOverallAdministrativeByTypeOfActivity", queryParams).toString(),
				getNumberOfCustomerByTamUrl = new URLBuilder(mainUrl + "getNumberOfCustomerByTam", queryParams).toString(),
				getNumberOfProjectsByTamUrl = new URLBuilder(mainUrl + "getNumberOfProjectsByTam", queryParams).toString(),
				getCustomerCodesUrl = new URLBuilder("/api/customers/getCodes").toString(),
				getTotalHoursByProjectUrl = new URLBuilder(mainUrl + "getTotalHoursByProject", queryParams).toString();

			//full time breakdown pie chart
			$http.get(getFullTimeBreakdownUrl)
				.success(function(data) {
					$scope.fullTimeRaw = $.map(data.totalTimeSpentPerTask, function(value, index) {
						return [value];
					});
					//removes the employee key 
					$scope.fullTimeBreakdown = _.map(_.groupBy($scope.fullTimeRaw, 'TASK'), function(entry) {
						return {
							TASK: entry[0].TASK,
							VAL: _.reduce(_.pluck(entry, 'VAL'), function(sum, num) {
								return sum + num;
							}, 0)
						};
					});
					//get total hrs count
					$scope.fullTimeHrs = _.reduce(_.pluck($scope.fullTimeRaw, 'TOTAL_HOURS'), function(sum, num) {
						return sum + num;
					}, 0);
					//get tams count
					$scope.fullTimeTAMs = data.numOfTams; //Object.keys(_.groupBy($scope.fullTimeRaw, 'EMPLOYEE_ID')).length;
					$scope.businessHrs = getBusinessDays($scope.startDate, $scope.endDate) * 8 * $scope.fullTimeTAMs;
					$scope.fteHrs = ($scope.fullTimeHrs / $scope.businessHrs).toFixed(2);
					//time per tam
					$scope.fullTimePerTAMs = ($scope.fullTimeHrs / $scope.fullTimeTAMs).toFixed(2);
					$scope.fullTimeBreakdownChart = $chartJs.pieChart($scope.fullTimeBreakdown, "Total Time Spent In Selected Period", 'left', false);

				});

			//project hours breakdown 
			$scope.getTopTotalHours();

// 			//retrieve possible tams
	$http.get("/api/customers/getCodes")
		.success(function(data) {
			$scope.projects = $.map(data.tables, function(value) {
				return value.VAL;
			});
	});
            
            $scope.getUsers("TAM", (data) => { $scope.tams = data });
            
			// overall administrative by type of activity pie chart
			$http.get(getOverallAdministrativeByTypeOfActivityUrl)
				.success(function(data) {
					$scope.overallAdministrativeByTypeOfActivityRaw = $.map(data, function(value, index) {
						return [value];
					});

					$scope.overallAdministrativeByTypeOfActivity = _.map(_.groupBy($scope.overallAdministrativeByTypeOfActivityRaw, 'TYPE'), function(
						entry) {
						return {
							TYPE: entry[0].TYPE,
							NUM_OF_ACTVTS: entry[0].NUM_OF_ACTVTS
						};
					});

					$scope.overallAdministrativeByTypeOfActivityChart = $chartJs.pieChart($scope.overallAdministrativeByTypeOfActivity,
						'Overall Administrative by Type of Activity', 'left', false);
				});

			// customer by tam pie chart
			$http.get(getNumberOfCustomerByTamUrl)
				.success(function(data) {
					var customerCount = 0;
					$scope.customerbyTamRaw = $.map(data, function(value, index) {
						return [value];
					});

					$scope.customerbyTam = _.map(_.groupBy($scope.customerbyTamRaw, 'TAM'), function(entry) {
						customerCount += Number.parseInt(entry[0].NUM_OF_CUSTOMERS);
						return {
							TAM: entry[0].TAM,
							NUM_OF_CUSTOMERS: entry[0].NUM_OF_CUSTOMERS
						};
					});

					$scope.customerCount = customerCount;

					$scope.customerbyTamChart = $chartJs.pieChart($scope.customerbyTam, 'Live Customers by TAM', 'left', false);
				});

			// projects by tam pie chart
			$http.get(getNumberOfProjectsByTamUrl)
				.success(function(data) {
					var projectsCount = 0;
					$scope.projectsByTamRaw = $.map(data, function(value, index) {
						return [value];
					});

					$scope.projectsByTam = _.map(_.groupBy($scope.projectsByTamRaw, 'TAM'), function(entry) {
						projectsCount += Number.parseInt(entry[0].NUM_OF_PROJS);
						return {
							TAM: entry[0].TAM,
							NUM_OF_PROJS: entry[0].NUM_OF_PROJS
						};
					});

					$scope.projectsCount = projectsCount;

					$scope.projectsByTamChart = $chartJs.pieChart($scope.projectsByTam, 'Live Projects by TAM', 'left', false);
				});

			// get all projects
 			$http.get(getCustomerCodesUrl).success(function(data) {
 					$scope.projects = $.map(data.tables, function(value) {
 						return value.VAL;
					});
				});

			// totalHoursByProject
			$http.get(getTotalHoursByProjectUrl)
				.success(function(data) {
					var totalCustomerHours = 0,
						projectsCount = 0;
					$scope.totalHoursByProjRaw = $.map(data, function(value, index) {
						totalCustomerHours += value["GRAND_TOTAL"];
						projectsCount++;

						return [value];
					});
					$scope.totalCustomerHours = totalCustomerHours;
					$scope.projectsCount = projectsCount;

					//removes the employee key 
					$scope.totalHoursByProject = _.map(_.groupBy($scope.totalHoursByProjRaw, 'PROJECT'), function(entry) {
						return {
							PROJECT: entry[0].PROJECT,
							GRAND_TOTAL: _.reduce(_.pluck(entry, 'GRAND_TOTAL'), function(sum, num) {
								return sum + num;
							}, 0)
						};
					});

					$scope.totalHoursByProjectChart = $chartJs.pieChart($scope.totalHoursByProject, 'Total Hours by Project', 'left');

					//D3 TREEMAP SAMPLE

					//convert to acceptable tree
					var tree = {
						name: 'top',
						children: $.map(data, function(d) {
							return [{
								name: d.PROJECT,
								size: d.GRAND_TOTAL
							}]
						})
					};
					//d3 hierarchy remap
					var root = d3.hierarchy(tree)
						.eachBefore(function(d) {
							d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name;
						})
						.sum(function(d) {
							return d.size
						})
						.sort(function(a, b) {
							return b.height - a.height || b.value - a.value;
						});

					//mouse over functions 
					var mousemove = function(d) {
						d3.select(this).style("background", "#808080");
						var xPosition = d3.event.pageX + 5;
						var yPosition = d3.event.pageY + 5;
						d3.select("#treeMapToolTip")
							.style("left", xPosition + "px")
							.style("top", yPosition + "px")
							.style("z-index", "1000");
						d3.select("#treeMapToolTip #title")
							.text(d.data.name);
						d3.select("#treeMapToolTip #value")
							.text(d.data.size + " Hours");
						d3.select("#treeMapToolTip #percent")
							.text(((d.data.size / totalCustomerHours) * 100).toFixed(1) + "%");
						d3.select("#treeMapToolTip").classed("hidden", false);
					};

					var mouseout = function() {
						d3.select("#treeMapToolTip").classed("hidden", true);
						d3.select(this).style("background", "#F0AB00");
					};

					var svg = d3.select("#projectHrsTreeMap");

					//draw
					function drawTreeMap() {
						$("#projectHrsTreeMap").empty();
						var width = svg.node().getBoundingClientRect().width;
						var height = svg.node().getBoundingClientRect().height;
						//base definition
						var treemap = d3.treemap()
							.size([width, height])
							.round(true)
							.paddingInner(1);

						treemap(root);
						var cell = svg.selectAll(".node")
							.data(root.leaves())
							.enter().append("div")
							.attr("class", "node")
							.style("box-sizing", "border-box")
							.style("position", "absolute")
							.style("overflow", "hidden")
							.style("left", function(d) {
								return d.x0 + "px";
							})
							.style("top", function(d) {
								return d.y0 + "px";
							})
							.style("width", function(d) {
								return d.x1 - d.x0 + "px";
							})
							.style("height", function(d) {
								return d.y1 - d.y0 + "px";
							})
							.style("background", "#F0AB00")
							.on("mousemove", mousemove)
							.on("mouseout", mouseout);

						cell.append("div")
							.style("padding", "4px")
							.style("padding-top", "2px")
							.style("line-height", "1em")
							.style("white-space", "pre")
							.style("color", "#fff")
							.style("font-size", "24")
							.style("font-weight", "700")
							.text(function(d) {
								return ((d.data.size / totalCustomerHours) * 100).toFixed(1) >= 0.5 ? d.data.name.split(/(?=[A-Z][^A-Z])/g) : '';
							});

						cell.append("div")
							.style("padding", "4px")
							.style("line-height", "1em")
							.style("white-space", "pre")
							.style("color", "#fff")
							.style("font-size", "18")
							.text(function(d) {
								return ((d.data.size / totalCustomerHours) * 100).toFixed(1) >= 0.5 ? ((d.data.size / totalCustomerHours) * 100).toFixed(1) +
									"%" : '';
							});
					}
					//wind size re draw
					window.addEventListener("resize", drawTreeMap);

					drawTreeMap();
            		$scope.$on('$routeChangeStart', function() {
                		window.removeEventListener("resize", drawTreeMap);
            	    });
				});

		};

		$http.get("/api/tam/timeTracking/getMaxDate").success(function(data){
            var date = new Date(data.replace(/-/g, '\/'));
            $scope.startDate = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().slice(0, 10);
            $scope.endDate = date.toISOString().slice(0, 10);
            $scope.loadData();
        });

    }]);