var _QueryParam = QueryParam,
    _URLBuilder = URLBuilder,
    globalVariables = globalVariables();

function appCommons(app) {
    app.filter('commonFilter', function () {
        return function (data, selection) {
            if (selection) {
                var tableCols = Object.keys(selection); //table columns string

                for (var colIndex in tableCols) {
                    var tableCol = tableCols[colIndex], //table column name string
                        _selection = Array.isArray(selection[tableCol]) ? selection[tableCol] : selection[tableCol].split(","); // if array use array, else split string into an array by comma

                    data = (data || []).filter(function (item) {
                        if (_selection.length <= 0) return true;

                        for (var i in _selection) {
                            var val = item[tableCol].toLowerCase(),
                                filterVal = _selection[i].trim().toLowerCase();

                            if (val.includes(filterVal)) {
                                return true;
                            }
                        }
                    });
                }
            }

            return data;
        };
    });

    function _buildFactory(objName, getUrl, dataHandler) {
        let _getUrl = new _URLBuilder(getUrl).toString();
        app.factory(objName, function ($http, $q) {
            var resultObj = {
                get: function () {
                    var deferred = $q.defer();

                    $http.get(_getUrl)
                        .then(function (response) {
                            if (dataHandler) {
                                response.data = dataHandler(response.data);
                            }

                            deferred.resolve(response.data);
                        })
                        .catch(function (response) {
                            deferred.reject(response);
                        });

                    return deferred.promise;
                }
            };

            return resultObj;
        });
    }
    _buildFactory("permissions", "/api/session/permissions");
}

//commonsService.js brings business logic functions to be used in different controllers
function commons($scope, $http, $filter) {
    $scope.global = $scope.global || {};

    function _httpGet(url) {
        return function (callback) {
            let getUrl = new URLBuilder(url).toString();
            $http.get(getUrl).then(function (response) {
                callback(response.data);
            });
        }
    };
    //common function to use for ng-tables filtering with search bar
    $scope.tblDataFilter = function (params, data) {
        var fltrdData = data;

        function comparator(expected, actual) {
            if (actual.length > 0) {
                return actual.indexOf(expected) > -1;
            }
            return true
        };
        if (params.filter().term) {
            fltrdData = params.filter() ? $filter('filter')(fltrdData, params.filter().term) : fltrdData;
        } else {
            fltrs = JSON.parse(JSON.stringify(params.filter()));
            delete fltrs.term;
            fltrdData = $filter('filter')(fltrdData, fltrs, comparator);
        }
        fltrdData = params.sorting() ? $filter('orderBy')(fltrdData, params.orderBy()) : fltrdData;

        params.total(fltrdData.length);
        return fltrdData.slice((params.page() - 1) * params.count(), params.page() * params.count());
    }
    $scope.global.load = function (vars) {
        if (!Array.isArray(vars)) {
            $scope = vars;
            vars = globalVariables;
        }

        vars = vars.map(function (v) {

            var foundIndex = globalVariables.findIndex(function (e) {
                return e.name == v;
            });

            return {
                name: globalVariables[foundIndex].name,
                defaultVal: globalVariables[foundIndex].defaultVal,
                source: globalVariables[foundIndex].source,
                call: _httpGet(globalVariables[foundIndex].source),
                dataHandler: globalVariables[foundIndex].dataHandler
            };
        });

        vars.forEach(function (commonVar) {
            if (commonVar.source) {
                // if http call already happened, get data from global
                if ($scope.global[commonVar.name]) {
                    $scope[commonVar.name] = $scope.global[commonVar.name];
                } else {
                    $scope.global[commonVar.name] = $scope[commonVar.name] = commonVar.defaultVal;

                    commonVar.call(function (data) {
                        if (commonVar.dataHandler) {
                            data = commonVar.dataHandler(data);
                        }

                        $scope.global[commonVar.name] = $scope[commonVar.name] = data;
                    });
                }
            } else {
                //sets defaultVal first 
                $scope[commonVar.name] = $scope.global[commonVar.name] = commonVar.defaultVal;
            }
        });
    };

    // autosave feature
    /**
     * 
     * @param {String} id - An autosave identifier to stop it futurely
     * @param {Number} delay - The time delay in milliseconds to run callback function
     * @param {Function} callback - A function to be ran after every delay interval
     */
    $scope.autoSave = function (id, delay, callback) {
        if (!$scope.autoSavers) {
            $scope.autoSavers = []
        }

        if (!id) {
            throw "@param {String} id is required"
        }

        $scope.autoSavers.push({
            id: id,
            intervalFunc: setInterval(callback, delay)
        });
    }

    $scope.$on('$routeChangeStart', function (event, next, prev) {
        if ($scope.autoSavers) {
            $scope.autoSavers.forEach(autoSaver => {
                clearInterval(autoSaver.intervalFunc);
            });
        }
    });

    $scope.autoSave.stop = function (id) {
        let foundAutoSaver = $scope.autoSavers.find((autoSaver) => autoSaver.id === id);
        clearInterval(foundAutoSaver.intervalFunc);
    }

    // that: the controller scope
    // tableName: name of the object implementing ngTableParams
    // colName: name of the column to be filtered
    // selection: the ng-model set in a multiselect tag, its values are compared/filtered against table data
    // objName: when selection is an array of objects, objName defines an specific property to be used for comparison
    /* 
        USE: Set an angular tag attribute, e.g.:
            <multiselect ng-model="MS_REGIONS" ng-change="filterTable(this, 'escalations', 'REGION', this.MS_REGIONS, 'CODE')" options="regions" id-prop="region" display-prop="region"></multiselect>
            
            Instead of ng-table to access $scope, you should use a namespace for your controller, e.g.:
            <div ng-controller="myController as controller"...
                <table id="tableId" ng-table="controller.tableId"...
            </div>

            In your controller tables must be created using this, and not $scope:
            this.tableId = new ngTableParams({
                page: 1
            }, {
                filterOptions: {
                    filterFilterName: "commonFilter"
                },
                dataset: $scope.someArray
            });
    */
    $scope.filterTable = function (that, tableName, colName, selection, objName) {
        if (typeof selection[0] == 'object') {
            selection = selection.map((e) => e[objName]);
        }

        if (that.controller) {
            if (that.controller[tableName]) {
                var filterObj = that.controller[tableName].filter() || {};
                filterObj[colName] = selection;

                that.controller[tableName].filter(filterObj);
                that.controller[tableName].reload();
            }
        }
    };

    //retrieve users by role
    $scope.getUsers = function (role, callback) {
        let getUsersUrl = new _URLBuilder("/api/users/getUsers", [new _QueryParam("role", role)]).toString();

        $http.get(getUsersUrl).success(function (data) {
            callback($.map(data, function (value, index) {
                return {
                    id: value.EMPLOYEE_ID,
                    name: value.USER_NAME
                };
            }));
        });
    };
};