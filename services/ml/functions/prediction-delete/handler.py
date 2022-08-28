import os
import boto3
import re

JSON_FOLDER_PATH = "/predictions/"
assets_bucket_name = os.environ["S3_ASSETS_BUCKET_NAME"]
ml_bucket_name = os.environ["S3_ML_BUCKET_NAME"]

s3 = boto3.resource("s3")


def main(event, context):
    bucket_name = event["detail"]["bucket"]["name"]
    key = event["detail"]["object"]["key"]

    if not re.match(re.compile(r"\bbooks/.*/pages/.*\.(jpg|png|jpeg|webp)\b"), key):
        print(f"invalid key passed: {key}")
        return

    if bucket_name != assets_bucket_name:
        print(f"invalid bucket name, expected:{assets_bucket_name}, got: {bucket_name}")
        return

    new_key = f"{key.rsplit('.', 1)[0]}.json"
    new_key = f"{JSON_FOLDER_PATH}".join(new_key.rsplit("/", 1))
    s3.Object(ml_bucket_name, new_key).delete()
