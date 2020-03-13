app.controller('headerController', ['$scope',function($scope) {
	    $(function () {
            $('[data-toggle="tooltip"]').tooltip();
        });
        $(function(){
            $('.dropdown').hover(function() {
                $(this).addClass('open');
            },
            function() {
                $(this).removeClass('open');
            });
        });
        var navMain = $(".navbar-collapse"); 
        navMain.on("click", "a:not([data-toggle])", null, function () {
            navMain.collapse('hide');
        });
}]);