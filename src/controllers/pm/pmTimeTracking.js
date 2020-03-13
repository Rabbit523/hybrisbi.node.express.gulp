//time tracking dashboard
app.controller('pmTimeTracking',['$scope','$http','$chartJs',function ($scope,$http,$chartJs){
    //initiates all tooltips
	$scope.tooltips();
	//initiates full page scroll
    $scope.fullPageScroll(); 

    $scope.regions = [ {"region":"APJ"},{"region":"EMEA"},{"region":"GCR"},{"region":"LAC"},{"region":"MEE"},{"region":"NA"},{"region":""}];
    $scope.pms = [];
    $scope.customers = [];
    $scope.partners = [];
    $scope.topN = [{"val": "All","text": "All"},{"val": "5","text": "Top 5"},{"val": "10","text": "Top 10"},{"val": "15","text": "Top 15"},{"val": "20","text": "Top 20"}];
	//normal var not working for this specific case ?????
	$scope.topProjHrs = "20";
	//tour content
	var tourContent = [
            {
                element: "",
                title: "PM Dashboard Information",
                content: "<p>This page is a set of views representing PM time allocation with data imported from CATXT files</p>" + 
                "<p>By default the Latest month of data in the data base is loaded</p>" + 
                "<p>To see a full tour of the controls on this page click 'next' otherwise click 'end tour'</p>"
            },
            {
                element: "#dTables",
                title: "Data Tables",
                content: "Change Main Data View to a data table"
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
                element: "#cView",
                title: "Current Data View",
                content: "Indicates the current view being shown",
                placement: "bottom"
            },
            {
                element: "#mainView",
                title: "Main Data View",
                content: "This is where the main data view is shown",
                placement: "top"
            },
            {
                element: "#dataTabs",
                title: "Data Tabs",
                content: "Indicate some summary of information for the current view",
                placement: "left"
            }
        ];
	//define tour for this page for info button

	var tour = $scope.createTour(tourContent);
	
	//info button binding
    $scope.infoTour = function(){ 
        tour.init();
        tour.restart();
    };
    
    //retrieve possible pms
    $http.get("/api/users/getUsers?role=PM") 
        .success(function(data) {
            $scope.pms = $.map(data, function(value) {return {id: value.EMPLOYEE_ID,name: value.USER_NAME};});
        });
    //retrieve possible customers
	$http.get("/api/customers/getCodes")
		.success(function(data) {
			$scope.customers = $.map(data.tables, function(value) {
				return value.VAL;
			});
	});

    //retrieve partners
    $http.get("/api/customers/getPartners") 
        .success(function(data) {
            $scope.partners = $.map(data, function(value, index) {return {id:index,name:value.VAL};});
        });
        
    $scope.projHrsTopN = function(){

        var queryParams = [
            new QueryParam("startDate", $scope.startDate),
            new QueryParam("endDate", $scope.endDate),
            new QueryParam("regions", $scope.REGIONS, "region"),
            new QueryParam("topN", $scope.topProjHrs),
            new QueryParam("pms", $scope.PMS,"id"),
            new QueryParam("partners", $scope.PARTNERS,"name"),
            new QueryParam("customers", $scope.PROJS, { substring: [0, 3] })
        ];
        
        var mainUrl = "/api/pm/timeTracking/";
        var projectHoursCustomerUrl = new URLBuilder(mainUrl + "getPrjHrsBreakdown", queryParams).toString(); 
        //project work by customer
        $http.get(projectHoursCustomerUrl)
            .success(function(data) {
            $scope.projectHrs = $.map(data, function(value) {return [value];});
            $scope.totalProjHrs = _.reduce(_.pluck($scope.projectHrs, 'Hours'), function(sum, num){ return sum + num; }, 0);
            $scope.projects = _.size($scope.projectHrs);
            $scope.projectHrsChart = $chartJs.barChartOneSet($scope.projectHrs,"Project Hours Per Customer",true);
        });
    }
    $scope.loadData = function(){

        var queryParams = [
            new QueryParam("startDate", $scope.startDate),
            new QueryParam("endDate", $scope.endDate),
            new QueryParam("regions", $scope.REGIONS, "region"),
            new QueryParam("pms", $scope.PMS,"id"),
            new QueryParam("partners", $scope.PARTNERS,"name"),
            new QueryParam("customers", $scope.PROJS, { substring: [0, 3] })
        ];
        var mainUrl = "/api/pm/timeTracking/";
        var totalTimeURL = new URLBuilder(mainUrl + "getFullTimeBreakdown", queryParams).toString();
        var projectHrsMonthUrl = new URLBuilder(mainUrl + "getPrjHrsMonthBreakdown", queryParams).toString();
        var projectHoursCustomerUrl = new URLBuilder(mainUrl + "getPrjHrsBreakdown", queryParams).toString(); 
        var meetingHrsUrl = new URLBuilder(mainUrl + "getMeetingsBreakdown", queryParams).toString();   
        var adminHrsUrl = new URLBuilder(mainUrl + "getAdminBreakdown", queryParams).toString();   
        
        //full time breakdown pie chart
        $http.get(totalTimeURL)
            .success(function(data) {
                $scope.fullTimeRaw = $.map(data, function(value) {return [value];});
                //removes the employee key 
                $scope.fullTimeBreakdown = _.map(_.groupBy($scope.fullTimeRaw, 'TASK'), function(entry){ return {TASK:entry[0].TASK , VAL:_.reduce(_.pluck(entry, 'VAL'), function(sum, num){ return sum + num; }, 0)};});
                //get total hrs count
                $scope.fullTimeHrs = _.reduce(_.pluck($scope.fullTimeRaw, 'VAL'), function(sum, num){ return sum + num; }, 0);
                //get pms count
                $scope.fullTimePMs = Object.keys(_.groupBy($scope.fullTimeRaw, 'EMPLOYEE_ID')).length;
                $scope.businessHrs = getBusinessDays($scope.startDate,$scope.endDate) * 8 * $scope.fullTimePMs;
                $scope.fteHrs = ($scope.fullTimeHrs / $scope.businessHrs).toFixed(2);
                //time per pm
                $scope.fullTimePerPMs = ($scope.fullTimeHrs / $scope.fullTimePMs).toFixed(2);
                $scope.fullTimeBreakdownChart = $chartJs.pieChart($scope.fullTimeBreakdown,"Total Time Spent In Selected Period",'left', false);
        });

        //full meetings breakdown pie chart
        $http.get(meetingHrsUrl)
            .success(function(data) {
            $scope.meetingsRaw = $.map(data, function(value) {return [value];});
            //removes the employee key 
            $scope.meetingsBreakdown = _.map(_.groupBy($scope.meetingsRaw, 'TASK'), function(entry){ return {TASK:entry[0].TASK , VAL:_.reduce(_.pluck(entry, 'VAL'), function(sum, num){ return sum + num; }, 0)};});
            //get total hrs count
            $scope.meetingHrs = _.reduce(_.pluck($scope.meetingsRaw, 'VAL'), function(sum, num){ return sum + num; }, 0);
            //get pms count
            $scope.meetingPMs = Object.keys(_.groupBy($scope.meetingsRaw, 'EMPLOYEE_ID')).length;
            //time per pm
            $scope.meetingPerPMs = ($scope.meetingHrs / $scope.meetingPMs).toFixed(2);
            $scope.meetingsBreakdownChart = $chartJs.pieChart($scope.meetingsBreakdown,"Internal Meetings Breakdown",'left', false);
        });
        $scope.projHrsTopN();
        //full admin breakdown pie chart
        $http.get(adminHrsUrl)
            .success(function(data) {
            $scope.adminRaw = $.map(data, function(value) {return [value];});
            //removes the employee key 
            $scope.adminBreakdown = _.map(_.groupBy($scope.adminRaw, 'TASK'), function(entry){ return {TASK:entry[0].TASK , VAL:_.reduce(_.pluck(entry, 'VAL'), function(sum, num){ return sum + num; }, 0)};});
            //get total hrs count
            $scope.adminHrs = _.reduce(_.pluck($scope.adminRaw, 'VAL'), function(sum, num){ return sum + num; }, 0);
            //get pms count
            $scope.adminPMs = Object.keys(_.groupBy($scope.adminRaw, 'EMPLOYEE_ID')).length;
            //time per pm
            $scope.adminPerPMs = ($scope.adminHrs / $scope.adminPMs).toFixed(2);
            
            $scope.adminBreakdownChart = $chartJs.pieChart($scope.adminBreakdown,"Admin Breakdown",'left', false);
        });
        $http.get(projectHrsMonthUrl)
            .success(function(data) {
                
            $scope.projectHrsMonth = $.map(data, function(value) {return [value];});
            //get total hrs count
            $scope.projsMthHrs = _.reduce(_.pluck($scope.projectHrsMonth, 'Hours'), function(sum, num){ return sum + num; }, 0);
            //get pms count
            $scope.projsMth = Object.keys(_.groupBy($scope.projectHrsMonth,'Client')).length;
            
            complexChartJsGenerator.interactiveScatterChart($scope.projectHrsMonth,'Project Hours Monthly Trend','monthlyHrsTrend');
        }); 
    };

    $http.get("/api/pm/timeTracking/getMaxDate").success(function(data){
        var date = new Date(data.replace(/-/g, '\/'));
        $scope.startDate = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().slice(0, 10);
        $scope.endDate = date.toISOString().slice(0, 10);
        $scope.loadData();
    });

}]);