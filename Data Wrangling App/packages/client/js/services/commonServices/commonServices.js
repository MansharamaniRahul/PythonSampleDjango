var wranglingModule=angular.module('wranglingApp');
wranglingModule.service('commonServices',["$mdDialog",'$sessionStorage','$rootScope',
	function($mdDialog,$sessionStorage,$rootScope){	
		this.setColumnList=function(columnList){
			this.columnList=[];
			this.columnList=columnList;
		};
		this.getColumnList=function(){
			return this.columnList;
		};
		this.getServerURL=function(){
			return this.url='http://10.20.3.125:8000';
		};
		this.setLookupList=function(lookupList){
			this.lookupList=[];
			this.lookupList=lookupList;
		};
		this.getLookupList=function(){
			return this.lookupList;
		};
		this.setChilTableDescription=function(tableDescription){
			this.tableDescription=[];
			this.tableDescription=tableDescription;
		};
		this.getChilTableDescription=function(){
			return this.tableDescription;
		};
		this.setColumnListForPreview=function(columnList){
			this.columnListForPreview=[];
			this.columnListForPreview=columnList;
			$sessionStorage.columnListForPreview=columnList;
		}
		this.getColumnListForPreview=function(){
			return this.columnListForPreview;
		};
		this.setChilTablesList=function(chilTablesList){
			this.chilTablesList=chilTablesList;
		};
		this.getChilTablesList=function(){
			return this.chilTablesList;
		};

		this.setTaskDetails=function(taskDetails){
			this.taskDetails=taskDetails;
		};
		this.getTaskDetails=function(){
			return this.taskDetails;
		}
		this.clearRow=function(currRow,list,callFrom){
	/*	if(currRow && !currRow.isDisabled)
		{
			for(var k in  currRow)
			{
				if(k!='id')
					currRow[k]=undefined;
			}

		}*/

		if(currRow )
		{
			for(var k in  currRow)
			{
				if(k!='id')
					currRow[k]=undefined;
			}

		}
		if(list && list.length==1)
		{
			switch(callFrom)
			{
				case 'filter':
				$rootScope.$broadcast('clearedOnlyFilter');
				break;

				case 'lookup':
				$rootScope.$broadcast('clearedOnlyLookup');
				break;

				case 'transformation':
				$rootScope.$broadcast('clearedOnlyTransformation');
				break;
			}
		}
	};
	this.deleteRow=function(row,list,callFrom){
		if(!row.isDisabled)
		{
			if(list.length>1)
			{
				for(let i=0;i<list.length;i++)
				{
					if(list[i].id==row.id)
						list.splice(i,1);
				}
			}
			else if(list && list.length==1)
			{
				switch(callFrom)
				{
					case 'filter':
					$rootScope.$broadcast('clearedOnlyFilter');
					break;

					case 'lookup':
					$rootScope.$broadcast('clearedOnlyLookup');
					break;

					case 'transformation':
					$rootScope.$broadcast('clearedOnlyTransformation');
					break;
				}
				
				

			}
		}
	};
	this.showAlert=function(textContent){
		$mdDialog.show(
			$mdDialog.alert()
			.parent(angular.element(document.querySelector('body')))
			.clickOutsideToClose(true)
			.title('Alert')
			.textContent(textContent)
			.ariaLabel('Alert Dialog Demo')
			.ok('Got it!')
			);
	};

	this.addRow=function(list){
		var rowDefaultData={};
		var lastId=list[list.length-1].id+1
		rowDefaultData.id=lastId;
		list.push(rowDefaultData);
	};

	this.getTaskDetailsForDBOprtns=function(){
		var taskDetails={};
		taskDetails.taskName=$sessionStorage.taskName;

		if($sessionStorage.childTable && $sessionStorage.childTable!='')
			taskDetails.childTable=$sessionStorage.childTable;

		if($sessionStorage.selectedColumns && $sessionStorage.selectedColumns.length>0)
			taskDetails.selectedColumns=$sessionStorage.selectedColumns;
		
		if($sessionStorage.filtersList && $sessionStorage.filtersList.length>0 )
			taskDetails.filterList=$sessionStorage.filtersList;

		if($sessionStorage.lookupList && $sessionStorage.lookupList.length>0 )
			taskDetails.lookupList=$sessionStorage.lookupList;

		if($sessionStorage.transformationsList && $sessionStorage.transformationsList.length>0 )
			taskDetails.transformationList=$sessionStorage.transformationsList;

			//taskDetails=JSON.stringify(taskDetails)
			return taskDetails;
		};

		this.validateFilterData=function(currRow,callFromPreviewORSave){
			var anyError=false;	
			currRow.errorMessage='';	
			if(currRow.column==undefined && currRow.condition==undefined && currRow.filterValue==undefined)
			{
				return 'delete obj';
			}
			else
			{
				if(currRow.column==null)
				{

					currRow.errorMessage='Delete the row or select one column.'
					if(callFromPreviewORSave)
						this.showAlert('Delete Empty rows or select column in filters.');
					anyError=true;
				}
				if(currRow.column=='')
				{

					currRow.errorMessage='Select Column';
					if(callFromPreviewORSave)
						this.showAlert('Delete Empty rows or select column in filters.');
					anyError=true;
				}	
				if(currRow.condition==undefined ||currRow.condition=='')
				{

					currRow.errorMessage+='Select condition';
					if(callFromPreviewORSave)
						this.showAlert('Select conditions in filters.');
					anyError=true;
				}
				if(currRow.filterValue==undefined || currRow.filterValue=='')
				{

					currRow.errorMessage +=' Enter filter value.';
					if(callFromPreviewORSave)
						this.showAlert('Enter filter value in filters.');
					anyError=true;
				}
				if((currRow.filterValue!=undefined || currRow.filterValue!='') && currRow.dataType)
				{			
					if(currRow.dataType=='int')
					{
						if(!(/^\d+$/.test(currRow.filterValue)))
						{

							currRow.errorMessage +=' Enter integer value.';
							if(callFromPreviewORSave)
								this.showAlert('Enter integer value in filter value.');
							anyError=true;
						}
					}
					if(currRow.dataType=='string')
					{
						if(typeof currRow.filterValue !='string')
						{
							currRow.errorMessage +=' Enter string value.';
							if(callFromPreviewORSave)
								this.showAlert('Enter string value in filter value.');
							anyError=true;
						}
						else
						{
							while(currRow.filterValue!=JSON.stringify(currRow.filterValue))
							{			
								if(currRow.filterValue.indexOf('\\')>=0)					
									currRow.filterValue=JSON.parse(currRow.filterValue);
								else if(currRow.filterValue.indexOf('"')!=0)
								{
									currRow.filterValue=JSON.stringify(currRow.filterValue);									
								}							
								else
									break;
							}
							
						}
					}	
					/*if(currRow.dataType=='timestamp')
					currRow.filterValue=new Date(currRow.filterValue).toLocaleDateString();	*/

				}

			}
			return anyError;
		};

		this.validateLookupData=function(currRow,callFromPreviewORSave){
			var anyError=false;	
			currRow.errorMessage='';

			if((currRow.parentTable==null || currRow.parentTable==undefined) && (currRow.childColumn==null || currRow.childColumn==undefined) && (currRow.selectedCondition== null || currRow.selectedCondition==undefined))
			{
				return 'delete obj';
			}
			else
			{
				/*if(currRow.parentTable==null )
				{
					currRow.errorMessage='Select LookUp Table, or delete current row.';
					anyError=true;	
					if(callFromPreviewORSave)
						this.showAlert('Select LookUp Table, or delete current row from loopup Page.');
				}*/	
				if(currRow.parentTable=='' || currRow.parentTable==null)
				{
					currRow.errorMessage+='Select LookUp Table.';
					anyError=true;	
					if(callFromPreviewORSave)
						this.showAlert('Select LookUp Table from loopup Page.');
				}	
				/*if(currRow.childColumn==null)
				{
					currRow.errorMessage+='Select Child Column, or delete current row.';
					anyError=true;	
					if(callFromPreviewORSave)
						this.showAlert('Select Child Column, or delete current row from loopup Page.');
				}	*/	
				if(currRow.childColumn=='' || currRow.childColumn==null)
				{
					currRow.errorMessage+='Select Child Column';
					anyError=true;	
					if(callFromPreviewORSave)
						this.showAlert('Select Child Column from loopup Page.');
				}	
				if(currRow.selectedCondition== null || currRow.selectedCondition==undefined ||currRow.selectedCondition.name=='')
				{
					currRow.errorMessage+='Select condition';
					anyError=true;
					if(callFromPreviewORSave)
						this.showAlert('Select condition from loopup Page.');

				}
				else
					currRow.lookupCond=currRow.selectedCondition.name;

				if(currRow.parentColumn==undefined || currRow.parentColumn=='')
				{
					currRow.errorMessage +=' Select Parent Column.';
					anyError=true;
					if(callFromPreviewORSave)
						this.showAlert('Select Parent Column from loopup Page.');
				}

				if(currRow.childColumnDataType!=currRow.parentColumnDataType)
				{
					currRow.errorMessage +=' Select Lookup Columns of same data type.';
					anyError=true;
					if(callFromPreviewORSave)
						this.showAlert('Select Lookup Columns of same data type from loopup Page.');
				}

			}
			return anyError;
		};

		this.validateTransformationData=function(currRow,callFromPreviewORSave){
			var anyError=false;	
			currRow.errorMessage='';	
			var lookupList=angular.copy(this.getLookupList());
			if(!lookupList)
				lookupList=$sessionStorage.lookupListForTransformationList ? angular.copy($sessionStorage.lookupListForTransformationList) : [];


			if((currRow.transformationFunction==undefined && currRow.targetColumn==undefined ) || (currRow.transformationFunction=="" && currRow.targetColumn=="" ) )
			{
				return 'delete obj';
			}
			else
			{
				if(currRow.transformationFunction== null || currRow.transformationFunction==undefined ||currRow.transformationFunction=='')
				{
					if(currRow.searchColumnName!=null && currRow.searchColumnName!=undefined && currRow.searchColumnName!='' )
						currRow.transformationFunction=currRow.searchColumnName
					else
					{
						currRow.errorMessage='Select some Trasnformation Function';
						anyError=true;	
						if(callFromPreviewORSave)
							this.showAlert('Select some Trasnformation Function in Trasnformation Page.');
					}
				}
				else
					if(lookupList && lookupList.length>0)
					{
						for(let i in lookupList)
						{
							if(currRow.transformationFunction.indexOf(lookupList[i].childColumn)>=0 || currRow.transformationFunction.indexOf(lookupList[i].parentColumn)>=0)
							{
								currRow.errorMessage='Transformation function cannot have lookup column.';
								anyError=true;	
								if(callFromPreviewORSave)
									this.showAlert('Transformation function cannot have lookup column in Trasnformation Page.');
							}
						}

					}

					if(currRow.targetColumn=='' || currRow.targetColumn==null)
					{
						currRow.errorMessage='Enter Target Column Name';
						anyError=true;
						if(callFromPreviewORSave)
							this.showAlert('Enter Target Column Name in Trasnformation Page.');
					}

				}
				return anyError;
			};

			this.validateData=function(taskDetails){
				var anyErrorFromFilter=false,anyErrorFromLookup=false,anyErrorFromTransfromation=false;
				if(taskDetails.filterList && taskDetails.filterList.length>0)
				{
					for(let i in taskDetails.filterList)
					{
						anyErrorFromFilter=this.validateFilterData(taskDetails.filterList[i],true)

					}
				}

				if(taskDetails.lookupList && taskDetails.lookupList.length>0)
				{
					for(let i in taskDetails.lookupList)
					{
						anyErrorFromLookup=this.validateLookupData(taskDetails.lookupList[i],true)

					}
				}

				if(taskDetails.transformationList && taskDetails.transformationList.length>0)
				{
					for(let i in taskDetails.transformationList)
					{
						anyErrorFromTransfromation=this.validateTransformationData(taskDetails.transformationList[i],true)

					}
				}
				return (anyErrorFromTransfromation || anyErrorFromLookup || anyErrorFromFilter)
			};

		}]);