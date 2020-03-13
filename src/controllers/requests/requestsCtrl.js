app.controller('requestsCtrl', ['$scope','$http','$filter', 'NgTableParams', function($scope,$http,$filter,ngTableParams) {	
	$scope.search = {term:''};
	var self = this;

	$scope.loadData = function(){
		$http.get("api/requests/getHBIPermissions")
		.success(function(data) {
			$scope.permissions=data;
			self.permissionsTable = new ngTableParams({
				count: $scope.permissions.length,
                filter: $scope.search
            }, {
                counts:[],
                getData: function(params) {
					var fltrdData = $scope.permissions;
					if (params.filter().term) {
						fltrdData = params.filter() ? $filter('filter')(fltrdData, params.filter().term) : fltrdData;
					}

					params.total(fltrdData.length);
					return fltrdData.slice((params.page() - 1) * params.count(), params.page() * params.count());
                }
			});
			
			$scope.disableSend=false;
		});
	}
	$scope.loadData();

	$scope.sendRequest = function(){
		$scope.disableSend=true;
		$http.put("api/requests/processHBIPermissions",JSON.stringify($scope.permissions))
		.success(function(data) {
			$scope.loadData();
			$scope.successAlert=true;
		}).error(function(){
			$scope.failAlert = true; 
		});
	};
	var tourContent = [
		{
			element: "",
			title: "Permissions Page",
			content: "<p>This page allows to view and request new permissions for the Hybris BI app</p>" + 
			"<p>To see a full tour of the controls on this page click 'next' otherwise click 'end tour'</p>"
		},
		{
			element: "#permissionsTable",
			title: "Permissions Table",
			placement:"left",
			content: "This Table displays all the available permissions for the App as well as the status of the permissions for the current User"
		},
		{
			element: "#permissionsStatus",
			title: "Permissions Status",
			placement: "bottom",
			content: "<p>The User may see 1 of 3 statuses here:</p>" + 
				"<span class='label label-success lg'>Granted</span>:<br>The user already has the current permissions<br>" + 
				"<span class='label label-warning lg'>In Proccess</span>:<br>The user already has the requested this permission but it has not been processed yet<br>" + 
				"<span class='label label-danger lg'>Granted</span>:<br> The user requested the permission but the admin rejected the request<br><br>" + 
				"Otherwise the user has not taken an action. The user may toggle the switch to request this permission"
		},
		{
			element: "#reqBtn",
			title: "Request Permissions",
			content: "Click this button to confirm the send requests for the selected permissions",
			placement: "right"
		}
	];
	
	var tour = $scope.createTour(tourContent);
	
	//info button binding
	$scope.infoTour = function(){ 
		tour.init();
		tour.restart();
	};

}]);