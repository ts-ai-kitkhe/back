import json


def hello(event, context):
    body = {
        "message": "Hello from ml service",
        "input": event,
    }

    return {"statusCode": 200, "body": json.dumps(body)}
