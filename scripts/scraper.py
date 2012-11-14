#!/usr/bin/python

import json
import string
import pollster
import pickle

with open("states.json", "r") as states_file:
   states = json.loads(states_file.read())

polls = pollster.Pollster()

data = {} 

for state in states['features']:
   # grab the name, skip states for which we do not have any data
   name = state['properties']['name']
   if (name == "District of Columbia"
       or name == "Alaska"
       or name == "Delaware"
       or name == "Wyoming"
       or name == "Puerto Rico"):
      continue
   
   slug = "2012-" + name.lower().replace(' ', '-') + "-president-romney-vs-obama"
   chart = polls.chart(slug)
   data[name] = chart.estimates_by_date()

with open("poll_data", "w") as data_file:
   pickle.dump(data, data_file)

