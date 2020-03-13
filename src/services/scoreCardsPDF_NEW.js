

function generateScoreCard(data){
    console.log(data);

    //months defintions for tables 
    var months = [
        {title: 'Jan', dataKey: 'Jan'},
        {title: 'Feb', dataKey: 'Feb'},
        {title: 'Mar', dataKey: 'Mar'},
        {title: 'Apr', dataKey: 'Apr'},
        {title: 'May', dataKey: 'May'},
        {title: 'Jun', dataKey: 'Jun'},
        {title: 'Jul', dataKey: 'Jul'},
        {title: 'Aug', dataKey: 'Aug'},
        {title: 'Sep', dataKey: 'Sep'},
        {title: 'Oct', dataKey: 'Oct'},
        {title: 'Nov', dataKey: 'Nov'},
        {title: 'Dec', dataKey: 'Dec'}
    ]

    //config for standard table used for data displays 
    var sapTable = {
        tableWidth:287,
        margin:{top: 22, right: 5, bottom: 5, left: 5},
        headerStyles: {
            fillColor: [240, 171, 0],
            textColor: [255,255,255],
            lineColor: [255,255,255],
            fontStyle:'bold',
            lineWidth: 0.5
        },
        bodyStyles: {
            fillColor: [248, 226, 203],
            textColor: [0,0,0],
            lineColor: [255,255,255],
            lineWidth: 0.5
        },
        alternateRowStyles: {
            fillColor: [251, 241, 231],
            textColor: [0,0,0],
            lineColor: [255,255,255],
            lineWidth: 0.5
        },
        drawCell: function (cell) {
            // Rowspan
            if(cell.raw.rowspan){
                doc.setFillColor(248, 226, 203);
                doc.rect(cell.x + 0.3, cell.y-(cell.height*(cell.raw.rowspan-1))+0.3, cell.width-0.6, (cell.height * cell.raw.rowspan)-0.5, 'F');
                doc.autoTableText(cell.raw.title, cell.x+1.5,  (cell.y-(cell.height * (cell.raw.rowspan-1))) + ((cell.height * cell.raw.rowspan)/ 2), {
                halign: 'left',
                valign: 'middle'
            });
            
                return false;
            }
        }

    }

    //config for targets displays table
    var targetTable = {
        showHeader:'never',
        tableWidth:'wrap',
        margin:{top: 22, right: 5, bottom: 5, left: 5},
        bodyStyles: {
            fillColor: [255, 255, 255],
            textColor: [0,0,0],
            lineColor: [255,255,255],
            lineWidth: 0.5
        },
        alternateRowStyles: {
            fillColor: [255, 255, 255],
            textColor: [0,0,0],
            lineColor: [255,255,255],
            lineWidth: 0.5
        },
        drawRow: function(row){
            if(row.cells.name){
                row.cells.name.styles.cellPadding={top: 1.7638888888888886, right: 1.7638888888888886, bottom: 1.7638888888888886, left: 0};
            }
            if(row.cells.green){
                row.cells.green.styles.fillColor=[85, 219, 59];
            }
            if(row.cells.yellow){
                row.cells.yellow.styles.fillColor=[250, 255, 5];
            }            
            if(row.cells.red){
                row.cells.red.styles.fillColor=[244, 66, 66];
            }
            if(row.cells.na){
                row.cells.na.styles.fillColor=[204, 204, 204];
            }
        }
    }

    //base doc definitions
    var doc = new jsPDF()
    var doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm'
    })

    //sap slide styles adds black bar at bottom gold bar on top
    function addstyling(){
        doc.setFillColor(240,171,0);
        doc.rect(5,0,287,7,'F');
        doc.setFillColor(0,0,0);
        doc.rect(5,203,287,7,'F');
    }

    //footer function
    function addFooter(pageNumber){
        doc.setTextColor(255,255,255);
        addText(data.period,10,208,12);
        addText("Customer " + pageNumber,265,208,12);
        addText(data.customer,120,208,12);
        doc.setTextColor(0,0,0);
    }

    //generic text function
    function addText(text,x,y,fontSize){
        doc.setFontSize(fontSize);
        doc.text(text,x,y);
    }

    /**
     * adds new page and adds the 'SAP' stylign to it 
     * @param {pageNumber} pageNumber - pagenumber to display
     * @param {title} title - title for the page 
     * @param {seperator} seperator - boolean if this is a sepertor page and title should be in middle
     */
    function addPage(pageNumber,title, seperator){
        doc.addPage();
        addstyling();
        addFooter(pageNumber);
        doc.setPage(pageNumber);
        seperator ? addText(title,5,100,28) : addText(title,5,17,24)

    }

    /**
     * maps raw array length 12 to obj of 12 months for tables  
     * @param {headers} headers - headers to pad before months will have key attributes 'h' + index ex 'h0'
     * @param {data} data - raw array of 12 values 
     * @param {type} type - identifier for sla function if 1 table ocntaisn different targets
     */
    //remaps data to a array based on months
    function mapDataRow(headers,data, type){
        var obj = {};
        for(var i in data){
            var key = months[i].dataKey;
            obj[key]= data[i] !== null ? data[i] :'';
        }
        for(var i in headers){
            if(typeof(headers[i]) === 'object'){
                obj['h'+ i ] = {title:headers[i].title,rowspan:headers[i].rowspan};
            }else{
                obj['h'+ i ] = headers[i];
            }
        }
        obj.type = type;

        return obj;
    }
    
    /**
     * generic table generate to make data tables 
     * @param {headers} headers - headers to pad before months
     * @param {data} data - data rows should be mapped using mapDataRow 
     * @param {slaFn} slaFn - sla function for cell colors
     * @param {top} top - set top margin
     * @param {customHeaders} customHeaders - use custom headers instead of month padded 
     */

    function addTable(headers,data,slaFn,top,customHeaders){
        function tableHeaders(headers){
            var mapped=headers.map(function(e,i){
                return {"title":e,dataKey:"h" + i};
            })
            return mapped.concat(months);
        }
        sapTable.drawRow = slaFn;
        if(top){
            sapTable.margin.top = top;
        }
        doc.autoTable(customHeaders ? headers : tableHeaders(headers), data,sapTable);

    }

    /**
     * generic target table generator 
     * @param {data} data - array of targets of form {type:'text'} where type is one of green,yellow,red,na (yellow and na optional)
     * @param {top} top - set top margin
     */
    function addTarget(data,top){
        var targetHeaders =[
            {title: 'name', dataKey: 'name'},
            {title: 'green', dataKey: 'green'},
            {title: 'red', dataKey: 'red'}
        ];
        if(data[0].yellow){
            targetHeaders =[
                {title: 'name', dataKey: 'name'},
                {title: 'green', dataKey: 'green'},
                {title: 'yellow', dataKey: 'yellow'},
                {title: 'red', dataKey: 'red'}
            ];
        }
        if(data[0].na){
            targetHeaders.push({title:'na',dataKey:'na'});
        }
        targetTable.margin.top = top;
        doc.autoTable(targetHeaders,data,targetTable);
    }

    /**
     * generic sla fn creator to calculate sla colors 
     * @param {row} row - the data row to process 
     * @param {greenVal} greenVal - green value threshold
     * @param {yellowVal} yellowVal - yellow value threshold (optional)
     * @param {less} less - boolean if target should be calculated as less than instead of greater
     * @param {less} naTag - boolean if 0 should be marked as grey na
     */
    function slaFn(row,greenVal,yellowVal,less,naTag){
        for(var i in months){
            var cell = row.cells[months[i].dataKey];
            var val=parseFloat(cell.text);
            if(val >= 0){
                if( val === 0 && naTag){
                    cell.styles.fillColor=[204, 204, 204];
                }else if((!less && val>=greenVal) || (less && val<=greenVal)){
                    cell.styles.fillColor=[85, 219, 59]
                }else if((!less && yellowVal && val>=yellowVal) || (less && yellowVal &&  val<=yellowVal)){
                    cell.styles.fillColor=[250, 255, 0]
                }else{
                    cell.styles.fillColor=[244, 66, 66]
                }
            }
        }
    }  
    //convert chart canvas to image and add
    function addChart(id){
        var canvasImg = $(id)[0].toDataURL("image/png", 1.0);
        doc.addImage(canvasImg, 'PNG', 5, 25, 287, 150 );
    }
    //title page
    addstyling();

    // sap_logo
    // sap_logo
    /*
    var logo = '<?xml version="1.0" standalone="no"?><svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="225px" height="51px">' +
    '<g>' +
    '<path fill="#008FD3" d="M74.3,33.8V10h5.3v9.2h9.4V10h5.3v23.8h-5.3V23.6h-9.4v10.2H74.3z M96.4,39.8l1.1-4c0.5,0.1,1.7,0.5,3.3,0.5' +
    'c1.1,0,1.8-0.4,2.2-1.5l0.3-0.8l-6.6-17.2h5.4l3.8,11.1h0.1l3.8-11.1h5l-7.2,19c-1.2,3-2.7,4.8-6.2,4.8' +
    'C98.7,40.4,97.3,40,96.4,39.8z M122.2,31.8v2H117V10h5.2v9.3c1.1-1.6,2.7-3,5.3-3c3.9,0,6.6,3,6.6,8.9c0,5.9-2.7,8.8-6.7,8.8' +
    'C125.1,34.1,123.5,33.2,122.2,31.8z M128.9,25.2c0-2.9-1-4.7-3.3-4.7c-1.3,0-2.5,0.8-3.4,1.7v6.3c1.1,1.1,2.1,1.6,3.5,1.6' +
    'C127.8,30.2,128.9,28.4,128.9,25.2z M137.4,33.8V16.6h5.2v2.9h0c0.9-1.5,2.6-3.2,5.8-3.2h0.2l-0.1,4.6c-0.2,0-1-0.1-1.4-0.1' +
    'c-2.1,0-3.6,1.1-4.6,2.4v10.7H137.4z M151.2,14.3v-4.2h5.2v4.2H151.2z M151.2,33.8V16.6h5.2v17.2H151.2z M159,31.5l2.1-2.9' +
    'c1.5,1.3,3.9,2.2,6,2.2c1.6,0,2.7-0.6,2.7-1.7c0-1.2-0.9-1.6-3.3-2.1c-3.3-0.6-6.7-1.4-6.7-5.4c0-3.4,2.8-5.4,6.7-5.4' +
    'c3.5,0,5.6,0.9,7.5,2.4l-2,2.9c-1.7-1.2-3.5-1.9-5.1-1.9c-1.5,0-2.3,0.6-2.3,1.5c0,1,0.9,1.4,3.1,1.8c3.4,0.6,7,1.3,7,5.2' +
    'c0,4.2-3.6,5.8-7.6,5.8C163.3,34.2,160.8,33,159,31.5z M0.1,28.4l4-2.4c1.3,2.6,3.7,4.1,6.5,4.1c2.4,0,4.2-0.9,4.2-2.7' +
    'c0-1.8-1.7-2.6-4.9-3.5c-4.3-1.2-8.7-2.3-8.7-7.3c0-4.5,3.5-7.1,8.6-7.1c4.9,0,7.8,2.4,9.5,4.9l-3.7,2.8c-1.3-2-3.6-3.4-5.9-3.4' +
    'c-2.2,0-3.5,1-3.5,2.4c0,1.9,1.8,2.6,4.9,3.5c4.2,1.1,8.7,2.5,8.7,7.4c0,3.8-2.9,7.3-9.6,7.3C5.1,34.3,1.9,31.8,0.1,28.4z' +
    'M20.8,33.8l8.5-24h5l8.5,24h-5.3l-1.8-5.3h-8.1l-1.8,5.3H20.8z M28.8,24.7h5.6l-2.8-8.1h-0.1L28.8,24.7z M45.4,33.8V9.9h8.7' +
    'c5.1,0,9.8,1.4,9.8,7.7c0,6.4-5.1,7.7-9.8,7.7h-3.4v8.5H45.4z M50.7,21.2h3.6c3.3,0,4.5-1.3,4.5-3.6c0-2.2-1.2-3.5-4.5-3.5h-3.6V21.2z">' +
    '</path>' +
    '<path fill="#F0AB00" d="M200.4,43.5l-10.1-0.2l-0.6-1.6c-0.1-0.3-3.4-8.4-3.4-19.8c0-11.4,3.2-19.5,3.4-19.8l0.6-1.5l10.1-0.5v5.2' +
    'L194,5.5c-0.9,2.7-2.5,8.7-2.5,16.4c0,7.6,1.6,13.6,2.4,16.3l6.5,0.1V43.5z M213.5,13.2l-5.4-0.2c-0.5,1.5-1.4,4-2.4,6.5' +
    'c-1-2.5-1.8-5-2.3-6.5l-5.4,0.3c0.3,1.1,1.8,6.1,3.9,10.6c1.3,3,3,6.2,4.2,8.3l5.9-0.1c0-0.1-1.6-2.9-3.3-6.2' +
    'c0.3-0.7,0.7-1.4,1-2.1C211.5,19.1,213.2,14.1,213.5,13.2 M222.1,2.1l-0.6-1.5l-10.1-0.5v5.2l6.5,0.3c0.9,2.7,2.5,8.7,2.5,16.4' +
    'c0,7.6-1.6,13.6-2.4,16.3l-6.5,0.1v5.2l10.1-0.2l0.6-1.6c0.1-0.3,3.4-8.4,3.4-19.8C225.4,10.5,222.2,2.4,222.1,2.1">' +
    '</path></g></svg>'
    
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    canvas.height = 59.3125;
    canvas.width = 13.49375;
    context.clearRect(0,0,canvas.width,canvas.height);
    canvg(canvas, logo);


    var imgData = canvas.toDataURL('image/png',1.0);
    doc.addImage(imgData, 'PNG', 5, 22,59.53125,13.49375);
    */

    //title
    addText('Monthly Operational Report',5,80,28);

    //customer name
    addText('Customer',5,100,18);
    addText(data.customer,5,110,24);

    //period
    addText('For The Month Of:',5,130,18);
    addText(data.period,5,140,24);

    //footer + doc tag
    addText("Generated On: " + data.generationDate.slice(0,10) + " Printed On: " + new Date().toISOString().slice(0,10),5,200,8);
    addText("[CUS-TAM-SCOCA-DOC-1.0]",254,200,8);
    addFooter(1);

    //availability seperator page 
    addPage(2,'Availability', true);

    //availability uptimes 
    addPage(3,'Availability');

    //uptimes sla function
    function uptimeSlaFn(row){
        if(row.raw.type==="U"){
            slaFn(row,99.9,98.9,false);
        }else if(row.raw.type==="D"){
            slaFn(row,30,60,true);
        }
    }

    //availability table
    addTable(['KPI'],[
        mapDataRow(
            ['Site Availability - Website Uptime (%)'],
            data.availability.siteUptime,
            'U'
        ),
        mapDataRow(
            ['SLA - Hybris Cloud Uptime (%)'],
            data.availability.infraUptime,
            'U'
        ),
        mapDataRow(
            ['Downtime Planned (min.)'],
            data.availability.sitePlannedDownTime,
            'N'
        ),
        mapDataRow(
            ['Downtime Unplanned (min.)'],
            data.availability.siteUnplannedDownTime,
            'D'
        )
    ],uptimeSlaFn);

    //uptime targets
    addTarget([{
        name:'Uptime Target Legend:',
        green:'Greater or equal to 99.9',
        yellow:'Greater or equal to 98.9',
        red:'Less than 98.9'
    }],64)
    addTarget([{
        name:'Downtime Target Legend:',
        green:'Less than 30 min/mth',
        yellow:'Greater than 30 min/mth',
        red:'Greater than 60 min/mth'
    }],74)

    addPage(4,'Availability');
    //page load slas 
    function pageLoadSlaFn(row){
        if(row.raw.type === "I"){
            slaFn(row,3000,5000,true);
        }else if(row.raw.type === "O"){
            slaFn(row,1000,3000,true);
        }
    }
    //page load table
    addTable(['KPI',''],[
        mapDataRow(
            ['', 'Outside SAP network (ms.)'],
            data.availability.outDataCenter,
            'I'
        ),
        mapDataRow(
            [{title:'Page Load Time',rowspan:2}, 'Inside SAP network (ms.)'],
            data.availability.inDataCenter,
            'O'
        )
    ],pageLoadSlaFn);

    //page load target
    addTarget([{
        name:'Outside SAP network Target Legend:',
        green:'Less than 3000ms',
        yellow:'Less than 5000ms',
        red:'Greater than 5000ms'
    }],48)
    addTarget([{
        name:'Inside SAP network Target Legend:',
        green:'Less than 1000ms',
        yellow:'Less than 3000ms',
        red:'Greater than 3000ms'
    }],58)

    //licensing seperator
    addPage(5,'Licensing',true);

    addPage(6,'Licensing');
    //version infomation

    addTable(
        [{title:'KPI',dataKey:'KPI'},{title:'Edition Type',dataKey:'ET'},{title:'Contract Value',dataKey:'CT'}],
        [{KPI:'SAP Hybris Commerce Cloud Edition',ET:data.licensing.hybrisEdition, CT:data.licensing.contractValue}],
        null,22,true);

    function versionTarget(row){
        var version = row.cells.VERSION;
        var eol = row.cells.EOL;

        var dEnd = new Date(eol.raw.substring(0,4),eol.raw.substring(5,7) - 1,eol.raw.substring(8,10));
        var dCard = new Date(data.month.substring(0,4),data.month.substring(5,7) - 1,data.month.substring(8,10));
    
        if(dEnd.getMonth() - dCard.getMonth() + (12 * (dEnd.getFullYear() - dCard.getFullYear())) > 6){
            version.styles.fillColor=[85, 219, 59];
        }else if(dCard < dEnd){
            version.styles.fillColor=[250, 255, 0];
        }else{
            version.styles.fillColor=[244, 66, 66];
        }
        
        
    } 

    if(data.licensing.hybrisVersion.length>0){

        for(var i in data.licensing.hybrisVersion){
            data.licensing.hybrisVersion[i].KPI='Hybris Product Version'
        }
        addTable(
            [
                {title:'KPI',dataKey:'KPI'},
                {title:'Version',dataKey:'VERSION'},
                {title:'Supported Until',dataKey:'EOL'},
                {title:'Supported Until',dataKey:'SUPPORTED'}
            ],
            data.licensing.hybrisVersion,
            versionTarget,42,true);
    }

    addPage(7,'Licensing Metrics');

    //edition sla function
    function editionSlaFn(row){
        slaFn(row,data.licensing.contractValue,data.licensing.contractValue*1.10,true);
    }
    //pips and cores tables 
    addTable(['KPI'],[
        mapDataRow(
            ['Peak Page Impressions (#)'],
            data.licensing.pageImpressions
        )
    ],data.licensing.hybrisEdition ==='PPV' ? editionSlaFn:null,22);

    addTable(['KPI',''],[
        mapDataRow(
            ['','App Server'],
            data.licensing.appServer
        ),
        mapDataRow(
            [{title:'Productive Cores (#)', rowspan:2},'Admin Server'],
            data.licensing.adminServer
        )
    ],data.licensing.hybrisEdition.includes('Cores') ? editionSlaFn:null,40);

    //pips/cores targets
    addTarget([{
        name:'Peak Page Views Target Legend:',
        green:'Less than or equal to contracted value',
        yellow:'Less than 10 % over contracted value',
        red:'Greater than 10% over contracted value'
    }],66)

    addPage(8,'Licensing Metrics');

    //bandwidth table
    addTable(['KPI'],[
        mapDataRow(
            ['Bandwidth Uitilization (#)'],
            data.licensing.bandwidth
        ),
    ],editionSlaFn,22);

    //bandwidth target 
    addTarget([{
        name:'Bandwidth Target Legend:',
        green:'Less than or equal to contracted value',
        yellow:'Less than 10 % over contracted value',
        red:'Greater than 10% over contracted value'
    }],40)

    addPage(9,'Service Fulfillment - Cloud',true);

    addPage(10,'Cloud - Incidents'); 
    //incidents sla function
    function incidentsSlaFn(row){
        if(row.raw.type === "P1"){
            slaFn(row,10,50,true);
        }else if(row.raw.type === "P2"){
            slaFn(row,30,50,true);
        }
    }

    //incoming incidents table
    addTable(['KPI',''],[
        mapDataRow(
            ['','Cloud Incidents (#)'],
            data.service.incidents.incoming
        ),
        mapDataRow(
            ['','Very High Priority (%)'],
            data.service.incidents.p1,
            'P1'
        ),
        mapDataRow(
            [{title:'Incident Management', rowspan:3},'High Priority (%)'],
            data.service.incidents.p2,
            'P2'
        )
    ],incidentsSlaFn,22);

    //incoming incidents targets 
    addTarget([{
        name:'Very High Target Legend:',
        green:'Less than 10%',
        yellow:'Less than 50%',
        red:'More than 50%'
    }],56)
    addTarget([{
        name:'High Target Legend:',
        green:'Less than 30%',
        yellow:'Less than 50%',
        red:'More than 50%'
    }],66)

    addPage(11,'Cloud - Incidents');

    //irt sla function
    function irtSlaFn(row){
        slaFn(row,95);
    }

    //incoming incidents irt
    addTable(['KPI',''],[
        mapDataRow(
            ['','Adherence'],
            data.service.incidents.percAdherence
        ),
        mapDataRow(
            ['','Very High Priority'],
            data.service.incidents.adhereP1
        ),
        mapDataRow(
            [{title:'SLA IRT Adherence (%)', rowspan:3},'High Priority'],
            data.service.incidents.adhereP2
        )
    ],irtSlaFn,22);

    //irt targets 
    addTarget([{
        name:'% Adherence:',
        green:'Greater than 95%',
        red:'Less than 95%'
    }],54)

    addPage(12,'Cloud - Incidents');
    //backlog table
    addTable(['KPI',''],[
        mapDataRow(
            ['','Total'],
            data.service.incidents.backlog
        ),
        mapDataRow(
            ['','At SAP'],
            data.service.incidents.backlogSAP
        ),
        mapDataRow(
            [{title:'Backlog (#)', rowspan:3},'At Customer'],
            data.service.incidents.backlogCustomer
        )
    ],null,22);

    addPage(13,'Cloud - Incidents Backlog Breakdown');
    //backlog split by location chart
    addChart("#backlog-incidents-chart-loc");

    addPage(14,'Cloud - Incidents Backlog Breakdown');
    //backlog split by priority chart 
    addChart("#backlog-incidents-chart");

    addPage(15,'Cloud - Resolved Incidents');

    //pcc sla fn
    function pccSlaFn(row){
        if(row.raw.type ==='S'){
            slaFn(row,7.5,5.5,false,true);
        }
        if(row.raw.type ==='C'){
            slaFn(row,25,35,true,true);
        }
    }

    //pcc table 
    addTable(['KPI',''],[
        mapDataRow(
            ['','PCC Reply (%)'],
            data.service.incidents.pccReply
        ),
        mapDataRow(
            ['','Avg. Score Question 1-4 (#)'],
            data.service.incidents.pccQuestions,
            'S'
        ),
        mapDataRow(
            [{title:'PCC', rowspan:3},'Confirmed Automatically (%)'],
            data.service.incidents.pccAutoConfirm,
            'C'
        )
    ],pccSlaFn,22);

    //pcc target
    addTarget([{
        name:'Very High Target Legend:',
        green:'Less than 10%',
        yellow:'Less than 50%',
        red:'More than 50%',
        na:'Not Applicable'
    }],56)

    addPage(16,'Cloud - Resolved Incidents');
    //time at sap incidents
    addTable(['KPI',''],[
        mapDataRow(
            ['','Incoming'],
            data.service.incidents.atrInc
        ),
        mapDataRow(
            ['','Very High Priority'],
            data.service.incidents.atrP1
        ),
        mapDataRow(
            [{title:'Average Time At SAP \n(Days)', rowspan:3},'High Priority'],
            data.service.incidents.atrP2
        )
    ],null,22);

    addPage(17,'Service Fulfillment - Service Requests',true);

    addPage(18,'Service Fulfillment - Incoming Requests');
    //incoming reqs table
    addTable(['KPI',''],[
        mapDataRow(
            ['','Incoming (#)'],
            data.service.requests.incoming
        ),
        mapDataRow(
            ['','Very High Priority (%)'],
            data.service.requests.p1,
            'P1'
        ),
        mapDataRow(
            [{title:'Incoming Requests \nBy Priority', rowspan:3},'High Priority (%)'],
            data.service.requests.p2,
            'P2'
        )
    ],incidentsSlaFn,22);
    addText('Please note that in order to have service requests statistics displayed, the correct component (CEC-HCS-REQ) has to be chosen by the customer during service request \nticket creation.',5,60,10)
    
    //incoming reqs targets 
    addTarget([{
        name:'Very High Target Legend:',
        green:'Less than 10%',
        yellow:'Less than 50%',
        red:'More than 50%'
    }],66)
    addTarget([{
        name:'High Target Legend:',
        green:'Less than 30%',
        yellow:'Less than 50%',
        red:'More than 50%'
    }],76)
    addPage(19,'Service Fulfillment - Incoming Requests');
    addTable(['KPI',''],[
        mapDataRow(
            ['','Production'],
            data.service.requests.production
        ),
        mapDataRow(
            [{title:'Deployments (#)', rowspan:2},'Staging'],
            data.service.requests.staging
        )
    ],null,22);

    addPage(20,'Service Fulfillment - Backlog Requests');
    //backlog requests table
    addTable(['KPI',''],[
        mapDataRow(
            ['','Total'],
            data.service.requests.backlog
        ),
        mapDataRow(
            ['','At SAP'],
            data.service.requests.backlogSAP
        ),
        mapDataRow(
            [{title:'Backlog (#)', rowspan:3},'At Customer'],
            data.service.requests.backlogCustomer
        )
    ],null,22);

    addPage(21,'Service Fulfillment - Backlog Requests Breakdown');
    //backlog requests by location
    addChart("#backlog-requests-chart-loc");

    addPage(22,'Service Fulfillment - Backlog Requests Breakdown');
    //backlog requests
    addChart("#backlog-requests-chart");

    addPage(23,'Service Fulfillment - Resolved Requests');
    
    //time at sap requests
    addTable(['KPI',''],[
        mapDataRow(
            ['','Incoming'],
            data.service.requests.atrInc
        ),
        mapDataRow(
            ['','Very High Priority'],
            data.service.requests.atrP1
        ),
        mapDataRow(
            [{title:'Average Time At SAP \n(Days)', rowspan:3},'High Priority'],
            data.service.requests.atrP2
        )
    ],null,22);

    //final page with tam name
    addPage(24,'Thank You',true);
    addText('Contact',5,120,20);
    addText(data.tam,5,130,20);

    //save file
    doc.save('Scorecard ' + data.customerCode + ' ' + data.period);
}