import os
import boto3
import re

TXT_FOLDER_PATH = "/text/"
ml_bucket_name = os.environ["S3_ML_BUCKET_NAME"]

s3 = boto3.resource("s3")


def main(event, context):
    bucket_name = event["detail"]["bucket"]["name"]
    key = event["detail"]["object"]["key"]

    if not re.match(re.compile(r"\bbooks/.*/pages/predictions/.*\.json\b"), key):
        print(f"invalid key passed: {key}")
        return

    if bucket_name != ml_bucket_name:
        print(f"invalid bucket name, expected:{ml_bucket_name}, got: {bucket_name}")
        return

    new_key = f"{key.rsplit('.', 1)[0]}.txt"
    new_key = f"{TXT_FOLDER_PATH}".join(
        [new_key.rsplit("/", 2)[0]] + [new_key.rsplit("/", 2)[2]]
    )
    s3.Object(ml_bucket_name, new_key).delete()
