//adding and removing new and old partners
app.controller('partnerManager',['$scope','$http', function($scope,$http){ 
    
    //inserts new partner into  db
    $scope.addPartner = function(){
        if($scope.newPartner !==undefined){
            $http.put("/api/customers/addPartner?partner=" + $scope.newPartner) 
            .success(function(data) {
                $scope.partnerAddedAlert = true;
                $scope.newPartner = "";
                $scope.loadPartners();
            })
            .error(function(){
                $scope.failAlert = true; 
            });
        }
    }
    //removes partner from db
    $scope.deletePartner = function(){
        if($scope.delPartner !==undefined){
            $http.put("/api/customers/deletePartner?partner=" + $scope.delPartner) 
            .success(function(data) {
                if(data === "Partner Removed"){
                    $scope.partnerRemovedAlert = true;
                    $scope.delPartner="";
                    $scope.loadPartners();
                }else{
                    $scope.customersInUse=data;
                    $scope.partnerInUseAlert = true;   
                }
            }) 
            .error(function(){
                $scope.failAlert = true; 
            });
        }
    }
    //load partner choices for removal
    $scope.loadPartners = function(){
        $http.get("/api/customers/getPartners") 
            .success(function(data) {
                $scope.partners = data;
                $scope.partners.push({"VAL":""});
        });
    };
    $scope.loadPartners();
    
}]);