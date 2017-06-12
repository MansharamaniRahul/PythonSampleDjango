var transformationModule=angular.module('transformationModule');
transformationModule.service('transformationsService',[function(){
	this.setTransformationsList=function(transformationsList){
		this.transformationsList=transformationsList;
	};
	this.getTransformationsList=function(){
		return this.transformationsList;
	};

	this.setColumnsList=function(columnList){
		this.columnList=columnList;
	};
	this.getColumnsList=function(){
		return this.columnList;
	};
}]);