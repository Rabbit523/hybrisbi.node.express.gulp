app.controller('profileController', ['$scope', '$http', function ($scope, $http) {
    $scope.global.load(['roles', 'regions']);

    // fixes multiselect
    $scope.regions = $scope.regions;
    $scope.roles = $scope.roles;

    $scope.$watch('me', () => {
        if($scope.me){
            $scope.user=JSON.parse(JSON.stringify($scope.me));
        }
    });

    $scope.saveMe = () => {

            $http.put("./api/users/save", JSON.stringify($scope.user))
                .success(function () {
                    //refresh me
                    $http.get("/api/session/me").success(function(data){
                        $scope.me=data;
                        if ($scope.me.isUserComplete) {
                            if ($scope.me.role && $scope.me.region) {
                                $http.put("./api/requests/processDefaultRolePermissions", JSON.stringify({
                                    "user": $scope.me.uid,
                                    "role": $scope.me.role,
                                    "region": $scope.me.region
                                }));
                            }
                            $scope.failAlert=false;
                            $scope.closeProfileModal();
                        }else{
                            $scope.failAlert=true;
                        }
                    });
                });        
    }

    $scope.closeProfileModal = () => {
        if ($scope.me.isUserComplete) {
            $scope.modal("#profileModal", false);
        }
    }
}]);