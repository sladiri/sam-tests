#!/bin/bash

CTYPE="content-type:application/json"
URL="http://localhost:15672/api"
ADMIN="guest"
VHOST="samtests"

curl -i -u $ADMIN:$ADMIN -H $CTYPE -XPUT $URL/vhosts/$VHOST
curl -i -u $ADMIN:$ADMIN -H $CTYPE -XPUT -d'{"configure":".*","write":".*","read":".*"}' $URL/permissions/$VHOST/$ADMIN
curl -i -u $ADMIN:$ADMIN -H $CTYPE -XPUT -d'{"pattern":".*","apply-to":"queues","definition":{"max-length":3}}' $URL/policies/$VHOST/queuelimit

OPTS='{"durable":false}'
DEST="queues"
# curl -i -u $ADMIN:$ADMIN -H $CTYPE -XPUT -d$OPTS $URL/$DEST/$VHOST/actions
# curl -i -u $ADMIN:$ADMIN -H $CTYPE -XPUT -d$OPTS $URL/$DEST/$VHOST/propose
# curl -i -u $ADMIN:$ADMIN -H $CTYPE -XPUT -d$OPTS $URL/$DEST/$VHOST/model
# curl -i -u $ADMIN:$ADMIN -H $CTYPE -XPUT -d$OPTS $URL/$DEST/$VHOST/state
# curl -i -u $ADMIN:$ADMIN -H $CTYPE -XPUT -d$OPTS $URL/$DEST/$VHOST/state_representation
# curl -i -u $ADMIN:$ADMIN -H $CTYPE -XPUT -d$OPTS $URL/$DEST/$VHOST/render

curl -i -u $ADMIN:$ADMIN -H $CTYPE -XGET $URL/aliveness-test/$VHOST
