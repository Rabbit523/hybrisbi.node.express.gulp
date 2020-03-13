app.controller('usersController', ['$scope', '$http','$filter', 'NgTableParams', function ($scope, $http, $filter,ngTableParams) {
    $scope.global.load(['roles', 'employeeTypes', 'subRoles']);
    $scope.usersNames = [];
    $scope.usersIds = [];
    $scope.actionOpenFilterLabel = 'Open';    
    var self=this;
    $scope.search = {term:''};
    $scope.dataset=[];
    $scope.loadData = function(){
        $http.get('/api/users/getUsers').success(function(data){
            $scope.users=data;
            $scope.usersNames = $scope.users.map(v => v.USER_NAME).sort();
            $scope.usersIds = $scope.users.map(v => v.EMPLOYEE_ID).sort();

            self.usersTable = new ngTableParams({
                page: 1,
                count: 20,
                sorting: { USER_NAME: "asc" } ,
                filter: $scope.search
            }, {
                total:$scope.users.length,
                getData: function(params) {
                    return  $scope.tblDataFilter(params,$scope.users);
                }
            });
            
            self.applySelectedSort = applySelectedSort;
            $scope.activeSort='USER_NAMEasc';    
        });
    }

    function applySelectedSort(col,dir){
        self.usersTable.sorting(col, dir);
        $scope.activeSort=col+dir;
    }
    $scope.addUser = function(){
        $('#userModal').modal('show');
    }
    $scope.saveUser = function (){
        if($scope.userForm.$valid){
            $http.put("/api/users/save",JSON.stringify($scope.newUser))
                .success(function() {
                    $('#userModal').modal('hide');
                    $scope.loadData();
                    $scope.newUser = {};
                }).error(function(){
                    $scope.failAlert = true; 
                });
        }
    }
    $scope.loadData();
}]);