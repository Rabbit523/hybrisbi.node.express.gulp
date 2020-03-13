//power point generating functions
app.service('$pptGen', function () {
	var pptx = new PptxGenJS();
	var _colors = colors.map(function (value) {
		if (value == '#000000') {
			value = '#666666';
		}

		return value.substring(value.indexOf("#") + 1);
	});

	this.newPPT = function () {
		var pptx = new PptxGenJS();
		pptx.setLayout('LAYOUT_WIDE');
		return pptx;
	}

	//convert chart.js struct to pptxgen struct + declare options
	this.pieChart = function (slide, data, dataSetName, xPos, yPos, width, height, showLabel, showPercent, dataLabelPosition) {
		var keys = Object.keys(data[0]);
		var labels = data.map(function (a) {
			return a[keys[0]];
		});
		var values = data.map(function (a) {
			return a[keys[1]];
		});

		data = [{
			name: dataSetName,
			labels: labels,
			values: values,
		}],
			slide.addChart(pptx.charts.PIE, data, {
				x: xPos,
				y: yPos,
				w: width,
				h: height,
				dataLabelPosition: dataLabelPosition || 'outEnd',
				showLegend: true,
				legendPos: 'b',
				showLabel: showLabel,
				showPercent: showPercent,
				chartColors: _colors
			});
	}

	//convert chart.js struct to pptxgen struct + declare options
	this.lineChart = function (slide, data, title, xPos, yPos, width, height) {
		var chartData = [];
		for (var i in data.datasets) {
			var dataSet = data.datasets[i];
			chartData.push({
				name: dataSet.label,
				labels: data.labels,
				values: dataSet.data
			});
		}

		slide.addChart(pptx.charts.LINE, chartData, {
			x: xPos,
			y: yPos,
			w: width,
			lineDataSymbol: 'none',
			h: height,
			title: title,
			showTitle: true,
			font_face: 'Arial',
			legendPos: 'b',
			showLegend: true,
			chartColors: _colors,
			dataBorder: {
				pt: 2,
				color: 'FFFFFF'
			},
			fill: 'ffffff'
		});
	}

	//convert chart.js struct to pptxgen struct + declare options
	this.barChartOneSet = function (slide, data, title, xPos, yPos, width, height) {
		var dataset = [{
			name: "value",
			labels: data.labels,
			values: data.datasets[1].data
		}];
		slide.addChart(pptx.charts.BAR, dataset, {
			x: xPos,
			y: yPos,
			w: width,
			h: height,
			title: title,
			showTitle: true,
			font_face: 'Arial',
			chartColors: _colors
		})
	}

	//convert chart.js struct to pptxgen struct + declare options
	this.stackedBarChart = function (slide, data, title, xPos, yPos, width, height) {
		slide.addChart(pptx.charts.BAR, data, {
			x: xPos,
			y: yPos,
			w: width,
			h: height,

			title: title,
			showTitle: true,

			barDir: 'col',
			barGrouping: 'stacked',

			dataLabelColor   : 'FFFFFF',
			dataLabelFontFace: 'Arial',
			dataLabelFontSize: 12,
			showValue        : true,

			catAxisLabelColor   : '0000CC',
			catAxisLabelFontFace: 'Courier',
			catAxisLabelFontSize: 12,
			catAxisOrientation  : 'minMax',

			showLegend: false,
			showTitle : false,
			
			font_face: 'Arial',
			chartColors: _colors
		})
	}

	//front page title slide
	this.titleSlide = function (pptx, primaryTitle, subTitle) {
		var slide = pptx.addNewSlide();
		slide.addImage({
			path: './assets/img/SAP_Hybris_blugld.png',
			x: '2%',
			y: '30%',
			w: '14%',
			h: '5%'
		});
		slide.addImage({
			path: './assets/img/SAP_RunSimple.png',
			x: '2%',
			y: '92%',
			w: '14%',
			h: '6.5%'
		});
		slide.addShape(pptx.shapes.RECTANGLE, {
			x: '76%',
			y: 0,
			w: '8%',
			h: '100%',
			fill: 'F9DD99'
		});
		slide.addShape(pptx.shapes.RECTANGLE, {
			x: '84%',
			y: 0,
			w: '8%',
			h: '100%',
			fill: 'F4C44C'
		});
		slide.addShape(pptx.shapes.RECTANGLE, {
			x: '92%',
			y: 0,
			w: '8%',
			h: '100%',
			fill: 'F0AB00'
		});
		slide.addText(primaryTitle, {
			x: '1%',
			y: '35%',
			w: '80%',
			h: '8%',
			align: 'l',
			bold: true,
			font_size: 32,
			font_face: 'Arial',
			color: '000000'
		});
		slide.addText(subTitle, {
			x: '1%',
			y: '43%',
			w: '80%',
			h: '8%',
			align: 'l',
			bold: true,
			font_size: 32,
			font_face: 'Arial',
			color: 'F0AB00'
		});
		
		return slide;
	}
	//standard slide with formatting 
	this.stdSlide = function (pptx) {
		var slide = pptx.addNewSlide();
		slide.addShape(pptx.shapes.RECTANGLE, {
			x: 0,
			y: 0,
			w: '88%',
			h: '4%',
			fill: '000000'
		});
		slide.addShape(pptx.shapes.RECTANGLE, {
			x: '88%',
			y: 0,
			w: '4%',
			h: '4%',
			fill: '604400'
		});
		slide.addShape(pptx.shapes.RECTANGLE, {
			x: '92%',
			y: 0,
			w: '4%',
			h: '4%',
			fill: 'A87800'
		});
		slide.addShape(pptx.shapes.RECTANGLE, {
			x: '96%',
			y: 0,
			w: '4%',
			h: '4%',
			fill: 'F0AB00'
		});
		slide.addText('© 2017 SAP SE or an SAP affiliate company. All rights reserved', {
			x: '2%',
			y: '97%',
			w: '20%',
			h: '3%',
			align: 'l',
			font_size: 6,
			color: '000000'
		});
		slide.slideNumber({
			x: '95%',
			y: '94%',
			fontSize: 8
		});
		return slide;
	};
});

