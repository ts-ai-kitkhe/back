#!/bin/bash

./seed_s3_remove.sh
yarn workspace core sls invoke local -f booksSeederRemove
