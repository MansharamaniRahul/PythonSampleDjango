'use strict';

var createTaskModule=angular.module('createTaskModule');
createTaskModule.factory('createTaskFactory',['$http','commonServices',function($http,commonServices){

    return{
        getChildTaleList: function(){
            var url=commonServices.getServerURL()+'/impalaServer/getChildTableList/';
            return $http.get(url);
        }
    }

}]); 