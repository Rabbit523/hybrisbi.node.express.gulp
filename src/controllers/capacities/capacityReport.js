//capacities Report controller
app.controller('capacityReport',['$scope','$http',function($scope,$http){

    $scope.tooltips();
    $scope.fullPageScroll();
    
    //base options
    $scope.stackedBarChartOptions = { 
        scales: {
            yAxes: [{
                stacked: true,
                ticks: {
                    beginAtZero: true,
                    fontSize: 16
                }
            }],
            xAxes: [{
                stacked: true,
                ticks: {
                    beginAtZero: true,
                    fontSize: 16
                }
            }]
        },
        legend:{ display:false},
        plugins: {
    		datalabels: {
    		    color: "white",
    		    display: function(context) {
    			    return context.dataset.data[context.dataIndex] > 10;
    			},
    			font: function(context) {
                    var width = context.chart.width;
                    var size = Math.round(width / 32);
                    return {
                        size: size,
                        weight: 600
                    };
                },
    			formatter: Math.round
    		}
		}
    };
    
    $scope.regions = [ {"region":"APJ"},{"region":"EMEA"},{"region":"GCR"},{"region":"LAC"},{"region":"MEE"},{"region":"NA"},{"region":""}];
    $scope.tableHeaders = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    $scope.employeeTypes = [];
    $scope.roles = [];
    $scope.subRoles = [];
    $scope.users = [];

    //filter initial values
    var d = new Date();
    $scope.year = d.getFullYear();

    
    //initial data loads
    $scope.initiate = function(){
        //get Users
        $http.get("./api/capacities/initiatives/getUsers") 
            .success(function(data) {
                $scope.users = data;
        });
        //get possible types
        $http.get("./api/capacities/initiatives/getEmployeeTypes") 
            .success(function(data) {
                $scope.employeeTypes = data;
        });
        //get possible roles
        $http.get("./api/capacities/initiatives/getRoles") 
            .success(function(data) {
                $scope.roles = data;
        });
        //get possible sub roles
        $http.get("./api/capacities/initiatives/getSubRoles") 
            .success(function(data) {
                $scope.subRoles = data;
        });
        //get possible years of data
        $http.get("./api/capacities/report/getYears") 
            .success(function(data) {
                $scope.years = data;
                $scope.years.push({'VAL':($scope.years[$scope.years.length - 1].VAL + 1)});
        });
        $scope.loadData();
        $scope.aRep = "Capacities Breakdown";
        $scope.cB = true;
    };
    //data retrieval
    $scope.loadData = function(){
    	
        var queryParams = [
            new QueryParam("year", $scope.year),
            new QueryParam("regions", $scope.region, "region"),
			new QueryParam("types", $scope.type, "EMPLOYEE_TYPE"),
			new QueryParam("roles", $scope.role, "ROLE"),
			new QueryParam("subRoles", $scope.subRole, "SUB_ROLE"),
			new QueryParam("users", $scope.user, "EMPLOYEE_ID")
        ];
        var mainUrl = "/api/capacities/report/";
        var breakdownUrl = new URLBuilder(mainUrl + "getBreakdown", queryParams).toString(); 
        var initiativesUrl = new URLBuilder(mainUrl + "getInitiatives", queryParams).toString(); 
        var totalsUrl = new URLBuilder(mainUrl + "getTotals", queryParams).toString(); 
        var headCountUrl = new URLBuilder(mainUrl + "getHeadCount", queryParams).toString(); 
        
        $http.get(breakdownUrl)
            .success(function(data) {
                $scope.capacityBreakdown = data;
        }); 
        $http.get(initiativesUrl)
            .success(function(data) {
                $scope.initiativesBreakdown = data;
                $scope.initiativeTotals = [0,0,0,0,0,0,0,0,0,0,0,0];
    			for(var i in $scope.initiativesBreakdown){
                    for(var j in $scope.initiativesBreakdown[i]){
                    $scope.initiativeTotals[j] += $scope.initiativesBreakdown[i][j];    

                    }
    			}
    			for(var i in $scope.initiativeTotals){
    			   $scope.initiativeTotals[i] = $scope.initiativeTotals[i].toFixed(2)
    			}
        }); 
        $http.get(totalsUrl)
            .success(function(data) {
                var baseline = data.map(function(curr){return curr.HISTORIC_BASELINE === null ? curr.CURR_BASELINE_CAPACITY : curr.HISTORIC_BASELINE});
                var baseLineColors = data.map(function(curr){return curr.HISTORIC_BASELINE === null ? '#EFBB00' : '#000000'});
                $scope.totalCapacityData = {
                    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun","Jul","Aug","Sept","Oct","Nov","Dec"],
                        datasets: [{
                            label: 'Baseline %',
                            data: baseline,
                            backgroundColor: baseLineColors
                        },
                        {
                            label: 'Initiatives %',
                            data: data.map(function(curr){return curr.INITIATIVE_CAPACITY;}),
                            backgroundColor:'#008FD3'
                        }]
                }; 
        }); 
        $http.get(headCountUrl)
            .success(function(data) {
                $scope.headCount = data;
        }); 

        
    };
    $scope.initiate();
}]);