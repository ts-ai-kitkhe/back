import statistics
from utils.generation import (
    filter_boxes_by_models_predictions,
    get_all_leters,
    project_y_letters,
    find_distances_between_coordinates,
    get_lines,
    get_sorted_lines,
    get_text_lines,
)


def generate_text(model_response, filtered_corners, predictions) -> str:
    f_corners, f_predictions, prediction_mask = filter_boxes_by_models_predictions(
        filtered_corners, predictions, 0.9
    )
    all_letters = get_all_leters(f_corners)
    y_letters = project_y_letters(all_letters)
    coord_distances = find_distances_between_coordinates(y_letters)
    lines = get_lines(coord_distances, all_letters, y_letters)
    sorted_lines = get_sorted_lines(lines)
    text_lines = get_text_lines(sorted_lines, model_response)

    sorted_text_lines = [
        sorted(tl, key=lambda x: x["corners"][0][0]) for tl in text_lines
    ]

    joined_text_lines = [
        "".join([s["letter"] for s in stl]) for stl in sorted_text_lines
    ]

    mean_spaces_between_chars = [
        statistics.mean(
            [
                abs(stl[i]["corners"][2][0] - stl[i + 1]["corners"][0][0])
                for i in range(len(stl) - 1)
            ]
        )
        for stl in sorted_text_lines
    ]

    result_text = ""
    for i in range(len(sorted_text_lines)):
        sentence = sorted_text_lines[i]
        mean_space = mean_spaces_between_chars[i]
        sent = ""
        for i in range(len(sentence) - 1):
            sent += sentence[i]["letter"]
            if (
                abs(sentence[i]["corners"][2][0] - sentence[i + 1]["corners"][0][0])
                > mean_space
            ):
                sent += " "
        sent += sentence[-1]["letter"]
        result_text += sent + "\n"

    return result_text


def main(event, context):
    model_response = []
    filtered_corners, predictions = [], []
    result_text = generate_text(model_response, filtered_corners, predictions)
    print(result_text)
    