module.exports = function(RED) {
    function ExactTargetConfig(n) {
        RED.nodes.createNode(this,n);
        this.name = n.name;
        this.clientId = n.clientId;
        this.clientSecret = n.clientSecret;
        this.stack = n.stack;
    }
    RED.nodes.registerType(
        "exacttarget", 
        ExactTargetConfig,
        {
            credentials: {
                clientId: {type: "text"},
                clientSecret: {type: "password"},
                stack: {type: "text"}
            }
        }
    );
}