from django.http import HttpResponse
from pymongo import MongoClient
import json
from django.http import JsonResponse
from bson import ObjectId
from dataWranglingServer.settings import *

def getConditionsList(request):
	client = MongoClient(DATABASES['mongo']['url'])
	db = client.demo
	#collectionList=db.collection_names()
	collectionName=db.get_collection("ConditionsList")
	conditionList=[]

	a=db.ConditionsList.find()
	for i in a:
		obj={}
		for k,v in i.items():			
			k=k.encode("utf8")
			obj[k]=str(v)			
		conditionList.append(obj)

		
	return JsonResponse({'conditionList':conditionList})