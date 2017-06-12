import csv
import json
import itertools
import requests
from django.views.decorators.csrf import csrf_exempt
import sys, getopt, pprint
from pymongo import MongoClient
from impala.dbapi import connect
import yaml
from dataWranglingServer.settings import *
from django.http import JsonResponse
def getCursor():
    conn = connect(host=DATABASES['impala']['host'], port=DATABASES['impala']['port'],database=DATABASES['impala']['databaseName'])
    cur = conn.cursor()
    return cur

@csrf_exempt
def ingestion(request):
    try:
        data = request.GET['data']
        if data != '':
            ignoredAscii = data.encode('ascii', 'ignore')
            dataDict = yaml.load(ignoredAscii)
            if 'externalURL' in dataDict:
                CSV_URL=dataDict['externalURL']
            if 'tableName' in dataDict:
                tableName = dataDict['tableName']
            curr = getCursor()
            createQuery = getcreateQuery(tableName,CSV_URL)
            curr.execute(createQuery)
            insertQuery=createInsertQuery(tableName,CSV_URL)
            curr.execute(insertQuery)
            return JsonResponse({'responseData': "Success"})
        else:
            return JsonResponse({'responseData': "Error"})
    except Exception as e:
        return JsonResponse({'responseData': "Error"})
    finally:
        curr.close()


# creating table on impala
def getcreateQuery(tableName,CSV_URL):  # tableName
    header = header_creation(CSV_URL)
    variable_type = var_type(CSV_URL)
    query = "create table " + tableName + "("
    # combining header and var_type list
    for i, j in zip(header, variable_type):
        if i == header[-1]:
            query +=i +" " + j + ")"
        else:
            query +=i + " " + j + ","
    query += "row format delimited fields terminated by ',' ;"
    return query

def header_creation(CSV_URL):
    with requests.Session() as s:
        download = s.get(CSV_URL)
        decoded_content = download.content.decode('utf-8')
        cr = csv.reader(decoded_content.splitlines(), delimiter=',')
        head = set()
        head = cr.next()
        header=[]
        j=""
        for i in head:
            j=i.replace(" ", "").replace(",", "").replace(".","").replace("-","")
            header.append(j)
    return header





# variable types list
def var_type(CSV_URL):
    with requests.Session() as s:
            download = s.get(CSV_URL)
            decoded_content = download.content.decode('utf-8')
            cr = csv.reader(decoded_content.splitlines(), delimiter=',')
            for row in itertools.islice(cr, 1, 2):
                types1 = []
                for i in row:
                    types = ""
                    try:
                        var_type = type(int(i))
                        types = "int"
                    except ValueError:
                        try:
                            var_type = type(str(i))
                            types = "String"
                        except ValueError:
                            var_type = type(i)
                    types1.append(types)
    return types1





def createInsertQuery(tableName,CSV_URL):
    with requests.Session() as s:
        download = s.get(CSV_URL)
        decoded_content = download.content.decode('utf-8')
        cr = csv.reader(decoded_content.splitlines(), delimiter=',')
        header = set()
        header = cr.next()
        data = cr.next()
        print data

    insertQuery = "INSERT INTO TABLE " + tableName + " Values "
    listIndex = 0
    listOfData=[]
    indexOfI=0



    for i in data:

        try:
            var_type = type(float(i))
            types = "float"
            tup = (header[indexOfI], types, i)
        except ValueError, TypeError:
            try:
                var_type = type(str(i))
                types = "String"
                tup = (header[indexOfI], types, i)
            except ValueError:
                var_type = type(i)
        listOfData.append(tup)
        indexOfI += 1



    indexForValues = 0
    valueIndex = 0
    with requests.Session() as s:
        download = s.get(CSV_URL)
        decoded_content = download.content.decode('utf-8')
        cr = csv.reader(decoded_content.splitlines(), delimiter=',')

    indexToRemoveHeader=0
    for i in cr:
        if indexToRemoveHeader!=0:
            indexForValues = 0
            if valueIndex != 0:
                insertQuery += ' ,'
            for j in i:
                if indexForValues == 0:
                    if listOfData[indexForValues][1] == 'int' or listOfData[indexForValues][1] == 'Timestamp':
                        insertQuery += "( " + `int(j)`
                    else:
                        insertQuery += '( "' + str(j) + '" '
                    indexForValues += 1
                else:
                    if listOfData[indexForValues][1] == 'int' or listOfData[indexForValues][1] == 'Timestamp':
                        insertQuery += ", " + `int(j)`
                    else:
                        insertQuery += ', "' + str(j) + '" '
                    indexForValues += 1
            valueIndex += 1
            insertQuery += ') '
        indexToRemoveHeader+=1
    insertQuery += ' ;'
    return insertQuery