app.controller('scoreCard', ['$location', '$scope', '$http', '$document', function ($location, $scope, $http, $document) {
    $scope.tooltips();
    $scope.fullPageScroll();


    $scope.statuses = ['Initial Creation', 'PDF Generated', 'Confirmed'];
    $scope.status = 'Initial Creation';
    $scope.tableHeaders = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    //standard chart options
    $scope.stackedBarChartOptions = {
        responsive: false,
        maintainAspectRatio: false,
        scales: {
            yAxes: [{
                stacked: true,
                ticks: {
                    beginAtZero: true,
                    fontSize: 16
                }
            }],
            xAxes: [{
                stacked: true,
                ticks: {
                    beginAtZero: true,
                    fontSize: 16
                }
            }]
        },
        plugins: {
            datalabels: {
                display: function (context) {
                    return context.dataset.data[context.dataIndex] > 5;
                },
                font: { weight: "bold" },
                color: "white"
            }
        }
    };
$scope.scoreCardData = {
    customer: "Template",
    period: "holder",
    customerCode: "Temp",
    generationDate: "Template",
    tam: "Template",
    status:"Template",

    availability: {
        infraUptime: [null, null, null, null, null, null, null, null, null, null, null, null],
        siteUptime: [null, null, null, null, null, null, null, null, null, null, null, null],
        sitePlannedDownTime: [null, null, null, null, null, null, null, null, null, null, null, null],
        siteUnplannedDownTime: [null, null, null, null, null, null, null, null, null, null, null, null],
        outDataCenter: [null, null, null, null, null, null, null, null, null, null, null, null],
        inDataCenter: [null, null, null, null, null, null, null, null, null, null, null, null]
    },
    licensing: {
        pageImpressions: [null, null, null, null, null, null, null, null, null, null, null, null],
        bandwidth: [null, null, null, null, null, null, null, null, null, null, null, null],
        appServer: [null, null, null, null, null, null, null, null, null, null, null, null],
        adminServer: [null, null, null, null, null, null, null, null, null, null, null, null],
        contractValue: [null, null, null, null, null, null, null, null, null, null, null, null],
        hybrisEdition: "err",
        contractEdition: null,
        contractBandwidth: null,
        hybrisVersion: null
    },
    service: {
        incidents: {
            incoming: [null, null, null, null, null, null, null, null, null, null, null, null],
            p1: [null, null, null, null, null, null, null, null, null, null, null, null],
            p2: [null, null, null, null, null, null, null, null, null, null, null, null],
            percAdherence: [null, null, null, null, null, null, null, null, null, null, null, null],
            adhereP1: [null, null, null, null, null, null, null, null, null, null, null, null],
            adhereP2: [null, null, null, null, null, null, null, null, null, null, null, null],
            pccReply: [null, null, null, null, null, null, null, null, null, null, null, null],
            pccQuestions: [null, null, null, null, null, null, null, null, null, null, null, null],
            pccAutoConfirm: [null, null, null, null, null, null, null, null, null, null, null, null],
            backlog: [null, null, null, null, null, null, null, null, null, null, null, null],
            backlogSAP: [null, null, null, null, null, null, null, null, null, null, null, null],
            backlogCustomer: [null, null, null, null, null, null, null, null, null, null, null, null],
            backlogP1: [null, null, null, null, null, null, null, null, null, null, null, null],
            backlogP2: [null, null, null, null, null, null, null, null, null, null, null, null],
            backlogP3: [null, null, null, null, null, null, null, null, null, null, null, null],
            backlogP4: [null, null, null, null, null, null, null, null, null, null, null, null],
            atrInc: [null, null, null, null, null, null, null, null, null, null, null, null],
            atrP1: [null, null, null, null, null, null, null, null, null, null, null, null],
            atrP2: [null, null, null, null, null, null, null, null, null, null, null, null]
        },
        requests: {
            incoming: [null, null, null, null, null, null, null, null, null, null, null, null],
            p1: [null, null, null, null, null, null, null, null, null, null, null, null],
            p2: [null, null, null, null, null, null, null, null, null, null, null, null],
            production: [null, null, null, null, null, null, null, null, null, null, null, null],
            staging: [null, null, null, null, null, null, null, null, null, null, null, null],
            backlog: [null, null, null, null, null, null, null, null, null, null, null, null],
            backlogSAP: [null, null, null, null, null, null, null, null, null, null, null, null],
            backlogCustomer: [null, null, null, null, null, null, null, null, null, null, null, null],
            backlogP1: [null, null, null, null, null, null, null, null, null, null, null, null],
            backlogP2: [null, null, null, null, null, null, null, null, null, null, null, null],
            backlogP3: [null, null, null, null, null, null, null, null, null, null, null, null],
            backlogP4: [null, null, null, null, null, null, null, null, null, null, null, null],
            atrInc: [null, null, null, null, null, null, null, null, null, null, null, null],
            atrP1: [null, null, null, null, null, null, null, null, null, null, null, null],
            atrP2: [null, null, null, null, null, null, null, null, null, null, null, null]
        }
    },
    targets: {
        incidentsP1: null,
        incidentsP2: null
    }
};
    //retrieve score card data and map it back to the object looping through recieved rows 
    $scope.loadData = function () {
        $http.get("/api/scoreCards/getScoreCard?id=" + $scope.path[2] + "-" + $scope.newPeriod)
            .success(function (data) {
                //set scorecard data
                $scope.scoreCardData = data;
                $scope.status=data.status;
                $scope.scoreCardData.month=$scope.path[4] + '/' + ("0" + $scope.path[3]).slice(-2)  + '/01';

                //set graph data 
                $scope.backlogIncidentsChartData = {
                    labels: $scope.tableHeaders,
                    datasets: [{
                        label: 'Very High',
                        data: $scope.scoreCardData.service.incidents.backlogP1,
                        backgroundColor: '#d61800'
                    },
                    {
                        label: 'High',
                        data: $scope.scoreCardData.service.incidents.backlogP2,
                        backgroundColor: '#fc7311'
                    },
                    {
                        label: 'Medium',
                        data: $scope.scoreCardData.service.incidents.backlogP3,
                        backgroundColor: '#ffca2d'
                    },
                    {
                        label: 'Low',
                        data: $scope.scoreCardData.service.incidents.backlogP4,
                        backgroundColor: '#9efc10'
                    }]
                };
                $scope.backlogRequestsChartData = {
                    labels: $scope.tableHeaders,
                    datasets: [{
                        label: 'Very High',
                        data: $scope.scoreCardData.service.requests.backlogP1,
                        backgroundColor: '#d61800'
                    },
                    {
                        label: 'High',
                        data: $scope.scoreCardData.service.requests.backlogP2,
                        backgroundColor: '#fc7311'
                    },
                    {
                        label: 'Medium',
                        data: $scope.scoreCardData.service.requests.backlogP3,
                        backgroundColor: '#ffca2d'
                    },
                    {
                        label: 'Low',
                        data: $scope.scoreCardData.service.requests.backlogP4,
                        backgroundColor: '#9efc10'
                    }]
                };
                $scope.backlogIncidentsLocChartData = {
                    labels: $scope.tableHeaders,
                    datasets: [{
                        label: 'At SAP',
                        data: $scope.scoreCardData.service.incidents.backlogSAP,
                        backgroundColor: '#ffca2d'
                    },
                    {
                        label: 'At Customer',
                        data: $scope.scoreCardData.service.incidents.backlogCustomer,
                        backgroundColor: '#008FD3'
                    }]
                };
                $scope.backlogRequestsLocChartData = {
                    labels: $scope.tableHeaders,
                    datasets: [{
                        label: 'At SAP',
                        data: $scope.scoreCardData.service.requests.backlogSAP,
                        backgroundColor: '#ffca2d'
                    },
                    {
                        label: 'At Customer',
                        data: $scope.scoreCardData.service.requests.backlogCustomer,
                        backgroundColor: '#008FD3'
                    }]
                };
            });
    };
    //get targets
    $http.get("/api/targets/getTarget?type=Incidents_P1")
        .success(function (data) {
            $scope.incidentsP1 = data.tables[0];
        });
    $http.get("/api/targets/getTarget?type=Incidents_P2")
        .success(function (data) {
            $scope.incidentsP2 = data.tables[0];
        });
    //save status change
    $scope.updateStatus = function () {
        $http.put("/api/scoreCards/setStatus",JSON.stringify({id:$scope.id,status:$scope.status}))
            .success(function () {
                $scope.successAlert = true;
            });
    };
    //generate pdf and open in new window for priniting
    $scope.print = function () {
        $scope.hideToolTip();
        window.print();
    };
    
    var green = "rgba(29, 178, 0,0.85)";
    var yellow = "rgba(252, 236, 17,0.85)";
    var red = "rgba(255, 67, 30,0.85)";
    var grey = "#CCC";
    $scope.openCpAlertsModal = function (topIssue) {
        $("#cpAlertLoad").Loadingdotdotdot({
            "speed": 400,
            "maxDots": 6,
            "word": "Loading"
        });
        $http.get("/api/scoreCards/getCatchpointFailures?year=" + $scope.scoreCardData.month.substring(0, 4) + "&code=" + $scope.path[2]).success(function (data) {
            $scope.cpAlerts = data;
            $("#cpAlertLoad").Loadingdotdotdot("Stop");
            $("#cpAlertLoad").html("(Last 90 Days)");
            $("#cpAlertsModal").modal('show');
        });
    };
    //target functions
    $scope.unplannedDowntimeTarget = function (val) {
        num = parseFloat(val);
        if (num) {
            if (num < 30) {
                return "background-color:" + green + "!important";
            }
            else if (num < 60) {
                return "background-color:" + yellow + "!important";
            }
            else {
                return "background-color:" + red + "!important";
            }
        } else if(val === "N/A"){
            return "background-color:" + grey + "!important";
        }else{
            return "";
        }
    };
    $scope.uptimeTarget = function (val) {
        num = parseFloat(val);
        if (num) {
            if (num >= 99.9) {
                return "background-color:" + green + "!important";
            }
            else if (num >= 98.9) {
                return "background-color:" + yellow + "!important";
            }
            else {
                return "background-color:" + red + "!important";
            }
        } else if(val === "N/A"){
            return "background-color:" + grey + "!important";
        }else{
            return "";
        }
    };
    $scope.outsideDataCenterTarget = function (val) {
        num = parseFloat(val);
        if (num) {
            if (num < 3000) {
                return "background-color:" + green + "!important";
            }
            else if (num < 5000) {
                return "background-color:" + yellow + "!important";
            }
            else {
                return "background-color:" + red + "!important";
            }
        } else if(val === "N/A"){
            return "background-color:" + grey + "!important";
        }else{
            return "";
        }
    };
    $scope.insideDataCenterTarget = function (val) {
        num = parseFloat(val);
        if (num) {
            if (num < 1000) {
                return "background-color:" + green + "!important";
            }
            else if (num < 3000) {
                return "background-color:" + yellow + "!important";
            }
            else {
                return "background-color:" + red + "!important";
            }
        } else if(val === "N/A"){
            return "background-color:" + grey + "!important";
        }else{
            return "";
        }
    };
    $scope.versionsTarget = function (obj) {

        if (obj) {
            var dEnd = new Date(obj.EOL.substring(0, 4), obj.EOL.substring(5, 7) - 1, obj.EOL.substring(8, 10));
            var dCard = new Date($scope.scoreCardData.month);

            if (dEnd.getMonth() - dCard.getMonth() + (12 * (dEnd.getFullYear() - dCard.getFullYear())) > 6) {
                return "background-color:" + green + "!important";
            }
            else if (dCard < dEnd) {
                return "background-color:" + yellow + "!important";
            }
            else {
                return "background-color:" + red + "!important";
            }
        }
    };
    $scope.editionTarget = function (val) {
        num = parseFloat(val);
        if (num) {
            if (num <= $scope.scoreCardData.licensing.contractEdition) {
                return "background-color:" + green + "!important";
            }
            else if (num < $scope.scoreCardData.licensing.contractEdition * 1.10) {
                return "background-color:" + yellow + "!important";
            }
            else {
                return "background-color:" + red + "!important";
            }
        } else if(val === "N/A"){
            return "background-color:" + grey + "!important";
        }else{
            return "";
        }
    };
    $scope.bandwidthTarget = function (val) {
        num = parseFloat(val);
        if (num >=0) {
            if (num <= $scope.scoreCardData.licensing.contractBandwidth) {
                return "background-color:" + green + "!important";
            }
            else if (num < $scope.scoreCardData.licensing.contractBandwidth * 1.10) {
                return "background-color:" + yellow + "!important";
            }
            else {
                return "background-color:" + red + "!important";
            }
        } else if(val === "N/A"){
            return "background-color:" + grey + "!important";
        }else{
            return "";
        }
    };
    $scope.incidentsP1Target = function (val) {
        if ($scope.incidentsP1 && $scope.incidentsP1) {
            val = parseFloat(val);
            if (val >= 0) {
                if (val < $scope.incidentsP1.GREEN_VALUE) {
                    return "background-color:" + green + "!important";
                }
                else if (val < $scope.incidentsP1.YELLOW_VALUE) {
                    return "background-color:" + yellow + "!important";
                }
                else {
                    return "background-color:" + red + "!important";
                }
            } else {
                return "";
            }
        }
    };
    $scope.incidentsP2Target = function (val) {
        if ($scope.incidentsP2 && $scope.incidentsP2) {
            val = parseFloat(val);
            if (val >= 0) {
                if (val < $scope.incidentsP2.GREEN_VALUE) {
                    return "background-color:" + green + "!important";
                }
                else if (val < $scope.incidentsP2.YELLOW_VALUE) {
                    return "background-color:" + yellow + "!important";
                }
                else {
                    return "background-color:" + red + "!important";
                }
            } else {
                return "";
            }
        }
    };
    $scope.irtTarget = function (val) {
        val = parseFloat(val);
        if (val >= 0) {
            if (val > 95) {
                return "background-color:" + green + "!important";
            } else {
                return "background-color:" + red + "!important";
            }
        } else {
            return "";
        }
    };
    $scope.pccScoreTarget = function (val) {
        val = parseFloat(val);
        if (val > 0) {
            if (val > 7.5) {
                return "background-color:" + green + "!important";
            }
            else if (val > 5.5) {
                return "background-color:" + yellow + "!important";
            }
            else {
                return "background-color:" + red + "!important";
            }
        } else {
            if (val === 0) {
                return "background-color:#CCCCCC!important";
            } else {
                return "";
            }
        }
    };
    $scope.pccAutoConfirmTarget = function (val) {
        val = parseFloat(val);
        if (val > 0) {
            if (val < 25) {
                return "background-color:" + green + "!important";
            }
            else if (val < 35) {
                return "background-color:" + yellow + "!important";
            }
            else {
                return "background-color:" + red + "!important";
            }
        } else {
            if (val === 0) {
                return "background-color:#CCCCCC!important";
            } else {
                return "";
            }
        }
    };
    //descriptions for the tool tips
    $scope.dataDescriptions = {
        uptime: {
            title: "Site Availability",
            description: "The absolute server uptime for the current client",
            source: "Taken directly from catchpoint no further manipulations are done"
        },
        slaUptime: {
            title: "SLA Availability",
            description: "The adjusted availability as per the adjustements done by tams on catchpoint.",
            source: "Taken directly from catchpoint no further manipulations are done"
        },
        downtimePlanned: {
            title: "Downtime Planned",
            description: "Downtime Planned = minutes in a month * (SLA Availability - Site Availability)/100",
            source: "Calculated based on the site and SLA availability"
        },
        downtimeUnplanned: {
            title: "Downtime Unplanned",
            description: "Downtime Unplanned = minutes in a month * Site vailability/100 - planned downtime",
            source: "Calculated based on the site and SLA availability"
        },
        outsideResponse: {
            title: "Outside SAP network",
            description: "Page load time from catchpoint",
            source: "Taken directly from catchpoint no further manipulations are done"
        },
        insideResponse: {
            title: "Inside SAP network",
            description: "Page load time from inside the DC",
            source: "Taken directly from ops view"
        },
        hybrisEdition: {
            title: "SAP Hybris Commerce Cloud Edition",
            description: "The Type of edition this customer bought",
            source: "Maintained Manually in the customer record of this application"
        },
        hybrisVersion: {
            title: "SAP Hybris Version",
            description: "The most recent recorded version on which the customer was upon generation according to the below source",
            source: "https://wiki.hybris.com/pages/viewpage.action?pageId=272758628"
        },
        ppv: {
            title: "Peak Page Impressions",
            description: "Peak Page views for customer, a target appears if the customer has PPV edition",
            source: "PME Team, Igor Kiselev"
        },
        cores: {
            title: "Cores",
            description: "Cores for customer split by admin and app servers, a target appears if the customer has Cores edition",
            source: "PME Team, Igor Kiselev"
        },
        bandwidth: {
            title: "Bandwidth",
            description: "Bandwidth consumed by customer",
            source: "Taken directly from netflow extracts no further manipulations"
        },
        cloudIncidents: {
            title: "Cloud Incidents",
            description: "Incidents created for this customer, requires customer to select correct system number to appear (3 character code)",
            source: "BI launchpad BCP extracts"
        },
        cloudIncidentsP1: {
            title: "Cloud Incidents Very High Priority",
            description: "% of incidents created with very high priority for this customer, requires customer to select correct system number to appear (3 character code)",
            source: "BI launchpad BCP extracts"
        },
        cloudIncidentsP2: {
            title: "Cloud Incidents High Priority",
            description: "% of incidents created with high priority for this customer, requires customer to select correct system number to appear (3 character code)",
            source: "BI launchpad BCP extracts"
        },
        cloudIRT: {
            title: "Cloud Overall IRT",
            description: "Overall IRT for all incidents created by customer, requires customer to select correct system number to appear (3 character code)",
            source: "BI launchpad BCP extracts"
        },
        cloudIRTP1: {
            title: "Cloud IRT for Very High Incidents",
            description: "IRT for incidents created by customer with very high priority, requires customer to select correct system number to appear (3 character code)",
            source: "BI launchpad BCP extracts"
        },
        cloudIRTP2: {
            title: "Cloud IRT for High Incidents",
            description: "IRT for incidents created by customer with very high priority, requires customer to select correct system number to appear (3 character code)",
            source: "BI launchpad BCP extracts"
        },
        cloudBacklog: {
            title: "Cloud Incidents Backlog",
            description: "Incidents counted towards the backlog. Seperated by location",
            source: "BI launchpad BCP extracts"
        },
        cloudPCCReply: {
            title: "Cloud Incidents PCC Reply",
            description: "% of surveys to which the customer replied",
            source: "BI launchpad BCP extracts"
        },
        cloudPCCScore: {
            title: "Cloud Incidents Avg Score",
            description: "Avg score obtained on surveys",
            source: "BI launchpad BCP extracts"
        },
        cloudAutoConfirm: {
            title: "Cloud Incidents Automatically Closes",
            description: "% of incidents that were automatically closed where customer did not fill out a survey",
            source: "BI launchpad BCP extracts"
        },
        cloudATS: {
            title: "Cloud Incidents Average Time At SAP",
            description: "Average time an incident spent with internal SAP Teams Display as total as well as breakdowns for very high and high priority events",
            source: "BI launchpad BCP extracts"
        },
        reqs: {
            title: "Service Requests",
            description: "Service requests created for this customer, requires customer to select correct system number to appear (3 character code) and initially assigned to the initial area CEC-HCS-REQ",
            source: "BI launchpad BCP extracts"
        },
        reqsP1: {
            title: "Service Requests Very High Priority",
            description: "% of service requests created with very high priority for this customer, requires customer to select correct system number to appear (3 character code) and initially assigned to the initial area CEC-HCS-REQ",
            source: "BI launchpad BCP extracts"
        },
        reqsP2: {
            title: "Service Requests High Priority",
            description: "% of service requests created with high priority for this customer, requires customer to select correct system number to appear (3 character code) and initially assigned to the initial area CEC-HCS-REQ",
            source: "BI launchpad BCP extracts"
        },
        reqsProd: {
            title: "Service Requests For Production Deployments",
            description: "Service requests for production deployments, requires customer to select correct system number to appear (3 character code) and initially assigned to the initial area CEC-HCS-REQ and must be in the CEC-HCS-PFM-REQ-DEP component",
            source: "BI launchpad BCP extracts"
        },
        reqsStg: {
            title: "Service Requests For Staging Deployments",
            description: "Service requests for staging deployments, requires customer to select correct system number to appear (3 character code) and initially assigned to the initial area CEC-HCS-REQ and must be in the CEC-HCS-PFM-REQ-DEP component",
            source: "BI launchpad BCP extracts"
        },
        reqsBacklog: {
            title: "Service Requests Backlog",
            description: "Service Requests counted towards the backlog. Seperated by location",
            source: "BI launchpad BCP extracts"
        },
        reqsATS: {
            title: "Service Requests Average Time At SAP",
            description: "Average time a service request spent with internal SAP Teams Display as total as well as breakdowns for very high and high priority events",
            source: "BI launchpad BCP extracts"
        }
    };

    $scope.infoToolTip = function (e, val) {
        $scope.toolTip = $scope.dataDescriptions[val];
        $("#toolTip").removeClass("hidden");
        $("#toolTip").css({ 'top': e.clientY, 'left': e.clientX });

    };

    $scope.hideToolTip = function () {
        $("#toolTip").addClass("hidden");
    };
    $scope.refreshCatchpoint = function () {
        $("#cpRefreshLoad").Loadingdotdotdot({
            "speed": 400,
            "maxDots": 6,
            "word": "Loading"
        });
        $http.put("/api/scoreCards/updateCatchpointData",JSON.stringify({year:$scope.scoreCardData.month.substring(0, 4),code:$scope.path[2],id:$scope.path[1]}))
            .success(function () {
                $scope.loadData($scope.id);
                $("#cpRefreshLoad").Loadingdotdotdot("Stop");
                $("#cpRefreshLoad").html("(All data in the uptime table)");
        });
    }
    //get intial path
    $scope.id = $location.search().id;
    $scope.path = /(\d+)-(\w+)-(\d{1,2})-(\d{4})/.exec($scope.id);
    $scope.today = new Date().toISOString().substring(0, 10);

    window.onbeforeprint = function () {
        $scope.scrollTo(1);
        var sections = $("section");
        sections.each(function (i) {
            var el = $(sections[i]);
            el.removeAttr('style').removeClass("section");
        });
        $("body").addClass("disabled-onepage-scroll");
        $(document).unbind('mousewheel DOMMouseScroll MozMousePixelScroll');
        $scope.hideToolTip();
        document.title = "Scorecard " + $scope.scoreCardData.customerCode + "-" + $scope.scoreCardData.month.substring(0, 7);

    };
    window.onafterprint = function () {
        $scope.fullPageScroll();
        document.title = "Hybris BI";
        $http.put("/api/scoreCards/setGeneratedStatus",JSON.stringify({id:$scope.id}));
    };
    //ctrl+p does not execute window before print normally resulting in very slow render due to removing one page scroll functionally added extra events to force this behaviour
    function printHandler(e){
        if(e.ctrlKey && e.keyCode == 80){
            window.print();
            return false;
        }
    }
    $(document).bind("keyup keydown", printHandler);
    //remove print handler on navigate away
    $scope.$on('$routeChangeStart', function($event, next, current) { 
        $(document).unbind('keyup keydown', printHandler);
    });
    $scope.SC=true;
    if($scope.id){

        $scope.newPeriod = $scope.path[3] + "-" + $scope.path[4];
        //possible periods for customer
        $http.get("/api/scoreCards/getPeriodsCustomer?code=" + $scope.path[1] + "-" + $scope.path[2])
            .success(function (data) {
                $scope.periods = data;
                $scope.newPeriod = $scope.path[3] + '-' + $scope.path[4];
                $scope.SC=true;
            }).error(function (){
                $scope.SC=false;
            });
        $scope.loadData();
    }else{
        $scope.SC=false;
    }

}]);