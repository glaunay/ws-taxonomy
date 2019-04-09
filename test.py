
import urllib.request
import json

import random

def isChildOf(childTaxID, parentTaxID):
    url = 'http://localhost:3000/childof/' + str(childTaxID) + '-' + str(parentTaxID)
    #request = urllib.request.Request('http://localhost:3000/get/1239')
    print("requesting\"" + url + "\"")
    request = urllib.request.Request( url, headers={'User-Agent': 'Mozilla'} )
    result = urllib.request.urlopen(request)
    resulttext = result.read()
    return json.loads(resulttext)



for i in range (1,10000):
    data = isChildOf(str(random.randint(1,100000)), "1239")
    print(data)
    