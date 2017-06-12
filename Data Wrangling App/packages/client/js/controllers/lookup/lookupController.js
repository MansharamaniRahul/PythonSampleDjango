var lookupModule=angular.module('lookupModule',[]);

lookupModule.controller('lookupController',['$scope', 'lookupService','commonServices','$rootScope','$mdDialog',
	'lookupFactory','$location','$sessionStorage','commonFactory',
	function($scope,lookupService,commonServices, $rootScope,$mdDialog,lookupFactory,$location,$sessionStorage,commonFactory){ 
		

		if($sessionStorage && $sessionStorage.selectedChildTable)
			$rootScope.$broadcast('pageRefreshed',{ taskDetails: $sessionStorage.selectedChildTable });

		$rootScope.showLoader=true;
		$scope.columnsList=commonServices.getColumnList();
		var parentColumnList=[];	
		$scope.conditionsList=[];
		$scope.tableListAndData=[];
		var count=0;
		var message='';



		$rootScope.$on('lookupResponseFromDBReceived',function(event,obj){	
			if(obj && obj.errorFromServer!=undefined)
			{
				if(obj.errorFromServer)
					message+=' Error Occured while fetching data.';
			}
			if(obj && obj.responseForLookupList!=undefined)
			{
				if(!obj.responseForLookupList)
					message+=' No LookUp Tables are Available.';
			}
			if(obj && obj.responseForConditionList!=undefined)
			{
				if(!obj.responseForConditionList)
					message+=' No Conditions are available.';
			}
			if(message!='')
				commonServices.showAlert(message);

			count+=1;
			if(count==2)
			{
				$rootScope.showLoader=false;
			}	
		});


		$scope.tableListAndData= [];
		lookupFactory.getChildTaleList().success(function(response){			
			if(response && response.responseData && response.responseData.length>0)
			{
				$rootScope.$broadcast('lookupResponseFromDBReceived',{'responseForLookupList':true});
				$scope.tableListAndData=  response.responseData;
				commonServices.setChilTablesList( $scope.tableListAndData);
				
			} 
			else			
				$rootScope.$broadcast('lookupResponseFromDBReceived',{'responseForLookupList':false});			
		})
		.error(function(response){
			$rootScope.$broadcast('lookupResponseFromDBReceived',{'errorFromServer':true});
		});



		lookupFactory.getLoopUpConditionsList().success(function(response){
			if(response && response.conditionList && response.conditionList.length>0)
			{
				$rootScope.$broadcast('lookupResponseFromDBReceived',{'responseForConditionList':true});
				$scope.conditionsList=response.conditionList;	
			}
			else
				$rootScope.$broadcast('lookupResponseFromDBReceived',{'responseForConditionList':false});
		})
		.error(function(response){
			$rootScope.$broadcast('lookupResponseFromDBReceived',{'errorFromServer':true});
		});



		$scope.querySearchedTableName =function(searchText){
			if(searchText && searchText!='' && $scope.tableListAndData && $scope.tableListAndData.length>0)
			{
				searchText=searchText.toLowerCase();
				var similarTableName=[];

				for(var i=0;i<$scope.tableListAndData.length;i++)
				{
					var lowerCaseData=$scope.tableListAndData[i].name.toLowerCase();


					if(lowerCaseData.indexOf(searchText)>=0)
						similarTableName.push($scope.tableListAndData[i].name)
				}
				return similarTableName;
			}
		};


		$scope.parentTableSelected=function(currRow,selectedTable){		
			parentColumnList=[];	

			if(selectedTable!=null && selectedTable !='' && selectedTable.length>0)
			{
				$rootScope.showLoader=true;
				$scope.lookupTableSelected=selectedTable;
				for(var i=0;i<$scope.tableListAndData.length;i++){

					var lowerCaseTableName=$scope.tableListAndData[i].name.toLowerCase();
					var selectedTable=selectedTable.toLowerCase();
					if( lowerCaseTableName==selectedTable)
					{
						parentColumnList.push($scope.tableListAndData[i].columns);
							//$rootScope.$broadcast('lookupTableSelected',{'columns':$scope.tableListAndData[i].columns});
							
							if(currRow)	
							{
								currRow.parentTable=$scope.tableListAndData[i].name;				
								currRow.parentColumnList=$scope.tableListAndData[i].columns;
								currRow.childColumn=null;
								currRow.parentColumn=null;
								currRow.searchColumnNameFromChild='';
								currRow.searchParentColumnName='';
								currRow.selectedCondition=null;
								currRow.searchCondition='';
							}
							commonFactory.getTableDescription($scope.tableListAndData[i].name)
							.success(function(response){
								$rootScope.showLoader=false;
								if(response && response.tableDescription && response.tableDescription.length>0)
								{
									currRow.tableDescriptionParentTable=response.tableDescription;
								}
							})
							.error(function(error){
								$rootScope.showLoader=false;
							})
							break;
						}
					}
				}
				else if(currRow)
				{
					//$rootScope.$broadcast('lookupTableDeleted',{'columns':currRow.parentColumnList});
					currRow.parentTable=null;				
					currRow.parentColumnList=null;
					currRow.childColumn=null;
					currRow.parentColumn=null;
					currRow.searchColumnNameFromChild='';
					currRow.searchParentColumnName='';
					currRow.selectedCondition=null;
					currRow.searchCondition='';
				}
			};

			function DialogController($scope,  dialogData,currRow) {
				$scope.dialogData = dialogData;  
				$scope.currRow=currRow;
				var currRow=currRow;

				$scope.querySearchedTableName =function(searchText){
					if(searchText && searchText!='' && $scope.dialogData && $scope.dialogData.length>0)
					{
						searchText=searchText.toLowerCase();
						var similarTableName=[];

						for(var i=0;i<$scope.dialogData.length;i++)
						{
							var lowerCaseData=$scope.dialogData[i].name.toLowerCase();


							if(lowerCaseData.indexOf(searchText)>=0)
								similarTableName.push($scope.dialogData[i].name)
						}
						return similarTableName;
					}
				};

				$scope.parentTableSelected=function(selectedTable){		
					parentColumnList=[];	
					$rootScope.showLoader=true;			
					if(selectedTable!=null && selectedTable !='' && selectedTable.length>0){
						$scope.lookupTableSelected=selectedTable;
						for(var i=0;i<$scope.tableListAndData.length;i++){

							var lowerCaseTableName=$scope.tableListAndData[i].name.toLowerCase();
							var selectedTable=selectedTable.toLowerCase();
							if( lowerCaseTableName==selectedTable)
							{
								parentColumnList.push($scope.tableListAndData[i].columns);
							//$rootScope.$broadcast('lookupTableSelected',{'columns':$scope.tableListAndData[i].columns});
							$mdDialog.destroy();	
							if(currRow)	
							{
								currRow.parentTable=$scope.tableListAndData[i].name;				
								currRow.parentColumnList=$scope.tableListAndData[i].columns;
								currRow.childColumn=null;
								currRow.parentColumn=null;
								currRow.searchColumnNameFromChild='';
								currRow.searchParentColumnName='';
								currRow.selectedCondition=null;
								currRow.searchCondition='';
							}
							commonFactory.getTableDescription($scope.tableListAndData[i].name)
							.success(function(response){
								$rootScope.showLoader=false;
								if(response && response.tableDescription && response.tableDescription.length>0)
								{
									currRow.tableDescriptionParentTable=response.tableDescription;
								}
							})
							.error(function(error){
								$rootScope.showLoader=false;
							})
							break;
						}
					}
				}
			};

		};

		$scope.closeDialog=function () {
			$mdDialog.destroy();
			/*if($scope.lookupTableSelected==undefined)
			$location.url('/taskOperations');*/
			
		}

		$scope.selectLookup=function(currRow){
			if(currRow && $scope.tableListAndData && DialogController)
			{
				$mdDialog.show({
					escapeToClose:false,
					templateUrl:'./partials/lookup/parentSelectDialog.html',      
					scope:$scope.$new(),    
					locals: {
						dialogData:$scope.tableListAndData,
						currRow:currRow
					},
					controller: DialogController
				});
			}
		};

		
		$scope.columnSelected=function(currRow,columnName){			
			if(currRow)
			{				
				var tableDescription=[];
				var selectedChildClm='';
				if(columnName=='child')
				{
					tableDescription=commonServices.getChilTableDescription();
					if(currRow.childColumn &&  currRow.childColumn !='')
						selectedChildClm= currRow.childColumn;
					else if(currRow.searchColumnNameFromChild &&  currRow.searchColumnNameFromChild !='')
						selectedChildClm=currRow.searchColumnNameFromChild;
				}
				else if(columnName=='parent')
				{
					tableDescription=currRow.tableDescriptionParentTable;
					if(currRow.parentColumn &&  currRow.parentColumn !='')
						selectedChildClm= currRow.parentColumn;
					else if(currRow.searchParentColumnName &&  currRow.searchParentColumnName !='')
						selectedChildClm=currRow.searchParentColumnName;
				}
				if( tableDescription.length>0)
					for (let i in tableDescription)
					{
						if(selectedChildClm==tableDescription[i].columnName)
							if(columnName=='child')							
								currRow.childColumnDataType=tableDescription[i].columnDataType;
							else if(columnName=='parent')
								currRow.parentColumnDataType=tableDescription[i].columnDataType;
						}
					}
				};

				$rootScope.$on('tableSelected',function(){
					$scope.columnsList=commonServices.getColumnList();
				});

				var columnsList=commonServices.getColumnList();	

				$scope.lookupList=[];
				if($sessionStorage && $sessionStorage.lookupList && $sessionStorage.lookupList.length>0)
					$scope.lookupList=$sessionStorage.lookupList;
				else
				{
					var tableDescrption=commonServices.getChilTableDescription();
					var rowDefaultData={};
					rowDefaultData.columnsList=columnsList;
					rowDefaultData.tableDescrptionChildTable=tableDescrption;
					rowDefaultData.id=0;
					rowDefaultData.errorMessage='';
					$scope.lookupList.push(rowDefaultData);
				}


				$scope.querySearch=function (currRow,searchFrom) {
					if(currRow)
					{
						var parentList=[];
						var searchedText='';
						var childList=[];
						switch(searchFrom)
						{
							case 'childTable':
							if($scope.columnsList==undefined || $scope.columnsList.length<=0)
							{
								commonServices.showAlert('Select some Child Table and try again.');		
								return false;
							}	
							else 
								parentList=$scope.columnsList;
							searchedText=currRow.searchColumnNameFromChild ? currRow.searchColumnNameFromChild.toLowerCase() : '';
							break;

							case 'conditionTable':
							if(	$scope.conditionsList==undefined || $scope.conditionsList.length<=0)
							{
								commonServices.showAlert('No Conditions Found.');		
								return false;
							}	
							else 
								parentList=	$scope.conditionsList;
							searchedText=currRow.searchCondition ? currRow.searchCondition.toLowerCase() : '';								
							break;

							case 'parentTable':
							if(parentColumnList==undefined || parentColumnList.length<=0)
							{
								if(!currRow.parentColumnList && !currRow.parentColumnList.length>0)
								{
									commonServices.showAlert('Select some table and try again.');		
									return false;
								}
								else
									parentList=currRow.parentColumnList;
							}	
							else						
								parentList=parentColumnList[0];
							searchedText=currRow.searchParentColumnName ? currRow.searchParentColumnName.toLowerCase() : '';
							break;

						}
						for(var i=0;i<parentList.length;i++)
						{
							var lowerCaseData=''
							if(searchFrom!='conditionTable')
								lowerCaseData=parentList[i].toLowerCase();
							else
								lowerCaseData=parentList[i].name.toLowerCase();
							if(lowerCaseData!='' && lowerCaseData.indexOf(searchedText)>=0)
								childList.push(parentList[i])
						}
						return childList;

					}	
				};		


				$scope.addDeleteRow=function(task,row){
					if(task=='add')
					{
						commonServices.addRow($scope.lookupList);				
					}
					else
					{
						commonServices.deleteRow(row,$scope.lookupList,'lookup');
						//$rootScope.$broadcast('lookupTableDeleted',{'columns':row.parentColumnList});
					}
				};

				$scope.clearRow=function(currRow){		
					commonServices.clearRow(currRow,$scope.lookupList,'lookup');
					//$rootScope.$broadcast('lookupTableDeleted',{'columns':currRow.parentColumnList});								
				};

				$scope.createLookups=function(){
					$rootScope.showLoader=true;
					var count=0;
					for(let i in $scope.lookupList)
					{
						var validateMsg=commonServices.validateLookupData($scope.lookupList[i],false);
						if(validateMsg=='delete obj')
						{
							if($scope.lookupList.length>1)
								$scope.lookupList.splice(i,1);				
						}
					}
					for(let i in $scope.lookupList)
					{
						var validateMsg=commonServices.validateLookupData($scope.lookupList[i],false);				
						if(validateMsg==true)
						{
							$rootScope.showLoader=false;
							break;					
						}
						else if(validateMsg==false)
						{
							if($scope.lookupList[i].childColumn && $scope.lookupList[i].childColumn!=null)
							{
								count++;
								/*if($scope.lookupTableSelected)
								$scope.lookupList[i].parentTable=$scope.lookupTableSelected;*/
							}
						}

					}
					var allFiltersCreated=false;
					if(count==$scope.lookupList.length)
					{				
						allFiltersCreated=true;
						lookupService.setLookupsList($scope.lookupList);	
						commonServices.setLookupList($scope.lookupList);
						$sessionStorage.lookupListForTransformationList=angular.copy($scope.lookupList)	;		
						$rootScope.$broadcast('lookupsCreated');
					}					
					$rootScope.showLoader=false;	
				};
				var validateData=function(currRow){
					var anyError=false;	
					currRow.errorMessage='';
					if(currRow.parentTable==null )
					{
						currRow.errorMessage='Select LookUp Table, or delete current row.';
						anyError=true;	
					}	
					if(currRow.parentTable=='' )
					{
						currRow.errorMessage+='Select LookUp Table.';
						anyError=true;	
					}	
					if(currRow.childColumn==null)
					{
						currRow.errorMessage+='Select Child Column, or delete current row.';
						anyError=true;	
					}		
					if(currRow.childColumn=='')
					{
						currRow.errorMessage+='Select Child Column';
						anyError=true;	
					}	
					if(currRow.selectedCondition==undefined ||currRow.selectedCondition.name=='')
					{
						currRow.errorMessage+='Select condition';
						anyError=true;
					}
					else
						currRow.lookupCond=currRow.selectedCondition.name;

					if(currRow.parentColumn==undefined || currRow.parentColumn=='')
					{
						currRow.errorMessage +=' Select Parent Column.';
						anyError=true;
					}
					return anyError;
				};





			}]);

