module.exports = function(RED) {
  var ET_Client = require('fuelsdk-node');

  function DataExtension(config) {
    RED.nodes.createNode(this,config);
    var etConfig = RED.nodes.getNode(config.etConfig);

    var node = this;
    this.on('input', function(msg) {
      var client = new ET_Client(etConfig.credentials.clientId, etConfig.credentials.clientSecret, etConfig.credentials.stack);  

      var customerKey = msg.customerKey ? msg.customerKey : config.customerKey;
      var options = {
        props: ['Name'],
        filter: {
          leftOperand: 'DataExtension.CustomerKey',
          operator: 'equals',
          rightOperand: customerKey
        }
      };  
      var deColumn = client.dataExtensionColumn(options);
      
      deColumn.get(function(err,response) {
        if (err) {
          res.status(500).send( err )
        } else {
          var statusCode =  response && response.res && response.res.statusCode ? response.res.statusCode : 200;
          var result = response && response.body ? response.body : response;
          var fields = [];
          for (var i = 0; i < response.body.Results.length; i++) {
            fields.push(response.body.Results[i].Name);
          }

          var options = {
            Name: customerKey,
            props: fields,
          };

          var leftOperand = msg.conditionField ? msg.conditionField : config.conditionField;
          var operator = msg.conditionOperator ? msg.conditionOperator : config.conditionOperator;
          var rightOperand = msg.conditionValue ? msg.conditionValue : config.conditionValue;
          if (leftOperand && operator && rightOperand) {
            options.filter = {
              leftOperand: leftOperand,
              operator: operator,
              rightOperand: rightOperand,
            };
          }
          
          var deRow = client.dataExtensionRow(options);
          deRow.get(function(err,response) {
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
        }
      }); 
      
    });
  }
  RED.nodes.registerType("data-extension", DataExtension);
}
