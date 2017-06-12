'use strict';

var filterModule=angular.module('filterModule');
filterModule.factory('filtersFactory',['$http','commonServices',function($http,commonServices){
	
	return{
		getFilterList: function(){
			var url=commonServices.getServerURL()+'/mongoServer/getFilterList/';
			return $http.get(url);
		}
	}
	
}]);	
