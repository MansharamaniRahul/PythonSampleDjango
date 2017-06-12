from django.http import JsonResponse
from impala.dbapi import connect
from django.views.decorators.csrf import csrf_exempt
import json
import ast
import yaml
from django.utils.datastructures import MultiValueDictKeyError
from dataWranglingServer.settings import *

from elasticsearch import Elasticsearch


@csrf_exempt
def saveData(request):
	try:
		finalQuery=""
		data = request.GET['data']
		if data !='':
			ignoredAscii= data.encode('ascii', 'ignore')
			dataDict = yaml.load(ignoredAscii)
			curr = getCursor()
			dataExists = checkForTable(dataDict['taskName'],curr)
			finalQuery=createQuery(dataDict,dataExists);
			curr.execute(finalQuery)
			saveOnES(dataDict['taskName'],curr)
			outputRes="Data saved succesfully"
		else:
			outputRes = 'No data received to be saved.'
		return JsonResponse({'responseData':outputRes})
	except (MultiValueDictKeyError,Exception) as ex:
		outputRes = ex
		return JsonResponse({'responseData':outputRes})
	finally:
		curr.close()

def getCursor():
    conn = connect(host=DATABASES['impala']['host'], port=DATABASES['impala']['port'],database=DATABASES['impala']['databaseName'])
    cur = conn.cursor()
    return cur

def checkForTable(taskName,curr):
	query="SHOW TABLES LIKE '"+taskName.lower()+"' ;"
	curr.execute(query)
	result=curr.fetchall()
	return True if(len(result))>0 else False


def createQuery(taskDict,dataExists):
	if dataExists:
		dropTable='drop table '+taskDict['taskName']
		cur=getCursor()
		cur.execute(dropTable)
	selectSQL="CREATE TABLE "+taskDict['taskName']+" as ( SELECT "
	selectedColumnIndex =0
	if 'selectedColumns' in taskDict:
		for i in taskDict['selectedColumns']:
			if selectedColumnIndex == 0:
				selectSQL += 'a.'+i
			else:
				selectSQL += ', a.' + i
			selectedColumnIndex += 1
	else:
		selectSQL += " a.*"

	frmSQL=" FROM " + taskDict['childTable'] + " a "
	whereSQL=""



	##### lookup table join formation
	print 'Lkp tables:'
	lkpIdx=0;
	if 'lookupList' in taskDict:
		for lkp in taskDict['lookupList']:
			print lkp['parentTable']
			frmSQL += " LEFT JOIN " + lkp['parentTable'] + " lkp" + str(lkpIdx) + " ON a." + lkp['childColumn'] + lkp['selectedCondition']['value'] + "lkp"+str(lkpIdx)+"." + lkp['parentColumn']
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
				if fil['condition']['displayvalue']=='Contains' or fil['condition']['displayvalue']=='Like':
					whereSQL += " WHERE lower(trim(a." + fil['column']+")) " + fil['condition']['value'] +" "+ fil['filterValue'].lower()
				elif fil['dataType']=='timestamp' and not fil['keepTimeStamp']:
					whereSQL += " WHERE to_date(a." + fil['column'] + ") " + fil['condition']['value'] + ' to_date("' + fil[
						'filterValue']+'") '
				elif fil['dataType']=='timestamp' and fil['keepTimeStamp']:
					whereSQL += " WHERE a." + fil['column'] + " " + fil['condition']['value'] + ' "' + fil['filterValue'] + '" '
				else:
					whereSQL += " WHERE a." +  fil['column'] + " "+ fil['condition']['value'] + " "+ fil['filterValue']
			else:
				if fil['condition']['displayvalue']=='Contains' or fil['condition']['displayvalue']=='Like':
					whereSQL += " AND lower(trim(a." + fil['column'] +")) " + fil['condition']['value'] +" "+ fil['filterValue'].lower()
				elif fil['dataType']=='timestamp' and not fil['keepTimeStamp']:
					whereSQL += " AND to_date(a." + fil['column'] + ") " + fil['condition']['value'] + ' to_date("' + fil[
						'filterValue']+'") '
				elif fil['dataType']=='timestamp' and fil['keepTimeStamp']:
					whereSQL += " AND a." + fil['column'] + " " + fil['condition']['value'] + ' "' +  fil['filterValue'] +'" '
				else:
					whereSQL += " AND a." + fil['column'] + " "+fil['condition']['value'] + " "+fil['filterValue']
			filterIdx+=1

	print whereSQL
	query=selectSQL + frmSQL + whereSQL
	query+= ") ;"
	return query



def saveOnES(taskName,curr):
	es = Elasticsearch([{'host': Elasticsearch_VM['host'], 'port': Elasticsearch_VM['port']}])
	finalQuery = createQueryForES(taskName)
	curr.execute(finalQuery)
	data=curr.fetchall()
	descQuery='describe '+taskName+';'
	curr.execute(descQuery)
	tableDesc=curr.fetchall()
	tableColumns=[]
	for i in tableDesc:
		tableColumns.append(i[0])
	JsonData={}
	listOfRows=[]
	idCount = 0
	for i in data:
		rowObj={}
		count = 0
		for j in i:
			rowObj[tableColumns[count]]=j
			count+=1
		es.index(index=taskName.lower(), doc_type=taskName, id=idCount, body=rowObj)
		idCount+=1
	return data


def createQueryForES(taskName):
	selectQuery = 'Select * from ' + taskName + ';'
	return selectQuery






