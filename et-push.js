module.exports = function(RED) {
    var ET_Client = require('fuelsdk-node');

    function MobilePush(config) {
        RED.nodes.createNode(this,config);
        var etConfig = RED.nodes.getNode(config.etConfig);

        this.default = {
            messageId: config.messageId,
            deviceTokens: config.deviceTokens,
            subscriberKey: config.subscriberKey,
            messageBody: config.messageBody,
        };

        var node = this;
        this.on('input', function(msg) {                
            var client = new ET_Client(etConfig.credentials.clientId, etConfig.credentials.clientSecret, etConfig.credentials.stack);
            var payload = msg.payload;

            var body = {
                'SubscriberKeys': payload.subscriberKeys ? payload.subscriberKeys : node.default.subscriberKeys.split(','),
                'DeviceTokens': payload.deviceTokens ? payload.deviceTokens : node.default.deviceTokens.split(',')
            };
            var messageBody = payload.messageBody ? payload.messageBody : node.default.messageBody;
            if (messageBody && messageBody != '') {
                body.MessageBody = messageBody;
                body.Override = true;
            }
            console.log(body);
            var messageId = payload.messageId ? payload.messageId : node.default.messageId;
            client.RestClient
                .post({
                    uri: '/push/v1/messageContact/' + messageId + '/send',
                    body: body,
                    json: true
                })
                .then(
                    function(response) {
                        node.send({
                            payload: response.body
                        });
                    }.bind(this)
                )
                .catch(
                    function(err) {
                        node.error(err, {
                            payload: JSON.parse(JSON.stringify(err))
                        });
                    }.bind(this)
                );
        });
    }
    RED.nodes.registerType("et-push", MobilePush);
}
