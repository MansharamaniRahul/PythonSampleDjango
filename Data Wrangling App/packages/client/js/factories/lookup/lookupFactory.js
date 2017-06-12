'use strict';

var lookupModule=angular.module('lookupModule');
lookupModule.factory('lookupFactory',['$http','commonServices',function($http,commonServices){
	return{
		getLookupTables	: function(){
			var url=commonServices.getServerURL()+'/mongoServer/getLookupTableList/';
			return $http.get(url);
		},
		getLoopUpConditionsList	: function(){
			var url=commonServices.getServerURL()+'/mongoServer/getLoopUpConditionsList/';
			return $http.get(url);
		},
		getChildTaleList: function(){
            var url=commonServices.getServerURL()+'/impalaServer/getChildTableList/';
            return $http.get(url);
        }
	}
	
}]);	
