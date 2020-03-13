function session($rootScope, $http, Idle) {
	$http.get('/api/session/me').success(function (data) {
		$rootScope.me = data;
		if (!$rootScope.me.isUserComplete) {
			$rootScope.modal("#profileModal", true);
		}
	});

	//session management configuration
	// idle provider disabled for now until correct implementation of sso logout is done	
	//$rootScope.idleUser = false;
	$rootScope.activeUser = true;
	/*
	Idle.watch();
	$rootScope.$on('IdleStart', function() {
		$rootScope.idleUser = true;
		$rootScope.activeUser = false;
	});
	$rootScope.$on('IdleEnd', function() {
		$rootScope.idleUsssser = false;
		$rootScope.activeUser = true;
	});
	$rootScope.$on('IdleWarn', function(e, countdown) {
		$rootScope.logoutTimer = 100 - (countdown / 600) * 100;
		var date = new Date(null);
		date.setSeconds(countdown);
		$rootScope.logoutTime = date.toISOString().substr(11, 8);
	});
	$rootScope.$on('IdleTimeout', function() {
		$rootScope.logout();
	});
	*/
	//needs rewrite ??
	$rootScope.logout = function () {

		$http.get("/api/session/securityToken")
			.success(function (data) {
				var xhr = new XMLHttpRequest();
				var logoutData = {
					"X-CSRF-Token": data,
					"x-sap-origin-location": "/sap/hana/xs/formLogin/"
				}
				xhr.open('POST', '/sap/formLogin/logout.xscfunc');
				xhr.send(JSON.stringify(logoutData));
			});
	};
	$rootScope.navClick = function () {
		$("#quickNav").trigger($.Event("keypress", {
			which: 13
		}));
	};

	$rootScope.quickNavSelect = function (item) {
		if (item !== undefined) {
			//customer record navigation
			if (item.type === 'CR') {
				window.location = "#/customerRecord?code=" + item.id;
			}
			//url navigation
			else if (item.type === 'URL') {
				window.location = item.id;
			}
			//score card nav    
			else if (item.type === 'SC') {
				window.location = "#/scoreCard?id=" + item.id;
			}
			//escalation nav
			else if (item.type === 'ESC') {
				window.location = "#/escalation?esc=" + item.id;
			}
			//service outage nav
			else if (item.type ==='SO'){
				window.location = "#/serviceOutage?id=" + item.id;
			}
		}
		$("#quickNav").val('');
	}
	$rootScope.getSearchIndex = function () {
		$http.get("/api/session/searchIndex").success(function (data) {
			$rootScope.searchItems = data;
		})
	};
	var isChrome = !!window.chrome && !!window.chrome.webstore;
	var defaultPrint = window.print;
	window.print = function () {
		if (!isChrome) {
			alert("This feature should only be used on chrome to ensure optimal render");
		} else {
			defaultPrint();
		}
	}

	$rootScope.getSearchIndex();
	//initial login handle
	function fixInitialUrl() {
		var navPart = /(\#\/.*)/.exec(location.href);
		window.location = location.origin + "/" + (navPart === null ? "#/" : navPart[0]);

	}
	fixInitialUrl();
};