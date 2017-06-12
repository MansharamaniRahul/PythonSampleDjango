'use strict'
var previewModule=angular.module('previewModule',[]);

previewModule.controller('previewController',['$scope','$rootScope','$sessionStorage','previewFactory','commonServices','$state',
	function($scope,$rootScope,$sessionStorage,previewFactory,commonServices,$state){  

		$scope.pageSize = 10;
		$scope.curPage=0;
		$scope.totalItems=0;
		$scope.numberOfPages = function(){
			return Math.ceil($scope.totalItems / $scope.pageSize);
		};
		$scope.pagesizeArray = [
		{"id":5, "name":5},
		{"id":10, "name":10},
		{"id":25, "name":25},
		{"id":50, "name":50},
		{"id":100, "name":100},
		]

		$scope.onSelected = function (selectedItem) {
			switch (selectedItem) {
				case 5:
				$scope.pageSize=5;
				break;
				case 10:
				$scope.pageSize = 10;
				break;
				case 25:
				$scope.pageSize = 25;
				break;
				case 50:
				$scope.pageSize = 50;
				break;
				case 100:
				$scope.pageSize = 100;
				break;
				default:
				$scope.pageSize = 10;
			} 

		};

		if($sessionStorage && $sessionStorage.selectedChildTable)
			$rootScope.$broadcast('pageRefreshed',{ taskDetails: $sessionStorage.selectedChildTable });

		if($sessionStorage  && $sessionStorage.taskName && $sessionStorage.taskName!='' && $sessionStorage.childTable!='')
		{			
			var taskDetails=commonServices.getTaskDetailsForDBOprtns();
			if(taskDetails && taskDetails.taskName!='' && taskDetails.childTable!='')
			{
				var dataValidated=commonServices.validateData(taskDetails);					
				if(!dataValidated)
				{
					$rootScope.showLoader=true;
					previewFactory.previewData(taskDetails)
					.success(function(response){
						$rootScope.showLoader=false;
						if(response && response.responseData)
						{
							if(response.responseData!='Error')
							{
								if(response.responseData.length > 0 &&$sessionStorage)
								{
									var columns=[];
									if($sessionStorage && $sessionStorage.selectedColumns && $sessionStorage.selectedColumns.length>0)
										columns=angular.copy($sessionStorage.selectedColumns);
									else if($sessionStorage.columnListForPreview && $sessionStorage.columnListForPreview.length>0)								
										columns=angular.copy($sessionStorage.columnListForPreview);
									else
										columns=angular.copy($sessionStorage.columnsOfChilTable);
									if(taskDetails && taskDetails.transformationList && taskDetails.transformationList.length>0)
									{															
										for(let i in taskDetails.transformationList)
											if(columns.indexOf(taskDetails.transformationList[i].targetColumn)<=0)
												columns.push(taskDetails.transformationList[i].targetColumn)
										}
									/*else
									{
										var columnList=commonServices.getColumnList();
										for (let i in columnList)
											columns.push(columnList[i]);
									}
									*/
									$scope.tableColumns=columns;
									$scope.pageSize = 10;
									$scope.curPage=0;
									var tabledata=response.responseData;
									$scope.finalData=[];
									$scope.tableData=tabledata;						
									for(var j in tabledata)
									{
										var curRow=tabledata[j];
										var tableObj = {};
										for (var i in curRow)
										{
											tableObj[columns[i]]=curRow[i];
										}
										$scope.finalData.push(tableObj);
										$scope.totalItems=$scope.finalData.length;
									}						
								}
								else
								{
									commonServices.showAlert('No Task Details Exist to be Previewed.');
								}
							}
							else
							{
								commonServices.showAlert('Error Occured while fetching data. ');	
							}
						}
						else
							commonServices.showAlert('No Response Received from DB');

					})
					.error(function(error){					
						$rootScope.showLoader=false;
						commonServices.showAlert('Error While Preview ');					
					});
				}
			}
			else if($sessionStorage && ($sessionStorage.taskName==undefined || $sessionStorage.taskName==''))
			{
				$state.go('home');
				commonServices.showAlert('Create some task and try again.');
			}
			else if($sessionStorage && ($sessionStorage.childTable==undefined || $sessionStorage.childTable==''))			
			{
				$state.go('home');
				commonServices.showAlert('Select Some Child Table and try again.');
			}
		}
		else if($sessionStorage && ($sessionStorage.taskName==undefined || $sessionStorage.taskName==''))
		{
			$state.go('home');
			commonServices.showAlert('Create Some Task and Try Again');
		}
		else if($sessionStorage && ($sessionStorage.childTable==undefined || $sessionStorage.childTable==''))			
		{
			$state.go('home');
			commonServices.showAlert('Select Some Child Table and try again.');
		}

	}]);

