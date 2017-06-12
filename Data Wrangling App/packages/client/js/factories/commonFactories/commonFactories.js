'use strict';

var wranglingApp=angular.module('wranglingApp');
wranglingApp.factory('commonFactory',['$http','commonServices',function($http,commonServices){

    return{
        getChildTaleList: function(){
            var url=commonServices.getServerURL()+'/impalaServer/getChildTableList/';
            return $http.get(url);
        },
         getTableDescription: function(tableName){
            var url=commonServices.getServerURL()+'/impalaServer/getTableDescription/';          
            return $http({
				method: 'POST',
				url: url,
				params:{data:tableName}			
			});
        }
    }

}]); 


