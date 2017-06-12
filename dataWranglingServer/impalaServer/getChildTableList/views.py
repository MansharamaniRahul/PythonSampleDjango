from django.http import JsonResponse
from impala.dbapi import connect
from django.views.decorators.csrf import csrf_exempt
from django.utils.datastructures import MultiValueDictKeyError
from dataWranglingServer.settings import *
def getCursor():
    conn = connect(host=DATABASES['impala']['host'], port=DATABASES['impala']['port'],database=DATABASES['impala']['databaseName'])
    cur = conn.cursor()
    return cur


@csrf_exempt
def getChildTableList(request):
	outputRes=''
	try:
		tablesData=[]
		curr = getCursor()
		curr.execute('Show Tables;')
		tableList=curr.fetchall()
		for tableName in tableList:
			tableObj={}
			tableObj['name']=tableName[0]
			tableExist=checkForTable(tableName[0],curr)
			if tableExist and tableName[0]!='collateral123':
				query='describe '+tableName[0]+' ;'
				curr.execute(query)
				columnsTuple=curr.fetchall()
				columns=[]
				for column in columnsTuple:
					columns.append(column[0])
				tableObj['columns'] = columns
				tablesData.append(tableObj)
		return JsonResponse({'responseData':tablesData})
	except (MultiValueDictKeyError,Exception) as ex:
		print ex
		outputRes = 'Exception Occured at DB End'
		return JsonResponse({'responseData':outputRes})
	finally:
		curr.close()


def checkForTable(taskName,curr):
	query = 'SHOW TABLES LIKE "' + taskName.lower() + '";'
	curr.execute(query)
	result=curr.fetchall()
	return True if(len(result))>0 else False




