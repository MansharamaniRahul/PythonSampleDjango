'use strict';

var previewModule=angular.module('previewModule');
previewModule.factory('previewFactory',['$http','commonServices',function($http,commonServices){
	
	return{
		previewData: function(taskDetails){
			var url=commonServices.getServerURL()+'/impalaServer/previewData/';
			return $http({
				method: 'POST',
				url: url,
				params:{data:taskDetails}			
			});
		}
	}
	
}]);	
