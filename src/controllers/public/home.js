app.controller('home', ['$scope','$http','NgTableParams','$location','$filter',function($scope,$http,ngTableParams,$location,$filter) {

    $scope.assignedCustomers=false;
    $scope.scShortcut=false;
    $scope.$watch(function(){

        if($scope.me){
            if($scope.me.role ==="PM"||$scope.me.role ==="TAM"||$scope.me.role==="PM/TAM"){
                $scope.assignedCustomers=true;
            }
            if($scope.me.role ==="TAM"||$scope.me.role==="PM/TAM"){
                $scope.scShortcut=true;
            }
        }
    });


}]);