//managing initiatives data
app.controller('initiativeManager',['$scope','$http','NgTableParams', function($scope,$http,ngTableParams){ 
    $scope.initiative = {};
    $scope.newInitiative = {};
    $scope.forms = {};

    var self = this;
    var originalData = {};
    
    //functions to operate row editing
    function del(row) {
        var data = self.initiativesTable.settings().dataset;
        for(var i in data){
            if(row == data[i]){
                data.splice(i,1);
            }
        }
        self.initiativesTable.reload();
    }
    function resetRow(row, rowForm){
      row.isEditing = false;
      rowForm.$setPristine();
      for (var i in originalData){
        if(originalData[i].id === row.id){
            return originalData[i];
        }
      }
    }
    function cancel(row, rowForm) {
      var originalRow = resetRow(row, rowForm);
      angular.extend(row, originalRow);
    }
    function save(row, rowForm) {
      var originalRow = resetRow(row, rowForm);
      var userId = $scope.users.filter(function (el) {
                return (el.VAL === row.USER_NAME);
            });
      row.RESPONSIBLE = userId[0].EMPLOYEE_ID;
      angular.extend(originalRow, row);
    }
    self.cancel = cancel;
    self.del = del;
    self.save = save;
    
    $scope.regions = [ {"region":"APJ"},{"region":"EMEA"},{"region":"GCR"},{"region":"LAC"},{"region":"MEE"},{"region":"NA"},{"region":""}];
    $scope.employeeTypes = [];
    $scope.roles = [];
    $scope.subRoles = [];
    $scope.users = [];
    //default dates
    $scope.startDate = new Date(new Date().getFullYear(), 0, 1).toISOString().substring(0,10);
    $scope.endDate = new Date((new Date().getFullYear() + 1), 0, 1).toISOString().substring(0,10);
    
    ///initiator for page
    $scope.initiate = function(){
        //get tams
        $http.get("./api/capacities/initiatives/getUsers") 
            .success(function(data) {
                $scope.users = data;
        });
        //get possible initiatives
        $http.get("./api/capacities/initiatives/getInitiatives") 
            .success(function(data) {
                $scope.initiativeOptions = data;
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
        $scope.getInitiativesData();
    };

    
    //retrieves initatives data with optional filters 
    $scope.getInitiativesData = function(){
    	var queryParams = [
            new QueryParam("startDate", $scope.startDate),
            new QueryParam("endDate", $scope.endDate),
            new QueryParam("regions", $scope.region, "region"),
			new QueryParam("types", $scope.type, "EMPLOYEE_TYPE"),
			new QueryParam("roles", $scope.role, "ROLE"),
			new QueryParam("subRoles", $scope.subRole, "SUB_ROLE")
        ];
        var initiativesDataUrl = new URLBuilder("/api/capacities/initiatives/getInitiativesData", queryParams).toString(); 
        
        $http.get(initiativesDataUrl) 
            .success(function(data) {
                $scope.initiativesData = data;
                originalData = angular.copy($scope.initiativesData);
                self.initiativesTable = new ngTableParams({
                    page: 1,
                    count: 10
                }, {
                    dataset:$scope.initiativesData
                });
        });
    };
    //save new initiative assignment
    $scope.assignInitiative = function(){
        if($scope.forms.assignInitiative.$valid){
            $http.put("/api/capacities/initiatives/assignInitiative",JSON.stringify($scope.initiative))
                .success(function() {
                    $scope.successAssignAlert = true; 
                    $scope.getInitiativesData();
            });
        }
    };
    //create new initiative entry
    $scope.addInitiative = function(){
        if($scope.forms.newInitiative.$valid === true){
            $scope.duplicateAlert = false; 
            $http.put("/api/capacities/initiatives/addInitiative",JSON.stringify($scope.newInitiative))
                .success(function() {
                    $scope.successNewInitiativeAlert = true; 
                    //get possible initiatives
                    $http.get("/api/capacities/initiatives/getInitiatives") 
                        .success(function(data) {
                            $scope.initiativeOptions = data;
                    });
            }).error(function(){
                $scope.duplicateAlert = true; 
            });
        }
    };
    //remove initiative
    $scope.removeInitiative = function(){
        if($scope.delInitiative !== undefined){
            $http.get("/api/capacities/initiatives/removeInitiative?initiative=" + $scope.delInitiative) 
                .success(function() {
                    $scope.successRemoveAlert = true; 
                    $http.get("/api/capacities/initiatives/getInitiatives") 
                        .success(function(data) {
                            $scope.initiativeOptions = data;
                    });
            }).error(function(){
                $scope.failRemoveAlert = true; 
            });
        }
    };
    
    $scope.updateInitiativesData = function(){
    	var queryParams = [
            new QueryParam("startDate", $scope.startDate),
            new QueryParam("endDate", $scope.endDate),
            new QueryParam("regions", $scope.region, "region"),
			new QueryParam("types", $scope.type, "EMPLOYEE_TYPE"),
			new QueryParam("roles", $scope.role, "ROLE"),
			new QueryParam("subRoles", $scope.subRole, "SUB_ROLE")
        ];
        var initiativesChangeUrl = new URLBuilder("/api/capacities/initiatives/updateInitiativesData", queryParams).toString(); 
        
        $http.put(initiativesChangeUrl,JSON.stringify($scope.initiativesData))
            .success(function() {
                $scope.successUpdateAlert = true; 
                $scope.getInitiativesData();
        });
    };
    
    $scope.initiate();
}]); 