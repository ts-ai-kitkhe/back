import re
import os
import statistics
import json
import json
import boto3
import pickle
from transformers import PreTrainedTokenizerFast
import numpy as np


ml_bucket_name = os.environ["S3_ML_BUCKET_NAME"]

SERVICE_PATH = "functions/generate-text"
ROBERTA_TOKENS_MAP_PATH = "models/roberta_tokenizer/special_tokens_map.json"
ROBERTA_CONFIG_PATH = "models/roberta_tokenizer/tokenizer_config.json"
ROBERTA_TOKENS_MAP_PATH = "models/roberta_tokenizer/tokenizer.json"
TOKENIZER_PATH = "models/roberta_tokenizer"
VOCAB_PATH = "models/vocab/light_vocab.pkl"


class CandidatesSelector:
    def __init__(self):
        vocab_path = os.path.join(SERVICE_PATH, VOCAB_PATH)
        tokenizer_path = os.path.join(SERVICE_PATH, TOKENIZER_PATH)

        with open(vocab_path, "rb") as handle:
            self.vocab = pickle.load(handle)

        self.tokenizer = PreTrainedTokenizerFast.from_pretrained(tokenizer_path)
        self.MAX_LEN = 28

    def choose_best_candidate(self, words):
        minx = 10000
        candidates = []
        for w in words:
            enc = self.tokenizer(text=w)
            n_tokens = len(enc["input_ids"])
            if n_tokens <= minx:
                minx = n_tokens
                candidates.append(w)

        if len(candidates) == 0:
            return ""

        if len(candidates) == 1:
            return candidates[0]
        # vocab logic
        cand_vocab_counts = [(w, self.vocab.get(w, 0)) for w in candidates]
        best_cand = max(cand_vocab_counts, key=lambda x: x[1])[0]
        return best_cand

    def select_candidate(self, candidates):
        best_candidate = self.choose_best_candidate(candidates)
        return best_candidate


candicates_selector = CandidatesSelector()


def get_word_variants(word, min_thresh=0.95):
    word_vars = [""]
    probs = [1.0]
    for char_var in word:
        letters = char_var["top_letters"]
        confs = char_var["top_confidences"]
        char_vars = []
        char_probs = []
        for l, c in zip(letters, confs):
            char_vars += [v + l for v in word_vars]
            char_probs += [p * c for p in probs]
            if c > min_thresh:
                break
        word_vars = char_vars
        probs = char_probs
    return word_vars, probs


# This class represents a letter object.
# A letter contains the coordinates and dimensions
# of the bounding box in the image that it belongs
# to
class Letter:
    def __init__(self, coords, dims, number):
        self.id = number
        self.x = coords[0]
        self.y = coords[1]
        # dimensions in format [height,width]
        self.dimen = dims
        self.myCoor = [self.x, self.y]
        # will hold the string value of the letter when determined
        # or -1 if no value is determined.
        self.val = ""
        # the two adjacent neighbors of the letter are saved here
        # self.right
        # self.left

    def getID(self):
        return self.id

    def getY(self):
        return self.y

    def getX(self):
        return self.x

    def getCoords(self):
        return self.myCoor

    def getHeight(self):
        return self.dimen[0]

    def getWidth(self):
        return self.dimen[1]

    def getDimension(self):
        return self.dimen

    def getValue(self):
        return self.val

    def getRight(self):
        return self.right

    def getLeft(self):
        return self.left

    def getArea(self):
        return self.dimen[0] * self.dimen[1]


def filter_boxes_by_models_predictions(corners, predictions, confidence_threshold=0.5):
    predictions_confidence_array = np.array([p[1] for p in predictions], np.float16)
    pred_array = np.array(predictions, dtype=np.object_)
    corners_array = np.array(corners, dtype=np.object_)

    mask = np.where(predictions_confidence_array > confidence_threshold)
    filtered_predictions = pred_array[mask]
    filtered_corners = corners_array[mask]
    return filtered_corners, filtered_predictions, mask


def get_all_leters(corners):
    all_letters = []
    counter = 0
    for bx in corners:
        width = abs(bx[1][0] - bx[0][0])
        height = abs(bx[3][1] - bx[0][1])
        newLetter = Letter([bx[0][0], bx[0][1]], [height, width], counter)
        all_letters.append(newLetter)
        counter += 1

    all_letters.sort(key=lambda letter: letter.getY() + letter.getHeight())
    return all_letters


def project_y_letters(all_letters):
    prjYCoords = []
    for letter in all_letters:
        prjYCoords.append(letter.getY() + letter.getHeight())

    return prjYCoords


def find_distances_between_coordinates(y_projection):
    coorDists = [0]
    for i in range(1, len(y_projection)):
        valCur = y_projection[i]
        valPast = y_projection[i - 1]
        coorDists.append(valCur - valPast)

    return coorDists


