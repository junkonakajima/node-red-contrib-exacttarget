module.exports = function(RED) {
    var ET_Client = require('fuelsdk-node');

    function MobilePush(config) {
        RED.nodes.createNode(this,config);
        var etConfig = RED.nodes.getNode(config.etConfig);

        this.default = {
            messageId: config.messageId,
            deviceTokens: config.deviceTokens,
            subscriberKeys: config.subscriberKeys,
            messageText: config.messageText,
        };

        var node = this;
        this.on('input', function(msg) {                
            var client = new ET_Client(etConfig.credentials.clientId, etConfig.credentials.clientSecret, etConfig.credentials.stack);
            var payload = msg.payload;

            var body = {};
            var subscriberKeys = payload.subscriberKeys ? payload.subscriberKeys : node.default.subscriberKeys.split(',');
            var deviceTokens =  payload.deviceTokens ? payload.deviceTokens : node.default.deviceTokens.split(',');
            if (subscriberKeys.length > 0) {
                body.SubscriberKeys = subscriberKeys;
            } else if (deviceTokens.length > 0) {
                body.DeviceTokens = deviceTokens;
            }

            var messageText = payload.messageText ? payload.messageText : node.default.messageText;
            if (messageText && messageText != '') {
                body.MessageText = messageText;
                body.Override = true;
            }
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
    RED.nodes.registerType("mobile-push", MobilePush);
}
