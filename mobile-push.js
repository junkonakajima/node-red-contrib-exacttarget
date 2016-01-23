module.exports = function(RED) {
  var ET_Client = require('fuelsdk-node');

  function MobilePush(config) {
    RED.nodes.createNode(this,config);
    var etConfig = RED.nodes.getNode(config.etConfig);

    var node = this;
    this.on('input', function(msg) {
      var client = new ET_Client(etConfig.credentials.clientId, etConfig.credentials.clientSecret, etConfig.credentials.stack);

      var body = {};
      var subscriberKeys = msg.subscriberKeys ? msg.subscriberKeys : config.subscriberKeys.split(',');
      var deviceTokens =  msg.deviceTokens ? msg.deviceTokens : config.deviceTokens.split(',');
      if (subscriberKeys.length > 0) {
        body.SubscriberKeys = subscriberKeys;
      } else if (deviceTokens.length > 0) {
        body.DeviceTokens = deviceTokens;
      }

      var messageText = msg.payload ? msg.payload : config.messageText;
      if (messageText && messageText != '') {
        body.MessageText = messageText;
        body.Override = true;
      }
      var messageId = msg.messageId ? msg.messageId : config.messageId;
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
