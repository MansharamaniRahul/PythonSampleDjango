from pymongo import MongoClient
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import csv
import requests
import ast
import yaml
import os
from impala.dbapi import connect
from json2csv import api
import collections
import datetime

from io import StringIO
import sys
from six import string_types
import logging
from itertools import chain

from dataWranglingServer.settings import *
@csrf_exempt
def saveDataFromExternalURL(request):
    client = MongoClient(DATABASES['mongo']['url'])
    db = client.demo
    data = request.GET['data']
    outputRes=''
    s=''
    if data !='':
        e = data.encode('ascii', 'ignore')
        s = yaml.load(e)
        data=requests.get(s['externalURL'])
        jsonData=json.loads(data.content)
        curr=getCursor()
        dataExists = checkForTable(s['tableName'], curr)
        if dataExists:
            dropTable = 'drop table ' + s['tableName']
            curr.execute(dropTable)
        tableName=s['tableName']
        if 'mongoFntcn' in s:
            mongoFunction=s['mongoFntcn']
        else:
            mongoFunction=''
        #cmdString='MongoClient(host=["10.20.3.125:27017"], document_class=dict, tz_aware=False, connect=True)["demo"]["qwerty"].insert(jsonData)'
        if mongoFunction!='':
            db.tempTable.drop()
            db.tempTable.insert(jsonData)
            dataBaseObj = 'MongoClient(host=["10.20.3.125:27017"], document_class=dict, tz_aware=False, connect=True)["demo"]["'
            dataBaseObj += 'tempTable' + '"]' + '.' + mongoFunction
            exec (dataBaseObj)
            cur=db.tempTable.find()
            listofColumn=[]
            for i in cur:
                for k,v in i.iteritems():
                    if k.encode('utf-8')!='_id':
                        types = ""
                        try:
                            var_type = type(int(v))
                            types = "int"
                            tup=(k.encode('utf-8'),types,v)
                        except (ValueError,TypeError) as er:
                            try:
                                var_type = type(str(v))
                                types = "String"
                                tup=(k.encode('utf-8'), types,v)
                            except (ValueError,TypeError) as er:
                                try:
                                    var_type = type(list(v))
                                    types = "String"
                                    tup = (k.encode('utf-8'), types,v)
                                except (ValueError,TypeError) as er:
                                    try:
                                        var_type = type(dict(v))
                                        types = "String"
                                        tup = (k.encode('utf-8'), types,v)
                                    except (ValueError, TypeError) as er:
                                        try:
                                            var_type = type(datetime(v))
                                            types = "Timestamp"
                                            tup=(k.encode('utf-8'), types,v)
                                        except (ValueError, TypeError) as er:
                                            var_type = type(i)
                        listofColumn.append(tup)

            query="create table "+s["tableName"]+" ("
            for i in listofColumn:
                if i==listofColumn[-1]:
                    colName = 'data1' if i[0]=='data' else i[0]
                    colType = i[1]
                    query+=colName+" "+colType
                else:

                    colName='data1' if i[0]=='data' else i[0]
                    colType=i[1]
                    query += colName + " " + colType + ", "
            query+=") ;"
            curr = getCursor()
            curr.execute('use selfdi ;')
            curr.execute(query)

            insertQuery="INSERT INTO TABLE "+s["tableName"]+" ("
            listIndex=0
            for i in listofColumn:
                if listIndex==0:
                    insertQuery+='data1' if i[0]=='data' else i[0]
                    listIndex+=1
                else:
                    insertQuery +=", "+ ('data1' if i[0]=='data' else i[0])
                    listIndex += 1
            insertQuery+=") values "
            valueIndex=0
            tempDataCursor=db.tempTable.find()
            for i in tempDataCursor:
                if valueIndex!=0:
                    insertQuery+=' ,'
                insertValueIndex=0
                for k,v in i.iteritems():
                    if k != '_id':
                        if insertValueIndex==0:
                            if listofColumn[insertValueIndex][1]=='int' or listofColumn[insertValueIndex][1]=='Timestamp':
                                insertQuery += "( " + `v`
                            else:
                                if k!='_id':
                                    print json.dumps(v)
                                    insertQuery+='( "' + json.dumps(v).replace("'", '"').replace('"',"") + ' "'
                            insertValueIndex+=1
                        else:
                            if listofColumn[insertValueIndex][1] == 'int' or listofColumn[insertValueIndex][1] == 'Timestamp':
                                insertQuery += ", " +`v`
                            else:
                                if k != '_id':
                                    print json.dumps(v)
                                    insertQuery +=  ', "' + json.dumps(v).replace("'", '"').replace('"',"") + ' "'
                            insertValueIndex += 1
                insertQuery += ') '
                valueIndex+=1
            insertQuery+=" ;"
            curr.execute(insertQuery)

        else:
            listofColumn=[]
            listOfData = []
            p = {}
            if type(dict(jsonData)) == type(dict(p)):
                listOfData.append(jsonData)
            for i in listOfData:
                for k,v in i.iteritems():
                    if k.encode('utf-8') != '_id':
                        types = ""
                        try:
                            var_type = type(int(v))
                            types = "int"
                            tup = (k.encode('utf-8'), types, `v`)
                        except (ValueError, TypeError) as er:
                            try:
                                var_type = type(str(v))
                                types = "String"
                                tup = (k.encode('utf-8'), types, v)
                            except (ValueError, TypeError) as er:
                                try:
                                    var_type = type(list(v))
                                    types = "String"
                                    tup = (k.encode('utf-8'), types, str(v))
                                except (ValueError, TypeError) as er:
                                    try:
                                        var_type = type(dict(v))
                                        types = "String"
                                        tup = (k.encode('utf-8'), types, str(v))
                                    except (ValueError, TypeError) as er:
                                        try:
                                            var_type = type(datetime(v))
                                            types = "Timestamp"
                                            tup = (k.encode('utf-8'), types, `v`)
                                        except (ValueError, TypeError) as er:
                                            var_type = ""
                        listofColumn.append(tup)
            query = "create table " + s["tableName"] + " ("
            for i in listofColumn:
                    if i == listofColumn[-1]:
                        colName = i[0]
                        colType = i[1]
                        query += colName + " " + colType
                    else:
                        colName = i[0]
                        colType = i[1]
                        query += colName + " " + colType + ", "
            query += ") ;"
            curr = getCursor()
            curr.execute('use selfdi ;')
            curr.execute(query)
            insertQuery = "INSERT INTO TABLE " + s["tableName"] + " ("
            listIndex = 0
            for i in listofColumn:
                    if listIndex == 0:
                        insertQuery += i[0]
                        listIndex += 1
                    else:
                        insertQuery += ", " + i[0]
                        listIndex += 1
            insertQuery += ") values "


            indexForValues=0
            valueIndex = 0
            for i in listOfData:
                    indexForValues = 0
                    if valueIndex != 0:
                        insertQuery += ' ,'
                    for k,v in i.iteritems():
                        if indexForValues==0:
                            if listofColumn[indexForValues][1] == 'int' or listofColumn[indexForValues][1] == 'Timestamp':
                                insertQuery += "( " + `v`
                            else:
                                if k != '_id':
                                    print json.dumps(v)
                                    insertQuery += "( '" + json.dumps(v).replace("'", '"') + "' "
                            indexForValues+=1
                        else:
                            if listofColumn[indexForValues][1] == 'int' or listofColumn[indexForValues][1] == 'Timestamp':
                                insertQuery += ", " + `v`
                            else:
                                if k != '_id':
                                    print json.dumps(v)
                                    insertQuery += ", '" + json.dumps(v).replace("'", '"') + "' "
                            indexForValues+=1
                    valueIndex+=1
                    insertQuery += ') '
            insertQuery+=' ;'
            curr = getCursor()
            curr.execute('use selfdi ;')
            curr.execute(insertQuery)

            selectedColumnIndex = 0


            #dataBaseObjForFinalInsert = 'MongoClient(host=["10.20.3.125:27017"], document_class=dict, tz_aware=False, connect=True)["demo"]["'+s['tableName']+'"].insert(x)'
            #dataBaseObj = 'MongoClient(host=["10.20.3.125:27017"], document_class=dict, tz_aware=False, connect=True)["demo"]["tempTable"].find().forEach(function(x){'+dataBaseObjForFinalInsert+'})'
            #exec (dataBaseObj)


        outputRes = 'Success'
    else:
        outputRes='Error'
    return JsonResponse({'responseData':outputRes})




