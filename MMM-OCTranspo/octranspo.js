Module.register('octranspo', {

    scheduledTimer: -1,

    defaults: {
        appID: '9fc072f0',
        apiID: '5434c70b0ded082b2b35cd033ec52301',
        refreshInterval: (1000*60), // refresh every 15s
        timeFormat: 'HH:mm',
        debug: true,
        busInfo: null,
        stopNo: 3002,
        routeNo: 61,
        routeDirection: null // 0 for Eastbound, 1 for Westbound, null for 1 direction
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

        var departures = [];
        var bus = payload;

        if (!Array.isArray(bus.Route.RouteDirection)) {
            for (var i in bus.Route.RouteDirection.Trips.Trip) {
                departures.push({
                    StopNo: bus.StopNo,
                    StopLabel: bus.StopLabel,
                    RouteNo: bus.Route.RouteDirection.RouteNo,
                    TripDestination:  bus.Route.RouteDirection.Trips.Trip[i].TripDestination,
                    AdjustedScheduleTime: bus.Route.RouteDirection.Trips.Trip[i].AdjustedScheduleTime,
                    BusType: bus.Route.RouteDirection.Trips.Trip[i].BusType
                })
            }
        } else {
            if (this.config.direction === null || this.config.direction > 1 || this.config.direction < 0) {
                Log.error("Please specify a direction");
                Log.error(bus.Route.RouteDirection[0].Direction + ": 0");
                Log.error(bus.Route.RouteDirection[1].Direction + ": 1");
            } else {
                for (var i in bus.Route.RouteDirection[this.config.direction].Trips.Trip) {
                    departures.push({
                        StopNo: bus.StopNo,
                        StopLabel: bus.StopLabel,
                        RouteNo: bus.Route.RouteDirection.RouteNo,
                        TripDestination:  bus.Route.RouteDirection.Trips.Trip[i].TripDestination,
                        AdjustedScheduleTime: bus.Route.RouteDirection.Trips.Trip[i].AdjustedScheduleTime,
                        BusType: bus.Route.RouteDirection.Trips.Trip[i].BusType
                    })
                }
            }
        }
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "RESPONSE") {
            this.loaded = true;
            if (this.config.debug) {
                Log.info("RESPONSE receieved");
            }
            this.processData(payload);
        }
    }
});