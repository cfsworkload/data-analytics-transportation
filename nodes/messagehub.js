/**
 * Created by fwang1 on 3/25/15.
 */
module.exports = function(RED) {
  /*
   *   MessageHub Producer
   */
  function MessageHubProducer(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    var opts = {};
	   
    if (process.env.VCAP_SERVICES) {
    // Running in Bluemix
    var Kafka = require('node-rdkafka-prebuilt');
    node.log("Running in Bluemix mode.");

    var services = JSON.parse(process.env.VCAP_SERVICES);
    for (var key in services) {
        if (key.lastIndexOf('messagehub', 0) === 0) {
            messageHubService = services[key][0];
            opts.brokers = messageHubService.credentials.kafka_brokers_sasl;
            opts.username = messageHubService.credentials.user;
            opts.password = messageHubService.credentials.password;
        }
    }
	opts.calocation = '/etc/ssl/certs';
    //var Kafka = require('node-rdkafka');

    var apikey = config.apikey;
    var kafka_rest_url = config.kafkaresturl;
    //opts.username = apikey.substring(0,16);
    //opts.password = apikey.substring(16);
	    
    var driver_options = {
        //'debug': 'all',
        'metadata.broker.list': opts.brokers,
        'security.protocol': 'sasl_ssl',
        'ssl.ca.location': opts.calocation,
        'sasl.mechanisms': 'PLAIN',
        'sasl.username': opts.username,
        'sasl.password': opts.password,
	'client.id': 'kafka-producer'
    };

	var producer = new Kafka.Producer(driver_options);
	  
	var topic = config.topic;
	    
	
	
	producer.on('ready', function() {
		node.warn("producer established connection successfully.. ");
	});
	

    this.on("input", function(msg) {
		
		var payloads = [];
        payloads.push(msg.payload);
		payloads.forEach(function (msg) { 
			try {
				var message = new Buffer(JSON.stringify(msg));
				producer.produce(topic, null, message); 
         			node.log(message);
			} catch(e) {
			node.log('A problem occurred when sending our message');
    			node.error(e);
    		}
		}); 
      });
   
	  
	producer.on('error', function(err) {
  		node.error('Error from producer - possible connection failure');
  		node.error(err);
	});
	  
	node.warn("producer trying to connect.. ");
	node.log("username: " + opts.username);
	node.log("password: " + opts.password);
	 node.log("brokers: " + opts.brokers);
	producer.connect();
	 } else { node.error("cant find vcap");}
  }
  
  RED.nodes.registerType("messagehub out 2", MessageHubProducer);
  

  /*
   * Message Hub Consumer
   */
  function MessageHubConsumer(config) {
    RED.nodes.createNode(this,config);
    var node = this;
    var opts = {};
	// Running in Bluemix
    var Kafka = require('node-rdkafka-prebuilt');
    console.log("Running in Bluemix mode.");

    var services = JSON.parse(process.env.VCAP_SERVICES);
    for (var key in services) {
        if (key.lastIndexOf('messagehub', 0) === 0) {
            messageHubService = services[key][0];
            opts.brokers = messageHubService.credentials.kafka_brokers_sasl;
            opts.username = messageHubService.credentials.user;
            opts.password = messageHubService.credentials.password;
        }
    }
	opts.calocation = '/etc/ssl/certs';
	  
	  
	var driver_options = {
        //'debug': 'all',
        'metadata.broker.list': opts.brokers,
        'security.protocol': 'sasl_ssl',
        'ssl.ca.location': opts.calocation,
        'sasl.mechanisms': 'PLAIN',
        'sasl.username': opts.username,
        'sasl.password': opts.password,
	'client.id': 'kafka-consumer',
	'group.id': 'kafka-consumer-group'
    };
	  
    var apikey = config.apikey;
    var kafka_rest_url = config.kafkaresturl;
    
    var consumer  = new Kafka.KafkaConsumer(driver_options); 
    var consumedMessages = []   
    var topic = config.topic;
	
	  consumer.on('ready', function() {
		node.warn("consumer established connection successfully.. ");
		node.warn("consumer subscribed to topic:" + topic);
		consumer.consume([topic]);
	});
	  
    consumer.on('error', function(err) {
  		node.error('Error from consumer - possible connection failure');
  		node.error(err);
	});
	  
	
	  
    	consumer.on('data', function(m) {
		node.log(m.value.toString());
		node.send({payload: m.value.toString()});
	});
	  
	node.warn("consumer trying to connect.. "); 
	consumer.connect();  
  }

  RED.nodes.registerType("messagehub in 2", MessageHubConsumer);
}