def checkForTable(taskName,curr):
	query='SHOW TABLES LIKE "'+taskName.lower()+'";'
	curr.execute(query)
	result=curr.fetchall()
	return True if(len(result))>0 else False

















def getCursor():
    conn = connect(host=DATABASES['impala']['host'], port=DATABASES['impala']['port'],database=DATABASES['impala']['databaseName'])
    cur = conn.cursor()
    return cur

def json_to_csv(input_file_path, output_file_path):
    with open(input_file_path) as input_file:
        json = input_file.read()
    dicts = json_to_dicts(json)
    with open(output_file_path, "w") as output_file:
        dicts_to_csv(dicts, output_file)

def json_to_dicts(json_str):
    try:
      objects = yaml.safe_load(json_str)
      li=[]
      #li.append(objects)
    except json.decoder.JSONDecodeError:
      objects = [json.loads(l) for l in json_str.split('\n') if l.strip()]

    return [dict(to_keyvalue_pairs(obj)) for obj in objects]

def convert(data):
    if isinstance(data, basestring):
        return str(data)
    elif isinstance(data, collections.Mapping):
        return dict(map(convert, data.iteritems()))
    elif isinstance(data, collections.Iterable):
        return type(data)(map(convert, data))
    else:
        return data

def to_keyvalue_pairs(source, ancestors=[], key_delimeter='_'):
    def is_sequence(arg):
        #arg=convert(arg)
        return (not isinstance(arg, string_types)) and (hasattr(arg, "__getitem__") or hasattr(arg, "__iter__"))

    def is_dict(arg):
        #arg = convert(arg)
        return isinstance(arg, dict)

    if is_dict(source):
        result = [to_keyvalue_pairs(source[key], ancestors + [key]) for key in source.keys()]
        return list(chain.from_iterable(result))
    elif is_sequence(source):
        result = [to_keyvalue_pairs(item, ancestors + [str(index)]) for (index, item) in enumerate(source)]
        return list(chain.from_iterable(result))
    else:

        return [(key_delimeter.join(ancestors), source)]

def dicts_to_csv(source, output_file):
    def build_row(dict_obj, keys):
        return [dict_obj.get(k, "") for k in keys]

    keys = sorted(set(chain.from_iterable([o.keys() for o in source])))
    rows = [build_row(d, keys) for d in source]

    cw = csv.writer(output_file)
    cw.writerow(keys)
    for row in rows:
        cw.writerow([c if isinstance(c, string_types) else c for c in row])

def write_csv(headers, rows, file):
    cw = csv.writer(file)
    cw.writerow(headers)
    for row in rows:
        cw.writerow([c.encode('utf-8') if isinstance(c, str) or isinstance(c, unicode) else c for c in row])