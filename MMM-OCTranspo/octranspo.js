Module.register('oc-test', {

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
        routeDirection: null, // 0 for Eastbound, 1 for Westbound, null for 1 direction
        displaymode: 'default'
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

        if (!this.loaded) {
            wrapper.innerHTML = this.translate("LOADING");
            return wrapper;
        }

        if (!this.departures.length) {
            wrapper.innerHTML = this.translate("NODATA");
            return wrapper;
        }

        var table = document.createElement("table");
        table.id = "someTable";
        table.className = "some class name";

        if (this.config.displaymode === "default") {
            var row = document.createElement("tr");
            var stopHeader = document.createElement("th");
            var scheduleHeader = document.createElement("th");
            var gpsHeader = document.createElement("th");

            scheduleHeader.innerHTML = this.translate("schedule");
            gpsHeader.innerHTML = "GPS";

            // Refactor for multiple stops
            stopHeader.innerHTML = this.departures[0].StopLabel;

            // stopHeader.className = "stop class name";
            // scheduleHeader.className = "scheduled class name";
            // gpsHeader.className = "gps class name";

            row.appendChild(stopHeader);
            row.appendChild(scheduleHeader);
            row.appendChild(gpsHeader);

            table.appendChild(row);


            var row = document.createElement("tr");

            // TODO: fix cells
            for (var i in this.departures) {
                var currentDeparture = this.departures[i];

                var departureRow = document.createElement("td");
                departureRow.innerHTML = currentDeparture.RouteNo + " - " + currentDeparture.TripDestination;

                var scheduleRow = document.createElement("td");
                if (currentDeparture.AdjustmentAge === -1) { // No GPS adjusted time found
                    scheduleRow.innerHTML = moment().add(currentDeparture.AdjustedScheduleTime, 'minutes').format('hh:mm A');
                } else { // GPS adjusted time found
                    scheduleRow.innerHTML = "--";
                }

                var gpsRow = document.createElement("td");
                if (currentDeparture.AdjustmentAge === -1) { // No GPS adjusted time found
                    gpsRow.innerHTML = "--";
                } else { // GPS adjusted time found
                    scheduleRow.innerHTML = moment().add(currentDeparture.AdjustedScheduleTime, 'minutes').format('hh:mm A');
                }

            }
        }

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


    // Process bus time JSON object into departures array
    processData: function(bus) {
        if (!bus) {
            Log.error(this.name + ": Could not parse bus times.");
            return;
        }

        if (this.config.debug) {
            Log.info(this.name + ": Processing bus data.");
        }

        this.departures = [];

        if (!Array.isArray(bus.Route.RouteDirection)) {
            for (var i in bus.Route.RouteDirection.Trips.Trip) {
                this.departures.push({
                    StopNo: bus.StopNo,
                    StopLabel: bus.StopLabel,
                    RouteNo: bus.Route.RouteDirection.RouteNo,
                    TripDestination:  bus.Route.RouteDirection.Trips.Trip[i].TripDestination,
                    AdjustedScheduleTime: bus.Route.RouteDirection.Trips.Trip[i].AdjustedScheduleTime,
                    BusType: bus.Route.RouteDirection.Trips.Trip[i].BusType,
                    AdjustmentAge: bus.Route.RouteDirection.Trips.Trip[i].AdjustmentAge
                });
            }
        } else {
            if (this.config.direction === null || this.config.direction > 1 || this.config.direction < 0) {
                Log.error("Please specify a direction");
                Log.error(bus.Route.RouteDirection[0].Direction + ": 0");
                Log.error(bus.Route.RouteDirection[1].Direction + ": 1");
            } else {
                for (var i in bus.Route.RouteDirection[this.config.direction].Trips.Trip) {
                    this.departures.push({
                        StopNo: bus.StopNo,
                        StopLabel: bus.StopLabel,
                        RouteNo: bus.Route.RouteDirection[this.config.direction].RouteNo,
                        TripDestination:  bus.Route.RouteDirection[this.config.direction].Trips.Trip[i].TripDestination,
                        AdjustedScheduleTime: bus.Route.RouteDirection[this.config.direction].Trips.Trip[i].AdjustedScheduleTime,
                        BusType: bus.Route.RouteDirection[this.config.direction].Trips.Trip[i].BusType,
                        AdjustmentAge: bus.Route.RouteDirection[this.config.direction].Trips.Trip[i].AdjustmentAge
                    });
                }
            }
        }

        this.loaded = true;
        this.updateDom();
        Log.info(this.departures);
    },


    // Receive data bus time JSON object from node helper
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