# function finds the minimization of the weighted within-class variance
# this algorithm is adapted from:
# https://opencv-python-tutroals.readthedocs.io/en/latest/py_tutorials/py_imgproc/py_thresholding/py_thresholding.html
def findThresh(data):
    Binsize = 50
    # find density and bounds of histogram of data
    density, bds = np.histogram(data, bins=Binsize)
    # normalize the histogram values
    norm_dens = (density) / float(sum(density))
    # find discrete cumulative density function
    cum_dist = norm_dens.cumsum()
    # initial values to be overwritten
    fn_min = np.inf
    thresh = -1
    bounds = range(1, Binsize)
    # begin minimization routine
    for itr in range(0, Binsize):
        if itr == Binsize - 1:
            break
        p1 = np.asarray(norm_dens[0:itr])
        p2 = np.asarray(norm_dens[itr + 1 :])
        q1 = cum_dist[itr]
        q2 = cum_dist[-1] - q1
        b1 = np.asarray(bounds[0:itr])
        b2 = np.asarray(bounds[itr:])
        # find means
        m1 = np.sum(p1 * b1) / q1
        m2 = np.sum(p2 * b2) / q2
        # find variance
        v1 = np.sum(((b1 - m1) ** 2) * p1) / q1
        v2 = np.sum(((b2 - m2) ** 2) * p2) / q2

        # calculate minimization function and replace values
        # if appropriate
        fn = v1 * q1 + v2 * q2
        if fn < fn_min:
            fn_min = fn
            thresh = itr

    return thresh, bds[thresh]


def get_lines(coord_distances, all_letters, y_letters):
    # find division in distance data
    res, bthval = findThresh(coord_distances)
    # use division to distinguish between paragraphs and sentences
    lines = [[all_letters[0]]]
    IDS = [[all_letters[0].getID()]]
    count = 0

    start = 0
    end = 0
    asd = 1.0
    meanCoord = float(sum(coord_distances)) / float(len(coord_distances))
    stdCoord = np.std(coord_distances)

    medPoints = []
    for num in range(0, len(coord_distances)):
        if coord_distances[num] > meanCoord + asd * stdCoord and end == 0:
            start = num
        if coord_distances[num] > meanCoord + asd * stdCoord and start > 0:
            end = num
            medPoints.append(int(start + (end - start) / 2.0))
            start = num
    medPoints.append(start)

    medPoints.insert(0, 0)

    lines = []
    for num in range(0, len(medPoints)):
        lines.append(y_letters[medPoints[num]])

    return lines


def get_sorted_lines(lines):
    import statistics

    sorted_lines = sorted(lines)
    distances_lines = [
        (sorted_lines[i + 1] - sorted_lines[i]) for i in range(len(sorted_lines) - 1)
    ]
    distances_mean = statistics.mean(distances_lines)
    result_lines = [0]
    for i in range(len(sorted_lines) - 1):
        if distances_lines[i] > distances_mean / 2:
            result_lines.append(sorted_lines[i])
    return result_lines


def get_text_lines(result_lines, model_response):
    text_lines = []
    for i in range(len(result_lines) - 1):
        y0 = result_lines[i]
        y1 = result_lines[i + 1]

        text_lines.append(
            [
                m
                for m in model_response
                if m["corners"][0][1] >= y0 and m["corners"][0][1] <= y1
            ]
        )

    return text_lines


def generate_text(model_response, filtered_corners, predictions) -> str:
    if len(model_response) == 0 or len(filtered_corners) == 0 or len(predictions) == 0:
        return ""

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
        if len(stl) > 1 else 0
        for stl in sorted_text_lines
    ]
    sentences_word_list = []
    result_text = ""
    for i in range(len(sorted_text_lines)):
        sentence = sorted_text_lines[i]
        mean_space = mean_spaces_between_chars[i]
        sent = []
        word = []
        for i in range(len(sentence) - 1):
            word.append(sentence[i])
            if (
                abs(sentence[i]["corners"][2][0] - sentence[i + 1]["corners"][0][0])
                > mean_space
            ):
                sent.append(word)
                word = []
        if sentence != []:        
            word.append(sentence[-1])
        if word:
            sent.append(word)
        sentences_word_list.append(sent)

    text_lines = []
    for line in sentences_word_list:
        sentence = []
        for word in line:
            w, p = get_word_variants(word)
            best_word = candicates_selector.select_candidate(w)
            sentence.append(best_word)
        text_lines.append(sentence)

    result_text = "\n".join([" ".join(l) for l in text_lines])

    return result_text


s3 = boto3.resource("s3")



def main(event, context):
    d = event.get("detail")
    b = d.get("bucket")
    bucket = b.get("name")
    o = d.get("object")
    key = o.get("key")
    print(f"{bucket}/{key}: init...")
    if not re.match(re.compile(r'\bbooks/.*/pages/.*\.json\b'), key):
        print("File:", key)
        return

    if bucket != ml_bucket_name:
        print(bucket)
        return

    obj = s3.Object(bucket, key)
    data = json.loads(obj.get()["Body"].read())
    model_response = data.get("data")

    filtered_corners = [m.get("corners") for m in model_response]
    predictions = [(m.get("letter"), m.get("confidence")) for m in model_response]
    result_text = generate_text(model_response, filtered_corners, predictions)

    new_key = f"{key.rsplit('.', 1)[0]}.txt"
    object = s3.Object(ml_bucket_name, new_key)

    print(f"{ml_bucket_name}/{new_key}: saving...")
    object.put(Body=result_text, ContentType='text/plain; charset=utf-8')
