from django.http import HttpResponse
from pymongo import MongoClient
import json
from django.http import JsonResponse
from dataWranglingServer.settings import *

def getLookUpList(request):
	client = MongoClient(DATABASES['mongo']['url'])
	db = client.demo
	collectionList=db.collection_names()
	parentTableList=[]
	lookUpList=[]
	for collection in collectionList:
		thisCollCur=db[collection].find()
		obj={}
		for curr in thisCollCur:
			for k,v in curr.items():
				obj[k]=str(v)
				if v==True and k=='isLookUp':
					lookUpList.append(collection)

	for collection in lookUpList:
		parentObj={}
		parentObj['name']=collection.encode('utf8')
		colName=parentObj['name'].replace("'","")
		dbName=db[colName].find_one()
		columnsList=[]
		for column in dbName:
			column=column.encode('utf8')
			if column !='isLookUp':
				columnsList.append(column)		
		parentObj['columns']=columnsList
		parentTableList.append(parentObj)	
	return JsonResponse({'list':parentTableList})