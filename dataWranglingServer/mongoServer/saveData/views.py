from pymongo import MongoClient
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import ast
import yaml
from dataWranglingServer.settings import *
@csrf_exempt
def saveData(request):
	client = MongoClient(DATABASES['mongo']['url'])
	db = client.demo
	data = request.GET['data']
	outputRes=''
	if data !='':
		e = data.encode('ascii', 'ignore')
		s = yaml.load(e)
		db.mongodbInHouse.insert(s)
		outputRes='Metadata saved succesfully'
	else:
		outputRes = 'Error while saving metadata.'

	
	return JsonResponse({'responseData':outputRes})