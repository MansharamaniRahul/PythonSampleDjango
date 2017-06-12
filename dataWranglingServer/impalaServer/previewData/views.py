from django.http import JsonResponse
from impala.dbapi import connect
from django.views.decorators.csrf import csrf_exempt
import yaml
from django.utils.datastructures import MultiValueDictKeyError
import datetime
from dataWranglingServer.settings import *


@csrf_exempt
def previewData(request):
	try:
		outputRes=""
		finalQuery=""
		selectedData=[]
		data = request.GET['data']
		if data !='':
			ignoredAscii= data.encode('ascii', 'ignore')
			dataDict = yaml.load(ignoredAscii)
			finalQuery=createQuery(dataDict)
 			curr=getCursor()
			curr.execute(finalQuery)
			selectedData = curr.fetchall()
			outputRes=selectedData
		else:
			outputRes = 'Fail, No Task Details Received'
		return JsonResponse({'responseData':outputRes})
	except (Exception) as ex:
		print ex
		outputRes = 'Error'
		return JsonResponse({'responseData':outputRes})
	finally:
		curr.close()

def getCursor():
    conn = connect(host=DATABASES['impala']['host'], port=DATABASES['impala']['port'],database=DATABASES['impala']['databaseName'])
    cur = conn.cursor()
    return cur

def createQuery(taskDict):
	selectSQL='SELECT '
	selectedColumnIndex=0
	if 'selectedColumns' in taskDict:
		for i in taskDict['selectedColumns']:
			if selectedColumnIndex==0:
				selectSQL+='a.'+i
			else:
				selectSQL+=', a.'+i
			selectedColumnIndex+=1
	else:
		selectSQL+=" a.* "



	frmSQL=" FROM " + taskDict['childTable'] + " a "
	whereSQL=""
	##### lookup table join formation
	print 'Lkp tables:'
	lkpIdx=0;
	if 'lookupList' in taskDict:
		for lkp in taskDict['lookupList']:
			print lkp['parentTable']
			frmSQL += " JOIN " + lkp['parentTable'] + " lkp" + str(lkpIdx) + " ON a." + lkp['childColumn'] + lkp['selectedCondition']['value'] + "lkp"+str(lkpIdx)+"." + lkp['parentColumn']
			lkpIdx+=1

	print frmSQL

	##### transformed column formation
	txIdx=0;
	if 'transformationList' in taskDict:
		for tx in taskDict['transformationList']:
			print tx['targetColumn']
			selectSQL += ", " + tx['transformationFunction'] + " as " + tx['targetColumn']
			#selectSQL += ", " + tx['transformationFunction'] + "("+ tx['srcColumn'] + ") as " + tx['targetColumn']
			txIdx+=1

	print selectSQL

	##### filter clause
	filterIdx=0;
	if 'filterList' in taskDict:
		for fil in taskDict['filterList']:
			print fil['column']
			if filterIdx == 0 :
				if fil['condition']['displayvalue']=='Contains' or fil['condition']['displayvalue']=='Like' or fil['dataType']=='string':
					whereSQL += " WHERE lower(trim(a." + fil['column']+")) " + fil['condition']['value'] +" "+ fil['filterValue'].lower()
				elif fil['dataType']=='timestamp' and not fil['keepTimeStamp']:
					whereSQL += " WHERE to_date(a." + fil['column'] + ") " + fil['condition']['value'] + ' to_date("' + fil[
						'filterValue']+'") '
				elif fil['dataType']=='timestamp' and fil['keepTimeStamp']:
					whereSQL += " WHERE a." + fil['column'] + " " + fil['condition']['value'] + ' "' + fil['filterValue'] + '" '
				else:
					whereSQL += " WHERE a." +  fil['column'] + " "+ fil['condition']['value'] + " "+ fil['filterValue']
			else:
				if fil['condition']['displayvalue']=='Contains' or fil['condition']['displayvalue']=='Like' or fil['dataType']=='string':
					whereSQL += " AND lower(trim(a." + fil['column'] +")) " + fil['condition']['value'] +" "+ fil['filterValue'].lower()
				elif fil['dataType']=='timestamp' and not fil['keepTimeStamp']:
					whereSQL += " AND to_date(a." + fil['column'] + ") " + fil['condition']['value'] + ' to_date("' + fil[
						'filterValue']+'") '
				elif fil['dataType']=='timestamp' and fil['keepTimeStamp']:
					whereSQL += " AND a." + fil['column'] + " " + fil['condition']['value'] + ' "' +  fil['filterValue'] +'" '
				else:
					whereSQL += " AND a." + fil['column'] + " "+fil['condition']['value'] + " "+fil['filterValue']
			filterIdx+=1
			#daa=datetime.date('10/03/2014')

	print whereSQL
	return selectSQL + frmSQL + whereSQL + ";"






