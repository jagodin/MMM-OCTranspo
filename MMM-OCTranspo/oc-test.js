Module.register('oc-test', {

    scheduledTimer: -1,

    defaults: {
        appID: '9fc072f0',
        apiID: '5434c70b0ded082b2b35cd033ec52301',
        refreshInterval: (1000*60)/4, // refresh every 15s
        timeFormat: 'HH:mm',
        debug: true,
        busInfo: null,
        stopNo: 3002,
        routeNo: 61,

        routeDirection: 0 // 0 for Eastbound, 1 for Westbound
    },

    start: function() {
        Log.info("Starting module: " + this.name);

        if(!Array.isArray(this.config.busInfo)) {
            this.config.busInfo = [];
        }

        if (this.config.debug) {
            Log.info("Sending Notif to Node Helper.");
        }

        this.resume();
        this.requestData();
    },

    resume: function() {
        if (this.scheduledTimer === -1) {
            if (this.config.debug) {
                Log.info(this.name + ": Scheduling updates.");
            }
            var self = this;
            this.scheduledTimer = setInterval(function () {
                self.requestData();
            }, this.config.refreshInterval);
        }
    },

    getDom: function() {
        var wrapper = document.createElement("div");

        wrapper.innerHTML = this.config.routeNo;
        return wrapper;
    },

    requestData: function () {
        this.loaded = false;
        this.updateDom();

        if (this.config.debug) {
            console.log(this.name + ": Requesting data from node_helper.js");
        }

        this.sendSocketNotification('GETDATA', this.config);
    },

    processData: function(payload) {
        if (!payload) {
            Log.error(this.name + ": Could not parse bus times.");
            return;
        }

        if (this.config.debug) {
            Log.info(this.name + ": Processing bus data.");
        }

        /*
        * Data to extract
        * routeNo - Direction
        * scheduled time - GPS adjusted time
        */

        // Push bus data to departures array
        // this.departures.push({
        //     RouteNo: bus.RouteNo,
        //     TripDestination: bus.TripDestination,
        //     StopLabel: bus.StopLabel,
        //     AdjustedScheduleTime: bus.AdjustedScheduleTime, // time in minutes until bus comes to stop
        //     BusType: bus.BusType
        // });

        this.departures = [];

        Log.info(payload);
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "RESPONSE") {
            this.loaded = true;
            if (this.config.debug) {
                Log.info("RESPONSE receieved");
                Log.info(payload);
            }
            this.processData(payload);
        }
    }
});