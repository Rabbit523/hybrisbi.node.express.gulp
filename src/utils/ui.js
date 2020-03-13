function ui($rootScope) {

    let hasError = (selector) => {
            $(selector).addClass("has-error");
        },
        noError = (selector) => {
            $(selector).removeClass("has-error");
        };

    $rootScope.validateFld = (fldCheck, fldSelector) => {
        if (fldCheck) {
            noError(fldSelector);
        } else {
            hasError(fldSelector);
        }
    };

    // enables modal overlay color on top of another modal
    // reference: https://stackoverflow.com/questions/19305821/multiple-modals-overlay
    $(document).on('show.bs.modal', '.modal', function (event) {
        var zIndex = 1040 + (10 * $('.modal:visible').length);

        $(this).css('z-index', zIndex);
        setTimeout(function () {
            $('.modal-backdrop').not('.modal-stack').css('z-index', zIndex - 1).addClass('modal-stack');
        }, 0);
    });


    /**
     * @param string domSelector
     * @param bool open
     */
    $rootScope.modal = (domSelector, open) => {
        $(domSelector).modal(open ? "show" : "hide");
    }

    /* use: 
        $scope.myRating = 'red' || 'danger';
        $scope.classes = 'panel, label, text';
        
        getRatingClass($scope.myRating, $scope.classes); // returns string "panel-danger label-danger text-danger" 
        ng-class="getRatingClass(myRating, classes)" // set class="panel-danger label-danger text-danger"
    */
    $rootScope.getRatingClass = function (rating, bsClassPrefix) {
        var retClass = null;

        if (rating) {
            rating = rating.toLowerCase();
            bsClassPrefix = bsClassPrefix;

            var _generateBSClasses = function (state) {
                if (bsClassPrefix) {
                    return bsClassPrefix.split(',').map(function (v, i) {
                        return v + '-' + state;
                    }).join('');
                } else {
                    return state;
                }
            };

            switch (rating) {
                case 'red':
                case 'danger':
                    retClass = _generateBSClasses('danger');
                    break;
                case 'yellow':
                case 'warning':
                    retClass = _generateBSClasses('warning');
                    break;
                case 'green':
                case 'success':
                    retClass = _generateBSClasses('success');
                    break;
            }
        }

        return retClass;
    };

    $rootScope.sideBar = function () {
        var isSideBarCollapsed = $(".sidenav")[0].classList.contains("sidenav-collapsed");

        if (isSideBarCollapsed) {
            $(".sidenav").removeClass("sidenav-collapsed");
            $(".right-content").removeClass("when-sidebar-is-collapsed");
            $(".hideable").css({
                display: "block"
            });
            $(".openable").css({
                display: "none"
            });

        } else {
            // $(".right-content").addClass();
            $(".right-content").addClass("when-sidebar-is-collapsed");
            $(".col-sm-3.sidenav").addClass("sidenav-collapsed");
            $(".hideable").css({
                display: "none"
            });
            $(".openable").css({
                display: "block"
            });
        }
        if ($rootScope.fullPageEnabled) {
            $rootScope.resizeNavCheck();
        }
    };

    $rootScope.$on('$routeChangeStart', function () {
        // Unbinds scroll events to re-enable them
        $rootScope.fullPageEnabled = false;

        $("#top-body").css("overflow-y", "auto");
        $(document).unbind("mousewheel DOMMouseScroll MozMousePixelScroll");
        window.removeEventListener("resize", $rootScope.resizeNavCheck);
    });

    $rootScope.tooltips = function () {
        $(function () {
            $('[data-toggle="tooltip"]').tooltip();
        });
        $(function () {
            $("[data-hide]").on("click", function () {
                $(this).closest("." + $(this).attr("data-hide")).hide();
            });
        });
    };
    $rootScope.createTour = function (contents) {
        var tour = new Tour({
            backdrop: true,
            orphan: true,
            storage: false,
            autoscroll: false,
            template: "<div class='popover tour'>" +
                "<div class='arrow'></div>" +
                "<h3 class='popover-title tour-header-info'></h3>" +
                "<div class='popover-content'></div>" +
                "<div class='popover-navigation'>" +
                "<div class='btn-group'>" +
                "<button class='btn btn-outline-primary btn-sm' data-role='prev'>Prev</button>" +
                "<button class='btn btn-outline-primary btn-sm' data-role='next'>Next</button>" +
                "</div>" +
                "<button class='btn btn-outline-danger btn-sm' data-role='end'>End tour</button>" +
                "</div>" +
                "</div>",
            onStart: function () {
                $rootScope.fullPageEnabled ? $rootScope.scrollTo(1) : null;
            },
            steps: contents

        });
        return tour;
    };
    $rootScope.onScrollableDomTopCount = 0;
    $rootScope.onScrollableDomBottomCount = 0;
    $rootScope.reachedScrollableDomEdgeLocked = false;
    $rootScope.fullPageScroll = function () {
        $rootScope.fullPageEnabled = true;

        var mainContent = $('#main-content');
        $(".right-content").css("overflow-y", 'hidden');
        mainContent.onepage_scroll({
            pagination: false,
            keyboard: false,
            responsiveFallback: 992,
            afterMove: function (index) {
                $('#inPageNav').children().children().removeClass('active');
                $('#inPageNav').children().eq(index - 1).children().addClass('active');
                $rootScope.reachedScrollableDomEdgeLocked = false;
                $rootScope.onScrollableDomTopCount = 0;
                $rootScope.onScrollableDomBottomCount = 0;
            }
        });
        $rootScope.scrollTo = function (index) {
            $("#main-content").moveTo(index);
        };

        function onScrollableDomEdgeCounter(isTopEdge, e) {
            if (!$rootScope.reachedScrollableDomEdgeLocked) {
                if (isTopEdge) {
                    $rootScope.onScrollableDomTopCount++;
                } else {
                    $rootScope.onScrollableDomBottomCount++;
                }

                $rootScope.reachedScrollableDomEdgeLocked = true;

                if ($rootScope.onScrollableDomTopCount <= 1 || $rootScope.onScrollableDomBottomCount <= 1) {
                    setTimeout(function unlockEdgeCounter() {
                        $rootScope.reachedScrollableDomEdgeLocked = false;
                    }, 2000);
                }
            }
        }
        $(".main-content-section-overflow").on('mousewheel DOMMouseScroll MozMousePixelScroll', function (e) {

            var ele = $(this)[0];
            if (ele.scrollTop == 0 || ele.scrollTop >= (ele.scrollHeight - ele.clientHeight - 10)) {
                function _shouldMove(count) {
                    if (count > 1) {
                        //Now should move using one page scroll
                        $rootScope.reachedScrollableDomEdgeLocked = false;
                        $rootScope.onScrollableDomTopCount = 0;
                        $rootScope.onScrollableDomBottomCount = 0;
                    } else {
                        //Do NOT use one page scroll
                        e.stopPropagation();
                    }
                }

                if (e.originalEvent.deltaY < 0) { // If mouse is scrolling upwards increment dom edge top counter by 1
                    onScrollableDomEdgeCounter(true, e);
                    _shouldMove($rootScope.onScrollableDomTopCount);
                } else { // else increment dom edge bottom counter by 1
                    onScrollableDomEdgeCounter(false, e);
                    _shouldMove($rootScope.onScrollableDomBottomCount);
                }
            } else {
                e.stopPropagation();
                //$rootScope.reachedScrollableDomEdgeLocked = false;
                $rootScope.onScrollableDomTopCount = 0;
                $rootScope.onScrollableDomBottomCount = 0;
            }
        });

        //multiselect default scrolls
        $("multiselect").on('mousewheel DOMMouseScroll MozMousePixelScroll', function (e) {
            e.stopPropagation();
        });
        $rootScope.resizeNavCheck = function(){
        	var inPageNav = $('#inPageNav')[0];
        	
            if(inPageNav.offsetWidth < inPageNav.scrollWidth){
                $rootScope.inPageNavOverflow = true;
            }else{
                $rootScope.inPageNavOverflow = false;
            }
    
             var timeOut = 0;
            $('#rightArrow').on('mousedown touchstart', function() {
            
                timeOut = setInterval(function(){
                    var leftPos = $('#inPageNav').scrollLeft();
                    $("#inPageNav").scrollLeft(leftPos + 40);
                }, 100);
            }).bind('mouseup mouseleave touchend', function() {
                clearInterval(timeOut);
            });
            $('#leftArrow').on('mousedown touchstart', function() {
                timeOut = setInterval(function(){
                    var leftPos = $('#inPageNav').scrollLeft();
                    $("#inPageNav").scrollLeft(leftPos - 40);
                }, 100);
            }).bind('mouseup mouseleave touchend', function() {
                clearInterval(timeOut);
            });
    	};
    	$rootScope.resizeNavCheck();
    	window.addEventListener("resize", $rootScope.resizeNavCheck);
	};
}