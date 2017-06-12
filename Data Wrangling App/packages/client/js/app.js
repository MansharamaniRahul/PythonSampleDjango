'use strict';

var wranglingModule=angular.module('wranglingApp',['ngMaterial','ui.router','ngAnimate','homeModule',
    'headerModule','ngStorage','filterModule','transformationModule','createTaskModule','listTaskModule',
    'taskOperationsModule','lookupModule','previewModule']);


wranglingModule.config(function($stateProvider, $urlRouterProvider,$httpProvider){
 $httpProvider.defaults.useXDomain = true;
 delete $httpProvider.defaults.headers.common['X-Requested-With'];

 $urlRouterProvider.otherwise('/home');

 $stateProvider
 .state('home',{
    url:'/home',
    templateUrl:'./partials/home/home.html' ,
    controller:'homeController'
})   
 .state('createTask',{        
    url:'/createTask',
    templateUrl:'./partials/createTask/createTask.html' ,
    controller:'createTaskController'
})

 .state('listTask',{
    url:'/listTask',
    templateUrl:'./partials/listTask/listTask.html' ,
    controller:'listTaskController'
})        
 .state('filter',{
    url:'/filter',
    templateUrl:'./partials/filters/filters.html',
    controller :'filtersController'
})
 .state('transformation',{
    url:'/transformations',
    templateUrl:'./partials/transformation/transformation.html',
    controller:'transformationsController'
})
 .state('taskOperations',{
    url:'/taskOperations',
    templateUrl:'./partials/taskOperations/taskOperations.html',
    controller:'taskOperationsController'
})
 .state('lookup',{
    url:'/lookups',
    templateUrl:'./partials/lookup/lookup.html',
    controller:'lookupController'
})

 .state('preview',{
    url:'/preview',
    templateUrl:'./partials/preview/preview.html',
    controller:'previewController'
})

});

wranglingModule.service('serverURL',[function(){
    this.URL='http://localhost:8080/#';
}]);

wranglingModule.filter('startFrom', function() {
    return function(input, start) {
        if(input!=undefined  && start!=undefined )
        {
            start = +start; 
            return input.slice(start);    
        }        
    }
});



