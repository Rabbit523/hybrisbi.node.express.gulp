//version controller page
app.controller('versionManager', ['$scope','$http','NgTableParams', function($scope,$http,ngTableParams) {
    
    var originalData = {};
    $scope.search = {term:''};
    $scope.productOptions = [];
    $scope.versionOptions = [];
    $scope.gaOptions = [];
    $scope.eolOptions = [];
    var self = this;
    $scope.loadData = function(){
            $http.get("/api/versions/getVersions") 
                .success(function(data) {

                    $scope.versions = data;
                    $scope.productOptions = _.uniq($scope.versions.map(v => v.PRODUCT)).sort();
                    $scope.versionOptions = _.uniq($scope.versions.map(v => v.VERSION)).sort();
                    $scope.gaOptions = _.uniq($scope.versions.map(v => v.GA)).sort();
                    $scope.eolOptions = _.uniq($scope.versions.map(v => v.EOL)).sort();
                    
                    originalData = angular.copy($scope.versions);
                    self.versionsTable = new ngTableParams({
                        page: 1,
                        count: 15,
                        sorting: { VERSION: "desc" } ,
                        filter: $scope.search
                    }, {
                        total:$scope.versions.length,
                        getData: function(params) {
                            return  $scope.tblDataFilter(params,$scope.versions);
                        }
                    });

                    self.applySelectedSort = applySelectedSort;
                    $scope.activeSort='VERSIONdesc';    
            });    
    };
    $scope.saveChanges = function(){
        $http.put("/api/versions/updateTable",JSON.stringify($scope.versions))
        .success(function() {
            $scope.successTableAlert = true;
        })
        .error(function(){
            $scope.failTableAlert = true;  
        });
    };
    $scope.saveVersion = function(){
        $scope.successAlert = false;  
        $scope.failAlert = false;   
        if($scope.versionForm.$valid){
            $http.put("/api/versions/addVersion",JSON.stringify($scope.newVersion))
            .success(function() {
                $scope.loadData();    
                $scope.failAlert = false; 
                $('#versionModal').modal('hide');
            }).error(function(){
                $scope.failAlert = true; 
            });
        }else{
            $scope.failAlert = true; 
        }
    };
    
    //functions to operate row editing
    function del(row) {
        var data = self.versionsTable.settings().dataset;
        for(var i in data){
            if(row == data[i]){
                data.splice(i,1);
            }
        }
        self.versionsTable.reload();
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
    function applySelectedSort(col,dir){
        self.versionsTable.sorting(col, dir);
        $scope.activeSort=col+dir;
    }
    $scope.addVersion = function(){
        $('#versionModal').modal('show');
    }
    $scope.loadData();
    self.cancel = cancel;
    self.del = del;
    self.save = save;
    
}]); 