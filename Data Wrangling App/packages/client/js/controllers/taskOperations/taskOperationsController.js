var taskOperationsModule=angular.module('taskOperationsModule',[]);

taskOperationsModule.controller('taskOperationsController',['$scope','$rootScope','$sessionStorage',
	function($scope,$rootScope,$sessionStorage){  	
		if($sessionStorage && $sessionStorage.selectedChildTable)
			$rootScope.$broadcast('pageRefreshed',{ taskDetails: $sessionStorage.selectedChildTable });

				$scope.tiles = [
				{
					name:'filter_list',
					displayValue:'Filters',
					state:'filter'
				},
				{
					name:'transform',
					displayValue:'Transformation',
					state:'transformation'
				},
				{
					name:'looks',
					displayValue:'Look Up',
					state:'lookup'
				}
				];
		          
		 

	}]);

