//requires underscore library

var complexChartJsGenerator = {
   
    /**
     * 
     * args:
     * data: the data set
     * title: chart title
     * div: html div to create chart in
     * 
     * assumptions made on data:
     * 1st column = x axis labels
     * 2nd column = series
     * 3rd column = value for series
     * 
     * data set may contain non unique series and x axis labels, only unique entries are kept 
     * 
     * */
    interactiveScatterChart:function(data,title,div){
    
        //find div
        var parent = $('#' + div);
        parent.empty();
        //creates html elements needed by chart
        parent.append('<div style="display:inline-block">' +
                            '<div style="display:inline-block; width: 10px;height: 10px;margin-right: 5px;border: 1px solid rgba(0, 0, 0, .2);background: #F0AB00;border-radius: 10px;"></div>' +
                            '<select id="seriesSelect" class="series-picker"></select>' +
                             '<div style="display:inline-block; width: 10px;height: 10px;margin-right: 5px;border: 1px solid rgba(0, 0, 0, .2);background: #008FD3;border-radius: 10px;"></div>' +
                            '<h6 style="display:inline-block;">Average</h6>' +
                        '</div> <canvas id="chart" style="height:100%"></canvas>');
        //get necessary elemnts from created div
        var canvas = parent.find("#chart")[0];  
        var ctx = parent.find('#chart')[0];

        var options = {
            title:{
                display:false,
                text:title
                
            },
            legend:{
                display:false,
                position:'right'
            },
            animation:{
                duration:0
            },
            responsive:true,
            maintainAspectRatio:false,
            plugins:{datalabels: {display:false}}
        }; 
        
        //keys used for sorting
        var keys = Object.keys(data[0]);
        //extracts series and labels (labels are reversed assuming dates in format yyyy-MM-dd)
        var labels = _.sortBy(_.uniq(data.map(function(a) {return a[keys[0]];}),false),function(num){ return new Date("01/" + num.replace(/-/g, '\/')); });
        var series = _.uniq(data.map(function(a) {return a[keys[1]];}),false);
        
        //helper method for matching data series entries to x axis entries
        function dataSeries(subset){
            var serie = [];
            for(var i in labels){
                var match = subset.filter(function (entry) { return entry[keys[0]] === labels[i];})[0];
                var val;
                (match !== undefined) ? val = match[keys[2]]: val = 0;
                serie.push({x:labels[i],y:val});
            }
            return serie;
        }
        //creates the tendline
        function trendSet(){
            var avgs = [];
            for(var i in labels){
                var matchSet = data.filter(function (entry) { return entry[keys[0]] === labels[i];});
                var values = matchSet.map(function(a) {return a[keys[2]];});
                var sum = values.reduce(function(previous, current) {return current += previous});
                var avg = Math.round(sum / values.length);
                avgs.push(avg);
            }    
            return {
                    label: 'Average',
                    fill:false, 
                    showLine:true,
                    borderColor:'#008FD3',
                    backgroundColor:'#008FD3', 
                    data:avgs                                                
                }
        }
        //creates the data set
        function setData(){
            if(data.length === 0){
                data = [{"No Data":0}];
            }
            var keys = Object.keys(data[0]);
            var subDataSets = [];
            subDataSets.push(trendSet());
            for(var i in series){
                subDataSets.push({
                    label: series[i],
                    fill:false, 
                    showLine:false,
                    borderColor:'#c4c4c4',
                    backgroundColor:'#c4c4c4', 
                    data:dataSeries(data.filter(function (entry) { return entry[keys[1]] === series[i];}))                                                 
                });
            }
            return {
                labels: labels,
                datasets: subDataSets
            };    
        }
        
        //render the chart
        var chart = new Chart(ctx, {type:'line', data:setData(),options:options});
        var select = parent.find('#seriesSelect')[0];

        function highlightSeries(setIndex){
            
            //clear highlights
            for(var i in chart.data.datasets){
                if(i > 0){
                    chart.data.datasets[i].showLine = false;
                    chart.data.datasets[i].borderColor = '#c4c4c4';
                    chart.data.datasets[i].backgroundColor = '#c4c4c4';   
                }
            }
            if(setIndex > 0){
                select.value = setIndex;
                var targetSet = chart.data.datasets[setIndex];
                targetSet.showLine = true;
                targetSet.borderColor = '#F0AB00';
                targetSet.backgroundColor = '#F0AB00';
                chart.update();
            }
            
        }
        
        //add event listener to highlighting a series on click
        canvas.addEventListener('click', function(e) {
            var activePoints = chart.getElementAtEvent(e)[0];
            if (activePoints) {
                highlightSeries(activePoints._datasetIndex);
            }
        });
        
        //add event listener to highlighting a series on mouseover
        canvas.onmousemove =  function(e) {
            var activePoints = chart.getElementAtEvent(e)[0];
            if (activePoints) {
                var targetSet = chart.data.datasets[activePoints._datasetIndex];
                if(targetSet.borderColor !== '#F0AB00'  & activePoints._datasetIndex > 0){
                for(var i in chart.data.datasets){
                    if(chart.data.datasets[i].borderColor !== '#F0AB00' & i>0){
                        chart.data.datasets[i].showLine = false;
                        chart.data.datasets[i].borderColor = '#c4c4c4';
                        chart.data.datasets[i].backgroundColor = '#c4c4c4';   
                    }
                }
                    targetSet.showLine = true;
                    targetSet.borderColor = '#000000';
                    targetSet.backgroundColor = '#000000';
                    chart.update();
                }
            }else{
                for(var i in chart.data.datasets){
                    if(chart.data.datasets[i].borderColor !== '#F0AB00' & i > 0){
                        chart.data.datasets[i].showLine = false;
                        chart.data.datasets[i].borderColor = '#c4c4c4';
                        chart.data.datasets[i].backgroundColor = '#c4c4c4'; 
                    }
                }    
                chart.update();
                
            }
        };
        //append select options and add listener
        select.append(new Option(' ', -1));
        for(var i=1 ;i< chart.data.datasets.length; i++){
            var set = chart.data.datasets[i];

            select.append(new Option(set.label, i));
        }
        select.addEventListener('change',function(){
            highlightSeries(select.value);
        });
    }
};