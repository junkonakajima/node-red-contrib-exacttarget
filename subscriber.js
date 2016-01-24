module.exports = function(RED) {
  var ET_Client = require('fuelsdk-node');

  function DataExtension(config) {
    RED.nodes.createNode(this,config);
    var etConfig = RED.nodes.getNode(config.etConfig);

    var node = this;
    this.on('input', function(msg) {
      var options = {
        props: config.properties ? config.properties.split(',') : ['EmailAddress', 'SubscriberKey'],
        filter: {
          leftOperand: msg.conditionField ? msg.conditionField : config.conditionField,
          operator: msg.conditionOperator ? msg.conditionOperator : config.conditionOperator,
          rightOperand: msg.conditionValue ? msg.conditionValue : config.conditionValue,
        }
      };

      var client = new ET_Client(etConfig.credentials.clientId, etConfig.credentials.clientSecret, etConfig.credentials.stack);

      var subscriber = client.subscriber(options);
      subscriber.get(function(err,response) {
        if (err) {
          node.error(err, {
            payload: JSON.parse(JSON.stringify(err))
          });
        } else {
          node.send({
            payload: response.body.Results
          });
        }
      });
    });
  }
  RED.nodes.registerType("subscriber", DataExtension);
}
