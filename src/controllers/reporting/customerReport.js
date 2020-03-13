app.controller('customerReport', ['$scope', '$http','$location', '$chartJs',function($scope, $http,$location, $chartJs) {
    $scope.code = $location.search().code;

    $scope.startDate = '2017-01-01';
    $scope.endDate = '2018-03-01';
    $scope.incidentsGroup = "W";
    $scope.loadData = function (){
        var queryParams = [
            new QueryParam("startDate", $scope.startDate),
            new QueryParam("endDate", $scope.endDate),
            new QueryParam("code", $scope.code),
            new QueryParam("type", $scope.incidentsGroup)
        ];
        var mainUrl = "/api/report/customers/";
        var incidentsUrl = new URLBuilder(mainUrl + "getIncidents", queryParams).toString();
        $http.get(incidentsUrl ).success(function(data){
            $scope.incidentsChart = $chartJs.lineChart(data,"By Week","top",false,true,false,false,false);
        });
    }
    $scope.loadData();
}]);