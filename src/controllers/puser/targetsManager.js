//targets page controller
app.controller('targetsManager', ['$scope','$http', function($scope,$http){
    
    //getselected target current values
    $scope.get = function(){
        $http.get("/api/targets/getTarget?type=" + $scope.target.TYPE)
            .success(function(data) {
                $scope.target = data.tables[0]; 
            });  
    };
    
    //if values are not blank save changes to hana
    $scope.set = function(){
        $scope.successAlert = false; 
        $scope.failAlert = false;  
        if($scope.target.GREEN_VALUE !== null &&  $scope.target.GREEN_VALUE !== '' && $scope.target.YELLOW_VALUE !== null && $scope.target.YELLOW_VALUE !== ''){
            $http.put("/api/targets/setTarget",JSON.stringify($scope.target))
                .success(function() {
                    $scope.successAlert = true; 
                })
                .error(function(){
                    $scope.failAlert = true;
                });
        }else{
            $scope.failAlert = true;   
        }
    };
    
    //get dropdown options
    $http.get("/api/targets/getTypes")
        .success(function(data) {
            $scope.types = convertHanaJSON(data.tables); 
    }); 
    
}]);