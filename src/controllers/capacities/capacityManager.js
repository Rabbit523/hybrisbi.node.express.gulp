//manage capacities data
app.controller('capacityManager',['$scope','$http', function($scope,$http){ 
    $scope.forms={};
    $scope.capacity={};
    $scope.capacity.TYPE=null;
    
    ///loads Capacities for page page
    $scope.loadCapacities= function(){
        $http.get("/api/targets/getCapacities") 
            .success(function(data) {
                $scope.capacities = convertHanaJSON(data.tables);
        });
    }
    $scope.updateCapacity= function(){
        if($scope.forms.updateForm.$valid){
            $http.put("/api/targets/setCapacities",JSON.stringify($scope.capacity)) 
                .success(function(data) {
                    $scope.loadCapacities();
                    $scope.capacityUpdateAlert=true;
            });
        }
    }
    $scope.get= function(){
        var target=$scope.capacities.filter(function (el) {
            return (el.VAL === $scope.capacity.TYPE);
        });
        $scope.capacity.CAPACITY=target[0].CAPACITY;
        $scope.capacity.SCALAR=target[0].SCALAR;
    }
    $scope.loadCapacities();
    

}]); 