app.controller('outagesManager', ['$scope', '$http','$location','NgTableParams', function($scope, $http,$location,ngTableParams) {
    var self=this;

    var tourContent = [
        {
            element: "",
            title: "Customer Records",
            content: "<p>This page manages Customer Records.</p>" + 
            "<p>To see a full tour of the controls on this page click 'Next' otherwise click 'End tour'</p>"
        },
        {
            element: "#filterCustomer",
            title: "Filters",
            content: "<p>Filters affect the data shown the table.</p>" + 
                     "<p>Each column can be filtered</p>",
            placement: "left"
        },
        {
            element: "#customerTbl",
            title: "Customers table",
            content: "<p>The table loads all Customers</p>",
            placement: "top"
        },
        {
            element: "#searchTbl",
            title: "Search Table",
            content: "<p>Type in any search term to search the table</p>",
            placement: "bottom"
        },
        {
            element: "#openRec0",
            title: "Open Customer Record",
            content: "<p>Navigates to the selected cusomter record page</p>",
            placement: "left"
        }
    ];
    var tour = $scope.createTour(tourContent);
    $scope.showPreview = false;
    //info button binding
    $scope.infoTour = function () {
        tour.init();
        tour.restart();
    };
    $scope.search = {term:''};
    $scope.loadData = function(){
        $http.get('/api/serviceDisruption/getAllNotifications') 
            .success(function(data) {
                $scope.outagesData = data;

                $scope.ids =  _.uniq(data.map(v => v.ID).sort());
                $scope.customerNames = _.uniq(data.map(v => v.CUSTOMERS).sort());
                $scope.users = _.uniq(data.map(v => v.CREATED_BY).sort());
                $scope.date = _.uniq(data.map(v => v.CREATED_ON).sort());
                
                self.outagesTable = new ngTableParams({
                    page: 1,
                    count: 15,
                    sorting: { CREATED_ON: "desc" } ,
                    filter: $scope.search
                }, {
                    total:$scope.outagesData.length,
                    getData: function(params) {
                        return  $scope.tblDataFilter(params,$scope.outagesData);
                    }
                });
                self.applySelectedSort = applySelectedSort;
                $scope.activeSort='CREATED_ONasc';    
        });
    };

    function applySelectedSort(col,dir){
        self.outagesTable.sorting(col, dir);
        $scope.activeSort=col+dir;
    }
    $scope.loadData();
}]);