var lookupModule=angular.module('lookupModule');
lookupModule.service('lookupService',[function(){	
	this.setLookupsList=function(lookupList){
		this.lookupList=lookupList;
	};
	this.getLookupsList=function(){
		return this.lookupList;
	};

	
}]);