import os
import boto3
import re
import json


TXT_FOLDER_PATH = '/text/'
ml_bucket_name = os.environ["S3_ML_BUCKET_NAME"]

s3 = boto3.resource("s3")


def main(event, context):
    d = event.get("detail")
    b = d.get("bucket")
    bucket = b.get("name")
    o = d.get("object")
    key = o.get("key")
    print(event)

    if not re.match(re.compile(r'\bbooks/.*/pages/text/.*\.txt\b'), key):
        print(key)
        return

    if bucket != ml_bucket_name:
        print(bucket)
        return
    
    txt_objects = []
    for obj in bucket.objects.all():
        txt_objects.append(json.loads(obj.get()["Body"].read()))
        print("*"*100, txt_objects)
    print(len(txt_objects))