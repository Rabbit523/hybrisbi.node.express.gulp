//function that converts a data mapping into a printable pdf doc
function mapPDF(data){
    
        //generation date
        var d = new Date();
        //table styling used in doc
        var sapTable = {
            fillColor: function (i) { 
        		return  (i === 0) ? '#F0AB00' : ((i % 2 === 0) ?  '#FBF1E7' : '#F8E2CB');
        	},
        	alignemnt:'center',
        	hLineColor: 'white',
        	vLineColor:'white',
            hLineWidth: function () {
        	    return 2;
        	}
        };
    
        //text helper functions
        function newPage(title){
            return {text: title,pageBreak:'before', style: 'sectionTitle'};
        }
        function innerTitle(title,bold,span){
                return {rowSpan: span, text:title, bold:bold, fillColor:'#F8E2CB'};
        }
        function subTitlePage(title){
            return {text:title,margin:[15,225,0,0], pageBreak:'before',style:'title'};
        } 
        function textBox(text){
            return {
              margin: [15, 0, 10, 5],
              text:text
                
            };   
        }
        //standard data series
        function dataSeries(headers,path,slaFn){
            if(slaFn !== undefined){
                return headers.concat([
                        (path[0] !== null ) ? slaFn(path[0]) : '',
                        (path[1] !== null ) ? slaFn(path[1]) : '',
                        (path[2] !== null ) ? slaFn(path[2]) : '',
                        (path[3] !== null ) ? slaFn(path[3]) : '',
                        (path[4] !== null ) ? slaFn(path[4]) : '',
                        (path[5] !== null ) ? slaFn(path[5]) : '',
                        (path[6] !== null ) ? slaFn(path[6]) : '',
                        (path[7] !== null ) ? slaFn(path[7]) : '',
                        (path[8] !== null ) ? slaFn(path[8]) : '',
                        (path[9] !== null ) ? slaFn(path[9]) : '',
                        (path[10] !== null ) ? slaFn(path[10]) : '',
                        (path[11] !== null ) ? slaFn(path[11]) : ''
                    ]);
            }else{
                return headers.concat(
                    [
                        (path[0] !== null ) ? { text: path[0], alignment:'center'} : '',
                        (path[1] !== null ) ? { text: path[1], alignment:'center'} : '',
                        (path[2] !== null ) ? { text: path[2], alignment:'center'} : '',
                        (path[3] !== null ) ? { text: path[3], alignment:'center'} : '',
                        (path[4] !== null ) ? { text: path[4], alignment:'center'} : '',
                        (path[5] !== null ) ? { text: path[5], alignment:'center'} : '',
                        (path[6] !== null ) ? { text: path[6], alignment:'center'} : '',
                        (path[7] !== null ) ? { text: path[7], alignment:'center'} : '',
                        (path[8] !== null ) ? { text: path[8], alignment:'center'} : '',
                        (path[9] !== null ) ? { text: path[9], alignment:'center'} : '',
                        (path[10] !== null ) ? { text: path[10] , alignment:'center'} : '',
                        (path[11] !== null ) ? { text:path[11], alignment:'center'} : ''
                    ]);  
            }
        }
        //data series where not applicable is possible
        function naDataSeries(headers,path,slaFn,comp){
            return headers.concat([
                    (comp[0] !== 0) ? ((path[0] !== null ) ? slaFn(path[0]) : '') : { text: path[0], alignment:'center', fillColor:'#d1d1d1'}  ,
                    (comp[1] !== 0) ? ((path[1] !== null ) ? slaFn(path[1]) : '') : { text: path[1], alignment:'center', fillColor:'#d1d1d1'} ,
                    (comp[2] !== 0) ? ((path[2] !== null ) ? slaFn(path[2]) : '') : { text: path[2], alignment:'center', fillColor:'#d1d1d1'} ,
                    (comp[3] !== 0) ? ((path[3] !== null ) ? slaFn(path[3]) : '') : { text: path[3], alignment:'center', fillColor:'#d1d1d1'} ,
                    (comp[4] !== 0) ? ((path[4] !== null ) ? slaFn(path[4]) : '') : { text: path[4], alignment:'center', fillColor:'#d1d1d1'} ,
                    (comp[5] !== 0) ? ((path[5] !== null ) ? slaFn(path[5]) : '') : { text: path[5], alignment:'center', fillColor:'#d1d1d1'} ,
                    (comp[6] !== 0) ? ((path[6] !== null ) ? slaFn(path[6]) : '') : { text: path[6], alignment:'center', fillColor:'#d1d1d1'} ,
                    (comp[7] !== 0) ? ((path[7] !== null ) ? slaFn(path[7]) : '') : { text: path[7], alignment:'center', fillColor:'#d1d1d1'} ,
                    (comp[8] !== 0) ? ((path[8] !== null ) ? slaFn(path[8]) : '') : { text: path[8], alignment:'center', fillColor:'#d1d1d1'} ,
                    (comp[9] !== 0) ? ((path[9] !== null ) ? slaFn(path[9]) : '') : { text: path[9], alignment:'center', fillColor:'#d1d1d1'} ,
                    (comp[10] !== 0) ? ((path[10] !== null ) ? slaFn(path[10]) : '') : { text: path[10], alignment:'center', fillColor:'#d1d1d1'} ,
                    (comp[11] !== 0) ? ((path[11] !== null ) ? slaFn(path[11]) : '') : { text: path[11], alignment:'center', fillColor:'#d1d1d1'} 
                ]);
        }
        //data series where target is variable by month
        function vDataSeries(headers,path,slaFn,comp){
             return headers.concat([
                    ((path[0] !== null ) ? slaFn(path[0],comp[0]) : ''),
                    ((path[1] !== null ) ? slaFn(path[1],comp[1]) : ''),
                    ((path[2] !== null ) ? slaFn(path[2],comp[2]) : ''),
                    ((path[3] !== null ) ? slaFn(path[3],comp[3]) : ''),
                    ((path[4] !== null ) ? slaFn(path[4],comp[4]) : ''),
                    ((path[5] !== null ) ? slaFn(path[5],comp[5]) : ''),
                    ((path[6] !== null ) ? slaFn(path[6],comp[6]) : ''),
                    ((path[7] !== null ) ? slaFn(path[7],comp[7]) : ''),
                    ((path[8] !== null ) ? slaFn(path[8],comp[8]) : ''),
                    ((path[9] !== null ) ? slaFn(path[9],comp[9]) : ''),
                    ((path[10] !== null ) ? slaFn(path[10],comp[10]) : ''),
                    ((path[11] !== null ) ? slaFn(path[11],comp[11]) : '')
                ]);
        }
        
        //standard data table
        function dataTable(spacers,series){
            
            function getTitles(spaces){
                var titles = [{text: 'KPI', style:'tHead'}];
                            
                for(var i = 0;i < spaces;i++){
                    titles.push('');
                    
                }  
                return [titles.concat([
                                {text: 'Jan', style:'tHead'},{text: 'Feb', style:'tHead'},
                                {text: 'Mar', style:'tHead'},{text: 'Apr', style:'tHead'},{text: 'May', style:'tHead'},
                                {text: 'Jun', style:'tHead'},{text: 'Jul', style:'tHead'},{text: 'Aug', style:'tHead'},
                                {text: 'Sep', style:'tHead'},{text: 'Oct', style:'tHead'},{text: 'Nov', style:'tHead'},
                                {text: 'Dec', style:'tHead'}
                        	])];
            }
            var tWidths;
            switch(spacers){
                case 0:
                tWidths = ['15.04%','7.08%','7.08%','7.08%','7.08%','7.08%','7.08%','7.08%','7.08%','7.08%','7.08%','7.08%','7.08%','7.08%'];
                break;
                case 1:
                tWidths = ['11.5%','10%','6.54%','6.54%','6.54%','6.54%','6.54%','6.54%','6.54%','6.54%','6.54%','6.54%','6.54%','6.54%','6.54%'];    
                break;
            }
        
            return {
        		style: 'table',
        		table: {
        		    widths:tWidths,
        			body: getTitles(spacers).concat(series)
        		},
        		layout:sapTable
        	};
        }
        //data table of variable columns
        function customTable(widths,dataSet){
            return {
        		style: 'table',
                table: {
                    widths:widths,
        			body: dataSet
        	    },
        		layout:sapTable
        	};
        }
        //special table for targets
        function versionsTable(series){
            var titles = [[{text: 'Product', style:'tHead'},{text: 'Version', style:'tHead'},{text: 'Supported Until', style:'tHead'},{text: 'Currently Supported', style:'tHead'}]];    
            var values = [];
            
            if(series !== null){
            for(var i in series){
                values.push(["Hybris Product Version", versionsTarget(series[i].VERSION,series[i].EOL),series[i].EOL,series[i].SUPPORTED]);
            }
            }else{
               values.push(["Hybris Product Version",'Missing Information','Missing Information','Missing Information']);
                
            }
            return {
        		style: 'table',
        		table: {
        		    widths:['25%','25%','25%','25%'],
        			body: titles.concat(values)
        		},
        		layout:sapTable
        	};
    
        }
        
        //functions for applying targets
        function versionsTarget(version,eol){
    
            var dEnd = new Date(eol.substring(0,4),eol.substring(5,7) - 1,eol.substring(8,10));
            var dCard = new Date(data.month.substring(0,4),data.month.substring(5,7) - 1,data.month.substring(8,10));
        
            if(dEnd.getMonth() - dCard.getMonth() + (12 * (dEnd.getFullYear() - dCard.getFullYear())) > 6){
               return  {text: version,alignment:'center', fillColor:'#55db3b'};
            }
            else if(dCard < dEnd){
               return  {text: version,alignment:'center',fillColor:'#faff00'};
            }
            else{
              return  {text:version,alignment:'center',fillColor:'#f44242'};  
            } 
        }
        function irtTarget(val){
            if(val > 95){
               return  {text: val,alignment:'center', fillColor:'#55db3b'};
            }else{
              return  {text: val,alignment:'center',fillColor:'#f44242'};  
            } 
        }
        function pccScoreTarget(val){
            if(val > 7.5){
                return  {text: val,alignment:'center', fillColor:'#55db3b'};
            }
            else if(val > 5.5){
                return  {text: val,alignment:'center',fillColor:'#faff00'};
            }
            else{
                return  {text: val,alignment:'center',fillColor:'#f44242'};  
            }
        }
        function pccAutoConfirmTarget(val){
            if(val < 25){
               return  {text: val,alignment:'center', fillColor:'#55db3b'};
            }
            else if(val < 35){
               return  {text: val,alignment:'center',fillColor:'#faff00'};
            }
            else{
              return  {text: val,alignment:'center',fillColor:'#f44242'};  
            }
        }
        function incidentsP1Target(val){
            if(val < data.incidentsP1.GREEN_VALUE){
               return  {text: val,alignment:'center', fillColor:'#55db3b'};
            }
            else if(val < data.incidentsP1.YELLOW_VALUE){
               return  {text: val,alignment:'center',fillColor:'#faff00'};
            }
            else{
              return  {text: val,alignment:'center',fillColor:'#f44242'};  
            }
        }
        function incidentsP2Target(val){
            if(val < data.incidentsP2.GREEN_VALUE){
               return  {text: val,alignment:'center', fillColor:'#55db3b'};
            }
            else if(val < data.incidentsP2.YELLOW_VALUE){
               return  {text: val,alignment:'center',fillColor:'#faff00'};
            }
            else{
              return  {text: val,alignment:'center',fillColor:'#f44242'}; 
            }
        }
        function UptimeTarget(val){
            if(val >= 99.9){
               return  {text: val,alignment:'center', fillColor:'#55db3b'};
            }
            else if(val >= 98.9){
               return  {text: val,alignment:'center',fillColor:'#faff00'};
            }
            else{
              return  {text: val,alignment:'center',fillColor:'#f44242'};  
            }
        }
        function outsideDataCenter(val){
            if(val < 3000){
               return  {text: val,alignment:'center', fillColor:'#55db3b'};
            }
            else if(val < 4000){
               return  {text: val,alignment:'center',fillColor:'#faff00'};
            }
            else{
              return  {text: val,alignment:'center',fillColor:'#f44242'};  
            }
        }
        function insideDataCenter(val){
            if(val < 1000){
               return  {text: val,alignment:'center', fillColor:'#55db3b'};
            }
            else if(val < 2000){
               return  {text: val,alignment:'center',fillColor:'#faff00'};
            }
            else{
              return  {text: val,alignment:'center',fillColor:'#f44242'}; 
            }
        }
        function unPlannedDowntime(val){
            if(val < 30){
               return  {text: val,alignment:'center', fillColor:'#55db3b'};
            }
            else if(val < 60){
               return  {text: val,alignment:'center',fillColor:'#faff00'};
            }
            else{
              return  {text: val,alignment:'center',fillColor:'#f44242'};  
            }
        }
        function bandwidthTarget(val){
            if(val <= data.licensing.contractBandwidth){
               return  {text: val,alignment:'center', fillColor:'#55db3b'};
            }
            else if(val < data.licensing.contractBandwidth * 1.10){
               return  {text: val,alignment:'center',fillColor:'#faff00'};
            }
            else{
              return  {text: val,alignment:'center',fillColor:'#f44242'};  
            }
        }
        function editionTarget(val,comp){
            if(val <= comp){
               return  {text: val,alignment:'center', fillColor:'#55db3b'};
            }
            else if(val < comp * 1.10){
               return  {text: val,alignment:'center',fillColor:'#faff00'};
            }
            else{
              return  {text: val,alignment:'center',fillColor:'#f44242'};  
            }
        }
        
        //standard targets legend
        function targetsDisplay(header,val1,val2,val3,val4){
            if(!val4){
                return {
                    margin:[15,5,15,5],
                	style: 'table',
                	table: {
                			body: [
                				    
                				[header + ':',
                                {text:val1,fillColor: '#55db3b'},' ',
                                {text:val2,fillColor:'#faff00'},' ',
                                {text:val3,fillColor:'#f44242'}]
                			]
                    },
                    layout:'noBorders'
                };
            }else{
                return {
                	style: 'table',
                	table: {
                			body: [
                				    
                				[header + ':',' ',
                                {text:val1,fillColor: '#55db3b'},' ',
                                {text:val2,fillColor:'#faff00'},' ',
                                {text:val3,fillColor:'#f44242'},'',
                                {text:val4,fillColor:'#d1d1d1'}]
                			]
                    },
                    layout:'noBorders'
                };    
                
            }
        }
        //irt requires special legend
        function irtTargetsDisplay(){
                return {
                	style: 'table',
                	table: {
                			body: [
                				    
                				['% Adherence:',' ',
                                {text:'Greater than 95%',fillColor: '#55db3b'},' ',
                                {text:'Less than 95%',fillColor:'#f44242'},'',
                                {text:'Not applicable',fillColor:'#d1d1d1'}]
                			]
                    },
                    layout:'noBorders'
                };   
        }
        //editions requires a special display
        function targetsDisplayEdition(){
            if(data.licensing.hybrisEdition === 'PPV'){
                return targetsDisplay('Peak Page Views Target Legend','Less than or equal to contracted value','Less than 10 % over contracted value','Greater than 10% over contracted value');
            }
            if(data.licensing.hybrisEdition.substring(0,5) === 'Cores'){
                return targetsDisplay('Cores Target Legend','Less than or equal to contracted value','Less than 10 % over contracted value','Greater than 10% over contracted value');
            }    
            else{
                return '';
            }
        }
        
        //applying targets variability requires functions for ppv and cores tables
        function ppvDisplay(){
            if(data.licensing.hybrisEdition === 'PPV'){
                return dataTable(0,[vDataSeries([innerTitle('Peak Page Views (# per sec.)',true)],data.licensing.pageImpressions,editionTarget,data.licensing.contractValue)]);
            }else{
                return dataTable(0,[dataSeries([innerTitle('Peak Page Views (# per sec.)',true)],data.licensing.pageImpressions)]);
            }    
        }
        function coresDisplay(){
            if(data.licensing.hybrisEdition.substring(0,5) === 'Cores'){
                return dataTable(1,[vDataSeries([innerTitle('Productive Hybris cores(#)',true,2),'App Server'],data.licensing.appServer,editionTarget,data.licensing.contractValue),
        				        vDataSeries(['','Admin Server'],data.licensing.adminServer,editionTarget,data.licensing.contractValue)]);
            }else{
                return dataTable(1,[dataSeries([innerTitle('Productive Hybris cores(#)',true,2),'App Server'],data.licensing.appServer),
        				        dataSeries(['','Admin Server'],data.licensing.adminServer)]);
            }
        }
        
        //main document definition
        var pdfTemplate = {
            //doc meta data
            info: {
                title:  'Score Card ' + data.customer,
                author: 'SAP Hybris Score Card Generator',
                subject: 'Score Card'
            },
            //main page details
            pageOrientation: 'landscape',
            pageMargins: [ 0, 20, 0, 20],
            
            //header function to add sap styling of orange line
            header: {    		
                
                table: {
        			widths:['1.5%','97%','1.5%'],
        			body:[
                            [
                                '',
                                {text:'\n\n',fillColor:'#F0AB00'},
                                ''
                    	    ]
                    ]
        		},
        		layout:'noBorders'
        	},
            //footer returns an object with variable info 
            footer: function(currentPage) {  
                return {    
                    margin:0,
                    table: {
            			widths:['1.5%','97%','1.5%'],
            			body:[
                                [
                                    '\n\n',
                                    {columns: 
                                        [
                                          {text: data.period,color:'white',alignment:'left'},
                                          { text: data.customer + ' - ' + data.customerCode,color:'white', alignment: 'center' },
                                          { text: "Customer   " + currentPage.toString(),color:'white', alignment: 'right' }
                                          ]
                                    ,fillColor:'#000000'},
                                    ''
                        	    ]
                        ]
            		},
            		layout:'noBorders'
        	    };
            },
            //main doc contents
        	content: [
        	        
                //title page content
                {image:'data:image/png;base64,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',
                    width:226.2,height:44.4,margin: [15, 80, 0, 20]
                },
                {text: 'Monthly Operational Report\n\n',margin:[15,0,0,0], style:'title'},
                {text: 'Customer:\n\n',margin:[15,0,0,0], fontSize: 18},{text: data.customer,margin:[15,0,0,0], fontSize: 18},'\n\n',
                {text: 'For the Month Of:\n\n',margin:[15,0,0,0], fontSize: 14},{text: data.period,margin:[15,0,0,0], fontSize: 14},'\n\n',
                { columns: [
                {text: '\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nGenerated On: ' + data.generationDate.substring(0,10) +  ', Printed On: ' + d.getFullYear() + '-' + ("0" + (d.getMonth() + 1)).slice(-2) + '-' + d.getDate(),margin:[15,0,0,0], fontSize: 8},
                {text: '\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n[CUS-TAM-SCOCA-DOC-1.0]',margin:[0,0,15,0], fontSize: 8,alignment:'right'}
                ]},
                //availability page
                subTitlePage('Availability'),
                newPage('Availability'),
        		dataTable(0,[dataSeries([innerTitle('Site Availability - Website Uptime (%)',true)],data.availability.siteUptime,UptimeTarget),
            		            dataSeries([innerTitle('SLA - Hybris Cloud Uptime (%)',true)],data.availability.infraUptime,UptimeTarget),
            				    dataSeries(['Downtime Planned (min.)'],data.availability.sitePlannedDownTime),
            				    dataSeries(['Downtime Unplanned  (min.)'],data.availability.siteUnplannedDownTime,unPlannedDowntime)]),
            				    
            	//availability targets
        		targetsDisplay(' Uptime Target Legend','Greater or equal to : 99.9','Greater or equal to 98.9','Less than 98.9'),
        		targetsDisplay('Down Time Target Legend','Less than 30 min/mth','Greater than 30 min/mth','Greater than 60 min/mth'),
        		
        		//availability descriptions
        		{text: 'Site Availability - Website Uptime', style: 'sectionDescription'},
                textBox('The absolute availability of the website as measured by 3rd party monitoring service.'),
                {text: 'SLA Hybris Cloud Uptime ', style: 'sectionDescription'},
                textBox('The Hybris Cloud uptime corresponds to a 99.9% System Availability percentage during each month for productive versions. In case of SAP’s failure to meet the System Availability SLA, the customer can claim 2% of monthly subscription fees for each 1% below System Availability SLA, not to exceed 100% of monthly subscription fees.'),
                {text: 'Planned Downtime', style: 'sectionSubDescription'},
                textBox('Planned downtime corresponds to the scheduled downtime measured each month. Scheduled downtime for the applicable SAP Cloud Services to which customer has subscribed is set forth in “Service Level Agreement for SAP Cloud Services”.'),
                {text: 'Unplanned Downtime', style: 'sectionSubDescription'},
                textBox('Unplanned downtime corresponds to any other scheduled downtime not specified in “Service Level Agreement for SAP Cloud Services” or unavailability caused by factors outside of SAP’s reasonable control, such as unpredictable and unforeseeable events that could not have been avoided even if reasonable care had been exercised.'),
              
                //page load page                    
                newPage('Availability'),
        		dataTable(1,[dataSeries([innerTitle('\nPage Load Time',true,2),'Outside SAP network (ms)'], data.availability.outDataCenter,outsideDataCenter),
                                dataSeries(['','Inside SAP network (ms)'], data.availability.inDataCenter,insideDataCenter)]),
                //page load targets
                targetsDisplay('Outside SAP network Target Legend','Less than 3000ms','Less than 5000ms','Greater than 5000ms'),
        		targetsDisplay('Inside SAP network Target Legend','Less than 1000ms','Less than 3000ms','Greater than 3000ms'),
        		
        		//page load descriptions
        		{text: 'Page Load Time ', style: 'sectionDescription'},
                textBox('Page load time within the SAP network is the load time measured inside the datacenter and corresponds to SAP’s system availability SLA, whereas the page load time outside the SAP network is measured over the public internet. Page load time measured from outside the SAP network can be affected by several factors, such as proxies, caching, 3rd party services and VPN usage. There are also several ways of improving page load time, such as employing a CDN or engaging with Hybris Expert Services for a performance evaluation. Page load times are reported as averages in milliseconds.'),
                //licensing page
                //edition table
                subTitlePage('Licensing'),
                newPage('Licensing Metrics'),
        		customTable(['33.33%','33.33%','33.33%'],[[{text: 'KPI', style:'tHead'},{text:'Edition Type', style:'tHead'},{text:'Contracted Value', style:'tHead'} ],
        					[innerTitle('SAP Hybris Commerce Cloud Edition',true),data.licensing.hybrisEdition,data.licensing.contractEdition]]),
        					
        		//version table
            	versionsTable(data.licensing.hybrisVersion),
            	targetsDisplay('Versions Target Legend','Version is supported','End-of-life date in less than 6 months','End-of-life'),
            	
            	//license descriptions
            	{text: 'SAP Hybris Commerce Cloud Edition', style: 'sectionDescription'},
                textBox('The Hybris Commerce Cloud is available in three editions: Standard, Professional and Enterprise, with the option of choosing cores, revenue or peak page views as licensing metric, plus additional add-on services.'),
                {text: 'SAP Hybris Version', style: 'sectionDescription'},
                textBox('The SAP Hybris version relates to the current version installed on Cloud. Unless otherwise specified in the contract, the customer is responsible for upgrading the SAP Hybris software to the latest version.'),
                
                //cores+ppvs page
                newPage('Licensing Metrics'),
                ppvDisplay(),
                coresDisplay(),
                
                //target for 1 or the other or none + table creation
                targetsDisplayEdition(),
                
                //page impression descriptions
                {text: 'Peak Page Views', style: 'sectionDescription'},
                textBox('A single view of a mobile or browser application, email, or web page of an internet site, including application screen views, application screen states, mobile web pages, and social network pages. Page views occur each time a web page is loaded or refreshed on named domain(s), an application is loaded, or when targeted content renders or is shown through an opened or viewed email. Peak page views are reported per day and calculated as peaks per second in a period of 5 minutes.'),
                
                //cores descriptions
                {text: 'Productive Hybris Cores', style: 'sectionDescription'},
                textBox('Corresponds to the number of cores that are assigned for the Hybris application server. When counting physical Cores, each Core of a physical CPU that runs at least parts of the Cloud Service, including those that are temporarily assigned or scheduled to cover peak processing, is considered and counted. If the Cloud Service will run in a pure virtual environment each virtual Core that runs at least parts of the Cloud Service, including those that are temporarily assigned or scheduled to cover peak processing, is counted. '),
                
                //bandwidth table
        		newPage('Licensing Metrics'),
        		dataTable(0,[dataSeries([innerTitle('Bandwidth Utilization(Mbps)',true)],data.licensing.bandwidth,bandwidthTarget)]),
        		
        		//bandwidth description
                {text: 'Bandwidth utilization', style: 'sectionDescription'},
                targetsDisplay('Bandwidth Target Legend','Less than or equal to contracted value','Less than 10 % over contracted value','Greater than 10% over contracted value'),
                textBox('Bandwidth reporting tracks the Customer’s consumption of network resources. The base rate specified in the Agreement in Mega-bits-per-second (Mbps) is a unit of measure used for the bandwidth of SAP Hybris Commerce Cloud. The bandwidth metric in Mbps reflects the datacenter inbound and outbound traffic to and from the Customer’s servers. This includes traffic passing through the public internet and any physical or virtual tunnels. The 95th percentile is used to meter the bandwidth usage, allowing the Customer to burst beyond the committed base rate when necessary. '),
                
        		//Cloud incidents
                subTitlePage('Service Fulfillment - Cloud'),
        		newPage('Cloud - Incidents'),
        		dataTable(1,[dataSeries([innerTitle('Incident Management',true,3),'Cloud Incidents (#)'],data.service.incidents.incoming),
            				    dataSeries( ['','Very High Priority (%)'],data.service.incidents.p1,incidentsP1Target),
            				    dataSeries( ['','High Priority (%)'],data.service.incidents.p2,incidentsP2Target)]),
            	
            	//Cloud incidents targets
            	{text: 'Incident Management', style: 'sectionDescription'},
                targetsDisplay('Very High Target Legend','Less than ' + data.incidentsP1.GREEN_VALUE + '%','Less than ' + data.incidentsP1.YELLOW_VALUE + '%','More than ' + data.incidentsP2.YELLOW_VALUE + '%'),
                targetsDisplay('High Target Legend','Less than ' + data.incidentsP2.GREEN_VALUE + '%','Less than ' + data.incidentsP2.YELLOW_VALUE + '%','More than ' + data.incidentsP2.YELLOW_VALUE + '%'),
                
                //Cloud incidents descriptions
                textBox('An incident is an unplanned interruption to an IT service or reduction in the quality of an IT service. Failure of a configuration item that has not yet affected service is also an incident – for example, failure of one disk from a mirror set. Incident Management is the process responsible for managing the lifecycle of all incidents. Incident management ensures that normal service operation is restored as quickly as possible and the business impact is minimized.'),
                {text: 'Priority Definitions', style: 'sectionDescription'},
                textBox('Very High: An incident should be categorized with the priority Very High if the problem has very serious consequences for normal business processes or IT processes related to core business processes for customers. Urgent work cannot be performed. This is generally caused by the following circumstances:'),
                {
                    style:'table',
        			ul: [
        				'A productive system is completely down. ',
        				'The imminent go-live or upgrade is jeopardized.',
        				'The core business processes of the customer are seriously affected.',
        				'A workaround is not available.',
        				'The incident requires immediate processing because the malfunction may cause serious data losses.'
        			]
    		    },
                textBox('High: An incident should be categorized with the priority High if normal business processes are seriously affected. Necessary tasks cannot be performed. This is caused by incorrect or inoperable functions in the SAP system that are required immediately. The incident is to be processed as quickly as possible because a continuing malfunction can seriously disrupt the entire productive business flow.'),
                
                //Cloud IRT 
        		newPage('Cloud - Incidents'),
        		dataTable(1,[naDataSeries([innerTitle('SLA IRT Adherence (%)',true,3),'Cloud Incidents'],data.service.incidents.percAdherence,irtTarget,data.service.incidents.incoming),
                                naDataSeries(['','Very High Priority'],data.service.incidents.adhereP1,irtTarget,data.service.incidents.p1),
        			            naDataSeries(['','High Priority'],data.service.incidents.adhereP2,irtTarget,data.service.incidents.p2)]),
        			            
        		//Cloud IRT targets	            
        		{text: 'SLA IRT Adherence', style: 'sectionDescription'}, 
        		irtTargetsDisplay(),
        		//Cloud IRT description
                textBox('Support Engineer adherence to the Initial Response Time defined and agreed upon in the Service Level Agreement between SAP and the client.'),
                
                //Cloud Backlog
                newPage('Cloud - Incidents'),
                dataTable(1,[dataSeries([{rowSpan: 3,text:'Backlog (#)', fillColor:'#F8E2CB',alignment:'center',bold:true},'Total'],data.service.incidents.backlog),
        					    dataSeries(['','At SAP'],data.service.incidents.backlogSAP),
        					    dataSeries(['','At Customer'],data.service.incidents.backlogCustomer)]),
        					    
        		//Cloud backlog  description
        		{text: 'Backlog', style: 'sectionDescription'}, 	
                textBox('Backlog refers to the number of incidents that remain open and unresolved at the end of each month.'),
                
                //Cloud chart
    			newPage('Cloud - Incidents Backlog Breakdown'),       
        		{
        		  style:'table',
        		  image:document.getElementById('backlog-incidents-chart-loc').toDataURL(),
        		  width:800
        		},
    			newPage('Cloud - Incidents Backlog Breakdown'),       
        		{
        		  style:'table',
        		  image:document.getElementById('backlog-incidents-chart').toDataURL(),
        		  width:800
        		},
                
                //Cloud PCC
                newPage('Cloud - Resolved Incidents'),
        		dataTable(1,[dataSeries([innerTitle('PCC',true,3),'Reply (%)'],data.service.incidents.pccReply),
                                naDataSeries(['','Avg. Score questions 1-4'],data.service.incidents.pccQuestions,pccScoreTarget,data.service.incidents.pccReply),
                                dataSeries(['','Auto Confirmed (%)'],data.service.incidents.pccAutoConfirm,pccAutoConfirmTarget)]),
                //Cloud PCC targets
            	{text: 'PCC', style: 'sectionDescription'},
        		targetsDisplay('Avg. Score questions 1-4 Target Legend','Greater than 7.5','Greater than 5.5','Less than 5.5','Not applicable'),
        		targetsDisplay('Auto Confirmed Target Legend','Less then 25%','Less then 35%','Greater then 45%'),
        		
        		//Cloud PCC descriptions
        		{text:'The Positive Call Closure:', bold:true, margin: [15, 5, 10, 15]},
                textBox('Survey to measure customer satisfaction within the incident solving process. It is a survey of questions and a fixed scoring model offered to be filled in by author when confirming the message solution.'),
                {text:'Avg. Score:', bold:true, margin: [15, 5, 10, 15]},
                textBox('After every incident is solved and completed the customer is invited to fill out a PCC survey with six questions. They rate their satisfaction on various areas on a scale of one to ten.'),
                {text:'Confirmed automatically:', bold:true,  margin: [15, 5, 10, 15]},
                textBox('The percentage of incidents that were closed automatically and where the customer did not fill in the PCC survey.'),
    
                //Cloud time at sap
        	    newPage('Cloud - Resolved Incidents'),
        		dataTable(1,[dataSeries([{rowSpan: 3,text:'Average time At SAP (Days)', fillColor:'#F8E2CB',alignment:'center',bold:true},'Cloud Incidents'],data.service.incidents.atrInc),
        					    dataSeries(['','Very High Priority'],data.service.incidents.atrP1),
        					    dataSeries(['','High Priority'],data.service.incidents.atrP2)]),
        					    
        		//Cloud average time description
    			{text: 'Average Time at SAP', style: 'sectionDescription'}, 	
                textBox('The average time that an incident spent being handled by and assigned to internal teams at SAP, the time at customer is not accounted for. Average time at SAP applies only for resolved and closed incidents, for unresolved incidents and requests, see Backlog.'),
        		
        		//Serivce Req incidents
                subTitlePage('Service Fulfillment - Service Requests'),
        		newPage('Service Fulfillment - Incoming Requests'),
        		dataTable(1,[dataSeries([innerTitle('Incoming Requests By Priority',true,3),'Service Requests (#)'],data.service.requests.incoming),
        					    dataSeries(['','Very High Priority (%)'],data.service.requests.p1,incidentsP1Target),
        			            dataSeries(['','High Priority (%)'],data.service.requests.p2,incidentsP2Target)]),
        	    textBox('Please note that in order to have service requests statistics displayed, the correct component (CEC-HCS-REQ) has to be chosen by the customer during service request ticket creation.'),
        		{text: 'Service Requests', style: 'sectionDescription'},
        		
        		//Service Req targets 
                targetsDisplay('Very High Target Legend','Less than ' + data.incidentsP1.GREEN_VALUE + '%','Less than ' + data.incidentsP1.YELLOW_VALUE + '%','More than ' + data.incidentsP2.YELLOW_VALUE + '%'),
                targetsDisplay('High Target Legend','Less than ' + data.incidentsP2.GREEN_VALUE + '%','Less than ' + data.incidentsP2.YELLOW_VALUE + '%','More than ' + data.incidentsP2.YELLOW_VALUE + '%'),
                
                //Service Req descriptions
                textBox('A formal request from a user for something to be provided – for example, a request for information or advice; to perform a deployment on the customer environment; to reset a password; or to whitelist a new user e-mail. Service requests are managed by the request fulfilment process, and may be linked to a request for change as part of fulfilling the request. '),
    	       
    	        //Service Req deployments
                newPage('Service Fulfillment - Incoming Requests'),
        		dataTable(1,[dataSeries([innerTitle('Deployments',true,2),'Production (#)'],data.service.requests.production),
        					   dataSeries(['','Staging (#)'],data.service.requests.staging)]),
        		{text: 'Deployments', style: 'sectionDescription'}, 
    
        		//Service Req deployment descriptions
                textBox('A customer initiated packaged code deployment from the Development environment to the Staging environment or a packaged code deployment from the Staging environment to the Production environment. The delivery resources that support this work effort are part of a shared services team. SAP Hybris Cloud Services include SAP Hybris application deployment services for Development (where applicable), Staging and Production environments during the Project Phase and after the Go- Live of a site. The Customer is responsible for code deployment on the Development environment only.'),
    			
    			//Service Req backlog 
    			newPage('Service Fulfillment - Backlog Requests'),
        	    dataTable(1,[dataSeries([{rowSpan: 3,text:'Backlog (#)', fillColor:'#F8E2CB',alignment:'center',bold:true},'Service Requests'],data.service.requests.backlog),
        					    dataSeries(['','At SAP'],data.service.requests.backlogSAP),
        					    dataSeries(['','At Customer'],data.service.requests.backlogCustomer)]),
        		 
    			//Service Req Backlog description  
    			{text: 'Backlog', style: 'sectionDescription'}, 	
                textBox('Backlog refers to the number of requests that remain open and unresolved at the end of each month.'), 
                
    			//Service Req backlog Chart
    			newPage('Service Fulfillment - Requests Backlog Breakdown'),       
        		{
        		  style:'table',
        		  image:document.getElementById('backlog-requests-chart-loc').toDataURL(),
        		  width:800
        		},
    			newPage('Service Fulfillment - Requests Backlog Breakdown'),  
        		{
        		  style:'table',
        		  image:document.getElementById('backlog-requests-chart').toDataURL(),
        		  width:800
        		},       
        		
    			//Service time at SAP
                newPage('Service Fulfillment - Resolved Requests'),
                dataTable(1,[dataSeries([innerTitle('Average time At SAP (Days)',true,3),'Service Requests '],data.service.requests.atrInc),
            					dataSeries(['','Very High Priority'],data.service.requests.atrP1),
            					dataSeries(['','High Priority'],data.service.requests.atrP2)]),
            					
            	//Service Req time at SAP description
    			{text: 'Average Time at SAP', style: 'sectionDescription'},
                textBox('The average time that a service request spent being handled by and assigned to internal teams at SAP, the time at customer is not accounted for. Average time at SAP applies only for resolved and closed incidents, for unresolved incidents and requests, see Backlog.'),
        	    newPage(''),
        	    {text: '\n\nThank You\n\n',margin:[15,0,0,0], style:'title'},
                {text: 'Contact:\n\n',margin:[15,0,0,0], fontSize: 14},{text: data.tam,margin:[15,0,0,0], fontSize: 14}
              
        	],
        	styles: {
        	    title:{
        	      fontSize:36,   
        	      bold:true,
        	      margin: [0, 0, 0, 0],
        	      alignment:'left'
        	    },
        	    sectionTitle:{
        	      fontSize:24,
        	      bold:true,
        	      margin:[15,10,10,10],
        	      alignment:'left'
        	        
        	    },
        	    pageFooter:{
        	      fontSize: 12,
        	      margin:[10,5,10,10],
        	      color:'white',
        	      alignment:'left'
        	        
        	    },
        	    sectionDescription:{
        	      fontSize:16,
        	      bold:true,
        	      underline:true,
        	      margin:[15,5,10,10],
        	      alignment:'left'
        	        
        	    },
        	    sectionSubDescription:{
        	      fontSize:14,
        	      bold:true,
        	      underline:true,
        	      margin:[15,5,10,5],
        	      alignment:'left'
        	        
        	    },
        		table: {
        			margin: [15, 0, 15, 10],
        			alignemnt:'left'
        		},
        		tHead:{
        		    bold:true,
        		    color:'white'
        		}
        	}
        
        };    
        return pdfTemplate;
    }
