//service report controller
app.controller('serviceReport',['$scope','$http','$chartJs',function ($scope,$http,$chartJs){
       
        //initiates all tooltips
		$scope.tooltips();
		//initiates full page scroll
		$scope.fullPageScroll();  
		
		var weeksSlider = $("#slider")[0];
		$scope.regions = [{"region": "APJ"}, {"region": "EMEA"}, {"region": "GCR"}, {"region": "LAC"}, {"region": "MEE"}, {"region": "NA"}, {"region": ""}];
        $scope.customers = [];

        //retrieves years
        $http.get("/api/report/service/getYears")
            .success(function(data) {
                $scope.years = data;
        });   
        
        //retrieve customers
        $http.get("/api/customers/getCodes")
			.success(function(data) {
				$scope.customers =  $.map(data.tables, function(value) {return value.VAL;});
		});
		
        //sorting prevention for ng-repeats
        $scope.ngColNoSort = function(obj){
            if (!obj) {
                return [];
            }
            return Object.keys(obj);
        };
        
        // data load function to retrieve and format data for displays
        $scope.loadData = function (){
            //get query params
            var queryParams = [
                new QueryParam("startWeek", $scope.startWeek),
                new QueryParam("endWeek", $scope.endWeek),
                new QueryParam("regions", $scope.REGIONS, "region"),
                new QueryParam("customers", $scope.PROJS, { substring: [0, 3] })
                
            ];
            
            //no filter available setting
            $scope.filterNA = false; 
            if($scope.REGIONS !== undefined && $scope.REGIONS.length > 0){
                $scope.filterNA = true;     
            }
            if($scope.PROJS !== undefined && $scope.PROJS.length > 0){
                $scope.filterNA = true; 
            }
            
            
            var mainUrl = "/api/report/service/";
            
            var incomingIncidentsUrl = new URLBuilder(mainUrl + "getIncomingIncidents", queryParams).toString();
            var incomingIncidentsByCustomerUrl = new URLBuilder(mainUrl + "getIncomingIncidentsByCustomers", queryParams).toString();
            var solvedIncidentsUrl = new URLBuilder(mainUrl + "getSolvedIncidents", queryParams).toString();
            var solvedIncidentsByCustomerUrl = new URLBuilder(mainUrl + "getSolvedIncidentsByCustomers", queryParams).toString();
            var incomingReqsUrl  = new URLBuilder(mainUrl + "getIncomingServiceReqs", queryParams).toString();
            var incomingReqsByCustomerUrl = new URLBuilder(mainUrl + "getIncomingServiceReqsByCustomers", queryParams).toString();
            var solvedReqsUrl  = new URLBuilder(mainUrl + "getSolvedServiceReqs", queryParams).toString();
            var solvedReqsByCustomerUrl = new URLBuilder(mainUrl + "getSolvedServiceReqsByCustomers", queryParams).toString();
            var incidentsBacklogUrl = new URLBuilder(mainUrl + "getIncidentsBacklog", queryParams).toString();
            var incidentsBacklogLocUrl = new URLBuilder(mainUrl + "getIncidentsBacklogByLoc", queryParams).toString();
            var serviceReqBacklogUrl = new URLBuilder(mainUrl + "getServiceReqsBacklog", queryParams).toString();
            var serviceReqBacklogLocUrl = new URLBuilder(mainUrl + "getServiceReqsBacklogByLoc", queryParams).toString();
            var pdsPseIncidentsUrl = new URLBuilder(mainUrl + "getPdsPseIncidents", queryParams).toString();
            var pdsPseServiceReqUrl = new URLBuilder(mainUrl + "getPdsPseServiceReqs", queryParams).toString();
            var internalServiceReqsUrl  = new URLBuilder(mainUrl + "getInternalServiceReqs", queryParams).toString();
            var internalServiceReqsPsePdsUrl = new URLBuilder(mainUrl + "getInternalServiceReqsPsePds", queryParams).toString();
            var pfmDeploymentsUrl  = new URLBuilder(mainUrl + "getPfmDeployments", queryParams).toString();
            var unknownCodeUrl = new URLBuilder(mainUrl + "getUnknownCodes", queryParams).toString();

            
            //incoming incidents section
            //incoming incidents
            $http.get(incomingIncidentsUrl)
                .success(function(data) {
                    $scope.incomingIncidents = $.map(data, function(value) {return [value];});
                    $scope.incomingIncidentsChart = $chartJs.lineChart($scope.incomingIncidents,"By Week","top",true,false,false,false,true);
            });  
            
            //incoming incidents by customer section
            $http.get(incomingIncidentsByCustomerUrl + "&top10=false")
                .success(function(data) {
                    $scope.incomingIncidentsByCustomers = $.map(data, function(value) {return [value];});
            });
            
            //incoming incidents by customer section top 10
            $http.get(incomingIncidentsByCustomerUrl + "&top10=true")
                .success(function(data) {
                    $scope.incomingIncidentsByCustomerstop10 = $.map(data, function(value) {return [value];});
                    $scope.incomingIncidentsByCustomersChart = $chartJs.pieChart($scope.incomingIncidentsByCustomerstop10,"By Customer","top",true,false,false,false,true);
            });
            
            //solved incidents section
            $http.get(solvedIncidentsUrl)
                .success(function(data) {
                    $scope.solvedIncidents = $.map(data, function(value) {return [value];});
                    $scope.solvedIncidentsChart = $chartJs.lineChart($scope.solvedIncidents,"By Week","top",true,false,false,false,true);
            });
            
            //solved incidents by customer section
            $http.get(solvedIncidentsByCustomerUrl + "&top10=false")
                .success(function(data) {
                    $scope.solvedIncidentsByCustomers = $.map(data, function(value) {return [value];});
            });
            
            //solved incidents by customer section top 10
            $http.get(solvedIncidentsByCustomerUrl + "&top10=true")
                .success(function(data) {
                    $scope.solvedIncidentsByCustomerstop10 = $.map(data, function(value) {return [value];});
                    $scope.solvedIncidentsByCustomersChart = $chartJs.pieChart($scope.solvedIncidentsByCustomerstop10,"By Customer","top",true,true);
            });
            
            //Incoming Service Reqs section
            $http.get(incomingReqsUrl)
                .success(function(data) {
                    $scope.incomingServiceReq = $.map(data, function(value) {return [value];});
                    $scope.incomingServiceReqChart = $chartJs.lineChart($scope.incomingServiceReq,"By Week","top",true,false,false,false,true);
            }); 
        
            //incoming service requests by customer section
            $http.get(incomingReqsByCustomerUrl + "&top10=false")
                .success(function(data) {
                    $scope.incomingServiceReqsByCustomers = $.map(data, function(value) {return [value];});
            });
            
            //incoming service requests by customer section top 10
            $http.get(incomingReqsByCustomerUrl + "&top10=true")
                .success(function(data) {
                    $scope.incomingServiceReqsByCustomerstop10 = $.map(data, function(value) {return [value];});
                    $scope.incomingServiceReqsByCustomersChart = $chartJs.pieChart($scope.incomingServiceReqsByCustomerstop10,"By Customer","top",true,true);
            });
            
            //Solved Service Reqs section
            $http.get(solvedReqsUrl)
               .success(function(data) {
                    $scope.solvedServiceReq = $.map(data, function(value) {return [value];});
                    $scope.solvedServiceReqChart = $chartJs.lineChart($scope.solvedServiceReq,"By Week","top",true,false,false,false,true);
            });
            
            //solved service requests by customer section
            $http.get(solvedReqsByCustomerUrl + "&top10=false")
                .success(function(data) {
                    $scope.solvedServiceReqsByCustomers = $.map(data, function(value) {return [value];});
            });
            
            //solved service requests by customer section top 10
            $http.get(solvedReqsByCustomerUrl + "&top10=true")
                .success(function(data) {
                    $scope.solvedServiceReqsByCustomerstop10 = $.map(data, function(value) {return [value];});
                    $scope.solvedServiceReqsByCustomersChart = $chartJs.pieChart($scope.solvedServiceReqsByCustomerstop10,"By Customer","top",true,true);
            });
            
            //backlog incidents section
            $http.get(incidentsBacklogUrl)
                .success(function(data) {
                        $scope.backlogIncidents = $.map(data, function(value) {return [value];});
                        $scope.backlogIncidentsChart  = $chartJs.lineChart($scope.backlogIncidents,"By Data Center","top",true,false,false,false,true);
            });
            
            //backlog incidents by location
            $http.get(incidentsBacklogLocUrl)
                .success(function(data) {
                    $scope.backlogIncidentsByLoc = $.map(data, function(value) {return [value];});
                    $scope.backlogIncidentsByLocChart = $chartJs.lineChart($scope.backlogIncidentsByLoc,"By Location","top",true,false,false,false,true);
            });  

            //backlog Service requests section
            $http.get(serviceReqBacklogUrl)
                .success(function(data) {
                        $scope.backlogServiceReqs = $.map(data, function(value) {return [value];});
                        $scope.backlogServiceReqsChart = $chartJs.lineChart($scope.backlogServiceReqs,"By Data Center","top",true,false,false,false,true);
            });
            
            //backlog service requests by location
            $http.get(serviceReqBacklogLocUrl)
                .success(function(data) {
                    $scope.backlogServiceReqsByLoc = $.map(data, function(value) {return [value];});
                    $scope.backlogServiceReqsByLocChart = $chartJs.lineChart($scope.backlogServiceReqsByLoc,"By Location","top",true,false,false,false,true);
            });  
            
            //PDS PSE section
            //pds pse incidents
            $http.get(pdsPseIncidentsUrl)
                .success(function(data) {
                        $scope.pdsPseIncidents = $.map(data, function(value) {return [value];});
                        $scope.pdsPseIncidentsChart = $chartJs.lineChart($scope.pdsPseIncidents,"PDS and PSE Incidents","top",true,false,false,false,true);
            });  
            //pds pse service reqs
            $http.get(pdsPseServiceReqUrl)
                .success(function(data) {
                        $scope.pdsPseServiceReqs = $.map(data, function(value) {return [value];});
                        $scope.pdsPseServiceReqsChart  = $chartJs.lineChart($scope.pdsPseServiceReqs,"PDS and PSE Service Requests","top",true,false,false,false,true);
            }); 
            
            //internal service reqs section
            //incoming internal service reqs
            $http.get(internalServiceReqsUrl + "&type=incoming")
                .success(function(data) {
                        $scope.incomingInternalServiceReqs = $.map(data, function(value) {return [value];});
                        $scope.incomingInternalServiceReqsChart = $chartJs.lineChart($scope.incomingInternalServiceReqs,"Incoming By Week","top",true,false,false,false,true);
            }); 
            
            $http.get(internalServiceReqsUrl + "&type=solved")
                .success(function(data) {
                        $scope.solvedInternalServiceReqs = $.map(data, function(value) {return [value];});
                        $scope.solvedInternalServiceReqsChart = $chartJs.lineChart($scope.solvedInternalServiceReqs,"Solved By Week","top",true,false,false,false,true);
            }); 
            
            //solved internal service reqs
            $http.get(internalServiceReqsPsePdsUrl)
                .success(function(data) {
                        $scope.internalPdsPse = $.map(data, function(value) {return [value];});
                        $scope.internalPdsPseChart = $chartJs.lineChart($scope.internalPdsPse,"PDS and PSE Internal Change Requests","top",true,false,false,false,true);
            }); 
            
            //pfm deployments section
            $http.get(pfmDeploymentsUrl)
                .success(function(data) {
                        $scope.pfmDeployments = $.map(data, function(value) {return [value];});
                        $scope.pfmDeploymentsChart = $chartJs.lineChart($scope.pfmDeployments,"PFM Deployments","top",true,false,false,false,true);
            }); 
            //retrieve unknown codes
            $http.get(unknownCodeUrl)
                .success(function(data) {
                        $scope.unknownCodes = $.map(data, function(value) {return [value];});
            }); 
        };
        //handles changing slider and reloading data on year change
        $scope.changeYear = function(){
            //change slider bounds to other year
        	weeksSlider.noUiSlider.updateOptions({
        		range: {
            		'min': new Date($scope.year - 1,11,1).getTime(),
            		'max': new Date($scope.year,11,31).getTime()
        		}
        	});
            weeksSlider.noUiSlider.set([new Date($scope.year,0,1).getTime(),new Date($scope.year,11,31).getTime()]);
            $scope.loadData();
        };
        
        //default week calculations for intervals
        var d = new Date();
        $scope.year = d.getFullYear();
        $scope.endWeek = d.getFullYear() + '-W' + ISO_WEEK(d);
        var intervalDate = new Date();
        intervalDate.setDate(d.getDate() - 42);
        $scope.startWeek = intervalDate.getFullYear() + '-W' + ISO_WEEK(intervalDate);

        //bind configuration	  
        noUiSlider.create(weeksSlider, {
        	start: [timestamp(intervalDate),timestamp(d) ], 
        	connect: true, 
        	behaviour: 'tap-drag', 
        	step: 7 * 24 * 60 * 60 * 1000,
        	range: {
        		'min': new Date($scope.year - 1,11,1).getTime(),
        		'max': new Date($scope.year,11,31).getTime()
        	}
        });
        function weeksFormat(value) {
            var d = new Date(value);
            var isoWeek = ISO_WEEK(d);
            var year = d.getFullYear();
            if(d.getMonth() === 11 && isoWeek === 1){
                year++;
            }
            return year + '-W' + ('0' + isoWeek).slice(-2);
	    }
	   
        //bind value changes
        weeksSlider.noUiSlider.on('update', function(){
        	var values = weeksSlider.noUiSlider.get();
            $scope.startWeek = weeksFormat(Math.round(values[0]));
            var start = new Date(Math.round(values[0]));
            $scope.startWeekDate = start.getFullYear() + '-' + ("0" + (start.getMonth() + 1)).slice(-2) + '-' + ("0" + start.getDate()).slice(-2);
            
            $scope.endWeek = weeksFormat(Math.round(values[1]));
            var end = new Date(Math.round(values[1]));
            $scope.endWeekDate = end.getFullYear() + '-' + ("0" + (end.getMonth() + 1)).slice(-2) + '-' + ("0" + end.getDate()).slice(-2);

        });


        weeksSlider.noUiSlider.on('change', function(){
            $scope.loadData();
        });

        $scope.loadData();
}]);