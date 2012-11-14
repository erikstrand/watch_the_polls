#!/usr/bin/python

import pickle
import json

# only include data from this month and later months
month = 5

# load raw data
with open("poll_data", "r") as data_file:
   data = pickle.load(data_file)

# format data
new_data = {}
for state, stats in data.items():
   dates = {}
   for datum in stats:
      date = datum['date']
      if int( date.split('-')[1] ) < month:
         continue
      estimates = {}
      for estimate in datum['estimates']:
         estimates[estimate['choice']] = estimate['value']
      dates[date] = estimates
   new_data[state] = dates

# save json
file_name = "poll_data_" + str(month) + ".json"
with open(file_name, "w") as formatted_file:
   json.dump(new_data, formatted_file, sort_keys=True, indent=3)

