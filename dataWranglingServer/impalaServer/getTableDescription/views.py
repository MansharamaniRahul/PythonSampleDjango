from django.http import JsonResponse
from impala.dbapi import connect
from django.views.decorators.csrf import csrf_exempt
import json
import ast
import yaml
from django.utils.datastructures import MultiValueDictKeyError
from dataWranglingServer.settings import *

@csrf_exempt
def getTableDescription(request):
    try:
        data=request.GET['data']
        ignoredAscii = data.encode('ascii', 'ignore')
        tableData = yaml.load(ignoredAscii)
        finalQuery="describe "+tableData+ " ;"
        curr=getCursor()
        curr.execute(finalQuery)
        tableDescTuple=curr.fetchall()
        tableDescArray=[]
        for i in tableDescTuple:
            tableObj={}
            tableObj['columnName']=i[0]
            tableObj['columnDataType'] = i[1]
            tableDescArray.append(tableObj)
        return JsonResponse({"tableDescription":tableDescArray})
    except (MultiValueDictKeyError, Exception) as ex:
        print ex
        outputRes = 'Error'
        return JsonResponse({'responseData': outputRes})
    finally:
        curr.close()


def getCursor():
    conn = connect(host=DATABASES['impala']['host'], port=DATABASES['impala']['port'],database=DATABASES['impala']['databaseName'])
    cur = conn.cursor()
    return cur