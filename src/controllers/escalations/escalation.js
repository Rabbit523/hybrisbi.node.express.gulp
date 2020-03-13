//escalations overview page controller
app.controller('escalation', ['$scope', '$http','$location','$timeout', function($scope, $http,$location,$timeout) {
    $scope.global.load(['escalationManagers']);
    $scope.tooltips();
    var d= new Date();
    $scope.monthDay = monthNames[d.getMonth()] + " " + d.getDate();
    $scope.year = d.getFullYear();
    $scope.customerCodes = [];
    $http.get('/api/customers/getCodes').success(function(data){
        $scope.customerCodes =  $.map(data.tables, function(e) {return {name:e.VAL,id:e.VAL.substring(0,3)};});
    })

    // $scope.autoSave("updateCustomer", 5000, () => {
    //     $("#myButton").click()
    // });

    //tour content
    var tourContent = [
            {
                element: "",
                title: "Escalation",
                content: "<p>This page represents information for an individual eascalation</p>" + 
                "<p>To see a full tour of the controls on this page click 'next' otherwise click 'end tour'</p>"
            },
            {
                element: "#sideNavActionsBody",
                title: "Action",
                content: "<p>Functions for this page</p>" + 
                         "<p>Toggle to change between report and edit views of the escalation</p>" +
                         "<p>Button to save new escalation or buttons ot save current/new update</p>" + 
                         "<p>Button to print the escalation report (can also be triggered with ctrl+p)</p>",
                placement:"right"
            },
            {
                element: "#baseInfoBody",
                title: "Base Information",
                content: "<p>Basic information of the escalation only the active information is saved for this section no versioning occurs</p>",
                placement:"left"
            },
            {
                element: "#lastUpdate",
                title: "Current Update",
                content: "<p>the Active Update which can be changed until the 'Complete Update' Button is pressed.</p>" +
                "<p>If the 'Complete Update' button is pressed a version of the data will be kept and a new version with a increased update count will be created. 'Save Current Update' overwrites the active version of the update</p>",
                placement:"left"
            },
            {
                element: "",
                title: "Old Updates",
                content: "Displays a collapsable view for showing previous updates changes to this data are not permitted",
                placement:"top"
            }
        ];
    $scope.infoTour = function(tourName){ 
        var tour = $scope.createTour(tourContent);
        tour.init();
        tour.restart();
    };

    $scope.states = ["Active", "Faded Out", "Closed"];
    $scope.ratings = ["Red", "Yellow", "Green"];
    $scope.sources = ["Customer directly", "CM", "Director", "Internally", "Other"];
    $scope.regions = [{"CODE":"NA","NAME":"North America"},{"CODE":"APJ","NAME":"Asia Pacific Japan"},{"CODE":"GCR","NAME":"Greater China"},{"CODE":"MEE","NAME":"Middle and Eastern Europe"},{"CODE":"EMEA","NAME":"Europe, Middle East, and Africa"},{"CODE":"LAC","NAME":"Latin America and the Caribbean"}];
    $scope.teams = ["PS", "PIE", "TAMS", "PMS", "Other"];
    $scope.levels = ["Hot Temp.", "L1", "L3"];
    $scope.reasons = ["Performance", "Deployment Issues", "Turnaround Time", "Communication Breakdown", "Outage", "Service Offering", "Reflected on HCS","Hypercare Needed","Product Issue","Other"];
    
    // escalation currently handled by the app, used for adding or editing an escalation
    $scope.resetEscalation = function() {
        $scope.updatingTopIssue = {};
        $scope.escalation={           
            DURATION_ON_L1:null,
            DURATION_ON_L1_TIME_TYPE:null,
            REGION:null,
            FADEOUT_DATE:null,
            CLOSURE_DATE:null,
            REASON_DESCRIPTION:"",
            STATE:null,
            UPDATABLES: {
                COMMENTS:"",
                ESCALATION_MANAGER:null,
                SOURCES:[],
                LEADERSHIP_LAST_UPDATE_DATE:null,
                LEADERSHIP_LAST_REPORT:null,
                TEAM_TIGER_ENGAGED:null,
                TEAMS_PEOPLE_INVOLVED:[],
                ESCALATED_TO_LEVEL_DATE:null,
                ESCALATED_TO_LEVEL:null,
                DIRECTOR:null
            },
            TOP_ISSUES:[]
        }; 
    }; 
    $scope.resetEscalation();

    $scope.loadData = function(escalationId) {
        $scope.escalation.ESCALATION_ID = escalationId;

        $http.get("/api/escalations/overview/getEscalationById?esc_id=" + escalationId)
            .success(function(data) { 

                $scope.escalation = data;
                $scope.escalation.DURATION_ON_L1 = parseFloat($scope.escalation.DURATION_ON_L1); // input tag uses type="number"
                //multi select mappings
                $scope.escalation.UPDATABLES.SOURCES = $scope.escalation.UPDATABLES.SOURCES ? $scope.escalation.UPDATABLES['SOURCES'].split(','):[];
                $scope.escalation.UPDATABLES.TEAMS_PEOPLE_INVOLVED = $scope.escalation.UPDATABLES.TEAMS_PEOPLE_INVOLVED ? $scope.escalation.UPDATABLES['TEAMS_PEOPLE_INVOLVED'].split(','):[];
            })
            .error(function(){
                $scope.resetEscalation();
            });
    };

    //printing functions
    $scope.print = function(){
        $scope.viewType = 2;

        $timeout(function() {
            window.print();
        });
    };

    window.onbeforeprint = function(){
        $scope.viewType=2;
        document.title = $scope.escalation.ESCALATION_ID; 
    };
    //ctrl+p does not execute window before print normally resulting in view change not being triggered and blank page being shown add extra event bind to force behaviour
    function printHandler(e){
        if(e.ctrlKey && e.keyCode == 80){
            $scope.viewType=2;
            document.title = $scope.escalation.ESCALATION_ID; 
            $scope.$apply();
            window.print();
            return false;
        }
    }
    $(document).bind("keyup keydown", printHandler);

    //remove print handler on navigate away
    $scope.$on('$routeChangeStart', function($event, next, current) { 
        $(document).unbind('keyup keydown', printHandler);
    });

    window.onafterprint = function(){
        $scope.printing = false;
        document.title = "Hybris BI";
    }; 

    $scope.saveEscalation = function(newUpdate) {
        //for maintain current update count vs new version
        $scope.escalation.NEW_UPDATE = newUpdate;
        
        //no id indicates this is a new record to create 
        if(!$scope.escalation.ESCALATION_ID){
            $scope.escalation.NEW_ESC=true;
        }

        //make sure field requirements are respected
        if($scope.escalation.TOP_ISSUES.length > 0 && $scope.baseInfoForm.$valid && $scope.updateForm.$valid && $scope.escalation.UPDATABLES.SOURCES.length > 0){

            $http.put("/api/escalations/overview/escalation", JSON.stringify($scope.escalation))
                .success(function(res) {
                    $scope.successAlert = true;
                    //new escalation creation would indicate reload + immediate add to search index 
                    if($scope.escalation.NEW_ESC){
                        $scope.loadData(res); 
                        $scope.getSearchIndex();
                    }else{
                        //necessary ? 
                        $scope.loadData($scope.escalation.ESCALATION_ID)
                    }
                }).error(function(){
                    $scope.failAlert = true; 
                });
        }
    };

    //top issues updates object mapping
    $scope.addEscalationTopIssue = function() {
        $scope.updatingTopIssue.NUMBER = ($scope.escalation.TOP_ISSUES.length + 1);
        $scope.escalation.TOP_ISSUES.push($scope.updatingTopIssue);
    };
    $scope.updateEscalationTopIssue = function() {
        $scope.escalation.TOP_ISSUES[$scope.updatingTopIssue._index] = $scope.updatingTopIssue;
    };
    $scope.cancelEscalationTopIssueUpdate = function() {
        if($scope.tempUpdatingTopIssue) {
            $scope.escalation.TOP_ISSUES[$scope.tempUpdatingTopIssue._index] = $scope.tempUpdatingTopIssue;    
        }
        $scope.updatingTopIssue = $scope.tempUpdatingTopIssue = null;
    };
    
    $scope.resetUpdatingTopIssue = function() {
        $scope.updatingTopIssue = {
            ACTION_ITEMS:"",
            DESCRIPTION:"",
            EXIT_CRITERIA_ACHIEVED:"",
            EXIT_CRITERIA_TEXT:"",
            ISSUE_IMPACT_SUMMARY:"",
            NUMBER:null,
            RATING:null,
            REASONS:null,
            SHORT_NAME:null,
            STATUS:"",
            STATUS_SUMMARY:"",
            WEEK_DELTA:""
        };
    };
    //display helper for converting inumber to name
    $scope.getEMName = function(uid){
		for(var i in $scope.escalationManagers){
			var em=$scope.escalationManagers[i];
			if(em.id=== uid){return em.name;}
		}
		return "";
    }

    //top issues click handlers
    $scope.currentUpdatingTopIssue = function(topIssue) {
        if($scope.permissions.ESCALATIONS_ADMIN){
            $scope.tempUpdatingTopIssue = angular.copy(topIssue);
    
            $scope.updatingTopIssue = topIssue;
    		$('#topIssuesModal').modal('show');
        }else{
            $scope.viewTopIssue(topIssue);
        }
    };
    $scope.viewTopIssue = function(topIssue) {
        $scope.displayTopIssue = topIssue;
        $('#topIssuesViewModal').modal('show');
    };

    $scope.viewType=1;

    //initial load of escalation if id exists vs new creation
    var req=$location.search().esc;
    if(req){
       $scope.loadData(req);
    }

}]);