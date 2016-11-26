#!/bin/bash

CTYPE="content-type:application/json"
URL='http://localhost:15672/api'

curl -i -u guest:guest -H $CTYPE -XDELETE $URL/vhosts/samtests
