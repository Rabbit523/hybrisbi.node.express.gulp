//tam data importer page controller
app.controller('tamDataImporter', ['$scope', '$http', 'NgTableParams',
	function ($scope, $http, ngTableParams) {
		var originalData = {};
		$scope.errorTotal = null;

		var self = this;

		//loads errors table 
		$scope.loadErrors = function () {
			$http.get("/api/tam/dataImport/getErrors")
				.success(function (data) {
					$scope.errorSet = convertHanaJSON(data);
					
					$scope.errorTotal = Object.keys(data).length;

					if ($scope.errorSet.length > 0) {
						$scope.errorCorrectionUI = true;
						$scope.noErrors = false;
						$("#saveChangesBtn").prop("disabled", false);
						originalData = angular.copy($scope.errorSet);
						self.errorsTable = new ngTableParams({
							page: 1,
							count: 10
						}, {
								dataset: $scope.errorSet
							});
					} else {
						$scope.errorCorrectionUI = false;
						$scope.noErrors = true;
						$("#saveChangesBtn").prop("disabled", true);
					}
				});
		};
		$scope.saveChanges = function () {
			$("#saveChangesBtn").button("loading");

			$http.put("/api/tam/dataImport/importCorrectionsData", JSON.stringify($scope.errorSet))
				.success(function () {
					$("#saveChangesBtn").button("reset");
					$scope.successTableAlert = true;
					$scope.loadErrors();
				})
				.error(function () {
					$scope.failTableAlert = true;
				});
		};

		//functions to operate row editing
		function del(row) {
			var data = self.errorsTable.settings().dataset;
			for (var i in data) {
				if (row == data[i]) {
					data.splice(i, 1);
				}
			}
			self.errorsTable.reload();
		}

		function resetRow(row, rowForm) {
			row.isEditing = false;
			rowForm.$setPristine();
			for (var i in originalData) {
				if (originalData[i].id === row.id) {
					return originalData[i];
				}
			}
		}

		function cancel(row, rowForm) {
			var originalRow = resetRow(row, rowForm);
			angular.extend(row, originalRow);
		}

		function save(row, rowForm) {
			var originalRow = resetRow(row, rowForm);
			angular.extend(originalRow, row);
		}

		//redirect for hidden file input
		$scope.browseFile = function (file) {
			$(file).click();
		};

		//set dates to current month
		var d = new Date();
		$scope.year = d.getFullYear().toString();
		$scope.month = d.getMonth() + 1;
		//set null file
		$scope.tamTimeTrackingFile = null;

		//loads options and latest imports 
		$scope.load = function () {
			//get latest data point
			$http.get("/api/tam/dataImport/getMaxDate")
				.success(function (data) {
					$scope.tamMaxDate = data;
				});

			//get all possible years of data + possibility to add for next year
			$http.get("/api/tam/dataImport/getYears")
				.success(function (data) {
					$scope.years = convertHanaJSON(data.tables);
					$scope.years.push({
						'VAL': '' + ($scope.years[$scope.years.length - 1].VAL + 1)
					});
				});
		};
		//watch to test if the file is excel
		$scope.$watch(function () {
			if ($scope.tamTimeTrackingFile !== null) {
				!/.xlsx/i.test($scope.tamTimeTrackingFile.name) ? $scope.tamTimeTrackingAlert = true : $scope.tamTimeTrackingAlert = false;
			}
		});

		//main data import function
		$scope.importTamTimeTracking = function () {

			//function to parse files and push to hana
			$scope.parseFile = function (file) {

				var parser = new FileReader();
				var params = "&year=" + $scope.year + "&month=" + $scope.month;

				parser.onload = function (e) {
					var rawData = e.target.result;
					var workbook = XLSX.read(rawData, {
						type: 'binary',
						cellDates: true,
						dateNF: "YYYY-MM-DD"
					});

					//this is for spc files only due to junk headers at the top 4 rows are skipped 
					var data = XLSX.utils.sheet_to_json(workbook.Sheets["Sheet1"]);

					$http.put("/api/tam/dataImport/importTamDataTemp" + params, data)
						.success(function () {
							$scope.successTamTimeTrackingAlert = true;
							location.reload();
						});

				}
				parser.readAsBinaryString(file)
			};
			if ($scope.tamTimeTrackingFile !== null) {
				$scope.parseFile($scope.tamTimeTrackingFile);
				$scope.load();
			}
		}
        var monthSlider = $("#slider")[0];
        //bind configuration	  
        noUiSlider.create(monthSlider, {
            start: $scope.month, 
            connect:[true, false], 
            behaviour: 'tap-drag', 
            step: 1,
            range: {
            	'min': 1,
            	'max': 12
            }
        });
    
        //bind value changes
        monthSlider.noUiSlider.on('update', function(){
            $scope.month = Math.round(monthSlider.noUiSlider.get());
        });
		$scope.load();
		$scope.loadErrors();
		self.cancel = cancel;
		self.del = del;
		self.save = save;
	}]);