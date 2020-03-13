app.controller('scoreCardManager', ['$scope','$http','NgTableParams','$location','$filter',function($scope,$http,ngTableParams,$location,$filter) {
        //initiates all tooltips
		$scope.tooltips();
        $scope.customerCodes = [];
        $scope.customerNames = [];
        $scope.tams = [];
        $scope.periods = [];
        $scope.statuses=[];
        var self=this;

        $scope.search = {term:''};
        if($location.search().user){
            $scope.search.term = $scope.me.fullName;
        }

        $scope.loadData = function(){
            $http.get('/api/scoreCards/getScoreCardKey') 
                .success(function(data) {
                    $scope.scData=data;

                    $scope.customerCodes =  _.uniq(data.map(v => v.CUSTOMERCODE).sort());
                    $scope.customerNames = _.uniq(data.map(v => v.CUSTOMERNAME).sort());
                    $scope.tams = _.uniq(data.map(v => v.TAM).sort());
                    $scope.periods = _.uniq(data.map(v => v.PERIOD).sort());
                    $scope.statuses = _.uniq(data.map(v => v.STATUS).sort());
         
                    self.scTable = new ngTableParams({
                        page: 1,
                        count: 15,
                        filter: $scope.search
                    }, {
                        total:$scope.scData.length,
                        getData: function(params) {
                            return  $scope.tblDataFilter(params,$scope.scData);
                        }
                    });
                    self.applySelectedSort = applySelectedSort;  
            });
        };

        function applySelectedSort(col,dir){
            self.scTable.sorting(col, dir);
            $scope.activeSort=col+dir;
        }


        $scope.loadData();

}]);