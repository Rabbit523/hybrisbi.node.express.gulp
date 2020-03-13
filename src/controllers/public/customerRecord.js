//customer records page controller
app.controller('customerRecord', ['$scope', '$http', '$compile', '$location', function ($scope, $http, $compile, $location) {
    $scope.global.load(['timeZones']);
    
    //initiates all tooltips
    $scope.tooltips();

    $scope.regions = [{ "region": "APJ" }, { "region": "EMEA" }, { "region": "GCR" }, { "region": "LAC" }, { "region": "MEE" }, { "region": "NA" }, { "region": "" }];
    $scope.ccEditions = [];
    $scope.editions = [{ "edition": "Hybris Hosting" }, { "edition": "Edge" }, { "edition": "PPV" }, { "edition": "Cores Standard" }, { "edition": "Cores Professional" }, { "edition": "Cores Enterprise" }, { "edition": "Revenue Standard" }, { "edition": "Revenue Professional" }, { "edition": "Revenue Enterprise" }, { "edition": "" }];
    $scope.customer = {};
    $scope.milestoneTypes = ['Site Launch','Surge Event','Hybris Upgrade','Black Friday'];

    $scope.industries = ['Cargo Transportation & Logistics Service','Engineering, Construction and Operation',
        'Forest Products, Furniture & Textiles','Industrial Machinery and Components','Higher Education and Research',
        'Passenger Travel & Leisure','SAP Consolidated companies','Fabricated Metal Products','Wholesale Distribution',
        'Sports & Entertainment','Professional Services','Aerospace and Defense','Telecommunications',
        'Building Materials','Consumer Products','Primary Metals','Life Sciences','Public Sector',
        'Oil and Gas','Automotive','Healthcare','High Tech','Insurance','Utilities','Chemicals','Banking','Retail','Mining','Postal','Media'].sort();
    
    $scope.contactTypes = [
        'Primary',
        'Primary & Escalation',
        'Backup',
        'Backup & Escalation',
        'Technical',
        'Escalation'
    ];

    $scope.customer.HYBRIS_EDITION = "";
    $scope.contactTypes=['Primary','Primary & Escalation','Backup','Backup & Escalation','Technical','Escalation'];
    $scope.customerData = {};
    $scope.supportPartners = ["Accenture","Connext"];
    $scope.supportPartnerReq = false;
    $scope.supportPartnerEdit = false;
    $scope.dirty = false;

    $scope.editionChange = function(){
        var dc=$scope.customer.DATACENTER;
        $scope.editionEdit=false;
        $scope.supportPartnerReq = false;
        $scope.supportPartnerEdit = false;
        if($scope.customer.DATACENTER){
            if(dc === "FR1" || dc === "WA1"){
                $scope.customer.COMMERCE_CLOUD_EDITION = "1.0";
                $scope.customer.SUPPORT_PARTNER = null;
            }else if(dc === "ROT"){
                $scope.customer.SUPPORT_PARTNER = null;
                $scope.ccEditions=["1.1","1.2"];
                $scope.editionEdit=true;
            }else if(dc ==="MO2"){
                $scope.customer.SUPPORT_PARTNER = "Accenture";
                $scope.supportPartnerReq = true;
            }else if(dc === "D11"){
                $scope.customer.COMMERCE_CLOUD_EDITION = "1.1";
                $scope.customer.SUPPORT_PARTNER = null;
            }else if(dc === "NSQ"){
                $scope.customer.COMMERCE_CLOUD_EDITION = "1.2";
                $scope.customer.SUPPORT_PARTNER = null;
            }else if(dc === "SH3"){
                $scope.supportPartnerReq = true;
                $scope.supportPartnerEdit = true;
            }else if(dc.substring(0,2) === "XM"){
                $scope.customer.COMMERCE_CLOUD_EDITION = "2.0";
            }
        }else{
            $scope.customer.COMMERCE_CLOUD_EDITION = "";
        }
        $scope.supportPartnerChange();

    };
    $scope.acvFormat = function(){
        if($scope.customer.ACV){
            return $scope.customer.ACV.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
        }else{
            '';
        }
    }
    $scope.supportPartnerChange = function (){
        var partner = $scope.customer.SUPPORT_PARTNER;
        if(partner === "Accenture"){
            $scope.customer.COMMERCE_CLOUD_EDITION = "1.3";
        }
        else if(partner === "Connext"){
            $scope.customer.COMMERCE_CLOUD_EDITION = "1.4";
        }
    };
    //tour content
    var tourContent = [
        {
            element: "",
            title: "Customer Record Information",
            content: "<p>This page represents information for an individual customer</p>" +
                "<p>To see a full tour of the controls on this page click 'next' otherwise click 'end tour'</p>"
        },
        {
            element: "#mainPanel",
            title: "Main Overview Panel",
            content: "<p>this panel is a overview of the customer</p>" +
                "<p>this panel is green if customer is live blue otherwise</p>" +
                "<p>the top line indicates the customer code of of the customer</p>" +
                "<p>The 2nd line indicates if customer is live</p>" +
                "<p>\"LATEST SC\" indicates the month-year of the most recent score card or \"NA\" if none is available</p>" +
                "<p>\"MIN INFO\" indicates a <span class='glyphicon glyphicon-ok'></span> if all mandatory info is filled or an <span class='glyphicon glyphicon-remove'></span> otherwise<</p>"
        },
        {
            element: "#versionPanel",
            title: "Version Panel",
            content: "<p>Displays the Hybris version for the latest complete month by default</p>" +
                "<p>Press the Calendar if you would like to see the version recorded for a different month</p>" +
                "<p>If no version is available for a given month 'NA' is shown </p>"
        },
        {
            element: "#crLink",
            title: "Cloud Reporting",
            content: "<p>this link will open the customer's Cloud reporting page</p><p>(requires SAP internal network access)</p>"
        },
        {
            element: "#scoreCardBtn",
            title: "Score Cards",
            content: "<p>a link appears and opens the latest score card if there is an available score card and user has permissions</p>"
        },
        {
            element: "#main",
            title: "Main info",
            content: "the main view is split into sections, each section has fields relevant to that section",
            placement: "left"
        },
        {
            element: "",
            title: "Data Displays",
            content: "<p>If a field cannot be edited it will appear as this example:</p>" +
                "<p>(all fields if user does not have editing privileges)</p>" +
                "<div class='display-well'>An Example</div>"
        },
        {
            element: "",
            title: "Mandatory Fields",
            content: "<p>Not filled mandatory fields appear as this example:</p>" +
                "<p>(editing privileges required)</p>" +
                "<div class='form-group has-feedback has-error'>" +
                "<span class='glyphicon glyphicon-warning-sign form-control-feedback'></span>" +
                "<input type='text' class='form-control'>" +
                "<span class='help-block'>Required for XXXXXXXXX</span></div>"
        },
        {
            element: "",
            title: "Recommended Fields",
            content: "<p>Recommended but not strictly mandatory fields appear as this example:</p>" +
                "<p>(editing privileges required)</p>" +
                "<div class='form-group has-feedback has-warning'>" +
                "<span class='glyphicon glyphicon-question-sign form-control-feedback'></span>" +
                "<input type='text' class='form-control'>" +
                "<span class='help-block'>This field should be filled out</span></div>"
        }
    ];
    var tour = $scope.createTour(tourContent);

    //info button binding
    $scope.infoTour = function () {
        tour.init();
        tour.restart();
    };

    //ui tenant display helpers
    $scope.tenantDelayReason = function (reason) {
        for (var i in $scope.slaReasons) {
            if ($scope.slaReasons[i].ID === reason) {
                return $scope.slaReasons[i].REASON;
            }
        }
        return 'N/A';
    }
    $scope.tenantPanelCheck = function (tenant) {
        var slaEval = tenant.SLA_EVAL_VALUE;
     
        if (slaEval === 0) {
            return 'panel-success';
        }
        else if (slaEval === 1) {
            return 'panel-warning';
        }
        return 'panel-default';

    };
    $scope.tenantTargetCheck = function (slaEval) {
        if (slaEval === 0) {
            return 'glyphicon-ok';
        }
        if (slaEval === 1) {
            return 'glyphicon-remove';
        }
        return 'glyphicon-question-sign';
    };
    $scope.tenantTargetText = function (slaEval){
        if (slaEval === 0) {
            return 'On Target';
        }
        if (slaEval === 1) {
            return 'Off Target';
        }
        return 'N/A'; 
    }
    $scope.escPanelColor = function(rating){
        if(rating ==='GREY'){
            return 'panel-sap-NA';
        }
        else if (rating ==='RED'){
            return 'panel-red';
        }
        else if (rating ==='YELLOW'){
            return 'panel-yellow';
        }
        else if (rating ==='GREEN'){
            return 'panel-sap-green';
        }
    }
    $scope.tenantTag = function(tenant){
        var tId= /([A-z0-9]*)-([A-z0-9]*)/.exec(tenant);
        return tId[2];
    }
    //tenant sla type ref for target calculation
    var slaRef = { DEV: "SLA1", STG: "SLA2", PROD: "SLA3" };

    //target calculation for tenant
    function getSlaTarget(tDate, type) {
        var target = 0;
        var currDate = new Date(tDate.replace(/-/g, '\/'));
        //find appropriate target or use latest 1
        for (var i in $scope.slaTargets) {
            var d = new Date($scope.slaTargets[i].SLASTARTDATE.replace(/-/g, '\/'));
            if (currDate < d) {
                break;
            }
            target = $scope.slaTargets[i][slaRef[type]];
        }
        return target;
    }
    //tenant calculation
    function calculateTenant(tenant,type){
        //check if tenant can be calculated
        tenant.KICKOFF = $scope.customer.KICKOFFDATE;
        tenant.STARTDATE = $scope.customer.STARTDATE;
    	if((tenant.KICKOFF || tenant.STARTDATE) && tenant.DATE !== "" && tenant.DATE !== null && type !=='QA'){
    		//determine the sla target
            var target = getSlaTarget(tenant.DATE,type);
        	tenant.slaTarget = target;
        	
        	//convert tenant date to actual date for calculations
        	var tDate = new Date(tenant.DATE.replace(/-/g, '\/'));
        	
        	//null kickoff handling for calc
        	if(tenant.KICKOFF){
        		
	            var kickoff = new Date(tenant.KICKOFF.replace(/-/g, '\/'));
	            
	            //negative dates handling if tenant was delivered before kickoff
	            if(kickoff.getTime() > tDate.getTime()){
	                tenant.SLA_VALUE = - (getBusinessDays(tenant.DATE,tenant.KICKOFF,1) + target);    
	            }else{
	                tenant.SLA_VALUE = getBusinessDays(tenant.KICKOFF,tenant.DATE,1) - target;
	            }
	            tenant.SLA_EVAL_VALUE = tenant.SLA_VALUE > 0 ? 1 : 0;
	            
	        }else{
	            tenant.SLA_VALUE = null;
	            tenant.SLA_EVAL_VALUE = -1;
	            tenant.SLAREASON = -1
	        }
        
	        //null sig date handle for calc
	        if(tenant.STARTDATE){
                
	            var startDate = new Date(tenant.STARTDATE.replace(/-/g, '\/'));
	            //negative dates handling if tenant was delivered before contract sig 
	            if(startDate.getTime() > tDate.getTime()){
	                tenant.SLO_VALUE = - (getBusinessDays(tenant.DATE,tenant.STARTDATE,1) + target);    
	            }else{
	                tenant.SLO_VALUE = getBusinessDays(tenant.STARTDATE,tenant.DATE,1) - target;
	            }
	            tenant.SLO_EVAL_VALUE = tenant.SLO_VALUE > 0 ? 1 : 0;
	      
	            
	        }else{
	            tenant.SLO_VALUE = null;
	            tenant.SLO_EVAL_VALUE = -1;
	        }
        
        //null date handles or QA env 
        }else{
        	if(type !=='QA'){

	        	if(!tenant.KICKOFF){
	        		tenant.SLA_EVAL_VALUE = -1;
	        		tenant.SLA_VALUE = -1;     
	        	}
	 
	            if(!tenant.STARTDATE){
	                tenant.SLO_EVAL_VALUE = -1;	
	                tenant.SLO_VALUE = -1;
                }
                tenant.SLAREASON = -1;

            } else {
                tenant.SLA_EVAL_VALUE = -1;
                tenant.SLA_VALUE = null;
                tenant.SLAREASON = null;
                tenant.SLO_EVAL_VALUE = -1;
                tenant.SLO_VALUE = null;
            }
        }

        if(!tenant.SLAREASON){
            tenant.SLAREASON=-1;
        }

        //live checks for alt go lives
        if(tenant.USE_PROJECT_LIVE){
            tenant.LIVE=$scope.customer.LIVE;
            tenant.GO_LIVE_DATE=$scope.customer.GOLIVEDATE;
        }
    }
    function updateTenants(tenants, type) {
        for (var i in tenants) {
            calculateTenant(tenants[i], type);
        }
    }
    $scope.canEdit=false;
    //object checking format function for some differences between db results and ui mappings
    function fldFormat(fld){
        if(fld === ""){
            return null;
        }
        else if(fld === true){
            return 1;
        }
        else if(fld === false){
            return 0;
        }else{
            return fld;
        }
    }
    
    //tenant calc watches
    $scope.$watch(function(){

        //recalculate tenant values 
        if ($scope.customer && $scope.customer.TENANTS) {
            var tenants = $scope.customer.TENANTS;
            updateTenants(tenants['1-DEV'], 'DEV');
            updateTenants(tenants['2-STG'], 'STG');
            updateTenants(tenants['3-PROD'], 'PROD');
            updateTenants(tenants['4-QA'], 'QA');
        }
        //new tenant calculation if needed
        if ($scope.customer && $scope.newTenant) {
            if ($scope.newTenant.DATE && $scope.newTenant.ENVTYPE) {
                calculateTenant($scope.newTenant, $scope.newTenant.ENVTYPE);
            }
            if(!$scope.customer.GOLIVEDATE){
                $scope.customer.LIVE = false;
            }
        }
        if ($scope.permissions) {
            //permissions checks
            if (!($scope.permissions.CUSTOMER_ADMIN || ($scope.permissions.CUSTOMER_ADMIN_LIMITED && $scope.canEdit))) {
                $("#saveBtn").prop("disabled", true);
            } else {
                $("#saveBtn").prop("disabled", false);
            }
            if (!($scope.permissions.CUSTOMER_ADMIN || ($scope.permissions.CUSTOMER_ADMIN_LIMITED && $scope.canEdit))) {
                $("#newTenantBtn").prop("disabled", true);
            } else {
                $("#newTenantBtn").prop("disabled", false);
            }
            if (!$scope.permissions.ACV) {
                $scope.acvShow = false;
            } else {
                $scope.acvShow = true;
            }
            if (!$scope.permissions.SCORECARDS) {
                $scope.scoreCardBtn = false;
                $("#scoreCardBtn").prop("disabled", true);
            } 
        }
        if($scope.me && $scope.permissions && $scope.customer){
            if($scope.customer.PM === $scope.me.uid || $scope.customer.TAM === $scope.me.uid || $scope.permissions.CUSTOMER_ADMIN){
                $scope.canEdit = true;
            }else{
                $scope.canEdit =  false;
            }
        }
        //customer object changes comp
        if($scope.customer && $scope.originalCustomer){
            $scope.dirty=false;
            var keys = Object.keys($scope.originalCustomer);
            //compare main record fields for customer 
            for(var i in keys){
                var key = keys[i];
                //skip keys that have sub components those need to be evaluated differently
                if(!(key ==='TENANTS' || key === 'ESCALATION' || key === 'CATCHPOINT_TESTS' || key === 'VERSION_HISTORY')){
                    if(fldFormat($scope.customer[key]) !== $scope.originalCustomer[key]){
                        $scope.dirty=true;
                        break;
                    }
                }
            }
            //tenant compare necessary values
            for(var i in $scope.originalCustomer.TENANTS){
                for (var j in $scope.originalCustomer.TENANTS[i]){
                    var oTenant =  $scope.originalCustomer.TENANTS[i][j];
                    var cTenant =  $scope.customer.TENANTS[i][j];
                    //no need to check all keys
                    if(fldFormat(cTenant.DATE) !== oTenant.DATE || fldFormat(cTenant.GO_LIVE_DATE) !== oTenant.GO_LIVE_DATE || fldFormat(cTenant.LIVE) !== oTenant.LIVE || cTenant.SLAREASON !== oTenant.SLAREASON ||fldFormat(cTenant.USE_PROJECT_LIVE) !== oTenant.USE_PROJECT_LIVE){
                        $scope.dirty = true;
                    }
                }
            }
            //catchpoint tests values compare
            for(var i in $scope.originalCustomer.CATCHPOINT_TESTS){
                var oTst = $scope.originalCustomer.CATCHPOINT_TESTS[i];
                var cTst = $scope.customer.CATCHPOINT_TESTS[i];
                if(fldFormat(cTst.ACTIVE) !== oTst.ACTIVE){
                    $scope.dirty = true;
                }
            }
        }
    });
    
    //new tenant db insertion call
    $scope.addTenant = function(){
    	$scope.newTenant.PROJECT = $scope.customer.CUSTOMERCODE;
        $http.put("./api/tenants/newTenant",JSON.stringify($scope.newTenant))
            .success(function(data) {	
                $scope.customer.TENANTS[$scope.newTenant.ENVTYPE].push(data);
                $scope.newTenant = null;
            });
    };

    $scope.addUrl = function(){
        var main = $scope.customer.URLS.length === 0 ? true:false;
        $scope.customer.URLS.push({MAIN:main,URL:''});
    };

    $scope.addMilestone = function(){
        $scope.customer.MILESTONES.push({TYPE:'',START_DATE:'',END_DATE:'',STATUS:'UNDEFINED'});
    };

    $scope.setMilestoneStatus = function(milestone){
        var d = new Date();

        var startD = new Date(milestone.START_DATE.replace(/\-/g,'/'));
        var endD = new Date(milestone.END_DATE.replace(/\-/g,'/'));

        if(!endD){
            endD = startD;
        }
        if(!startD){
            milestone.STATUS='UNDEFINED';
        }else{
            if(d.getTime() < startD.getTime()){
                milestone.STATUS='UPCOMING';
            }
            else if(d.getTime() > endD.getTime()){
                milestone.STATUS='COMPLETED';
            }
            else if(d.getTime() >= startD.getTime() && d.getTime() <= endD.getTime()){
                milestone.STATUS='IN_PROGRESS';
            }else{
                milestone.STATUS='UNDEFINED';  
            }
        }
    }
    $scope.mainURLUpdate = function(urlRec){
        if(urlRec.MAIN){
            $scope.customer.URL = urlRec.URL;
        }
    }
    
    $scope.setMainUrl = function (urlRec){
        $scope.customer.URL = urlRec.URL;
        for(var i in $scope.customer.URLS){
            $scope.customer.URLS[i].MAIN = false;
        }
        urlRec.MAIN=true;
    }
    //loads options into the fields
    $scope.initiate = function () {
        $http.get("./api/customers/getDCs")
            .success(function (data) {
                $scope.dcs = data;
                $scope.dcs.push({ VAL: "" });
            });
        $http.get("./assets/resources/countries.json")
            .success(function (data) {
                $scope.countries = data;
            });
        $http.get("./api/users/getUsers?role=PM")
            .success(function (data) {
                $scope.pms = data;
                $scope.pms.push({"EMPLOYEE_ID":""});
            });
        $http.get("./api/users/getUsers?role=TAM") 
            .success(function(data) {
                $scope.tams = data;
                $scope.tams.push({"EMPLOYEE_ID":""});
            });
        /*$http.get("./api/users/getUsers?role=CM") 
            .success(function(data) {
                $scope.cms = data;
                $scope.cms.push({"EMPLOYEE_ID":""});
            });*/
        $http.get("./api/customers/getPartners") 
            .success(function(data) {
                $scope.partners = data;
                $scope.partners.push({ "VAL": "" });
            });
        $http.get("./api/tenants/getTargets")
            .success(function (data) {
                $scope.slaTargets = data;
            });
        $http.get("./api/tenants/getReasons")
            .success(function (data) {
                $scope.slaReasons = data;
            });
    };

    $scope.getSLAReasonText = function (id) {
        if ($scope.slaReasons) {
            var obj = $scope.slaReasons.filter(function (obj) {
                return obj.ID == id;
            });
            if (obj[0]) {
                return obj[0].REASON;
            } else {
                return "";
            }
        } else {
            return "";
        }
    };

    $scope.getPmText = function (id) {
        if ($scope.pms) {
            var obj = $scope.pms.filter(function (obj) {
                return obj.EMPLOYEE_ID == id;
            });
            if (obj[0]) {
                return obj[0].USER_NAME;
            } else {
                return "";
            }
        } else {
            return id;
        }
    };

    $scope.getCmText = function (id) {
        if ($scope.tams) {
            var obj = $scope.cms.filter(function (obj) {
                return obj.EMPLOYEE_ID == id;
            });
            if (obj[0]) {
                return obj[0].USER_NAME;
            } else {
                return "";
            }
        } else {
            return "";
        }
    };

    $scope.getTamText = function (id) {
        if ($scope.tams) {
            var obj = $scope.tams.filter(function (obj) {
                return obj.EMPLOYEE_ID == id;
            });
            if (obj[0]) {
                return obj[0].USER_NAME;
            } else {
                return "";
            }
        } else {
            return id;
        }
    };

    $scope.nullDate = function(v){
        if(v===null||v===""){
            return null;
        }else{
            return v;
        }
    };

    //function that sets the live bool for customers 
    $scope.liveCheck = function () {
        var d = new Date();
        if ($scope.customer.GOLIVEDATE !== null) {
            var dCurr = new Date($scope.customer.GOLIVEDATE.replace(/-/g, '\/'));
            if (dCurr < d) {
                $scope.customer.LIVE = 1;
            } else {
                $scope.customer.LIVE = 0;
            }
        } else {
            $scope.customer.LIVE = 0;
        }
    };
    $scope.showFactSheet = function (){
        $('#factSheet').modal('show');
    };
    //retrieves customer data upon changing the dropdown
    $scope.getCustomer = function (selection) {
        var code = /^[A-z0-9-]{3,12}/.exec(selection);
        $scope.getVersion();
        $http.get("./api/customers/getCustomer?code=" + code)
            .success(function (data) {
                $scope.originalCustomer = JSON.parse(JSON.stringify(data));
                $scope.customer = data;
                $scope.invalidCode = false;
                $scope.editionChange();
                $scope.activeTestCnt();
                if($scope.customer.SCORECARD_KEY){
                    $scope.scoreCardId = $scope.customer.SCORECARD_KEY;
                    var scPath = /(\d+)-(\w{3,12})-(\d{1,2})-(\d{4})/.exec($scope.customer.SCORECARD_KEY);
                    $scope.scoreCardDate = scPath[3] + "-" + scPath[4];
                    $scope.scoreCardBtn = true;
                    $("#scoreCardBtn").prop("disabled", false);
                }else {
                    $scope.scoreCardBtn = false;
                    $("#scoreCardBtn").prop("disabled", true);
                }
                $scope.editionChange();
                $scope.oldVersion = $scope.customer.VERSION === 1 ? 1 : parseInt($scope.customer.VERSION) - 1;
                if($location.search().factSheet && !$scope.reload){
                    $('#factSheet').modal('show');
                    $scope.reload = true;
                }
            });
    };
    $scope.addContact = function(type){
        var proto = {NAME:"",EMAIL:"",PHONE:"",TIMEZONE:"",TITLE:"",TYPE:""}
        if(type ==='CUSTOMER'){
            $scope.customer.CONTACTS.CUSTOMER.push(proto);
        }
        else if(type ==='PARTNER'){
            $scope.customer.CONTACTS.PARTNER.push(proto);
        }
    }
    $scope.activeTestCnt = function () {
        $scope.activeTests = $scope.customer.CATCHPOINT_TESTS.filter(function (t) { return t.ACTIVE == true }).length;
    };
    $scope.saving = false;
    //save changes
    $scope.updateCustomer = function () {
        $("#saveLoad").Loadingdotdotdot({
            "speed": 400,
            "maxDots": 6,
            "word": "Saving"
        });
        $scope.saving=true;
        
        $scope.showUpdatingSPCTenants = true;

        $http.put("./api/customers/setCustomer", JSON.stringify($scope.customer))
            .success(function (data) {
                $scope.successAlert = true;
                $scope.originalCustomer = JSON.parse(JSON.stringify(data));
                $scope.customer = data;
                $scope.oldVersion = parseInt($scope.customer.VERSION) - 1;
                $("#saveLoad").Loadingdotdotdot("Stop");
                $("#saveLoad").html("");
                $scope.saving=false;
            })
            .error(function () {
                $scope.failAlert = true;
                $scope.saving=false;
                $("#saveLoad").Loadingdotdotdot("Stop");
                $("#saveLoad").html("");
            });
    };
    $scope.editionTypeHelper = function(){
        if($scope.customer.HYBRIS_EDITION){
            if($scope.customer.HYBRIS_EDITION.indexOf('Cores') !== -1 || $scope.customer.HYBRIS_EDITION ==='Edge'){
                return 'Cores';
            }
            else if($scope.customer.HYBRIS_EDITION.indexOf('Revenue') !== -1){
                return '€';
            }
            else if($scope.customer.HYBRIS_EDITION === 'PPV' || $scope.customer.HYBRIS_EDITION === 'Hybris Hosting'){
                return 'Page Views';
            }else{
                return ' ';
            }
        }
        return '  ';
    }
    $scope.execSummary = function(){
        $http.get("./api/customers/getFactSheets?id=" + $scope.customer.CUSTOMERID).success(function(data){
            $scope.execFactSheets = data;
        });
    }
    $scope.sendFactSheet = function (){
        $http.get("./api/customers/sendFactSheet?to=" + $scope.factSheetTo + "&code=" + $scope.customer.CUSTOMERCODE).success(function () {
            $scope.successSendFSAlert = true;
            $scope.failSendFSAlert = false;
        }).error(function () {
            $scope.successSendFSAlert = false;
            $scope.failSendFSAlert = true;
        });
    }
    $scope.sendExecSummary = function (){
        $http.get("./api/customers/sendExecSummary?to=" + $scope.execSummaryTo + "&code=" + $scope.customer.CUSTOMERCODE).success(function () {
            $scope.successSendESAlert = true;
            $scope.failSendESAlert = false;
        }).error(function () {
            $scope.successSendFSAlert = false;
            $scope.failSendESAlert = true;
        });
    }
    $scope.MinInfoChk = function () {
        return $scope.customer.EDITION_CONTRACT_VALUE && $scope.customer.HYBRIS_EDITION && $scope.customer.GOLIVEDATE && $scope.customer.KICKOFFDATE && $scope.customer.CONTRACTSIGDATE && $scope.customer.URL && $scope.customer.CUSTOMER_SUMMARY && $scope.customer.INDUSTRY;
    };
    $scope.pCode = $location.search().code;
    $scope.initiate();

    $scope.getVersion = function () {
        $http.get("./api/versions/getTopVersion?code=" + $scope.pCode + "&month=" + $scope.versionDate + "-01").success(function (data) {
            $scope.version = data;
        });
    };
    $scope.projectDuration = function (customer){
        if(customer){
            if(customer.KICKOFFDATE && customer.GOLIVEDATE){
                var kOff = new Date(customer.KICKOFFDATE.replace(/-/g, '\/'));
                var goLive = new Date(customer.GOLIVEDATE.replace(/-/g, '\/'));

                var months;
                months = (goLive.getFullYear() - kOff.getFullYear()) * 12;
                months -= kOff.getMonth() + 1;
                months += goLive.getMonth();
                return (months <= 0 ? 0 : months) + ' Months';
            }
            return 'N/A';
        }
    };
    $scope.getCustomerHistory = function () {
        $http.get("./api/customers/getCustomer?code=" + $scope.pCode + "&version=" + $scope.oldVersion).success(function (data) {
            $scope.prevVCustomer = data;
            if (!$scope.versionCompare) {
                $scope.versionCompare = true;
            }
        })
    };
    
    //manual tenant provisioning for out of cycle
    $scope.provisionTenants = function(){

        $scope.tenantSyncing=true;
        $scope.tenantSyncError=false;
        $scope.tenantSyncLoad=true;

        $http.get("./api/customers/provisionTenants?key=" + $scope.customer.CUSTOMER_KEY).success(function () {
            $scope.getCustomer($scope.pCode);
            setTimeout(function() {$scope.tenantSyncing = false}, 500);
            $scope.tenantSyncLoad=false;
        }).error(function(){
            $scope.tenantSyncError = true;
            $scope.tenantSyncLoad=false;
        })
    };

    $scope.saveBtn = false;
    $scope.tenantBtn = false;
    $scope.acvShow = false;
    $scope.scoreCardBtn = false;
    $scope.editionEdit=false;


    //initiate version date as previous month
    $scope.versionDate = new moment().subtract(1, 'months').date(1).format("YYYY-MM");
    $scope.reload = false;
    if ($scope.pCode !== undefined) {
        $scope.getCustomer($scope.pCode);
        $scope.invalidCode = false;
    } else {
        $scope.invalidCode = true;
    }

}]);