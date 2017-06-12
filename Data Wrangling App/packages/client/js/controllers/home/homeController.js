var homeModuleControllers=angular.module('homeModule',[]);

homeModuleControllers.controller('homeController',['$scope','$rootScope','$stateParams',
	function($scope,$rootScope, $stateParams){  				

		
			$scope.tiles = [
			{
				name:'add',
				displayValue:'Create Task',
				state:'createTask'
			},
			{
				name:'list',
				displayValue:'List Task',
				state:'listTask'
			}
			];	


	}]);

