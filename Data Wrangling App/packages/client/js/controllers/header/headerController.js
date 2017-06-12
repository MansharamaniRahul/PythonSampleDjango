'use strict'
var headerModule=angular.module('headerModule',[]);

headerModule.controller('headerController',['$scope','$rootScope','$sessionStorage','headerFactory','commonServices',
	'$location','$state','$mdDialog','$q',
	function($scope,$rootScope,$sessionStorage,headerFactory,commonServices,$location,$state,$mdDialog,$q){  				

		$scope.taskCreated=false;
		$rootScope.$on('taskCreated',function(event){
			$scope.taskCreated=true;
		});
			

		$scope.tiles = [
		{
			name:'add',
			displayValue:'Create Task',
			state:'createTask'
		},
		{
			name:'list',
			displayValue:'List Task',
			state:'listTask'
		}
		];	
		/*var impalaResponse=false,mongoResponse=false;
		var message='';  		
		$rootScope.$on('responseFromDBReceived',function(event, obj){
			
			if(obj && obj.responseFromMongo!=undefined)
			{
				mongoResponse=true;
				if(obj.responseFromMongo)
					message+= 'Task Details Saved successfully . '
				else
					message+= 'Error While Saving Task Details .'
			}		

			if(obj && obj.responseFromImpala!=undefined)
			{
				impalaResponse=true;
				if(obj.responseFromImpala)
					message+= 'Task data successfully on Impala.'
				else
					message+= 'Error While Saving Task data.'		
			}	


			if(impalaResponse && mongoResponse)
			{
				$rootScope.showLoader=false;
				commonServices.showAlert(message);
			}	
		});
		*/
		$scope.previewData=function(){
			//$location.path('/preview');
			$state.go('preview',{},{reload:true});			
		}
		
		$scope.saveData=function(){	

			
			if($sessionStorage  && $sessionStorage.taskName && $sessionStorage.taskName!='')
			{
				var taskDetails=commonServices.getTaskDetailsForDBOprtns();
				if(taskDetails && taskDetails.taskName!='' && taskDetails.childTable!='')
				{
					var dataValidated=commonServices.validateData(taskDetails);
					
					if(!dataValidated)
					{	
						var deferred = $q.defer();
						$rootScope.showLoader=true;
						let promises={};
						for (let i=0;i<=1;i++)
						{
							if(i==0)
							{
								
								promises.mongo=headerFactory.saveDataMongo(taskDetails)
								.success(function(response){	
									deferred.resolve();	
								})
								.error(function(error){										
									deferred.reject();
								})
								
							}
							else
								promises.impala=headerFactory.saveDataImpala(taskDetails)		
							.success(function(response){	
								deferred.resolve();								
							})
							.error(function(error){	
								deferred.reject();																				
							})

						}
						$q.all(promises).then((showMess)=>{
							$rootScope.showLoader=false;
							if(showMess)
							{
								var responseFromMongo='';
								var responseFromImpala='';
								if(showMess.impala && showMess.impala.data && showMess.impala.data.responseData)
								{
									responseFromImpala=showMess.impala.data.responseData;
								}
								if(showMess.mongo && showMess.mongo.data && showMess.mongo.data.responseData)
								{
									responseFromMongo=showMess.mongo.data.responseData;
								}
							}							
							commonServices.showAlert(responseFromImpala+', '+responseFromMongo);
						});
						//$q.all(promises).then(showMess($scope.responseFromImpala,responseFromMongo));

						/*headerFactory.saveDataMongo(taskDetails)
						.success(function(response){
							promises.push(deferred.resolve());						
							$rootScope.$broadcast('responseFromDBReceived',{'responseFromMongo':true});
						})
						.error(function(error){
							promises.push(deferred.resolve());
							$rootScope.$broadcast('responseFromDBReceived',{'responseFromMongo':false});		
						});

						headerFactory.saveDataImpala(taskDetails)		
						.success(function(response){
							promises.push(deferred.resolve());
							$rootScope.$broadcast('responseFromDBReceived',{'responseFromImpala':true});
						})
						.error(function(error){			
							promises.push(deferred.resolve());
							$rootScope.$broadcast('responseFromDBReceived',{'responseFromImpala':false});		
						});	*/

						

					}
				}
				else if($sessionStorage && ($sessionStorage.taskName==undefined || $sessionStorage.taskName==''))
				{
					commonServices.showAlert('No Task Details Exist to be saved.');
					$state.go('home');
				}

			}
			else if($sessionStorage && ($sessionStorage.taskName==undefined || $sessionStorage.taskName==''))
			{
				commonServices.showAlert('Create Some Task and Try Again');
				$state.go('home');
			}
		};

		$scope.loadExternalData=function(){
			$mdDialog.show({
				escapeToClose:false,
				templateUrl:'./partials/loadExternalData/loadExternalData.html',      
				scope:$scope.$new(),    			
				controller: DialogController,
				locals:{
					factory:headerFactory
				}
			});


			function DialogController($scope,headerFactory) {
				$scope.data={};

				$scope.uploadFile=function(){
					//!$scope.data.mongoFntcn || $scope.data.mongoFntcn=='' || $scope.data.mongoFntcn==null ||
					if( !$scope.data.tableName || $scope.data.tableName=='' || $scope.data.tableName==null)
					{
						commonServices.showAlert('Enter Some Function and Table Name try again.');		
						$state.go('home');				
					}
					else if(!$scope.data.externalURL || $scope.data.externalURL=='' || $scope.data.externalURL==null)
					{
						$state.go('home');	
						commonServices.showAlert('Enter URl And try again.');
					}	
					else
					{
						if(!$scope.data.csv && !$scope.data.json)
						{
							commonServices.showAlert('Select JSON or CSV and try again.');
							$state.go('home');
						}
						else
						{
							if($scope.data.csv)
							{	
								var taskDetails={}
								taskDetails.externalURL=$scope.data.externalURL;
								taskDetails.tableName=$scope.data.tableName;
								$rootScope.showLoader=true;
								headerFactory.callCSVLoad(taskDetails)		
								.success(function(response){		
									$rootScope.showLoader=false;
									$scope.closeDialog();
									if(response && response.responseData && response.responseData=='Success')
									{
										commonServices.showAlert('Data Loaded Successfully.');
									}
								})
								.error(function(response){
									$rootScope.showLoader=false;
									$scope.closeDialog();
									if(response && response.responseData && response.responseData=='Error')
									{
										commonServices.showAlert('Error while loading data.');
									}
								})	;
								/*var fileInput = document.getElementById('file_input_file');
								if(fileInput.value==undefined || fileInput.value=="")
									commonServices.showAlert('Select some file or uncheck CSV checkbox.');*/
							}
							else if($scope.data.json)
							{
								/*if(!$scope.data.externalURL || $scope.data.externalURL=='' || $scope.data.externalURL==null)
									commonServices.showAlert('Enter URl or uncheck JSON checkbox.');
									else*/
									{
										if(headerFactory)
										{
											var dataClub={};
											dataClub.externalURL=$scope.data.externalURL;
											dataClub.mongoFntcn=$scope.data.mongoFntcn;
											dataClub.tableName=$scope.data.tableName;
											$rootScope.showLoader=true;
											headerFactory.saveDataOnImpalaExternalLoad(dataClub)
											.success(function(response){
												$rootScope.showLoader=false;
												$scope.closeDialog();
												if(response && response.responseData && response.responseData=='Success')
												{
													commonServices.showAlert('Data Loaded Successfully.');
												}
												else if(response && response.responseData && response.responseData=='Table Already Exist')
												{
													commonServices.showAlert('Table already exist, try with new Table Name.');
												}
											})
											.error(function(error){	
												$scope.closeDialog();	
												$rootScope.showLoader=false;							
												commonServices.showAlert('Error while saving data.');									
											});
										}
									}
								}
							}
						}
					};

					$scope.closeDialog=function() {
						$mdDialog.destroy();			
						$location.url('/');
					};

				};				
			}

		}]);

