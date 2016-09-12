#!/bin/bash

export PATH=/opt/ibm/java-x86_64-71/jre/bin/:$PATH

echo "getting secor and patching it"
git clone https://github.com/pinterest/secor.git
cp patch.diff ./secor
cd secor
git checkout bf0b6abef5c786345482da7579569e00081c6126
git apply --whitespace=nowarn --ignore-whitespace patch.diff
mvn package
cd ..
cp secor/target/lib/* lib/
cp secor/extraRes/messagehub.login-1.0.0.jar lib/
cp secor/target/secor-0.1-SNAPSHOT.jar secor-0.1-SNAPSHOT.jar
rm -rf secor
pkill -f 'org.apache.zookeeper.server.quorum.QuorumPeerMain'
sleep 2

echo "starting zookeeper"
scripts/run_kafka_class.sh \
            org.apache.zookeeper.server.quorum.QuorumPeerMain zookeeper.test.properties > \
            logs/zookeeper.log 2>&1 &
sleep 2
sudo java -ea -Dsecor_group=secor_backup -Dlog4j.configuration=log4j.prod.properties -Dlog4j.debug=true -Dconfig=secor.prod.partition.properties -Djava.security.auth.login.config=jaas.conf -cp secor-0.1-SNAPSHOT.jar:lib/* com.pinterest.secor.main.ConsumerMain > logs/secor.log 2>&1
