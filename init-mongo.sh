#!/bin/bash
mongosh ${MONGO_INITDB_DATABASE} --eval "
    var username = '${MONGO_INITDB_ROOT_USERNAME}', 
        password = '${MONGO_INITDB_ROOT_PASSWORD}', 
        database = '${MONGO_INITDB_DATABASE}';
    db = db.getSiblingDB(database);
    db.createUser({
        user: username,
        pwd: password,
        roles: [{ role: 'readWrite', db: database }]
    });
    db.createCollection('tags');
    db.createCollection('entries');
"