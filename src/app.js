var app = angular.module('hybris_bi_app', ['ngRoute', 'ngTable', 'tc.chartjs', 'file-model', 'ngCacheBuster',
	'btorfs.multiselect', 'ngIdle', 'datetimepicker', 'ngSanitize', 'ng-showdown', 'autoheight', 'bootstrap3-typeahead', 'ui.toggle']),
	monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
	colors = ["#F0AB00", "#000000", "#008FD3", "#970A82", "#E35500", "#4FB81C", "#609A7F",
		"#BB4A4E", "#E87700", "#8FB311", "#A8A340", "#D57A27", "#EC9100", "#BFAF08"];  //standard sap colors for coloring

//load screen fade out
$(document).ready(function () {
	$("#loading-screen").fadeOut(500, function () {
		$(this).remove();
	});
});

function timestamp(str) {
	return new Date(str).getTime();
}

// extends sap colors if more is needed                
function extendColors(len) {
	function _randomColor() {
		r = Math.floor(Math.random() * 200);
		g = Math.floor(Math.random() * 200);
		b = Math.floor(Math.random() * 200);

		return 'rgb(' + r + ', ' + g + ', ' + b + ')';
	}

	len = len - colors.length;
	for (var i = 0; i < len; i++) {
		colors.push(_randomColor());
	}
}

//convert xs return to array readable by angular
function convertHanaJSON(data) {
	var arr = [];
	$.each(data, function (index, objRow) {
		if (objRow.VAL !== "") {
			arr.push(objRow);
		}
	});
	return arr;
}

//week calculation for dates 
function ISO_WEEK(dt) {
	var tdt = new Date(dt.valueOf());
	var dayn = (dt.getDay() + 6) % 7;
	tdt.setDate(tdt.getDate() - dayn + 3);
	var firstThursday = tdt.valueOf();
	tdt.setMonth(0, 1);
	if (tdt.getDay() !== 4) {
		tdt.setMonth(0, 1 + ((4 - tdt.getDay()) + 7) % 7);
	}
	return 1 + Math.ceil((firstThursday - tdt) / 604800000);
}

//calculate businessDays between 2 dates expected input of string format : yyyy-MM-dd
//optional offset to not count x days from start 
function getBusinessDays(sDate, eDate, offset) {
	//format input as dates
	var startDate = new Date(sDate.replace(/-/g, '\/'));
	if (offset) {
		startDate.setDate(startDate.getDate() + offset);
	}
	startDate.setDate(startDate.getDate());
	var endDate = new Date(eDate.replace(/-/g, '\/'));
	var count = 0;
	var curDate = startDate;

	while (curDate <= endDate) {
		var dayOfWeek = curDate.getDay();
		if (!((dayOfWeek == 6) || (dayOfWeek == 0)))
			count++;
		curDate.setDate(curDate.getDate() + 1);
	}
	return count;

}

//downloads file from dataset
function extractFile(data, title) {
	var file = Papa.unparse(data);
	var csvData = new Blob(["\ufeff",file], {
		type: 'text/csv;charset=UTF-8;'
	});
	var csvURL = window.URL.createObjectURL(csvData);
	var tempLink = document.createElement('a');
	tempLink.href = csvURL;
	tempLink.setAttribute('download', title);
	tempLink.click();
}

app.factory('permissionsFac', function ($http, $rootScope) {
	var obj = {}
	obj.getPermissions = function () {
		$http.get("/api/session/privileges").success(function (data) {
			$rootScope.permissions = data;
		});

	}
	obj.checkPermission = async function (permission) {
		//resolve permissions if permissions do not exist
		if (!$rootScope.permissions) {
			var res = await $http.get("/api/session/privileges");
			$rootScope.permissions = res.data;
		}
		return $rootScope.permissions[permission];
	}
	return obj;
});

//permission resolution before route load
function permissionCheck(permission) {
	return {
		check: function (permissionsFac, $window) {
			//wrap function as top lvl async declaration seems to not compile properly
			async function wrap() {
				var checkRes = await permissionsFac.checkPermission(permission);
				if (!checkRes) {
					$window.location.assign('#/403');
					return false;
				}
				return true;
			}
			return wrap();
		}
	}
}

