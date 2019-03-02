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

var resultArr = [];

module.exports = NodeHelper.create({

    start: function(){
        console.log('oc-test: Starting node_helper')
    },

    getData: function() {
        var self = this;

        return new Promise((resolve, reject) => {
            for (var i in self.config.busInfo) {
                oc.getNextTripsForStop(self.config.busInfo[i].routeNo, self.config.busInfo[i].stopNo, function (err, result) {
                    if (err) {
                        console.log(err);
                        console.log("Stop No: " + self.config.busInfo[i].stopNo + "\n"
                            + "Route No: " + self.config.busInfo[i].routeNo);
                        reject();
                    } else {
                        if (self.config.debug) {
                            console.log("Pushing result to resultArr.");
                        }
                        resultArr.push(result);
                    }
                });
            }
            resolve();
        });
    },

    socketNotificationReceived: function(notification, payload){
        var self = this;
        if (notification === 'GETDATA') {
            this.config = payload;

            if (this.config.debug) {
                console.log("Notif receieved. Getting data from OC API.");
            }

            this.getData().then(() => {
                self.sendSocketNotification('RESPONSE', resultArr);
                resultArr = [];
            }).catch(err => console.log(err));
        }
    }
});
