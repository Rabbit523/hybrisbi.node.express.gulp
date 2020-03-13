//data importer page controller
app.controller('dataImporter', ['$scope','$http', function($scope,$http){
 
    //redirect for hidden file input
    $scope.browseFile = function(file){
        $(file).click(); 
    };

    //set dates to current month
    var d = new Date();
    $scope.year = d.getFullYear();
    $scope.month = d.getMonth() + 1;
    
    //initiates all tooltips
	$scope.tooltips();
	//initiates full page scroll
	$scope.fullPageScroll();    
    
    //set null files
    $scope.incomingIncidentsFile = null;
    $scope.solvedIncidentsFile = null;
    $scope.backlogIncidentsMonthFile = null;
    $scope.backlogIncidentsWeekFile = null;
    $scope.pccFile = null;
    $scope.changeReqFile = null;
    $scope.changeReqPDSFile = null;
    $scope.changeReqPSEFile = null;
    $scope.pageImpressionsFile = null;
    $scope.pageLoadFile = null;
    $scope.bandwidthFile = null;
    
    //loads options and latest imports 
    $scope.load = function(){
        //get all possible years of data + possibility to add for next year
        $http.get("./api/scoreCards/getYears") 
            .success(function(data) {
                $scope.years = data;
                $scope.years.push({'VAL':($scope.years[$scope.years.length - 1].VAL + 1)});
        });
        //get latest import dates
        $http.get("./api/admin/dataImport/latestData") 
            .success(function(data) {
                $scope.latestData=convertHanaJSON(data.tables);
        });
    };
    
    //watch to test if the file is csv
    $scope.$watch(function() {
        if($scope.incomingIncidentsFile !== null){
            !/.csv/.test($scope.incomingIncidentsFile.name)? $scope.incomingIncidentsAlert = true : $scope.incomingIncidentsAlert = false;
        }
        if($scope.solvedIncidentsFile !== null){
            !/.csv/.test($scope.solvedIncidentsFile.name)? $scope.solvedIncidentsAlert = true : $scope.solvedIncidentsAlert = false;
        }
        if($scope.backlogIncidentsMonthFile !== null){
            !/.csv/.test($scope.backlogIncidentsMonthFile.name)? $scope.backlogIncidentsMonthAlert = true : $scope.backlogIncidentsMonthAlert = false;
        }
        if($scope.backlogIncidentsWeekFile !== null){
            !/.csv/.test($scope.backlogIncidentsWeekFile.name)? $scope.backlogIncidentsWeekAlert = true : $scope.backlogIncidentsWeekAlert = false;
        }
        if($scope.pccFile !== null){
            !/.csv/.test($scope.pccFile.name)? $scope.pccAlert = true : $scope.pccAlert = false;
        }
        if($scope.changeReqFile !== null){
            !/.xlsx/.test($scope.changeReqFile.name)? $scope.incomingChangeReqAlert = true : $scope.incomingChangeReqAlert = false;
        }
        if($scope.changeReqPDSFile !== null){
            !/.xlsx/.test($scope.changeReqPDSFile.name)? $scope.incomingChangeReqPDSAlert = true : $scope.incomingChangeReqPDSAlert = false;
        }
        if($scope.changeReqPSEFile !== null){
            !/.xlsx/.test($scope.changeReqPSEFile.name)? $scope.incomingChangeReqPSEAlert = true : $scope.incomingChangeReqPSEAlert = false;
        }
        if($scope.pageImpressionsFile !== null){
            !/.csv/.test($scope.pageImpressionsFile.name)? $scope.pageImpressionsAlert = true : $scope.pageImpressionsAlert = false;
        }
        if($scope.bandwidthFile !== null){
            !/.csv/.test($scope.bandwidthFile.name)? $scope.bandwidthAlert = true : $scope.bandwidthAlert = false;
        }
        if($scope.pageImpressionsFile !== null){
            !/.csv/.test($scope.pageImpressionsFile.name)? $scope.pageImpressionsAlert = true : $scope.pageImpressionsAlert = false;
        }
        if($scope.pageLoadFile !== null){
            !/.csv/.test($scope.pageLoadFile.name)? $scope.pageLoadAlert = true : $scope.pageLoadAlert = false;
        }
    });
    
    $scope.generateScoreCards = function(){
        var params= "?year=" + $scope.year +"&month=" + $scope.month;
        $http.get("./api/admin/dataImport/generateScoreCards" + params)
            .success(function(data) {
                $scope.scoreCardsAlert = true;
                
            });  
    };
    
    $scope.importSPCData = function(){
        var params = "?year=" + $scope.year;
        
        //function to parse files and push to hana
        $scope.parseFile = function (file, apiDest){
            var spcParser = new FileReader();

            spcParser.onload = function(e){
                var rawData = e.target.result;
                var workbook = XLSX.read(rawData, {type : 'binary'});
               
                //this is for spc files only due to junk headers at the top 4 rows are skipped 
                var data = XLSX.utils.sheet_to_json(workbook.Sheets["Sheet1"],{range:4});
                $http.put(apiDest + params,data);
            }
            spcParser.readAsBinaryString(file)
        };

        if($scope.changeReqFile !== null){
            $scope.parseFile($scope.changeReqFile,"/api/admin/dataImport/importChangeReqs");
            $scope.successChangeReqAlert = true;
        }
        if($scope.changeReqPDSFile !== null){
            $scope.parseFile($scope.changeReqPDSFile,"/api/admin/dataImport/importChangeReqsPsePds?type=PDS");
            $scope.successChangeReqPDSAlert = true;
        }
        if($scope.changeReqPSEFile !== null){
            $scope.parseFile($scope.changeReqPSEFile,"/api/admin/dataImport/importChangeReqsPsePds?type=PSE");
            $scope.successChangeReqPSEAlert = true;
        }
        
    };
    $scope.importBIData = function (){
        var params = "?year=" + $scope.year;
        
        //hide warnings
        $scope.successIncomingAlert = false;
        $scope.successSolvedAlert = false; 
        $scope.successBacklogMonthAlert = false;  
        $scope.successBacklogWeekAlert = false;
        $scope.successPccAlert = false;
        
        if($scope.incomingIncidentsFile !== null){
            //incoming incidents import
            Papa.parse($scope.incomingIncidentsFile, {
    	        complete: function(results) {
    		        $http.put("./api/admin/dataImport/importIncomingIncidents" + params,results) 
                        .success(function() {
                            $scope.successIncomingAlert = true;  
                    });
    	        }
            });
        }
        if($scope.solvedIncidentsFile !== null){
            //solved incidents import
            Papa.parse($scope.solvedIncidentsFile, {
    	        complete: function(results) {
    		        $http.put("./api/admin/dataImport/importSolvedIncidents" + params,results) 
                        .success(function() {
                            $scope.successSolvedAlert = true;  
                    });
    	        }
            });
        }
        if($scope.backlogIncidentsMonthFile !== null){
            //backlog per month
            Papa.parse($scope.backlogIncidentsMonthFile, {
    	        complete: function(results) {
    		        $http.put("./api/admin/dataImport/importBacklogIncidentsMonth" + params,results) 
                        .success(function() {
                            $scope.successBacklogMonthAlert = true;  
                    });
    	        }
            });    
        }
        if($scope.backlogIncidentsWeekFile !== null){
            //backlog per week
            Papa.parse($scope.backlogIncidentsWeekFile, {
    	        complete: function(results) {
    		        $http.put("./api/admin/dataImport/importBacklogIncidentsWeek" + params,results) 
                        .success(function() {
                            $scope.successBacklogWeekAlert = true;  
                    });
    	        }
            });        
        }
        if($scope.pccFile !== null){
            //import pcc
            Papa.parse($scope.pccFile, {
    	        complete: function(results) {
    		        $http.put("./api/admin/dataImport/importPcc" + params,results) 
                        .success(function() {
                            $scope.successPccAlert = true;  
                    });
    	        }
            });
        }
        $scope.load();
    };

    $scope.importOpsViewData = function (){
        var params= "?year=" + $scope.year +"&month=" + $scope.month;
        if($scope.pageLoadFile!==null){
            Papa.parse($scope.pageLoadFile, {
    	        complete: function(results) {
    		        $http.put("./api/admin/dataImport/importPageLoad" + params,results) 
                        .success(function() {
                            $scope.successPageLoadAlert = true;
                            $scope.load();  
                    });
    	        }
            });
        }
    };
    $scope.importbandwidthData = function (){
    
        var period= $scope.year +'-' + $scope.month + '-01';
        var params= "?year=" + $scope.year + "&month=" + $scope.month;
        
        if($scope.bandwidthFile !==null){

            var bandwidthData=[];
            function parseMessage(message,pattern){
                var data;
                var dataFound = false;
                while((data = pattern.exec(message)) != null){
                    dataFound = true;
                    var customer = data[1].toUpperCase();
                    var value = parseFloat(data[5]);
                    var type = data[7];
                                
                    //correct value to mbps if needed
                    if(type === 'bps'){
                        value = value /  1000000;
                    }else if(type === 'Kbps'){
                        value = value / 1000;
                    }
                    
                    bandwidthData.push([customer,value,period]);
                }
                return dataFound;
            }
            Papa.parse($scope.bandwidthFile, {
        	        complete: function(results) {
        	            for(var i=1;i<results.data.length;i++){
        	                message = results.data[i][0];
            	            var billingData=parseMessage(message,/^(\w{3})(_|\s)(billing)(\s+)(\d+.\d+|\d+)(\s+|)(\w?bps)/igm);
            	            if(!billingData){
            	               parseMessage(message,/^(\w{3})(_|\s)(public)(\s+)(\d+.\d+|\d+)(\s+|)(\w?bps)/igm)
            	            }
        	            }
        	            
                        $http.put("./api/admin/dataImport/importBandWidth" + params,bandwidthData) 
                            .success(function() {
                                $scope.successBandwidthAlert = true;  
                                $scope.load();
                            });
                }});
        }
    };
    
    var monthSlider = $("#slider")[0];
    //bind configuration	  
    noUiSlider.create(monthSlider, {
        start: $scope.month, 
        connect:[true, false], 
        behaviour: 'tap-drag', 
        step: 1,
        range: {
        	'min': 1,
        	'max': 12
        }
    });

    //bind value changes
    monthSlider.noUiSlider.on('update', function(){
        $scope.month = Math.round(monthSlider.noUiSlider.get());
        //fix for month value not updating on UI should be investigated further as scope digest should occur without this
        if(!$scope.$$phase) {
            $scope.$apply();
        }
    });

    $scope.load();
    
}]);