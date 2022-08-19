# Pull the base image with python 3.8 as a runtime for your Lambda
FROM public.ecr.aws/lambda/python:3.8

COPY app ./

# Install the python requirements from requirements.txt
RUN python3.8 -m pip install -r requirements.txt

# Set the CMD to your handler
CMD ["handler.main"]