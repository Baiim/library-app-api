#!/bin/bash

echo "########### Waiting for primary ###########"
until mongo --host primary  --eval "printjson(db.runCommand({ serverStatus: 1}).ok)"
  do
    echo "########### Sleeping  ###########"
    sleep 5
  done


echo "########### Waiting for replica 01  ###########"
until mongo --host replica01 --eval "printjson(db.runCommand({ serverStatus: 1}).ok)"
  do
    echo "########### Sleeping  ###########"
    sleep 5
  done


echo "########### Waiting for replica 02  ###########"
until mongo --host replica02 --eval "printjson(db.runCommand({ serverStatus: 1}).ok)"
  do
    echo "########### Sleeping  ###########"
    sleep 5
  done

echo "########### All replicas are ready!!!  ###########"

echo "########### Setting up cluster config  ###########"

# echo "########### Getting replica set status  ###########"
# mongo --host primary -u root -p root --authenticationDatabase admin <<EOF
# rs.status()
# EOF
# echo "########### Initiating replica set ###########"
# mongo --host primary -u root -p root --authenticationDatabase admin <<EOF
# rs.initiate()
# EOF
# echo "########### Adding replica01 to replica set ###########"
# mongo --host primary -u root -p root --authenticationDatabase admin <<EOF
# rs.add("replica01:27017")
# EOF

# echo "########### Adding replica02 to replica set ###########"

# mongo --host primary -u root -p root --authenticationDatabase admin  <<EOF
# rs.add("replica02:27017")
# EOF

# echo "########### Getting replica set status again  ###########"
# mongo --host primary -u root -p root --authenticationDatabase admin  <<EOF
# rs.status();
# EOF
mongo --host primary -u root -p root --authenticationDatabase admin  <<EOF
var config = {
    "_id": "dbrs",
    "version": 1,
    "members": [
        {
            "_id": 1,
            "host": "primary:27017",
            "priority": 1
        },
        {
            "_id": 2,
            "host": "replica01:27017",
            "priority": 2
        },
        {
            "_id": 3,
            "host": "replica02:27017",
            "priority": 3
        }
    ]
};
rs.initiate(config, { force: true });
rs.status();

use libraryapp
db.createCollection('roles');
db.roles.insertMany([
    {
        'code': 0,
        'name': 'Super Admin',
        'description': 'User yang memiliki semua akses'
    },
    {
        'code': 1,
        'name': 'Admin',
        'description': 'User yang memiliki akses administrasi'
    },
    {
        'code': 2,
        'name': 'Member Perpustakaan',
        'description': 'User dengan akses terbatas'
    }
]);
EOF

echo "########### Stopping TEMP instance  ###########"
mongod --shutdown