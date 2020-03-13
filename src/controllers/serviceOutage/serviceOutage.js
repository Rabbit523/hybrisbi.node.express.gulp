app.controller('serviceOutage', ['$scope', '$http','$location','$timeout', function($scope, $http,$location,$timeout) {
    $scope.statuses=['Open'];
    $scope.outage = {START_DATE_TIME:'',END_DATE_TIME:'',STATUS:'Open'};
    $scope.potentialCauses=['Root cause TBD','Network','Application','Internet Service Provider','Data Center Provider', 'Human Error'];
    $scope.impacts = ['Storefront Down','Back Office (Admin Servers) Down','Intermittent Storefront availability','Intermittent Back Office (Admin Servers) availability','Unable To Process Orders','3rd party services unavailable (Payment Processor, Web Service calls)'];

    $scope.factSheets = [];
    $http.get("/api/customers/getCodes").success(function(data) {
        $scope.customers = $.map(data.tables, function(e) {
            var code = /([A-z0-9\-]*)-([A-z0-9]*)/.exec(e.VAL);
            return e.VAL;
        });
        var code = $location.search().code;
        if (code !== undefined) {
            $scope.outage.CUSTOMERS = _.filter($scope.customers,function(e){return e.substring(0,3) === code});
        }

    });

    $scope.getDelay = function () {
        if($scope.outage.START_DATE_TIME && $scope.outage.END_DATE_TIME){
            var sD = new Date($scope.outage.START_DATE_TIME);
            var eD = new Date($scope.outage.END_DATE_TIME);

            return Math.round((Math.abs(eD-sD) / 36e5) * 100 )/ 100;
        }
        return "";
    };
    $scope.statusSet = function (){
        if($scope.outage.END_DATE_TIME === ""|| $scope.outage.END_DATE_TIME === null){
            $scope.outage.STATUS = 'Open';
            $scope.statuses=['Open'];
        }else{
            $scope.statuses = ['Solution Provided','Resolved'];
        }
    }
    $scope.clearCust = function(){
        $scope.outage.ADD_FACT_SHEET=false;
        $scope.outage.CUSTOMERS=[];
    }
    $scope.customerDcs = function(){
        if($scope.outage.ALL_CUSTOMERS){
            return '';
        }
        var dcs = $scope.factSheets.map(function (e){
            if(e){return e.DATACENTER;}
        });
        return _.uniq(dcs).toString();
    };
    $scope.sendOutageNotification = function(){
        $http.put('./api/serviceDisruption/sendNotification',JSON.stringify($scope.outage)).success(function(data){
            $scope.successAlert = true;
            $scope.outage.ID = data.ID;
        })
    };
    $scope.getFactSheets = function () {
        var codes = $scope.outage.CUSTOMERS.map (function (e){
            var code = /([A-z0-9\-]*)-([A-z0-9]*)/.exec(e);
            return code[1];
        })
        $http.get("/api/customers/getFactSheets?codes=" + codes).success(function(data) {
            $scope.factSheets= data;
        });
    };
    $scope.dateTimePickerOptions = {
        format:'YYYY-MM-DD HH:mm'
    };
    $scope.currentTime = function(){
        var d = new Date();
        return d.toUTCString().replace('GMT','UTC');
    };
    $scope.getCustomerDisplay = function(){
        if($scope.outage.ID){
            if($scope.outage.ALL_CUSTOMERS){
                return 'All Customers';
            }else{
                var codes = $scope.outage.CUSTOMERS.map (function (e){
                    var code = /([A-z0-9\-]*)-([A-z0-9]*)/.exec(e);
                    return code[1];
                });
                return codes.join();
            }
        }else{
            return 'N/A';
        }
    };
    $scope.getNotification = function (id){
        $http.get('/api/serviceDisruption/getNotification?id=' + id).success(function(data){
            $scope.outage = data;
            $scope.getFactSheets();
        });
    }
    var id = $location.search().id;
    if (id !== undefined) {
        $scope.getNotification(id);
    }
}]);