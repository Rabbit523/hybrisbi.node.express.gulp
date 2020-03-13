//score card metrics ui controller
app.controller('scoreCardReport',['$scope','$http',function($scope,$http){

	//initiates all tooltips
	$scope.tooltips();
	//initiates full page scroll
	$scope.fullPageScroll();  
	
	var date = new Date();
	$scope.startDate = new Date(date.getFullYear(), 0, 1).toISOString().slice(0, 10);
	$scope.endDate = new Date(date.getFullYear()+1, 0, 1).toISOString().slice(0, 10);
    $scope.customers = [];
	$scope.regions = [{"region": "APJ"}, {"region": "EMEA"}, {"region": "GCR"}, {"region": "LAC"}, {"region": "MEE"}, {"region": "NA"}, {"region": ""}];
	$scope.status = [{"status": "Initial Creation"}, {"status": "PDF Generated"}, {"status": "Confirmed"}];

    $http.get("/api/customers/getCodes")
		.success(function(data) {
			$scope.customers = $.map(data.tables, function(value) {return value.VAL;});
	});
	$scope.target = function(difference){
		var diff=parseInt(difference);
		if(diff>30){
			return "label-danger";
		}
		if(diff>20){
			return "label-warning";
		}
		return "label-success";
	}
    $scope.loadData = function(){
        
        var queryParams = [
            new QueryParam("startDate", $scope.startDate),
            new QueryParam("endDate", $scope.endDate),
            new QueryParam("regions", $scope.REGIONS, "region"),
            new QueryParam("status", $scope.STATUS, "status"),
            new QueryParam("customers", $scope.PROJS, { substring: [0, 3] })
        ];
            
        var mainUrl = "/api/report/scoreCards/";
        var getMetrics = new URLBuilder(mainUrl + "getMetrics", queryParams).toString();
        var getTotals  = new URLBuilder(mainUrl + "getTotals", queryParams).toString();
        var getByCustomer = new URLBuilder(mainUrl + "getStatus", queryParams).toString();
        
        $http.get(getByCustomer).success(function(data){
        	$scope.byCustomerData=data;           
        })
        $http.get(getMetrics).success(function(data) {
            var months = _.sortBy(_.uniq(_.pluck(data,'CALENDAR_MONTH')),function(num){ return new Date("01/" + num.replace(/-/g, '\/'));});    
            var byStatus = _.groupBy(data,function(e){return e.STATUS;});
            
            for(var i in byStatus){
                
                var currData = _.sortBy(byStatus[i],function(num){ return new Date("01/" + num.CALENDAR_MONTH.replace(/-/g, '\/'))});
                byStatus[i] = Array.from({length:months.length});
                byStatus[i].fill({CNT:0});
                for(var j in currData){
                    byStatus[i][months.indexOf(currData[j].CALENDAR_MONTH)] = currData[j];
                }
            }
            $scope.metricsChart = {
			    type: "bar",
    			data: {
    				labels: months,
    				datasets: [{
    				    label:'Initial Creation',
    				    backgroundColor:"#008FD3",
    				    data:_.pluck(byStatus['Initial Creation'],'CNT')
    				    
    				},
    				{
    				    label:'PDF Generated',
    				    backgroundColor:"#F0AB00",
    				    data:_.pluck(byStatus['PDF Generated'],'CNT') 
    				},
    				{
    				    label:'Confirmed',
    				    backgroundColor:"#4FB81C",
    				    data:_.pluck(byStatus['Confirmed'],'CNT') 
    				}]
    			},
			    options: {
			        legend:{display:true},
    			    tooltips: {
    			       mode: "index",
    			       backgroundColor: 'black',
    			       callbacks: {
    			           footer: function(tooltipItems, data) {
    			               var sum = 0;
    			               
    			               tooltipItems.forEach(function(tooltipItem) {
    			                   sum += parseInt(data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]);
    			               });
    			               
    			               return 'Total: ' + sum;
    			           }
    			       }    
    			    },
    				scales: {
    					xAxes: [{
    						stacked: true,
    						gridLines: {
    							display: false
    						}
    					}],
    					yAxes: [{
    						stacked: true
    					}]
    				},
    				plugins: {
    					datalabels: {
    						color: "white",
    						display: function(context) {
    							return context.dataset.data[context.dataIndex] > 10;
    						},
    						font: function(context) {
                                var width = context.chart.width;
                                var size = Math.round(width / 32);
                                return {
                                  size: size,
                                  weight: 600
                                };
                            },
    						formatter: Math.round
    					}
				    }
			    }
		    };   
        }); 
        $http.get(getTotals).success(function(data) {
            $scope.scTotals = data;
        });
    };

    $scope.loadData();
}]);