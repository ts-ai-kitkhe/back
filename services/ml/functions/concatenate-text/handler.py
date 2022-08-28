import os
import boto3
import re
import json


TXT_FOLDER_PATH = '/text/'
ml_bucket_name = os.environ["S3_ML_BUCKET_NAME"]

s3 = boto3.client("s3")
s3_resource = boto3.resource("s3")
PAGE_DELIMITER = "=" * 20 

def main(event, context):
    # bucket_name = 'books/8462a56f-f641-4b5c-bfb9-c7cf3b751e63/pages/text/0002.txt'
    bucket_name = event['detail']['bucket']['name']
    
    # key = 'books/8462a56f-f641-4b5c-bfb9-c7cf3b751e63/pages/text/0002.txt'
    key = event['detail']['object']['key']
    
    if not re.match(re.compile(r'\bbooks/.*/pages/text/.*\.txt\b'), key):
        print(f"invalid key passed: {key}")
        return

    if bucket_name != ml_bucket_name:
        print(f'invalid bucket name, expected:{ml_bucket_name}, got: {bucket_name}')
        return

    # text_prefix = 'books/8462a56f-f641-4b5c-bfb9-c7cf3b751e63/pages/text'
    text_prefix = key.rsplit('/', 1)[0]
    print("TEXT PREFIX:", text_prefix)
    # objects = ['books/8462a56f-f641-4b5c-bfb9-c7cf3b751e63/pages/text/1.txt', 'books/8462a56f-f641-4b5c-bfb9-c7cf3b751e63/pages/text/2.txt']
    objects = s3.list_objects_v2(Bucket=bucket_name,Prefix=text_prefix)
    print("objects")
    print(objects)

    txt_objects = []
    
    for object_contents in objects['Contents']:
        print('object_contents')
        print(object_contents)
        object_key = object_contents['Key']
        object = s3_resource.Object(bucket_name, object_key)

        object_data = object.get()["Body"].read().decode('utf-8') 
        print("OBJECT DATA:")
        print(object_data)

        txt_objects.append(object_data)

    print("TXT OBJECTS", len(txt_objects))
    txt_path = text_prefix.rsplit('/', 2)[0]
    print("TEXT PATH:", txt_path)
    
    full_text = ""
    for i in range(len(txt_objects)):
        full_text += txt_objects[i]
        full_text += '\n'
        full_text +=  PAGE_DELIMITER + f" {i} " + PAGE_DELIMITER
        full_text += '\n'
    
    object = s3.Object(ml_bucket_name, txt_path)
    object.put(Body=full_text, ContentType='text/plain; charset=utf-8')
