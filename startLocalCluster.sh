# ./bin/zookeeper-server-start.sh config/zookeeper.properties
# ./bin/kafka-server-start.sh config/server.properties
# ./bin/kafka-server-start.sh config/server-1.properties
# ./bin/kafka-server-start.sh config/server-2.properties
# ./bin/kafka-console-producer.sh --broker-list localhost:9092 --topic

KAFKA=${1:-~/kafka_2.12-2.3.0/}
topic=${2:-first}
cd "$KAFKA" || exit
echo in folder: $(pwd)
# BROKER1="${$3:-server}"
# BROKER2="${$4:-server-1}"
# BROKER3="${$5:-server-2}"

gnome-terminal --tab --title="zookeeper" --command="bash -c './bin/zookeeper-server-start.sh config/zookeeper.properties; $SHELL'" \
--tab --title="broker 1" --command="bash -c './bin/kafka-server-start.sh config/${3:-server}.properties; $SHELL'" \
--tab --title="broker 2" --command="bash -c './bin/kafka-server-start.sh config/${4:-server-1}.properties; $SHELL'" \
--tab --title="broker 3" --command="bash -c './bin/kafka-server-start.sh config/${5:-server-2}.properties; $SHELL'" \
--tab --title="create topic ${topic}" --command="bash -c './bin/kafka-topics.sh --create --bootstrap-server localhost:9092 --replication-factor 3 --partitions 3 --topic ${topic}'" \
--tab --title="consumer ${topic}" --command="bash -c './bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --from-beginning --topic ${topic}'" \
--tab --title="producer ${topic}" --command="bash -c './bin/kafka-console-producer.sh --broker-list localhost:9092 --topic ${topic}; $SHELL'"
