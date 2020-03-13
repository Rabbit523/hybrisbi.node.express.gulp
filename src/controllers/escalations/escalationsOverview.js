//escalations overview page controller
app.controller('escalationsOverview', ['$scope', '$http', 'NgTableParams','$location', function($scope, $http, ngTableParams,$location) {
    $scope.global.load(['customerCodes','escalationManagers']);
    $scope.tooltips();
    var that = this;
    $scope.escalationIds = [];
    $scope.states = ["Active", "Faded Out", "Closed"];
    $scope.ratings = ["Red", "Yellow", "Green"];
    $scope.sources = ["Customer directly", "CM", "Director", "Internally", "Other"];
    $scope.regions = [{"CODE":"NA","NAME":"North America"},{"CODE":"APJ","NAME":"Asia Pacific Japan"},{"CODE":"GCR","NAME":"Greater China"},{"CODE":"MEE","NAME":"Middle and Eastern Europe"},{"CODE":"EMEA","NAME":"Europe, Middle East, and Africa"},{"CODE":"LAC","NAME":"Latin America and the Caribbean"}];
    $scope.teams = ["PS", "PIE", "TAMS", "PMS", "Other"];
    $scope.levels = ["Hot Temp.", "L1", "L3"];
    $scope.reasons = ["Performance", "Deployment Issues", "Turnaround Time", "Communication Breakdown", "Outage", "Service Offering", "Reflected on HCS"];
    $scope.search = {term:'',STATE:'Active'};
    if($location.search().code){
        $scope.MS_STATES=[];
        $scope.search.term=$location.search().code;
    }else{
        $scope.MS_STATES=["Active"]
    }
    $scope.loadData = function() {
        let getLiveEscalationsUrl = new URLBuilder('/api/escalations/overview/getEscalations').toString();
        $http.get(getLiveEscalationsUrl).success(function(data) {
            $scope.escalationIds = data.map(v => v.ESCALATION_ID).sort();
            $scope.aliveEscalations = data;
            that.escalations = new ngTableParams({ 
                    page: 1, 
                    count: 15,
                    sorting: { ESCALATION_ID: "asc" } ,
                    filter: $scope.search
                }, { 
                    dataset: $scope.aliveEscalations, 
                    total:$scope.aliveEscalations.length,
                    getData: function(params) {
                        return  $scope.tblDataFilter(params,$scope.aliveEscalations);
                    }
                }
            );
            that.applySelectedSort = applySelectedSort;
            $scope.activeSort='ESCALATION_IDasc';    
        });   
    }; 

    $scope.loadData();

    function applySelectedSort(col,dir){
        that.escalations.sorting(col, dir);
        $scope.activeSort=col+dir;
    }

    //open escalation
    $scope.openEsc = function(id){
        window.location = "#/escalation?esc=" + id; 
    };
    $scope.newEsc = function(id){
    	window.location = "#/escalation"; 
    }

    //tour content
	var tourContent = {
	    main: [
    	    {
                element: "",
                title: "Escalations Overview",
                content: "<p>This page manages escalation information.</p>" + 
                "<p>To see a full tour of the controls on this page click 'Next' otherwise click 'End tour'</p>"
            },
            {
                element: "#filterState",
                title: "Filters",
                content: "<p>Filters affect the data shown the Ongoing escalations table.</p>" + 
                         "<p>By Default Only active Escalations are shown</p>",
                placement: "left"
            },
            {
                element: "#escalationsTbl",
                title: "Ongoing escalations table",
                content: "<p>The table loads all escalations</p>",
                placement: "top"
            },
            {
                element: "#actionAddEscalation",
                title: "Add Escalation",
                content: "<p>Opens a new escalation page.</p>",
                placement: "bottom"
            },
            {
                element: "#searchTbl",
                title: "Search Table",
                content: "<p>Type in any search term to search the table</p>",
                placement: "bottom"
            },
            {
                element: "#openEsc0",
                title: "Edit escalation",
                content: "<p>All escalations are editable</p>" + 
                         "<p>Click on the pencil to open the escalation</p>",
                placement: "left"
            }
        ]
	};
	
    $scope.infoTour = function(tourName){ 
        var tour = $scope.createTour(tourContent[tourName]);
        tour.init();
        tour.restart();
    };
}]);