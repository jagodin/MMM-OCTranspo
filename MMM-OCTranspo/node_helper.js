var NodeHelper = require("node_helper");
var moment = require("moment");
var Octranspo = require('octranspo');

/* Initialize OC Transpo API wrapper
*
* To get appID and apiKey, visit
* http://www.octranspo.com/developers/submit_an_octranspo_app
*
* */
var oc = new Octranspo({
    appID: '9fc072f0',
    apiKey: '5434c70b0ded082b2b35cd033ec52301'
});

module.exports = NodeHelper.create({

    start: function(){
        console.log('oc-test: Starting node_helper')
    },

    getData: function() {
        var self = this;

        oc.getNextTripsForStop(self.config.routeNo, self.config.stopNo, function(err, result){
            if (err) {
                console.log(err);
                console.log("Stop No: " + self.config.stopNo + "\n"
                    + "Route No: " + self.config.routeNo);
            } else {
                if (self.config.debug) {
                    console.log("Sending notif back to module.");
                    console.log(result);
                }
                self.sendSocketNotification('RESPONSE', result);
            }
        });
    },

    socketNotificationReceived: function(notification, payload){
        if (notification === 'GETDATA') {
            this.config = payload;

            if (this.config.debug) {
                console.log("Notif receieved. Getting data from OC API.");
            }

            this.getData();
        }
    }
});