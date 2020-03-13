//Contractor time entry page controller
app.controller('contractorTimeEntry',['$scope','$http','NgTableParams', function($scope,$http,ngTableParams){
    var originalData = {};
    var self = this;
    
    $scope.entry={};
    
    $scope.GRs=['600324','600318','General'];
    
    var date= new Date();
    $scope.entry.ENTRY_DATE = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().slice(0, 10);
   
    $http.get("/api/users/getUsers?role=PM&type=C") 
        .success(function(data) {
            $scope.pms = $.map(data, function(value, index) {return [value];});;
            $scope.pms.push({"VAL":"","EMPLOYEE_ID":""});
    });
    //create new entry
    $scope.submitEntry= function(){
       
        if($scope.entryForm.$valid === true){
            
            $scope.entry.PM_NAME= _.findWhere($scope.pms, {EMPLOYEE_ID: $scope.entry.PM}).VAL;
            $scope.entry.PM_ADJ= "1" + $scope.entry.PM.substring(1,$scope.entry.PM.length);
            
            $http.put("/api/pm/contractorTimeEntry/newEntry",JSON.stringify($scope.entry))
            .success(function() {
                $scope.successEntryAlert = true;
                $scope.loadEntries();
            })
            .error(function(){
                $scope.failEntryAlert = true;  
            });
        }
    }
    //update entries
    $scope.saveChanges= function(){
        var pm="1"+$scope.entry.PM.substring(1,$scope.entry.PM.length);
        $http.put("/api/pm/contractorTimeEntry/updateEntriesForPM?PM="+pm,JSON.stringify($scope.entriesData))
        .success(function() {
            $scope.successTableAlert = true;
            $scope.loadEntries();
        })
        .error(function(){
            $scope.failTableAlert = true;  
        });
    }
    //functions to operate row editing
    function del(row) {
        var data = self.entriesTable.settings().dataset;
        for(var i in data){
            if(row == data[i]){
                data.splice(i,1);
            }
        }
        self.entriesTable.reload();
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
      angular.extend(originalRow, row);
    }
    self.cancel = cancel;
    self.del = del;
    self.save = save;
    
    $scope.loadEntries= function(){
        var pm="1"+$scope.entry.PM.substring(1,$scope.entry.PM.length);
        $http.get("/api/pm/contractorTimeEntry/getEntriesForPM?PM="+pm) 
        .success(function(data) {
            $scope.entriesData = convertHanaJSON(data);
            if($scope.entriesData.length>0){
                $scope.modifyEntries=true;
                $("#saveChangesBtn").prop("disabled", false);
                        
                originalData = angular.copy($scope.entriesData);
                self.entriesTable = new ngTableParams({
                    page: 1,
                    count: 10
                }, {
                    dataset:$scope.entriesData
                });
            }else{
                $scope.modifyEntries=false;
                $("#saveChangesBtn").prop("disabled", true);
            }   
        });    
    }


}]);