var filterModule=angular.module('filterModule');
filterModule.service('filtersService',[function(){
	this.setFiltersList=function(filtersList){
		this.filtersList=filtersList;
	};
	this.getFiltersList=function(){
		return this.filtersList;
	};

	this.setColumnsList=function(columnList){
		this.columnList=columnList;
	};
	this.getColumnsList=function(){
		return this.columnList;
	};
}]);