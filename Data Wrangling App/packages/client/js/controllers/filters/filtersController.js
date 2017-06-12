var filtersController=angular.module('filterModule',[]);

filtersController.controller('filtersController',
	['$scope', 'filtersService','commonServices','$rootScope','$mdDialog','filtersFactory','$sessionStorage',
	function($scope,filtersService,commonServices, $rootScope,$mdDialog,filtersFactory,$sessionStorage){ 

		$rootScope.showLoader=true;
		if($sessionStorage && $sessionStorage.selectedChildTable)
			$rootScope.$broadcast('pageRefreshed',{ taskDetails: $sessionStorage.selectedChildTable });

		$scope.columnsList=commonServices.getColumnList();
		$scope.tableDescrption=commonServices.getChilTableDescription();
		var conditionList=[];				
		

		$scope.tableListAndData=[];
		filtersFactory.getFilterList().success(function(response){
			$rootScope.showLoader=false;
			if(response && response.data && response.data.length>0)
			{
				conditionList=response.data;
			}
			else
				commonServices.showAlert('No Data Received');
		})
		.error(function(response){
			$rootScope.showLoader=false;
			if(response )
			{
				commonServices.showAlert('Error From Server.');
			}
		});

		$rootScope.$on('tableSelected',function(){
			$scope.tableDescrption=commonServices.getChilTableDescription();
			$scope.columnsList=commonServices.getColumnList();
		});

		var columnsList=commonServices.getColumnList();	
		var tableDescrption=commonServices.getChilTableDescription();	

		$scope.filtersList=[];
		if($sessionStorage && $sessionStorage.filtersList && $sessionStorage.filtersList.length>0)
			$scope.filtersList=$sessionStorage.filtersList;
		else
		{
			var rowDefaultData={};
			rowDefaultData.id=0;
			rowDefaultData.errorMessage='';
			$scope.filtersList.push(rowDefaultData);
		}
		

		$scope.columnSelected=function(currRow){
			if(currRow && currRow.column && currRow.column!='')
			{
				if(tableDescrption==undefined && $scope.tableDescrption==undefined)
				{
					commonServices.showAlert('Select Child table and try again.');		
					return false;
				}
				else if($scope.tableDescrption!=undefined)
					tableDescrption=$scope.tableDescrption;

				for(var i=0;i<tableDescrption.length;i++)
				{
					var lowerCaseData=tableDescrption[i].columnName.toLowerCase();
					if(lowerCaseData.indexOf(currRow.column)>=0)
					{
						currRow.placeholder='Enter '+tableDescrption[i].columnDataType+' value'
						currRow.dataType=tableDescrption[i].columnDataType;
					}
				}
			}
		};


		$scope.querySearchedColumnName=function(serachText){
			var r=$scope.tableDescrption;
			if(tableDescrption==undefined && $scope.tableDescrption==undefined)
			{
				commonServices.showAlert('Select Child table and try again.');		
				return false;
			}
			else if($scope.tableDescrption!=undefined)
				tableDescrption=$scope.tableDescrption;

			if(serachText!='')
			{
				serachText=serachText.toLowerCase();
				var similarColumnList=[];
				for(var i=0;i<tableDescrption.length;i++)
				{
					var lowerCaseData=tableDescrption[i].columnName.toLowerCase();
					if(lowerCaseData.indexOf(serachText)>=0)
						similarColumnList.push(tableDescrption[i].columnName)
				}
				return similarColumnList;
			}
		};

		

		$scope.querySearchedCondition=function(serachText){
			if(serachText!='' && conditionList && conditionList.length>0)
			{
				serachText=serachText.toLowerCase();
				var similarColumnList=[];
				for(var i=0;i<conditionList.length;i++)
				{
					var lowerCaseData=conditionList[i].displayvalue.toLowerCase();
					if(lowerCaseData!='' && lowerCaseData.indexOf(serachText)>=0)
						similarColumnList.push(conditionList[i])
				}
				return similarColumnList;
			}
		};

		$scope.addDeleteRow=function(task,row){
			if(task=='add')
			{
				commonServices.addRow($scope.filtersList);				
			}
			else
			{
				commonServices.deleteRow(row,$scope.filtersList,'filter');
			}
		};

		$scope.clearRow=function(currRow){	
			commonServices.clearRow(currRow,$scope.filtersList,'filter');							
		};
		$scope.createFileters=function(){
			$rootScope.showLoader=true;
			var count=0;
			for(let i in $scope.filtersList)
			{
				var validateMsg=commonServices.validateFilterData($scope.filtersList[i],false);
				if(validateMsg=='delete obj')
				{
					if($scope.filtersList.length>1)
						$scope.filtersList.splice(i,1);				
				}
			}
			for(let i in $scope.filtersList)
			{
				var validateMsg=commonServices.validateFilterData($scope.filtersList[i],false);
				if(validateMsg==true)
				{
					$rootScope.showLoader=false;
					break;					
				}
				else if(validateMsg==false)
				{
					if($scope.filtersList[i].column && $scope.filtersList[i].column!=null && $scope.filtersList[i].column!='')
					{						
						count++;
						/*if($scope.filtersList[i].dataType=='timestamp')
							$scope.filtersList[i].filterValue=new Date($scope.filtersList[i].filterValue);*/
					}
				}
			}
			var allFiltersCreated=false;
			if(count==$scope.filtersList.length)
			{
				allFiltersCreated=true;
				filtersService.setFiltersList($scope.filtersList);
				$sessionStorage.filtersList=$scope.filtersList;				
				$rootScope.$broadcast('filtersCreatred');
			}
			/*if(allFiltersCreated)
			{
				for(let i=0;i<$scope.filtersList.length;i++)
					$scope.filtersList[i].isDisabled=true;	
			}
			else
				commonServices.showAlert('Complete all blank filters or delete additional rows.');	*/		
			$rootScope.showLoader=false;
		};
		

		var validateData=function(currRow){
			var anyError=false;	
			currRow.errorMessage='';	
			if(currRow.column==null)
			{
				currRow.errorMessage='Delete the row or select one column.'
				anyError=true;
			}
			if(currRow.column=='')
			{
				currRow.errorMessage='Select Column';
				anyError=true;
			}	
			if(currRow.condition==undefined ||currRow.condition=='')
			{
				currRow.errorMessage+='Select condition';
				anyError=true;
			}
			if(currRow.filterValue==undefined || currRow.filterValue=='')
			{
				currRow.errorMessage +=' Enter filter value.';
				anyError=true;
			}
			if((currRow.filterValue!=undefined || currRow.filterValue!='') && currRow.dataType)
			{			
				if(currRow.dataType=='int')
				{
					if(isNaN(parseInt(currRow.filterValue)))
					{
						currRow.errorMessage +=' Enter integer value.';
						anyError=true;
					}
				}
				if(currRow.dataType=='string')
				{
					if(typeof currRow.filterValue !='string')
					{
						currRow.errorMessage +=' Enter string value.';
						anyError=true;
					}
				}				
			}
			return anyError;
		};



		$scope.onDateSelected=function(event,currRow){
			currRow.errorMessage='';
			var confirm = $mdDialog.confirm()
			.title('Would you like to keep Timestamp ?')						
			.targetEvent(event)
			.ok('Yes')
			.cancel('No');
			//var jsDate=new Date(currRow.filterValue).toLocaleDateString()+'T'+new Date(currRow.filterValue).toLocaleTimeString();

			$mdDialog.show(confirm).then(function() {
				currRow.keepTimeStamp=true;

				var jsDate=new Date(currRow.filterValue).toLocaleDateString();
				var dateArray=jsDate.split('/');
				var date=dateArray[1]<10?"0"+dateArray[1]:dateArray[1];
				var year=dateArray[2];
				var month=dateArray[0]<10?"0"+dateArray[0]:dateArray[0];
				var finalDate=year+'-'+month+'-'+date+' ';
				var sysDate=new Date();
				var currTime=sysDate.toLocaleTimeString();
				var curTimeArry=currTime.split(':');
				curTimeArry[0]=curTimeArry[0].length=1?'0'+curTimeArry[0]:curTimeArry[0];
				var secArry=curTimeArry[2].split(' ');
				var sec=secArry[0];
				var hr=curTimeArry[0];
				var min=curTimeArry[1];
				finalDate+=hr+':'+min+':'+sec;
				currRow.filterValue=finalDate;

			}, function() {
				currRow.keepTimeStamp=false;

				var jsDate=new Date(currRow.filterValue).toLocaleDateString();
				var dateArray=jsDate.split('/');
				var date=dateArray[1]<10?"0"+dateArray[1]:dateArray[1];
				var year=dateArray[2];
				var month=dateArray[0]<10?"0"+dateArray[0]:dateArray[0];
				var finalDate=year+'-'+month+'-'+date+' ';
				var sysDate=new Date();
				var currTime=sysDate.toLocaleTimeString();
				var curTimeArry=currTime.split(':');
				curTimeArry[0]=curTimeArry[0].length=1?'0'+curTimeArry[0]:curTimeArry[0];
				var secArry=curTimeArry[2].split(' ');
				var sec=secArry[0];
				var hr=curTimeArry[0];
				var min=curTimeArry[1];
				finalDate+=hr+':'+min+':'+sec;
				currRow.filterValue=finalDate;
			});
		};


		$scope.dateFilter=function(eve,currRow){
			if(currRow && eve)
			{
				currRow.errorMessage='';
				if(/^[a-zA-Z]*$/.test(eve.key))
					currRow.errorMessage='Select date only.'
			}
		};

	}]);

