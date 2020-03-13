app.controller('userController', ['$scope', '$routeParams', 'NgTableParams', '$http', function ($scope, $routeParams, ngTableParams, $http) {

    // $http.get('/someUrl', config).then(successCallback, errorCallback);
    // $http.post('/someUrl', data, config).then(successCallback, errorCallback);

    class User {
        constructor(uid, firstName, lastName, email, region, role, subRole) {
            let options = {}
            if (typeof uid == 'object') {
                options = uid;
            } else {
                options.uid = uid;
                options.firstName = firstName;
                options.lastName = lastName;
                options.fullName = `${this.firstName} ${this.lastName}`;
                options.email = email;
                options.region = region;
                options.role = role;
                options.subRole = subRole;
                // options.employeeType = employeeType;
                // options.isActive = isActive;
            }

            this.construct(options);
        }

        construct(options) {
            this.uid = options.uid;
            this.firstName = options.firstName;
            this.lastName = options.lastName;
            this.fullName = `${options.firstName} ${options.lastName}`;
            this.email = options.email;
            this.region = options.region;
            this.role = options.role;
            this.subRole = options.subRole;
            // this.employeeType = options.employeeType;
            // this.isActive = options.isActive;
        }

        /**
         * Grant user permission
         */
        grantPermission(permissionId, resolve, reject) {
            $http.get(`api/admin/approvals/givePermission?uid=${this.uid}&permission=${permissionId}`)
                .then(data => resolve(data), err => reject(err));
        }

        /**
         * Saves user
         */
        save(resolve, reject) {
            $http.put(`api/users/save`, JSON.stringify(this))
                .then(data => resolve(data), err => reject(err));
        }

        load(resolve, reject) {
            $http.get(`api/users/getUserById?uid=${this.uid}&q=permissions`)
                .then(response => {
                    let data = response.data;

                    this.uid = data.userInfo.EMPLOYEE_ID;
                    this.firstName = data.userInfo.FIRST_NAME;
                    this.lastName = data.userInfo.LAST_NAME;
                    this.isActive = !!(data.userInfo.ACTIVE);
                    this.region = data.userInfo.REGION;
                    this.employeeType = data.userInfo.EMPLOYEE_TYPE;
                    this.role = data.userInfo.ROLE;
                    this.subRole = data.userInfo.SUB_ROLE;
                    this.email = data.userInfo.EMAILADDRESS;
                    this.fullName = data.userInfo.USER_NAME;


                    this.permissions = data.permissions;

                    resolve(this);
                }, err => reject(err));
        }
    }

    $scope.global.load(['permissionsStatuses', 'roles', 'subRoles', 'regions', 'employeeTypes']);

    // another multiselect fix...
    $scope.permissionsStatuses = $scope.global.permissionsStatuses;
    $scope.roles = $scope.global.roles;
    $scope.subRoles = $scope.global.subRoles;
    $scope.regions = $scope.global.regions;
    $scope.employeeTypes = $scope.global.employeeTypes;

    // fix multiselect bug `Cannot read property 'slice' of undefined`
    $scope.permissionsNames = [];

    $scope.user = new User($routeParams.uid);

    $scope.filterPermissions = (searchTerm, permissionProp) => {
        if (searchTerm) {
            if ($scope.user && $scope.user.permissions) {
                $scope.filteredPermissions = $scope.user.permissions.filter(e => e[permissionProp] ? e[permissionProp].toLowerCase().includes(searchTerm.toLowerCase()) : false);
            }
        } else {
            $scope.filteredPermissions = $scope.user.permissions;
        }

    };

    $scope.changeUser = () => {
        $scope.user.region = !!($scope.user._selectedRegion[0]) ? $scope.user._selectedRegion[0].region : null;
        $scope.user.role = !!($scope.user._selectedRole[0]) ? $scope.user._selectedRole[0].role : null;
        $scope.user.subRole = !!($scope.user._selectedSubRole[0]) ? $scope.user._selectedSubRole[0].subRole : null;
        // $scope.user.employeeType = $scope.user._selectedEmployeeType[0].employeeType || null;

        $scope.validateFld($scope.user.region, "#fldRegion");
        $scope.validateFld($scope.user.uid, "#fldUid");
        $scope.validateFld($scope.user.firstName, "#fldFirstName");
        $scope.validateFld($scope.user.lastName, "#fldLastName");
        $scope.validateFld($scope.user.email, "#fldEmail");
        $scope.validateFld($scope.user.role, "#fldRole");
        // $scope.validateFld($scope.user.subRole, "#fldSubRole");
        // $scope.validateFld($scope.user.employeeType, "#fldEmployeeType");

        if ($(".has-error").length == 0) {
            $scope.isFormInvalid = false;
        } else {
            $scope.isFormInvalid = true;
        }
    };

    // Edit User Info
    $scope.isEditingUserInfo = false;
    $scope.userInfoIconButton = 'pencil'
    $scope.editUserInfo = () => {
        $scope.isEditingUserInfo = !$scope.isEditingUserInfo;
        $scope.userInfoIconButton = $scope.isEditingUserInfo ? 'minus-sign' : 'pencil';
    };

    $scope.grantPermission = (permission) => {
        let continueGrant = confirm("Grant '" + permission.TITLE + "' to " + $scope.user.fullName + " (" + $scope.user.uid + ")?");

        if (continueGrant) {
            $scope.user.grantPermission(permission.PERMISSION_ID, data => {
                $scope.loadUser();
            }, err => console.error(err));
        }
    };

    $scope.loadUser = () => {
        $scope.user.load(data => {
            $scope.filteredPermissions = $scope.user.permissions;
            $scope.permissionsNames = $scope.user.permissions.map(v => v.TITLE);

            $scope.user._selectedRole = [{
                "role": $scope.user.role
            }];

            $scope.user._selectedSubRole = [{
                "subRole": $scope.user.subRole
            }];

            $scope.user._selectedRegion = [{
                "region": $scope.user.region
            }];

            $scope.user._selectedEmployeeType = [$scope.user.employeeType];

            this.permissionsTable = new ngTableParams({
                page: 1,
                count: $scope.user.permissions.length
            }, {
                filterOptions: {
                    filterFilterName: "commonFilter"
                },
                dataset: $scope.user.permissions,
                counts: []
            });

        }, err => console.err(err));
    }
    $scope.loadUser();


    $scope.saveUser = () => {
        $scope.user.save(data => {
            $scope.userSavedSuccessfully = true;
        }, err => {
            $scope.userSavedError = err;
            console.error(err);
        });
    }
}]);