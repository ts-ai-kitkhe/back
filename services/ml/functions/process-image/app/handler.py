import re
import cv2
import json
import boto3
import os
import numpy as np
from tensorflow import keras
from sklearn.preprocessing import LabelEncoder
from utils.preprocessing import (
    preprocess_image,
    get_corners,
    get_areas,
    get_boxes_sides_length,
    filter_by_area,
    filter_by_sides,
    get_characters,
    remove_extra_space_around_characters,
    zero_padding,
    input_for_frontend,
    get_bounding_boxes,
)
JSON_FOLDER_PATH = '/predictions/'

s3 = boto3.resource("s3")
ml_bucket_name = os.environ["S3_ML_BUCKET_NAME"]

model_name = "models/first_cnn/first_cnn.h5"
label_encoder_name = "models/first_cnn/first_cnn_label_encoder.npy"

model = keras.models.load_model(model_name)
le = LabelEncoder()
le.classes_ = np.load(label_encoder_name, allow_pickle=True)
le_name_mapping = dict(zip(le.transform(le.classes_), le.classes_))


def predict_characters(characters, filtered_corners):
    predictions = []
    for c in characters:
        image_cnn = np.zeros(shape=(1, 28, 28))
        image_cnn[0] = zero_padding(
            remove_extra_space_around_characters(c, extra_space_value=0)
        )
        prediction = model.predict(image_cnn, verbose=0)
        letter, confidence = np.argmax(prediction), np.max(prediction)
        # save top 3 predictions as well
        top_preds = [le_name_mapping[p] for p in (-prediction).argsort()[0]][:3]
        top_confs = np.sort(prediction[0])[::-1][:3]

        predictions.append(
            (le_name_mapping[letter], confidence, (top_preds, top_confs))
        )
    return filtered_corners, predictions
    # return input_for_frontend(filtered_corners, predictions)


def extract_bounding_boxes(img):
    binary_image = preprocess_image(img)
    # characteristics
    bounding_boxes = get_bounding_boxes(binary_image)
    corners = get_corners(bounding_boxes)
    areas = get_areas(corners)
    widths, heights = get_boxes_sides_length(corners)

    # filters
    filtered_areas, filtered_corners, area_mask = filter_by_area(
        areas, corners, filter_value=0
    )
    filtered_widths, filtered_heights = (
        np.array(widths)[np.array(area_mask)].tolist(),
        np.array(heights)[np.array(area_mask)].tolist(),
    )

    filtered_corners, side_mask = filter_by_sides(
        filtered_corners, filtered_widths, filtered_heights
    )
    filtered_widths, filtered_heights = (
        np.array(filtered_widths)[np.array(side_mask)].tolist(),
        np.array(filtered_heights)[np.array(side_mask)].tolist(),
    )
    filtered_areas = np.array(filtered_areas)[np.array(side_mask)].tolist()

    filtered_areas, filtered_corners, area_mask = filter_by_area(
        filtered_areas, filtered_corners, filter_value=np.mean(filtered_areas) / 2
    )
    filtered_widths, filtered_heights = (
        np.array(widths)[np.array(area_mask)].tolist(),
        np.array(heights)[np.array(area_mask)].tolist(),
    )
    return binary_image, filtered_corners


def main(event, context):
    d = event.get("detail")
    b = d.get("bucket")
    bucket = b.get("name")
    o = d.get("object")
    key = o.get("key")

    print(f"{bucket}/{key}: init...")

    if not re.match(re.compile(r"\bbooks/.*/pages/.*\.(jpg|png|jpeg|webp)\b"), key):
        return

    obj = s3.Object(bucket, key)

    img_array = np.asarray(bytearray(obj.get()["Body"].read()), dtype=np.uint8)
    print(f"{bucket}/{key}: img_array.shape={img_array.shape}")

    im = cv2.imdecode(img_array, cv2.IMREAD_GRAYSCALE)
    print(f"{bucket}/{key}: im.shape={im.shape}")

    print(f"{bucket}/{key}: extract_bounding_boxes...")
    binary_image, filtered_corners = extract_bounding_boxes(im)

    print(f"{bucket}/{key}: get_characters...")
    characters = get_characters(binary_image, filtered_corners)

    print(f"{bucket}/{key}: predict_characters...")
    filtered_corners, predictions = predict_characters(characters, filtered_corners)
    res = input_for_frontend(
        filtered_corners, predictions, width=im.shape[1], height=im.shape[0]
    )
    new_key = f"{key.rsplit('.', 1)[0]}.json"
    new_key = f'{JSON_FOLDER_PATH}'.join(new_key.rsplit('/'))
    object = s3.Object(ml_bucket_name, new_key)

    print(f"{ml_bucket_name}/{new_key}: saving...")
    object.put(Body=json.dumps(res), ContentType="application/json")

    print(f"{ml_bucket_name}/{key}: finish")
