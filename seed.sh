#!/bin/bash

./seed_s3.sh
yarn workspace core sls invoke local -f booksSeeder