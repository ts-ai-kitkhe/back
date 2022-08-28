#!/bin/bash

./sync_s3_data.sh

yarn workspace core sls invoke local -f booksSeeder