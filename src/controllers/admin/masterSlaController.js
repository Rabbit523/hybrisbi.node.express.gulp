//new customer page controller

app.controller('masterSlaController',['$scope','$http',function ($scope,$http){
    //push master SLA into hana
    
    $scope.newSLO = {};
    //function to add the updated SLA to db
    
     $scope.addNewSla = function(){
        $scope.successAlert = false; 
        $scope.failAlert = false;  
        if($scope.forms.newSLOForm.$valid ){
             $scope.successAlert = false; 
              $scope.failAlert = false;  
             $http.put("/hybrisbi_dest/HYBRIS_BI_DEV/sections/admin/xsjs/masterSlaConnector.xsjs?cmd=setMasterSLA",JSON.stringify($scope.newSLO))
                .success(function() {
                    $scope.successAlert = true; 
                })
                .error(function(){
                    $scope.failAlert = true; 
            });
        }
    };
}]);