app.controller('escalationsReport', ['$scope', '$http', '$chartJs',function($scope, $http, $chartJs) {
	//initiates all tooltips
    $scope.tooltips();
    //initiates full page scroll
    $scope.fullPageScroll(); 
    $scope.regions = [{"region": "APJ"}, {"region": "EMEA"}, {"region": "GCR"}, {"region": "LAC"}, {"region": "MEE"}, {"region": "NA"}, {"region": ""}];
    $scope.customers = [];
    // all customers
    $http.get("./api/customers/getCodes")
        .success(function(data) {
            $scope.customers =  $.map(data.tables, function(val) {return val.VAL;});
    });
    //default dates to last 12 months
    var date=new Date();
    $scope.endDate= new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().slice(0,10);    	
    date.setMonth(date.getMonth() - 12);
    $scope.startDate= new Date(date.getFullYear(), date.getMonth(), 1).toISOString().slice(0,10);    
   
    $scope.type = 1;
    $scope.split = 1; 
    $scope.groupBy = 'a';
    $scope.escType = function(type){
        $scope.type=type;
        $scope.loadData();
    }
    $scope.splitType = function(split){
        $scope.split=split;
        $scope.loadData(); 
    }
    $scope.groupType = function(groupBy){
        $scope.groupBy=groupBy;
        $scope.loadData(); 
    }
    $scope.loadData = function(){
        var queryParams = [
            new QueryParam("split", $scope.split),
            new QueryParam("groupBy",$scope.groupBy),
            new QueryParam("type", $scope.type),
            new QueryParam("startDate", $scope.startDate),
            new QueryParam("endDate", $scope.endDate),
            new QueryParam("regions", $scope.REGIONS, "region"),
            new QueryParam("customers", $scope.PROJS, { substring: [0, 3] })
        ];
        var mainUrl = "/api/escalations/report/";
        var getMonthlyBreakdown = new URLBuilder(mainUrl + "getMonthlyBreakdown", queryParams).toString(); 
        $http.get(getMonthlyBreakdown).success(function(data){
            //split data sets 
            var escalations=data.escalations;
            var customers = data.customers;
            if(escalations.length>0){
                //escalation data sets 
                var keys = Object.keys(escalations[0]);
                var months= escalations.map(function (a) {
                    return a[keys[0]];
                })
                var subDataSets = [];
                //line chart data lablels 
                var datalabelsLine =  {
                    backgroundColor: function(context) {
                        return context.dataset.borderColor;
                    },
                    display: function(context) {
                        return context.dataset.data[context.dataIndex] > 0;
                    },
                    borderRadius: 4,
                    color: 'white',
                    font: {
                        weight: 'bold'
                    },
                    formatter: Math.round
                }
                //create data sets for escalations
                for (var i in keys) {
                    if (i > 0) {
                        subDataSets.push({
                            type:'line',
                            label: keys[i],
                            fill: false,
                            data: escalations.map(function (a) {
                                return a[keys[i]];
                            }),
                            borderColor: colors[i],
                            backgroundColor:colors[i],
                            yAxisID: "EscCnt",
                            datalabels:datalabelsLine
                        });
                    }
                }
                //bar chart data labels 
                var dataLabelsBar = {
                    color: "white",
                    anchor:"end",
                    align:"start",
                    display: function(context) {
                        return context.dataset.data[context.dataIndex] > 10;
                    },
                    font: {weight:"bold"},
                    formatter: Math.round
                };

                //live customers set
                subDataSets.push({
                    type : "bar",
                    label:"Live Customers",
                    data:months.map(function(e){
                        return customers[e] ? customers[e].LIVE : 0;
                    }),
                    borderColor:"#F0AB00",
                    backgroundColor:"rgba(240, 171, 0,0.5)",
                    datalabels:dataLabelsBar
                });
                //project customers set
                subDataSets.push({
                    type : "bar",
                    label:"Project Customers",
                    data:months.map(function(e){
                        return customers[e] ? customers[e].PROJECT : 0;
                    }),
                    borderColor:"#808080",
                    backgroundColor:"rgba(81, 79, 79,0.5)",
                    datalabels:dataLabelsBar
                });
            }            
            else{
                subDataSets=[];
                months=[];
            }
            var options = {
                legend:{
                    display:true,
                    position:'top'
                },
                scales:{
                    xAxes: [{
                        stacked: true
                    }],
                    yAxes: [
                        {
                            stacked: true,
                            position: 'right',
                            scaleLabel: {
                                display: true,
                                labelString: 'Customers'
                            },
                            
                        },
                        {
                            usePointStyle: true,
                            id: 'EscCnt',
                            type: 'linear',
                            position: 'left',
                            scaleLabel: {
                                display: true,
                                labelString: 'Escalations'
                            },
                            gridLines:{
                                display:false
                            },
                            ticks: {
                                suggestedMin: 0,
                                suggestedMax: 15
                            }
                        }
                    ]
                }
            }

            //create data sets for the customer counts;
            $scope.monthlyBreakDown={
                data:{
                    labels: months,  
                    datasets:subDataSets
                },
                options:options
            }
        });
    }
    $scope.loadData();

}]);