// TO BE CLEARED/DELETED
// app.service('$pptGen',function(){
//         var pptx = new PptxGenJS();
//         var colors=["F0AB00","000000","008FD3","970A82","E35500","4FB81C","609A7F",
//         "BB4A4E","E87700","8FB311","A8A340","D57A27","EC9100","BFAF08"];
    
//         this.newPPT=function (){
//             var pptx = new PptxGenJS();
//             pptx.setLayout('LAYOUT_WIDE');
//             return pptx;
//         }
            
//         //convert chart.js struct to pptxgen struct + declare options
//         this.pieChart = function(slide,data,dataSetName,xPos,yPos,width,height){
//                 var keys = Object.keys(data[0]);
//                 var labels = data.map(function(a) {return a[keys[0]];});
//                 var values = data.map(function(a) {return a[keys[1]];});

//                 data = [{
//                         name:dataSetName,
//                         labels:labels,
//                         values:values
//                 }],
//                 slide.addChart(pptx.charts.PIE, data, {x:xPos, y:yPos, w:width, h:height,dataLabelPosition:'outEnd',showLabel:true, chartColors:colors});
//             }
            
//         //convert chart.js struct to pptxgen struct + declare options
//         this.lineChart=function(slide,data,title,xPos,yPos,width,height){
//                 var chartData=[];
//                 for( var i in data.datasets){
//                     var dataSet=data.datasets[i];
//                     chartData.push({name:dataSet.label,labels:data.labels,values:dataSet.data});
//                 }
                
//                 slide.addChart(pptx.charts.LINE, chartData, {x:xPos, y:yPos, w:width, lineDataSymbol:'none', h:height,title:title, showTitle:true,font_face:'Arial', legendPos:'b', showLegend:true, chartColors:colors,
//                             dataBorder: {pt:2, color:'FFFFFF'}, fill:'ffffff' });
//         }
        
//         //convert chart.js struct to pptxgen struct + declare options
//         this.barChartOneSet=function(slide,data,title,xPos,yPos,width,height){
//             var dataset=[{name:"value",labels:data.labels,values:data.datasets[1].data}];
//             slide.addChart(pptx.charts.BAR,dataset,{x:xPos, y:yPos, w:width ,h:height,title:title, showTitle:true,font_face:'Arial',chartColors:colors})
//         };
//         //front page title slide
//         this.titleSlide=function(pptx,primaryTitle,subTitle){
//             var slide =pptx.addNewSlide();  
//             slide.addImage({ path:'./assets/img/SAP_Hybris_blugld.png', x:'2%', y:'30%', w:'14%', h:'5%' });
//             slide.addImage({ path:'./assets/img/SAP_RunSimple.png', x:'2%', y:'92%', w:'14%', h:'6.5%' });
//             slide.addShape( pptx.shapes.RECTANGLE,  { x: '76%', y:0, w:'8%', h:'100%', fill:'F9DD99' });
//             slide.addShape( pptx.shapes.RECTANGLE,  { x: '84%', y:0, w:'8%', h:'100%', fill:'F4C44C' });
//             slide.addShape( pptx.shapes.RECTANGLE,  { x: '92%', y:0, w:'8%', h:'100%', fill:'F0AB00' });
//             slide.addText(primaryTitle,{ x:'1%', y:'35%', w:'80%', h:'8%', align:'l',bold:true, font_size:32, font_face:'Arial', color:'000000'});
//             slide.addText(subTitle,{ x:'1%', y:'43%', w:'80%', h:'8%', align:'l',bold:true, font_size:32, font_face:'Arial', color:'F0AB00'});
//             return slide;
            
//         }    
//         //standard slide with formatting 
//         this.stdSlide= function(pptx){
//                 var slide =pptx.addNewSlide();    
//                 slide.addShape( pptx.shapes.RECTANGLE,  { x: 0, y:0, w:'88%', h:'4%', fill:'000000' });    
//                 slide.addShape( pptx.shapes.RECTANGLE,  { x: '88%', y:0, w:'4%', h:'4%', fill:'604400' });
//                 slide.addShape( pptx.shapes.RECTANGLE,  { x: '92%', y:0, w:'4%', h:'4%', fill:'A87800' });
//                 slide.addShape( pptx.shapes.RECTANGLE,  { x: '96%', y:0, w:'4%', h:'4%', fill:'F0AB00' });
//                 slide.addText('© 2017 SAP SE or an SAP affiliate company. All rights reserved',{ x:'2%', y:'97%', w:'20%', h:'3%', align:'l', font_size:6, color:'000000'});
//                 slide.slideNumber({ x:'95%', y:'94%', fontSize:8 });
//                 return slide;
//         }
    
// });