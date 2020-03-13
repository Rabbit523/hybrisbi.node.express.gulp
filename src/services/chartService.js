//service for mapping data sets to chart.JS objects that can be bound to scope for simple angular charts
app.service('$chartJs', function () {
	//expect input : array of objects and title for chart
	//returns line chart object with data bindings and options
	//expects the 1st key in set to be the x axis
	// special setting for 1 series chart
	//allow removal addition of fill and or title
	//assumes each column is a data series
	this.lineChart = function (data, title,legendPos,titleDisplay,fill,percent,customSize,legendDisplay) {
		//empty set handling
		if (data.length === 0) {
			data = [{
				"No Data": 0
			}];
		}
		var keys = Object.keys(data[0]);
		var subDataSets = [];
		for (var i in keys) {
			//generate sub sets for chart (0 always corresponds to x axis and is skipped);
			if (i > 0) {
				subDataSets.push({
					type:'line',
					label: keys[i],
					fill: fill ? true : false,
					data: data.map(function (a) {
						return a[keys[i]];
					}),
					borderColor: keys.length > 2 ? colors[i] : "#F0AB00",
					backgroundColor: keys.length > 2 ? colors[i] : "rgba(240, 171, 0,0.5)"
				});
			}
		}
		var options = {
		    title: {
				display: titleDisplay ? true : false,
				text: title
			},
			legend: {
				display: legendDisplay ? true : false,
				position: legendPos || "top"
			},
			responsive: true,
			maintainAspectRatio: customSize ? false : true,
			plugins: {
				datalabels: {
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
			}
		};
		
		if(percent){
		    options.scales = {
               yAxes: [{
                   ticks: {
                       min: 0,
                       max: 100,
                       callback: function(value) {
                           return value + "%";
                       }
                   }
               }]
            };
		}
		return {
			data: {
				labels: data.map(function (a) {
					return a[keys[0]];
				}),
				datasets: subDataSets
			},
			options:options 
		};
	};

	//expect input : array of objects and title for chart
	//returns pie chart object with data bindings and options
	//expects objects with 2 keys:1st key=labels; 2nd key=values 
	
	this.pieChart = function (data, title, legendPos,titleDisplay,doghnut) {
		extendColors(data.length);

		if (data.length === 0) {
			data = [{
				"No Data": 0
			}];
		}
		var keys = Object.keys(data[0]);
		return {
			data: {
				datasets: [{
					data: data.map(function (a) {
						return a[keys[1]];
					}),
					backgroundColor: colors
				}],
				labels: data.map(function (a) {
					return a[keys[0]];
				})
			},
			options: {
			    cutoutPercentage: doghnut ? 50 : 0,
				title: {
					display: titleDisplay ? true : false,
					text: title
				},
				legend: {
					position: legendPos || "top"
				},
				responsive: true,
				maintainAspectRatio: false,
				pieceLabel: {
					render: 'percentage',
					fontSize: 14,
					fontColor: '#fff',
					position: 'border',
					fontStyle: 'bold'
				},
				plugins:{datalabels: {display:false}}
			}
		};
	};

	//expect input : array of objects and title for chart
	//returns bar chart object with data bindings and options
	//expects objects with 2 keys:1st key=labels; 2nd key=values for each label
	//excepts 1 data set
	//creates an average line
	this.stackedChart = function (dataSets, title) {
		//empty set handling
		if (dataSets.length === 0) {
			dataSets = [{
				"No Data": 0
			}];
		}
        
		var _dataSets = [],
			_labels = dataSets[0].map(function (a) {
				return a;
			});

		delete dataSets[0]; // delete labels
		dataSets.forEach(function (ds) {
			_dataSets.push(ds);
		});
		return {
			type: "bar",
			data: {
				labels: _labels,
				datasets: _dataSets
			},
			options: {
			    tooltips: {
			       mode: "index",
			       backgroundColor: 'black',
			       callbacks: {
			           footer: function(tooltipItems, data) {
			               var sum = 0;
			               
			               tooltipItems.forEach(function(tooltipItem) {
			                   sum += data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
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
        				anchor:"end",
        				align:"start",
        				display: function(context) {
        					return context.dataset.data[context.dataIndex] > 10;
        				},
        				font: {weight:"bold"},
        				formatter: Math.round
    			    }
			    }
			}
		};
	};
	//expect input : array of objects and title for chart
	//returns bar chart object with data bindings and options
	//expects objects with 2 keys:1st key=labels; 2nd key=values for each label
	//excepts 1 data set
	//creates an average line
	this.barChartOneSet = function (data, title,avg) {

		//empty set handling
		if (data.length === 0) {
			data = [{
				"No Data": 0
			}];
		}

		var keys = Object.keys(data[0]);
		var dataSerie = data.map(function (a) {
			return a[keys[1]];
		});
		var dataSets = [];
		if(avg){
    		var average = Math.round(_.reduce(_.pluck(data, keys[1]), function (sum, num) {
    			return sum + num;
    		}, 0) / dataSerie.length);
    		var avgLineSerie = Array(dataSerie.length).fill(average);
    		dataSets.push({
					label: 'Average',
					type: 'line',
					pointStyle: 'line',
					fill: false,
					display : false,
					data: avgLineSerie,
					borderColor: '#008FD3',
					backgroundColor: '#008FD3',
					datalabels:{display:false}
				});
		}
		dataSets.push({
					label: keys[1],
					fill: false,
					data: dataSerie,
					borderColor: colors[0],
					backgroundColor: colors[0],
					datalabels:{
        				color: "white",
        				anchor:"end",
        				align:"start",
        				display: function(context) {
        					return context.dataset.data[context.dataIndex] > 5;
        				},
        				font: {weight:"bold"},
        				formatter: Math.round
    			    }
				});
		return {
			data: {
				labels: data.map(function (a) {
					return a[keys[0]];
				}),
				datasets:dataSets
			},
			options: {
				title: {
					display: true,
					text: title
				},
				legend:{
				    display:true,
				    position:'top'
				}
			}
		};
	};
    //obsolete revisit deleting
	this.attachPresentationFns = function(scope) {
	    if(scope) {
	        scope.currentChart = $(".section-selector")[0].attributes["fs-chart"].value; //sets current chart as first section defined
	        
	        scope.$on('duScrollspy:becameActive', function(event, element){
	            scope.currentChart = $(element.attr("href")).attr("fs-chart");
            });
	        
	        scope.openFullscreenChart = function (chartId) {
                $("#chartContainer")[0].style.width = "100%";
                var id= chartId || scope.currentChart,
                    chart = $("#" + id)[0];
                    
                chart.style.display = "block";
                // remove arrows from serviceReport page
                $(".ui-rangeSlider-label-inner").each(function(i) {
                	$(this).css({"position": "unset"});
                });
                $(chart).addClass("openChart");
            };
            
            scope.closeFullscreenChart = function () {
                $("#chartContainer")[0].style.width = "0%";
                // re-position arrows from serviceReport page
                $(".ui-rangeSlider-label-inner").each(function(i) {
                	$(this).css({"position": "absolute"});
                });
                var allCharts = $(".overlay-content").toArray();
                for (var i in allCharts) {
                    var chart = allCharts[i];
                    chart.style.display = "none";
                    $(chart).removeClass("openChart");
                }
            };
            
            scope.moveFullscreenChart = function (isForward) {
                var chart = $($(".openChart")[0]), //current chart shown
                    nextChart = isForward ? chart.attr("next-chart") : chart.attr("prev-chart");
                    
                this.closeFullscreenChart();
                this.openFullscreenChart(nextChart);
            };
            
            scope.moveFullscreenChartOnKeydown = function (e) {
                if ($(".openChart").length > 0) { // if there's an open chart
                    if (e.keyCode == 39) {
                        this.moveFullscreenChart(true);
                    } else if (e.keyCode == 37) {
                        this.moveFullscreenChart(false);
                    }
                }
            };
	    } else {
	        throw "Parameter 'scope' is not defined.";
	    }
	};
});