'use strict';

var headerModule=angular.module('headerModule');
headerModule.factory('headerFactory',['$http','commonServices',function($http,commonServices){
	
	return{
		saveDataMongo: function(taskDetails){			
			var url=commonServices.getServerURL()+'/mongoServer/saveData/';
			return $http({
				method: 'POST',
				url: url,
				params:{data:taskDetails}			
			});
		},
		saveDataImpala: function(taskDetails){
			var url=commonServices.getServerURL()+'/impalaServer/saveData/';
			return $http({
				method: 'POST',
				url: url,
				params:{data:taskDetails}			
			});
		},
		saveDataOnImpalaExternalLoad: function(externalURL){
			var url=commonServices.getServerURL()+'/mongoServer/saveDataFromExternalURL/';
			return $http({
				method: 'POST',
				url: url,
				params:{data:externalURL}			
			});
		},
		callCSVLoad: function(taskDetails){
			var url=commonServices.getServerURL()+'/impalaServer/csv/';
			return $http({
				method: 'POST',
				url: url,
				params:{data:taskDetails}			
			});
		}			
	}
	
}]);	
