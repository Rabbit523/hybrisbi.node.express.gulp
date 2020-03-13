app.controller('approvalsCtrl', ['$scope','$http', 'NgTableParams','$location', function($scope,$http, ngTableParams,$location) {	
//	$scope.users=[];
	$scope.global.load(['regions', 'roles']);
	$scope.usersNames = [];
	$scope.usersIds = [];
	$scope.search = {term:''};
	$scope.hybrisBI = {};
	var self = this;
/*
	$http.get('/api/users/getUsers').success(function(data){
		$scope.usersNames = data.map(v => v.USER_NAME).sort();
		$scope.usersIds = data.map(v => v.EMPLOYEE_ID).sort();
	});
*/
	$scope.loadRequests = function(){
		$http.get("api/admin/approvals/getHBIRequests").success(function(data) {

			$scope.usersNames = data.map(v => v.REQUESTOR_NAME).sort();
			$scope.usersIds = data.map(v => v.REQUESTOR_ID).sort();

			$scope.requests=data;

			self.approvalsTable = new ngTableParams({
				page: 1,
				count: 15,
				sorting: { REQUESTOR_NAME: "asc" } ,
				filter: $scope.search
			}, {
				total:$scope.requests.length,
				getData: function(params) {
					return  $scope.tblDataFilter(params,$scope.requests);
				}
			});
			self.applySelectedSort = applySelectedSort;
			$scope.activeSort='REQUESTOR_NAMEasc';    
			//load a request if it was already requested
			if($location.search().user){
				var user= $location.search().user;
				var req = $scope.requests.find(function(e){
					return e.REQUESTOR_ID === user;
				});
				if(req){
					$scope.openReq(req,req.REQ);
				}
			}
		});
	}

	function applySelectedSort(col,dir){
        self.usersTable.sorting(col, dir);
        $scope.activeSort=col+dir;
	}
	
	$scope.loadRequests();

    $scope.confirmRequest = function(){
		$http.put("api/admin/approvals/processHBIApproval",JSON.stringify($scope.openRequest.requests))
		.success(function(data) {
			$scope.loadRequests();
			$scope.successAlert= true;
		});
	};
	$scope.setReqStatus = function(index,status){
		$scope.openRequest.requests[index].REQUEST_RESULT = status;
	}

	$scope.openReq = function(requestor,reqs){
		$scope.openRequest={};
		$scope.openRequest.requestor=requestor;
		$scope.openRequest.requests = reqs;
		$('#modalRequest').modal('show');
	}
	$scope.approveAll = function(){
		for(var i in $scope.openRequest.requests){
			$scope.openRequest.requests[i].REQUEST_RESULT="approved";
		}
	};

	$scope.regions = $scope.regions;
    $scope.roles = $scope.roles;
    $scope.actionOpenFilterLabel = 'Open';

}]);