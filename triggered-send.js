module.exports = function(RED) {
    var ET_Client = require('fuelsdk-node');

    function TriggeredSend(config) {
        RED.nodes.createNode(this,config);
        var etConfig = RED.nodes.getNode(config.etConfig);

        this.default = {
            customerKey: config.customerKey,
            email: config.email,
            subscriberKey: config.subscriberKey,
            attributes: config.attributes
        };

        var node = this;
        this.on('input', function(msg) {
            var createAttributes = function(attributes) {
                var attributes = attributes ? attributes : {};
                if (typeof(attributes) === 'string' || attributes instanceof String) {
                    try {
                        attributes = JSON.parse(attributes);
                    } catch (e) {
                        node.error('Attributes is not valid JSON string');
                    }
                }
                var returnAttributes = [];
                for (var key in attributes) {
                    returnAttributes.push({
                        'Name': key,
                        'Value': attributes[key]
                    });
                }
                return returnAttributes;
            };

            var client = new ET_Client(etConfig.credentials.clientId, etConfig.credentials.clientSecret, etConfig.credentials.stack);                
            var payload = msg.payload;

            var options = {
                props: {
                    "TriggeredSendDefinition": {
                        "CustomerKey" : payload.customerKey ? payload.customerKey : node.default.customerKey
                    },
                    "Subscribers": [{
                        "EmailAddress" : payload.email ? payload.email : node.default.email,
                        "SubscriberKey" : payload.subscriberKey ? payload.subscriberKey : node.default.subscriberKey,
                        "Attributes" : createAttributes(payload.attributes ? payload.attributes : node.default.attributes)
                    }]
                }
            };

            var subscriber = options.props.Subscribers[0];
            if (!subscriber.EmailAddress) {
                var msg = 'EmailAddress is required';
                node.error(msg, {
                    payload: msg
                });
            }
            if (!subscriber.SubscriberKey) {
                var msg = 'SubscriberKey is required';
                node.error(msg, {
                    payload: msg
                });
            }

            var triggeredSend = client.triggeredSend(options);
            triggeredSend.send(function(err, response) {
                if (err) {
                    node.error(err, {
                        payload: JSON.parse(JSON.stringify(err))
                    });
                } else {
                    var statusCode = response && response.res && response.res.statusCode ? response.res.statusCode : 200;
                    var result = response && response.body ? response.body : response;
                    node.send({
                        payload: result
                    });
                }
            }); 
        });
    }
    RED.nodes.registerType("triggered-send", TriggeredSend);
}
