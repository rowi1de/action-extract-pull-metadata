import pymongo
import base64
import magic


def lambda_handler(event, context):
    ##CONNECT TO DB
    client = pymongo.MongoClient(
        "mongodb+srv://hackathon-competence-map:hackathon-competence-map@cluster0-akj15.mongodb.net/test?retryWrites"
        "=true&w=majority")
    db = client.get_database(name="competence-map")

    ##GET DATA
    fileCollection = db.get_collection("files")
    cursor = fileCollection.find({"version":6})

    ##COMPUTE COMPETENCE
    resultList = []
    for document in cursor:
          resultList.append(process(document))

    ##SEND RESULTS
    resultCollection = db.get_collection("results")

    flatList = [item for sublist in resultList for item in sublist]
    resultCollection.insert_many(flatList)


def process(document):
    file = document["file"]
    author = document["metadata"]["author"]
    filename = file["content"]["name"]

    author = document["commmits"]

    lineByLineCode = prepare(file["content"]["full"])
    lineByLineChanges = prepare(file["content"]["patch"])

    return magic.magic(lineByLineCode, lineByLineChanges, filename, author)


def doit():
    magic.doit()
    magic.doit()
    magic.magic.doit

def prepare(encodedString):
    decoded = base64.b64decode(encodedString).splitlines()
    final = []
    for line in decoded:
        try:
            final.append(line.decode("utf-8"))
        except:
            continue
    return final

def test():
    ##CONNECT TO DB
    client = pymongo.MongoClient(
        "mongodb+srv://hackathon-competence-map:hackathon-competence-map@cluster0-akj15.mongodb.net/test?retryWrites"
        "=true&w=majority")
    db = client.get_database(name="competence-map")

    ##GET DATA
    fileCollection = db.get_collection("files")
    cursor = fileCollection.find({"version":6})

    ##COMPUTE COMPETENCE
    resultList = []
    for document in cursor:
          resultList.append(process(document))

    ##SEND RESULTS
    resultCollection = db.get_collection("results")

    flatList = [item for sublist in resultList for item in sublist]
    resultCollection.insert_many(flatList)

print(test())

