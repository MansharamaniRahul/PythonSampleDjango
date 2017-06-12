'use strict';
var createTaskModule=angular.module('createTaskModule',[]);
createTaskModule.controller('createTaskController',
	['$scope','commonServices','$mdDialog','$rootScope','$location','$sessionStorage','commonFactory','$state',
	function($scope,commonServices,$mdDialog,$rootScope,$location,$sessionStorage,commonFactory,$state){
		
		var tableListAndData=[];
		$rootScope.showLoader=true;
		commonFactory.getChildTaleList()
		.success(function(response)
		{
			$rootScope.showLoader=false;
			if(response && response.responseData && response.responseData.length>0 && typeof response.responseData!='string')
			{
				tableListAndData=  response.responseData;
				commonServices.setChilTablesList(tableListAndData);
			} 
			else if(response && response.responseData && response.responseData.length>0 && typeof response.responseData=='string')
			{
				commonServices.showAlert(response.responseData);  
			}
		})
		.error(function(error){
			$rootScope.showLoader=false;
			if(error)
			{
				commonServices.showAlert('Error While getting Child Tables ');  
			} 
		});

		
		$scope.setTaskDetails={};

		$mdDialog.show({
			templateUrl:'./partials/createtask/createTaskDialog.html',      
			scope:$scope.$new(),
			controller: DialogController,
			locals:{
				$sessionStorage:$sessionStorage,
				commonFactory:commonFactory
			}
		});



		function DialogController($scope,$sessionStorage,commonFactory) {
			

			$scope.querySearchedTableName =function(serachText){
				if(serachText && serachText!='')
				{
					serachText=serachText.toLowerCase();
					var similarColumnList=[];
					for(var i=0;i<tableListAndData.length;i++)
					{
						var lowerCaseData=tableListAndData[i].name.toLowerCase();
						if(lowerCaseData.indexOf(serachText)>=0)
							similarColumnList.push(tableListAndData[i].name);
					}
					return similarColumnList;
				}
			};

			$scope.createTask=function() {	
				if($scope.setTaskDetails.selectedTable!=null && $scope.setTaskDetails.selectedTable!='' && $scope.setTaskDetails.taskName!=null  && $scope.setTaskDetails.taskName!='')
				{					
					$sessionStorage.selectedColumns=[];
					commonServices.setColumnListForPreview([]);

				//$location.url('/taskOperations');
				$rootScope.showLoader=true;
				for(var i=0;i<tableListAndData.length;i++) 
				{
					if(tableListAndData[i].name==$scope.setTaskDetails.taskName)
					{
						$rootScope.showLoader=false;
						commonServices.showAlert('Task already exist, creating again will overright existing  task.');							
					}	

					var lowerCaseData=tableListAndData[i].name;
					if(tableListAndData[i].name==$scope.setTaskDetails.selectedTable)
					{


						
						{
							$state.go('taskOperations');
							if($sessionStorage)
								$sessionStorage.childTable=tableListAndData[i].name;
							$scope.setTaskDetails.selectedTableData=tableListAndData[i];
							commonServices.setColumnList($scope.setTaskDetails.selectedTableData.columns);	
							commonFactory.getTableDescription(tableListAndData[i].name)	
							.success(function(response)
							{							
								$rootScope.showLoader=false;
								if(response && response.tableDescription && response.tableDescription.length>0)
								{
									var tableDescription=  response.tableDescription;
									$scope.setTaskDetails.tableDescription=tableDescription;
									commonServices.setChilTableDescription(tableDescription);
								} 
								$rootScope.$broadcast('taskCreatedORSelected',{ taskDetails: $scope.setTaskDetails });
							})
							.error(function(error){
								$rootScope.showLoader=false;
								if(error)
								{
									commonServices.showAlert('Error While getting Child Tables Description.');  
								} 
							});	
						}
						
					}
				}
				
				$mdDialog.destroy();
			}
			else
			{
				$state.go('home');
				commonServices.showAlert('Select Child Table from list and Task name and try again.');
			}
		};
	};

	$scope.closeDialog=function() {
		$mdDialog.destroy();			
		$location.url('/');
	};
}]);