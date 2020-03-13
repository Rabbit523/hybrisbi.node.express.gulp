app.controller('customerManager', ['$scope','$http','NgTableParams','$location',function($scope,$http,ngTableParams,$location) {
        //initiates all tooltips
		$scope.tooltips();
        $scope.customerCodes = [];
        $scope.customerNames = [];
        $scope.tams = [];
        $scope.pms = [];
		$scope.regions = [{"region": "APJ"}, {"region": "EMEA"}, {"region": "GCR"}, {"region": "LAC"}, {"region": "MEE"}, {"region": "NA"}];
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

        //info button binding
        $scope.infoTour = function () {
            tour.init();
            tour.restart();
        };
        $scope.search = {term:''};
        if($location.search().user){
            $scope.search.term = $scope.me.fullName;
        }
        $http.get("./api/customers/getDCs")
        .success(function (data) {
            $scope.dcs = data;
            $scope.dcs.push({ VAL: "" });
        });
        $scope.loadData = function(){
            $http.get('/api/customers/getCustomersFull') 
                .success(function(data) {
                    $scope.customersData = data;

                    $scope.customerCodes =  _.uniq(data.map(v => v.CUSTOMERCODE).sort());
                    $scope.customerNames = _.uniq(data.map(v => v.CUSTOMERNAME).sort());
                    $scope.tams = _.uniq(data.map(v => v.TAM).sort());
                    $scope.pms = _.uniq(data.map(v => v.PM).sort());
                    
                    self.customersTable = new ngTableParams({
                        page: 1,
                        count: 15,
                        sorting: { CUSTOMERCODE: "asc" } ,
                        filter: $scope.search
                    }, {
                        total:$scope.customersData.length,
                        getData: function(params) {
                            return  $scope.tblDataFilter(params,$scope.customersData);
                        }
                    });
                    self.applySelectedSort = applySelectedSort;
                    $scope.activeSort='CUSTOMERCODEasc';    
            });
        };
        function applySelectedSort(col,dir){
            self.customersTable.sorting(col, dir);
            $scope.activeSort=col+dir;
        }
        $scope.addCustomer = function(){
            $('#customerModal').modal('show');
        }
        $scope.saveCustomer = function (){
            if($scope.customerForm.$valid === true){
                $http.put("/api/customers/addCustomer",JSON.stringify($scope.newCustomer))
                    .success(function() {
                        $('#customerModal').modal('hide');
                        $scope.loadData();
                        $scope.newCustomer = {};
                        $scope.failAlert = false;
                    }).error(function(){
                        $scope.failAlert = true; 
                    });
            }
        }
        $scope.loadData();
        if($location.search().new && $scope.permissions.CUSTOMER_ADMIN){
            $('#customerModal').modal('show');
        }

}]);