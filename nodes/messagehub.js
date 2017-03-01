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
	   
	if (process.env.VCAP_SERVICES) {
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
    //var Kafka = require('node-rdkafka');

    var apikey = config.apikey;
    var kafka_rest_url = config.kafkaresturl;
	
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
	node.log("producer trying to connect.. ");
	
	producer.on('ready', function() {
		node.log("producer established connection successfully.. ");
	});
	

    this.on("input", function(msg) {
		
		var payloads = [];
        payloads.push(msg.payload);
		payloads.forEach(function (msg) { 
			try {
				producer.produce(topic, null, "apple"); 
				node.log("message sent");
         		node.log(msg);
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
	  
    var topic = config.topic;
    var stream = consumer.getReadStream(topic);
	this.log("Consumer created...");
	try { 
    	stream.on('data', function(data) {
  		console.log('Got message');
  		console.log(data.message.toString());
		node.send({payload: data});	
		});
	} catch(e) {
      node.error(e);
      return;
    }
	stream.on('error', function (err) {
    	console.error('Error in our kafka stream');
  		console.error(err);
	});
  }

  RED.nodes.registerType("messagehub in 2", MessageHubConsumer);
}
