'use strict';

var transformationModule=angular.module('transformationModule');

transformationModule.factory('transformationsFactory',['$http','commonServices',function($http,commonServices){
	
	return{
		getImpalaBuiltInLibrary	: function(){
			var url=commonServices.getServerURL()+'/mongoServer/getImpalaBuiltInLibrary/';
			return $http.get(url);
		}
	}
	
}]);	