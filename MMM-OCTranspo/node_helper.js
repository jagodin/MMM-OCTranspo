const NodeHelper = require("node_helper");
var moment = require("moment");
var Octranspo = require('octranspo');


// Initialize octranspo API wrapper
var oc = new Octranspo({
    appID: this.config.appID, //'9fc072f0',
    apiKey: this.config.apiKey //'5434c70b0ded082b2b35cd033ec52301'
});

module.exports = NodeHelper.create({

    start: function(){
        this.running = false;
        this.config = null;
    },

    getData: function(){
        oc.getNextTripsForStop(this.config.routeNo, this.config.stopNo, function(err, result){
            if (err) {
                console.log(this.name + ": Could not connect to OC Transpo API.");
            } else {
                this.sendSocketNotification("RESPONSE", result);
            }
        })
    },

    socketNotificationReceived: function(notification, payload){
        if (notification === 'GETDATA' && this.running == false) {
            this.running = true;
            this.config = payload;
            this.getData();
        }
    },
});
