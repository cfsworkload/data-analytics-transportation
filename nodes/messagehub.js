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
    var Kafka = require('node-rdkafka');

    //var apikey = config.apikey;
	var apikey = 'cUPJxFvxGe6ff4GpSG4TgKCn8WIWAGkZAV7SwuacfZqOwXZD';
    var kafka_rest_url = config.kafkaresturl;
	var user = apikey.substring(0,16);
	var pass = apikey.substring(16);

	var producer = new Kafka.Producer({
		'client.id': 'producer',
  		'metadata.broker.list': 'kafka01-prod01.messagehub.services.us-south.bluemix.net:9093,kafka02-prod01.messagehub.services.us-south.bluemix.net:9093,kafka03-prod01.messagehub.services.us-south.bluemix.net:9093,kafka04-prod01.messagehub.services.us-south.bluemix.net:9093,kafka05-prod01.messagehub.services.us-south.bluemix.net:9093',
		'security.protocol': 'sasl_ssl',
		'sasl.mechanisms': 'PLAIN',
		'ssl.ca.location': '/etc/ssl/certs',
		'sasl.username': user,
		'sasl.password': pass
	});
	  
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
  }
  
  RED.nodes.registerType("messagehub out", MessageHubProducer);
  

  /*
   * Message Hub Consumer
   */
  function MessageHubConsumer(config) {
    RED.nodes.createNode(this,config);

    var node = this;
    var Kafka = require('node-rdkafka');
    var apikey = config.apikey;
    var kafka_rest_url = config.kafkaresturl;
    
	var consumer  = new Kafka.KafkaConsumer({
		'client.id': 'consumer',
  		'group.id': 'consumer',
		'metadata.broker.list': kafka_rest_url,
		'security.protocol': 'sasl_ssl',
		'sasl.mechanisms': 'PLAIN',
		//'ssl.cipher.suites': 'TLSv1.2',
		'ssl.ca.location': '/etc/ssl/certs',
		'sasl.username': 'cUPJxFvxGe6ff4Gp',
		'sasl.password': 'SG4TgKCn8WIWAGkZAV7SwuacfZqOwXZD'
	},{}); 
	  
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

  RED.nodes.registerType("messagehub in", MessageHubConsumer);
}
