'use strict';

var transformationModule=angular.module('transformationModule',[]);

transformationModule.controller('transformationsController',
	['$scope','transformationsFactory','commonServices','$mdDialog','$rootScope','transformationsService',
	'$sessionStorage',
	function($scope,transformationsFactory,commonServices,$mdDialog,$rootScope,transformationsService,
		$sessionStorage){

		$rootScope.showLoader=true;
		$scope.selectedTableColumnList=[];
		$scope.autoCompleteHint=[];		
		var lookupList=angular.copy(commonServices.getLookupList());
		if(!lookupList)
			lookupList=$sessionStorage.lookupListForTransformationList ? angular.copy($sessionStorage.lookupListForTransformationList) : [];
		transformationsFactory.getImpalaBuiltInLibrary()
		.success(function(response){
			$rootScope.showLoader=false;
			if(response && response.data && response.data.success && response.data.success.length>0)
			{
				$scope.autoCompleteHint=angular.copy(commonServices.getColumnList());
				var builtInFunctionList=response.data.success;
				var list=[];
				for (let i in builtInFunctionList)
				{
					$scope.autoCompleteHint.push(builtInFunctionList[i].value);	
				}			
				var helpList=angular.copy($scope.autoCompleteHint);
				if(lookupList && lookupList.length>0)
				{
					for(let i in helpList)
					{
						for(let j in lookupList)
						{
							if(lookupList[j].childColumn==helpList[i] || lookupList[j].parentColumn==helpList[i])								
							{
								helpList.splice(i,1);
							}
						}
					}
				}
				$scope.autoCompleteHint=helpList;
				//$scope.autoCompleteHint.push(list);	
			}
			else
			{
				commonServices.showAlert('No Built in Function List found. ');	
			}
		})
		.error(function(response){
			$rootScope.showLoader=false;
			if(response && response.data && response.data.error )
			{
				commonServices.showAlert(response.data.error);	
			}
			else if(response)
				commonServices.showAlert('Error While Getting Function List');		
		})


		if($sessionStorage && $sessionStorage.selectedChildTable)
			$rootScope.$broadcast('pageRefreshed',{ taskDetails: $sessionStorage.selectedChildTable });
		

		$scope.selectedTableColumnList=commonServices.getColumnList();
		
		$rootScope.$on('tableSelected',function(){
			$scope.selectedTableColumnList=commonServices.getColumnList();
			$scope.autoCompleteHint.push(commonServices.getColumnList());
		});



		$scope.transformationsList=[];
		if($sessionStorage && $sessionStorage.transformationsList && $sessionStorage.transformationsList.length>0)
			$scope.transformationsList=$sessionStorage.transformationsList;
		else
		{
			var rowDefaultData={};
			rowDefaultData.id=0;
			rowDefaultData.errorMessage='';
			$scope.transformationsList.push(rowDefaultData);
		}


		

		
		$scope.querySearchedColumnName =function(e, row){
			var serachText=''
			if(e && row)
			{
				var value=row ? row.searchColumnName: '';	
				var currPosition=e.target.selectionStart;
				var taggedValue = value.replace(/\W+/g, '@');
				var subString='',finalString='';
				for(var i=currPosition-1;i>0;--i)
				{
					if(taggedValue[i]!='@')
					{
						if(taggedValue[i]!=undefined)	
							subString+=taggedValue[i];
					}
					else
					{
						break;
					}
				}
				subString=subString.split('');
				var reverseArry=subString.reverse();
				for(let i in reverseArry)
					finalString+=reverseArry[i];
				serachText=finalString+e.key;
			}

			
			$scope.columnFunctionList=[];
			

			if(serachText && serachText!='' && $scope.autoCompleteHint && $scope.autoCompleteHint.length>0)
			{				
				
				serachText=serachText.toLowerCase();				
				var columnsList=[];
				columnsList=angular.copy($scope.autoCompleteHint);			
				for(var i=0;i<columnsList.length;i++)
				{
					var lowerCaseData=columnsList[i].toLowerCase();
					if(lowerCaseData.indexOf(serachText)>=0)
						$scope.columnFunctionList.push(columnsList[i])
				}
			}
			else if(serachText && serachText!='')
			{
				commonServices.showAlert('Select Child Table and try again.');		
			}
			
			
		};

		

		$scope.closeDialog=function(){
			$mdDialog.destroy();
		};
		var showDialog=function(dialogData,currRow){			
			$mdDialog.show({
				templateUrl:'./partials/transformation/dialogContent.html',      
				scope:$scope.$new(),    
				locals: {
					dialogData: dialogData,
					currRow:currRow
				},
				controller: functionDetailDialogCtrl
			});

			function functionDetailDialogCtrl($scope,  dialogData,currRow) {
				$scope.dialogData = dialogData;  	
				var currRow=currRow;
				$scope.addTransformation=function(){
					if($scope.dialogData && $scope.dialogData.currChip && $scope.dialogData.currChip.name && currRow)
					{
						currRow.transformationFunction=$scope.dialogData.currChip.name;
						currRow.transformationFunction=$scope.dialogData.currChip.name;
					}
					$scope.closeDialog();	
				};

			};
		};



		/*Table General Operations*/
		$scope.addDeleteRow=function(task,row){
			if(task=='add')
			{
				commonServices.addRow($scope.transformationsList);				
			}
			else
			{
				commonServices.deleteRow(row,$scope.transformationsList,'transformation');
			}
		};

		$scope.clearRow=function(currRow){	
			commonServices.clearRow(currRow,$scope.transformationsList,'transformation');					
		};

		

		$scope.createTransformations=function(){
			$rootScope.showLoader=true;
			var count=0;
			var childColumnList=[];
			if($sessionStorage && $sessionStorage.selectedColumns)
				childColumnList=angular.copy($sessionStorage.selectedColumns);
			else
				childColumnList=angular.copy(commonServices.getColumnList());

			for(let i in $scope.transformationsList)
			{
				var validateMsg=commonServices.validateTransformationData($scope.transformationsList[i],false);
				if(validateMsg=='delete obj')
				{
					if($scope.transformationsList.length>1)
						$scope.transformationsList.splice(i,1);				
				}
			}
			for(let i in $scope.transformationsList)
			{
				var validateMsg=commonServices.validateTransformationData($scope.transformationsList[i],false);		
				if(validateMsg==true)
				{
					$rootScope.showLoader=false;
					break;					
				}				
				else if(validateMsg==false)
				{ 
					if($scope.transformationsList[i].targetColumn && $scope.transformationsList[i].targetColumn!=null)
					{
						if(childColumnList.indexOf($scope.transformationsList[i].targetColumn)<=0)
							childColumnList.push($scope.transformationsList[i].targetColumn);
						count++;
					}
				}
			}
			var allTransformationsCreated=false;
			if(count==$scope.transformationsList.length)
			{
				commonServices.setColumnListForPreview(childColumnList);
				allTransformationsCreated=true;
				transformationsService.setTransformationsList($scope.transformationsList);
				//$sessionStorage.transformationsList=$scope.transformationsList;
				$rootScope.$broadcast('transformationsCreatred');
			}
			/*if(allTransformationsCreated)
			{
				for(let i=0;i<$scope.transformationsList.length;i++)
					$scope.transformationsList[i].isDisabled=true;	
			}
			else
				commonServices.showAlert('Complete all blank Transformation or delete additional rows.');		*/	
			$rootScope.showLoader=false;
		};


		var validateData=function(currRow){
			var anyError=false;	
			currRow.errorMessage='';		
			if(currRow.transformationFunction== null || currRow.transformationFunction==undefined ||currRow.transformationFunction=='')
			{
				if(currRow.searchColumnName!=null && currRow.searchColumnName!=undefined && currRow.searchColumnName!='' )
					currRow.transformationFunction=currRow.searchColumnName
				else
				{
					currRow.errorMessage='Select some Trasnformation Function';
					anyError=true;	
				}
				
			}

			if(currRow.targetColumn=='' || currRow.targetColumn==null)
			{
				currRow.errorMessage='Enter Target Column Name';
				anyError=true;
			}
			return anyError;
		};

	}]);