//router
app.config(['$routeProvider', '$locationProvider',
	function ($routeProvider, $locationProvider, $location) {
		$routeProvider
			.when("/", {
				templateUrl: "partials/public/home.html",
				controller: "home"
			})
			.when("/customerRecord", {
				templateUrl: "partials/public/customerRecord.html",
				controller: "customerRecord",
				resolve: permissionCheck("EXECUTE")
			})
			.when("/customerRecords", {
				templateUrl: "partials/public/customerManager.html",
				resolve: permissionCheck("EXECUTE")
			})
			.when("/scoreCard", {
				templateUrl: "partials/scoreCards/scoreCard.html",
				controller: "scoreCard",
				resolve: permissionCheck("SCORECARDS")
			})
			.when("/scoreCardManager", {
				templateUrl: "partials/scoreCards/scoreCardManager.html",
				resolve: permissionCheck("SCORECARDS")
			})
			.when("/dataImporter", {
				templateUrl: "partials/admin/dataImporter.html",
				controller: "dataImporter",
				resolve: permissionCheck("ADMIN")
			})
			.when("/versionManager", {
				templateUrl: "partials/admin/versionManager.html",
				controller: "versionManager",
				resolve: permissionCheck("VERSION_ADMIN")
			})
			.when("/serviceOutage", {
				templateUrl: "partials/serviceOutage/serviceOutage.html",
				controller: "serviceOutage",
				resolve: permissionCheck("EXECUTE")
			})
			.when("/outagesManager", {
				templateUrl: "partials/serviceOutage/outagesManager.html",
				resolve: permissionCheck("EXECUTE")
			})
			.when("/targetsManager", {
				templateUrl: "partials/admin/targetsManager.html",
				controller: "targetsManager",
				resolve: permissionCheck("ADMIN")
			})
			.when("/dynamicReport", {
				templateUrl: "partials/reporting/dynamicReport.html",
				controller: "dynamicReport",
				resolve: permissionCheck("EXECUTE")
			})
			.when("/scoreCardReport", {
				templateUrl: "partials/reporting/scoreCardReport.html",
				controller: "scoreCardReport",
				resolve: permissionCheck("R_SCORECARDS")
			})
			.when("/serviceReport", {
				templateUrl: "partials/reporting/serviceReport.html",
				controller: "serviceReport",
				resolve: permissionCheck("R_SERVICE")
			})
			.when("/about", {
				templateUrl: "partials/public/about.html",
				controller: "aboutController"
			})
			.when("/pmTimeTracking", {
				templateUrl: "partials/pm/pmTimeTracking.html",
				controller: "pmTimeTracking",
				resolve: permissionCheck("PM_TIME_TRACKING")
			})
			.when("/contractorTimeEntry", {
				templateUrl: "partials/pm/contractorTimeEntry.html",
				controller: "contractorTimeEntry",
				resolve: permissionCheck("PM_CONTRACTOR_ENTRY")
			})
			.when("/pmDataImporter", {
				templateUrl: "partials/pm/pmDataImporter.html",
				resolve: permissionCheck("PM_DATA_IMPORT")
			})
			.when("/slaReporting", {
				templateUrl: "partials/pm/tenantSlaReport.html",
				controller: "tenantSlaReport",
				resolve: permissionCheck("PM_TENANT_SLO")
			})
			.when("/masterSla", {
				templateUrl: "partials/admin/masterSla.html",
				controller: "masterSlaController",
				resolve: permissionCheck("ADMIN")

			})
			.when("/tamTimeTracking", {
				templateUrl: "partials/tam/tamTimeTracking.html",
				controller: "tamTimeTracking",
				resolve: permissionCheck("TAM_TIME_TRACKING")
			})
			.when("/tamDataImporter", {
				templateUrl: "partials/tam/tamDataImporter.html",
				resolve: permissionCheck("TAM_DATA_IMPORT")
			})
			.when("/escalationsOverview", {
				templateUrl: "partials/escalations/escalationsOverview.html",
				controller: "escalationsOverview",
				resolve: permissionCheck("ESCALATIONS_VIEW")
			})
			.when("/escalation", {
				templateUrl: "partials/escalations/escalation.html",
				controller: "escalation",
				resolve: permissionCheck("ESCALATIONS_VIEW")
			})
			.when("/escalationsReport", {
				templateUrl: "partials/escalations/escalationsReport.html",
				controller: "escalationsReport",
				resolve: permissionCheck("ESCALATIONS_VIEW")
			})
			.when("/partnerManager", {
				templateUrl: "partials/admin/partnerManager.html",
				controller: "partnerManager",
				resolve: permissionCheck("CUSTOMER_ADMIN")
			})
			.when("/capacityReport", {
				templateUrl: "partials/capacities/capacityReport.html",
				controller: "capacityReport",
				resolve: permissionCheck("CAPACITY_REPORT")
			})
			.when("/initiativeManager", {
				templateUrl: "partials/capacities/initiativeManager.html",
				controller: "initiativeManager",
				resolve: permissionCheck("INITIATIVE_ADMIN")
			})
			.when("/capacityManager", {
				templateUrl: "partials/capacities/capacityManager.html",
				controller: "capacityManager",
				resolve: permissionCheck("CAPACITY_ADMIN")
			})
			.when("/usersManager", {
				templateUrl: "partials/admin/users.html",
				resolve: permissionCheck("USER_ADMIN")
			})
			.when("/usersManager/:uid", {
				templateUrl: "partials/admin/user.html",
				resolve: permissionCheck("USER_ADMIN")
			})
			.when("/tamManager", {
				templateUrl: "partials/admin/tamManager.html",
				controller: "tamManager",
				resolve: permissionCheck("USER_ADMIN")
			})
			.when("/pmManager", {
				templateUrl: "partials/admin/pmManager.html",
				controller: "pmManager",
				resolve: permissionCheck("USER_ADMIN")
			})
			.when("/techSupportManager", {
				templateUrl: "partials/admin/techSupportManager.html",
				controller: "techSupportManager",
				resolve: permissionCheck("USER_ADMIN")
			})
			.when("/irtReport", {
				templateUrl: "partials/reporting/irtReport.html",
				controller: "irtReport",
				resolve: permissionCheck("R_IRT")
			})
			.when("/customerAnalysis", {
				templateUrl: "partials/reporting/customerAnalysis.html",
				controller: "customerAnalysis",
				resolve: permissionCheck("R_CUSTOMERS")
			})
			.when("/customerReport", {
				templateUrl: "partials/reporting/customerReport.html",
				controller: "customerReport",
				resolve: permissionCheck("R_CUSTOMERS")
			})
			.when("/goLiveReport", {
				templateUrl: "partials/reporting/goLiveReport.html",
				controller: "goLiveReport",
				resolve: permissionCheck("CUSTOMER_ADMIN")
			})
			.when("/permissions", {
				templateUrl: "partials/requests/requests.html"
			})
			.when("/approvals", {
				templateUrl: "partials/approvals/approvals.html",
				resolve: permissionCheck("ADMIN")
			})
			.when("/403", {
				templateUrl: "partials/public/403.html"
			})
			.otherwise("/404", {
				templateUrl: "partials/public/404.html"
			});
	}]);

