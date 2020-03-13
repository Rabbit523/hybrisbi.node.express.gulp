//dynamic reports page controller
app.controller('dynamicReport', ['$scope', '$http', '$compile', function ($scope, $http, $compile) {
    //initiates all tooltips
    $scope.tooltips();
    //raw score card csv retrieval
    $scope.rawScoreCards = function () {
        $http.get("./api/report/dynamic/rawScoreCards")
            .success(function (data) {
                extractFile(data, 'raw_score_cards.csv');
            });
    };

    //raw customer data retrieval
    $scope.rawCustomerData = function () {
        $http.get("./api/report/dynamic/rawCustomerData")
            .success(function (data) {
                extractFile(data, 'raw_customer_data.csv');
            });
    };
    //raw pivot data dump
    $scope.rawPivotData = function () {
        extractFile($scope.pivotData, 'raw_pivot_data.csv');
    };
    $scope.BASE_TABLE = '';
    $scope.operators = ['>', '<', '>=', '<=', '!=', '='];
    $scope.subTables = [];
    $scope.baseFltrs =[];

    //retrieve table options
    $http.get("./api/report/dynamic/getTables").success(function (data) {
        $scope.tableOptions = data;
    });

    //get column options for base table and sub table options
    $scope.baseColumns = function () {
        $scope.subTables = [];
        $scope.subTableOptions = $scope.tableOptions.slice();
        $scope.subTableOptions.splice($scope.tableOptions.findIndex(function (i) { return i === $scope.BASE_TABLE }), 1);

        $http.get("./api/report/dynamic/getColumns?table=" + $scope.BASE_TABLE)
            .success(function (data) {
                $scope.baseOptions = data;
            });
    };

    //sets column names for chosen sub table
    $scope.getSubColumns = function (id) {
        $http.get("./api/report/dynamic/getColumns?table=" + $scope.subTables[id].table).success(function (data) {
            $scope.subTables[id].subTableColumns = data;
        });
    };

    $scope.addJoin = function(){
        $scope.subTables.push({table:null,baseKey:null,subKey:null,subTableColumns:null,filters:[]});
    };

    //push parameters to xs engine to retrieve data and generate a pivot chart
    $scope.getData = function () {
        $scope.loading = true;
        var options = { base: $scope.BASE_TABLE, subJoins: [], filters: [] };
        options.filters = options.filters.concat($scope.baseFltrs.map(function(e){
            e.table=$scope.BASE_TABLE;
            return e;
        }));
        for(var i in $scope.subTables){
            var join = $scope.subTables[i];
            options.subJoins.push({table:join.table,baseKey:join.baseKey,subKey:join.subKey});
            for(var i in join.filters){
                join.filters[i].table=join.table;
                options.filters.push(join.filters[i]);
            }
        }

        $http.put("./api/report/dynamic/getData", JSON.stringify(options))
            .success(function (data) {
                $scope.loading = false;
                $scope.pivotUI = true;
                $scope.pivotData=data;
                $("#outputPivot").pivotUI(data, {
                    aggregatorName: "Sum",
                    rendererName: "Table"
                }, true);
            });
    };
}]);