wranglingModule.controller('indexController',['$scope','commonServices','filtersService','$rootScope',
    'lookupService','transformationsService','$sessionStorage','$location','commonFactory','$mdDialog',
    function($scope,commonServices,filtersService, $rootScope,lookupService,
        transformationsService,$sessionStorage, $location,commonFactory,$mdDialog){

        $scope.mdsideNavIsOpen=false,$scope.selectedTable=[],$scope.slidePannelList=[];
        var tableListAndData=[];
        $rootScope.showLoader=true;
        $scope.selectedColumns={};       

        commonFactory.getChildTaleList()
        .success(function(response)
        {
         $rootScope.showLoader=false;
         if(response && response.responseData && response.responseData.length>0  && typeof response.responseData!='string')
         {
            tableListAndData=  response.responseData;
            commonServices.setChilTablesList(tableListAndData);
        } 
        else if(response && response.responseData && response.responseData.length>0 && typeof response.responseData=='string')
        {
            commonServices.showAlert(response.responseData);  
        }
    })
        .error(function(error){
            if(error)
            {
                $rootScope.showLoader=false;
                commonServices.showAlert('Error While getting Child Tables ');  
            } 
        });

        $scope.columnSelected=function(){
            if($sessionStorage)
            {
                var selectedColumnsArry=[];
                for (let i in $scope.selectedColumns)
                    if($scope.selectedColumns[i])
                        selectedColumnsArry.push(i);
                    $sessionStorage.selectedColumns=selectedColumnsArry;
                    commonServices.setColumnListForPreview(selectedColumnsArry);
                }            
            };




            $scope.thisTableSelected=function(tableName){

                for(let i=0;i<tableListAndData.length;i++){
                    tableName=tableName.replace(' ','').toLowerCase();
                    if(tableListAndData[i].name.replace(' ','').toLowerCase()==tableName) 
                    {
                        if($sessionStorage)
                            $sessionStorage.childTable=tableListAndData[i].name;
                        $scope.selectedTable.push(tableListAndData[i]);
                        commonServices.setColumnList(tableListAndData[i].columns);
                        $rootScope.$broadcast('tableSelected');   
                    } 
                }
            };



            $rootScope.$on('taskCreatedORSelected',function(event,taskDetails){
                if(taskDetails && taskDetails.taskDetails && taskDetails.taskDetails.selectedTableData )
                {
                    $rootScope.$broadcast('taskCreated');
                    $scope.selectedTable=[];
                    $scope.selectedColumns={};
                    $sessionStorage.selectedChildTable=taskDetails.taskDetails.selectedTableData;
                    $sessionStorage.columnsOfChilTable=$sessionStorage.selectedChildTable.columns;
                    $sessionStorage.tableDescription=taskDetails.taskDetails.tableDescription ? taskDetails.taskDetails.tableDescription : [];
                    $sessionStorage.taskName=taskDetails.taskDetails.taskName;
                    
                    $scope.mdsideNavIsOpen=true; 
                    $scope.taskName=taskDetails.taskDetails.taskName;
                    $sessionStorage.childTable=$sessionStorage.selectedChildTable.name;
                    $scope.selectedTable.push(taskDetails.taskDetails.selectedTableData);
                    commonServices.setColumnList(taskDetails.taskDetails.selectedTableData.columns);
                    commonServices.setColumnListForPreview(taskDetails.taskDetails.selectedTableData.columns);
                    commonServices.setChilTableDescription(taskDetails.taskDetails.tableDescription);
                    $rootScope.$broadcast('tableSelected');

                    if($sessionStorage.filtersList && $sessionStorage.filtersList.length>0 )
                        $sessionStorage.filtersList=[];
                    if($sessionStorage.lookupList && $sessionStorage.lookupList.length>0 )
                        $sessionStorage.lookupList=[];
                    if($sessionStorage.transformationsList && $sessionStorage.transformationsList.length>0 )
                        $sessionStorage.transformationsList=[];
                    if($sessionStorage.selectedColumns && $sessionStorage.selectedColumns.length>0)
                        $sessionStorage.selectedColumns=[];
                    $scope.filtersList=[];
                    $scope.transformationsList=[];
                    $scope.lookupList=[];   
                }     
                else
                {
                    commonServices.showAlert("Select child Table")
                    $location.url("/home");
                }     
            });

            $rootScope.$on('pageRefreshed',function(event,taskDetails){
                if(taskDetails && taskDetails.taskDetails && taskDetails.taskDetails.name )
                {                
                    $rootScope.$broadcast('taskCreated');   
                    $scope.selectedTable=[];
                    $scope.mdsideNavIsOpen=true; 
                    $scope.taskName=$sessionStorage.taskName;
                    $scope.selectedTable.push($sessionStorage.selectedChildTable);           
                    commonServices.setColumnList(taskDetails.taskDetails.columns); 
                    if($sessionStorage.tableDescription)
                       commonServices.setChilTableDescription($sessionStorage.tableDescription);

                   commonServices.setColumnListForPreview([]);
                    //$sessionStorage.selectedColumns=[];
                    
                    var r=commonServices.getColumnList();               
                    $scope.filtersList=($sessionStorage.filtersList);
                    $scope.lookupList=($sessionStorage.lookupList);
                    $scope.transformationsList=($sessionStorage.transformationsList);
                    $rootScope.$broadcast('tableSelected');
                }          
            });


            $rootScope.$on('lookupTableSelected',function(event ,lookupColumns){
                if(lookupColumns &&  lookupColumns.columns &&  lookupColumns.columns.length>0 && $scope.selectedTable && $scope.selectedTable.length>0 &&   $scope.selectedTable[0].columns)
                {
                  for(let i in lookupColumns.columns)
                  {
                    if($scope.selectedTable[0].columns.indexOf(lookupColumns.columns[i]<0))
                        $scope.selectedTable[0].columns.push(lookupColumns.columns[i]);
                }
            }                
        });

            $rootScope.$on('lookupTableDeleted',function(event ,lookupColumns){
                if(lookupColumns &&  lookupColumns.columns &&  lookupColumns.columns.length>0 && $scope.selectedTable && $scope.selectedTable.length>0 &&   $scope.selectedTable[0].columns)
                {
                  for(let i in lookupColumns.columns)
                  {
                    for(let j in $scope.selectedTable[0].columns)
                    {
                        if($scope.selectedTable[0].columns[j]==lookupColumns.columns[i])
                            $scope.selectedTable[0].columns.splice(j,1);
                    }
                }                  
            }                
        });

            $rootScope.$on('filtersCreatred',function(){                
                $scope.filtersList=(filtersService.getFiltersList());        
                $sessionStorage.filtersList=$scope.filtersList;
            });

            $rootScope.$on('transformationsCreatred',function(){        
                $scope.transformationsList=transformationsService.getTransformationsList();        
                $sessionStorage.transformationsList=$scope.transformationsList;        
            });


            $rootScope.$on('lookupsCreated',function(){       
                $scope.lookupList=lookupService.getLookupsList();          
                $sessionStorage.lookupList=$scope.lookupList;    
            });


   /*     $rootScope.$on('filtersCreatred',function(){     
            if($scope.filtersList && $scope.filtersList.length>0)
            {
                var array=filtersService.getFiltersList();
                for(let j in array)
                {
                    for(let i=0;i<$scope.filtersList.length;i++)
                    {
                        if($scope.filtersList[i].column!=array[j].column && $scope.filtersList[i].condition.displayvalue!=array[j].condition.displayvalue && $scope.filtersList[i].filterValue!=array[j].filterValue)
                           $scope.filtersList.push(array[j]);
                   }                     
               }
           }
           else
           {
            $scope.filtersList=[];
            $scope.filtersList=(filtersService.getFiltersList());
        }
        $sessionStorage.filtersList=$scope.filtersList;
    });*/



    /*$rootScope.$on('transformationsCreatred',function(){
        if($scope.transformationsList)
        {
            var array=transformationsService.getTransformationsList();
            for(let i in array)
                $scope.transformationsList.push(array[i]);
        }
        else
        {
            $scope.transformationsList=[];
            $scope.transformationsList=transformationsService.getTransformationsList();
        }   
        $sessionStorage.transformationsList=$scope.transformationsList;        
    });
    */
    /*
        $rootScope.$on('lookupsCreated',function(){
            if($scope.lookupList)
            {
                var array=lookupService.getLookupsList();
                for(let i in array)
                    $scope.lookupList.push(array[i]);
            }
            else
            {
                $scope.lookupList=[];
                $scope.lookupList=lookupService.getLookupsList();
            }   
            $sessionStorage.lookupList=$scope.lookupList;    
        });
        */  

        $rootScope.$on('clearedOnlyFilter',function(){
            $scope.filtersList=[];
            $sessionStorage.filtersList=[];
        });

        $rootScope.$on('clearedOnlyTransformation',function(){
            $scope.transformationsList=[];
            $sessionStorage.transformationsList=[];
        });

        $rootScope.$on('clearedOnlyLookup',function(){
            $scope.lookupList=[];
            $sessionStorage.lookupList=[];
        });



        $rootScope.$on('clearedCurrRow',function(event, obj){
           if($scope.filtersList.length>0)
           {
            for(let i=0;i<$scope.filtersList.length;i++)
            {
                if($scope.filtersList[i].id==obj.thisRowCleared.id)
                    $scope.filtersList.splice(i,1);
            }
        }
    });

        $scope.deleteCurFilter=function(curFilter){
            if(curFilter  && $scope.filtersList && $scope.filtersList.length>0)
            {
                for(let i=0;i<$scope.filtersList.length;i++)
                {
                    if($scope.filtersList[i].column==curFilter.column && $scope.filtersList[i].condition.displayvalue==curFilter.condition.displayvalue && $scope.filtersList[i].filterValue==curFilter.filterValue)
                        $scope.filtersList.splice(i,1);
                }  
            }
            if(curFilter && $sessionStorage && $sessionStorage.filtersList){
                for(let i=0;i<$sessionStorage.filtersList.length;i++)
                {
                    if($sessionStorage.filtersList[i].column==curFilter.column && $sessionStorage.filtersList[i].condition.displayvalue==curFilter.condition.displayvalue && $sessionStorage.filtersList[i].filterValue==curFilter.filterValue)
                        $sessionStorage.filtersList.splice(i,1);
                }  
            }
        }; 

        $scope.deleteCurLookup=function(curLookup){
            if(curLookup  && $scope.lookupList && $scope.lookupList.length>0)
            {
                for(let i=0;i<$scope.lookupList.length;i++)
                {
                    if($scope.lookupList[i].childColumn==curLookup.childColumn && $scope.lookupList[i].selectedCondition.name==curLookup.selectedCondition.name && $scope.lookupList[i].parentColumn==curLookup.parentColumn)
                        $scope.lookupList.splice(i,1);
                }  
            }
            if(curLookup  && $sessionStorage && $sessionStorage.lookupList)
            {
                for(let i=0;i<$sessionStorage.lookupList.length;i++)
                {
                    if($sessionStorage.lookupList[i].childColumn==curLookup.childColumn && $sessionStorage.lookupList[i].selectedCondition.name==curLookup.selectedCondition.name && $sessionStorage.lookupList[i].parentColumn==curLookup.parentColumn)
                        $sessionStorage.lookupList.splice(i,1);
                }  
            }
        };

        $scope.deleteCurTransform=function(curTransform){
            if(curTransform  && $scope.transformationsList && $scope.transformationsList.length>0)
            {
                for(let i=0;i<$scope.transformationsList.length;i++)
                {
                    if($scope.transformationsList[i].targetColumn==curTransform.targetColumn && $scope.transformationsList[i].transformationFunction==curTransform.transformationFunction )
                        $scope.transformationsList.splice(i,1);
                }  
            }
            if(curTransform && $sessionStorage && $sessionStorage.transformationsList){
                for(let i=0;i<$sessionStorage.transformationsList.length;i++)
                {
                    if($sessionStorage.transformationsList[i].targetColumn==curTransform.targetColumn && $sessionStorage.transformationsList[i].transformationFunction==curTransform.transformationFunction )
                        $sessionStorage.transformationsList.splice(i,1);
                }  
            }
        };     


        $scope.editTaskName=function(taskName){            
            $mdDialog.show({
                escapeToClose:true,
                templateUrl:'./partials/editTaskName/editTaskName.html',      
                scope:$scope.$new(),    
                locals: {
                    taskName:$scope.taskName                        
                },
                controller: DialogController
            });

            function DialogController($scope,taskName)
            {
                $scope.updateTAskName=function(taskName)
                {
                    $scope.$parent.taskName=taskName;
                    $sessionStorage.taskName=taskName;
                    $scope.closeDialog();
                }
            };
            $scope.closeDialog=function () {
                $mdDialog.destroy();
            }
            
        };
    }]);



        /*wranglingModule.factory('indexFactory',['$http','serverURL',function($http,serverURL){

            return{
                getChildTaleList: function(){
                    var url='http://localhost:8000/impalaServer/getChildTableList/';
                    return $http.get(url);
                }
            }

        }

]); */