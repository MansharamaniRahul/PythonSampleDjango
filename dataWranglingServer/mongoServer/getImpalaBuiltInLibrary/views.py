from pymongo import MongoClient
from django.http import JsonResponse
from dataWranglingServer.settings import *

def getBuiltInFunctionList(request):
    builtInFunctionList = []
    outputResponse = {}
    try:
        client = MongoClient(DATABASES['mongo']['url'])
        db = client.demo
        a = db.ImpalaStringFunctions.find()
        for i in a:
            obj = {}
            for k, v in i.items():
                k = k.encode("utf8")
                obj[k] = str(v)
            builtInFunctionList.append(obj)
        outputResponse['success']=builtInFunctionList
    except Exception:
        outputResponse['error']='Error While Getting Function List'

    return JsonResponse({'data': outputResponse})