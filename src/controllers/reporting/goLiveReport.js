app.controller('goLiveReport',['$scope','$http','$filter',function($scope,$http,$filter){
    $scope.pms = [];
    $scope.customers = [];
    $scope.regions = ["APJ","EMEA", "GCR","LAC","MEE","NA"];
    $scope.REGIONS=[];
    $scope.PROJS=[];
    $scope.PMS = [];
    $scope.groupedGoLives = [];
    if($scope.me.region==='NA'){
        $scope.REGIONS.push('LAC')
    }
    $scope.REGIONS.push($scope.me.region)
    
    $scope.infoToolTip = function (e, val) {

        $scope.toolTip = val;
        $("#toolTip").removeClass("hidden");
        $("#toolTip").css({ 'top': e.clientY, 'left': e.clientX });

    };

    $scope.hideToolTip = function () {
        $("#toolTip").addClass("hidden");
    };

    $scope.loadData = function(){

        $http.get('/api/customers/goLives').success(function(data) {
            $scope.pms = _.uniq(data.map(v => v.PM).sort());
            $scope.customers =  _.uniq(data.map(v => v.CUSTOMERCODE).sort());
            $scope.goLiveRaw=data;
            $scope.filter();
        });
    }
    function daysDelay(curr){
        var ONE_DAY = 1000 * 60 * 60 * 24;
        if(curr){
            var d= new Date();
            d.setHours(0,0,0,0);
            var goLive= new Date(curr.replace(/-/g,'/'))
            return Math.round((goLive.getTime() - d.getTime())/ONE_DAY);
        }
        return null;
    }
    $scope.filter = function(group){
        if(group){
            $scope.groupBy=group
        }
        var fltrs={
            REGION:$scope.REGIONS,
            CUSTOMERCODE:$scope.PROJS,
            PM:$scope.PMS
        }
        function comparator(expected, actual){  
            if(actual.length>0){
                return actual.indexOf(expected) > -1;
            }
                return true
          };

 
        var fltrdData = $filter('filter')($scope.goLiveRaw,fltrs,comparator);
        var groupBy = $scope.groupBy === 'pm' ? 'PM' : 'REGION';
        var fltrdData = $filter('orderBy')(fltrdData, ['+' + groupBy]);

        if(fltrdData){

            //group by persons in report
            var groupedGoLives = fltrdData.reduce(function (r, a) {

                r[a[groupBy]] = r[a[groupBy]] || [];
                r[a[groupBy]].push({CUSTOMERCODE:a.CUSTOMERCODE,GOLIVEDATE:a.GOLIVEDATE,DELAY:daysDelay(a.GOLIVEDATE),COMMENTS:a.COMMENTS});
                return r;
            }, Object.create(null));
            $scope.groupedGoLives = Object.keys(groupedGoLives).map(function(k) { return {name:k,data:groupedGoLives[k]} });

            var keys=Object.keys($scope.groupedGoLives);
            for(var i in keys){
                $scope.groupedGoLives[i].data.sort(function(a,b){
                    if(a.DELAY===null && b.DELAY===null){
                        return 0;
                    }
                    else if(b.DELAY === null){
                        return -1;
                    }
                    else if(a.DELAY === null){
                        return 1;
                    }
                    return a.DELAY- b.DELAY;
                })
            }
 
        }
    }
    $scope.extractData = function(){
        extractFile($scope.goLiveRaw,'Go_Lives.csv');
    }

    $scope.getPanelClass = function(delay){
        if(delay===null){
            return 'panel-default';
        }
        else if(delay<=7){
            return 'panel-danger';
        }
        else if(delay<=28){
            return 'panel-warning';
        }
        else if(delay>28){
            return 'panel-success';
        }

    }
    $scope.calcWidth = function(){

        return {'width' : $scope.groupedGoLives.length*250 + 'px'}
    }
    $scope.groupBy="pm";
    $scope.loadData();
}]);