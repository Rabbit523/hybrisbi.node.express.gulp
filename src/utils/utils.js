//loads common util functions
function utils($rootScope, $http,$filter, Idle) {
    session($rootScope, $http, Idle);
    commons($rootScope, $http,$filter);
    ui($rootScope);
}