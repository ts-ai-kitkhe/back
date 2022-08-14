import cv2
import json
import boto3
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

s3 = boto3.resource("s3")

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

        predictions.append((le_name_mapping[letter], float(confidence)))
        break
    return input_for_frontend(filtered_corners, predictions)


def extract_ounding_boxes(img):
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
    image_names = []

    for e in event["Records"]:
        bucket = e["s3"]["bucket"]["name"]
        key = e["s3"]["object"]["key"]
        obj = s3.Object(bucket, key)

        img_array = np.asarray(bytearray(obj.get()["Body"].read()), dtype=np.uint8)
        im = cv2.imdecode(img_array, cv2.IMREAD_GRAYSCALE)

        image_names.append(key)
        print(img_array.shape)
        print(im.shape)

        binary_image, filtered_corners = extract_ounding_boxes(im)

        characters = get_characters(binary_image, filtered_corners)
        res = predict_characters(characters, filtered_corners)

        object = s3.Object(bucket, f"{key.rsplit('.', 1)[0]}.json")
        object.put(Body=json.dumps(res))