//403 handler.
app.factory('403Detector', function ($location, $q) {
	return {
		responseError: function (response) {
			if (response.status === 403) {
				$location.path('/403');
				return $q.reject(response);
			} else {
				return $q.reject(response);
			}
		}
	};
});

//activate 403 detector
app.config(function ($httpProvider) {
	$httpProvider.interceptors.push('403Detector');
});
//prevents caching of pages
app.config(function (httpRequestInterceptorCacheBusterProvider) {
	httpRequestInterceptorCacheBusterProvider.setMatchlist([/.*partials.*/], true);
});
app.config(function ($showdownProvider) {
	$showdownProvider.setOption("simpleLineBreaks", true);
});
//idle configuration
app.config(function (IdleProvider, KeepaliveProvider) {
	KeepaliveProvider.interval(300); //ping every 1/3 session to keep alive (current xs session set to 900)
	KeepaliveProvider.http('/api/session/ping');
});

//date time config
app.config(['datetimepickerProvider', function (datetimepickerProvider) {
	datetimepickerProvider.setOptions({
		locale: 'en',
		useCurrent: false,
		format: 'YYYY-MM-DD'
	});
}]);

appCommons(app);

//permissions map for all permissions to the pages they give access to
app.run(function ($rootScope, $http, $filter, Idle, permissionsFac) {
	//global loads definitions
	utils($rootScope, $http, $filter, Idle);
	//load permissions
	permissionsFac.getPermissions();
});