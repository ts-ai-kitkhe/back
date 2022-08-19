import numpy as np

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
