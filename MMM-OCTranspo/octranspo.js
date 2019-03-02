Module.register('oc-test', {

    scheduledTimer: -1,

    defaults: {
        appID: '9fc072f0',
        apiID: '5434c70b0ded082b2b35cd033ec52301',
        refreshInterval: (1000*60)/4, // refresh every 15s
        timeFormat: 'HH:mm',
        debug: true,
        stopNo: 3002,
        routeNo: 61,
        displayMode: 'default',

        busInfo: [{
            stopNo: 3002,
            routeNo: 97,
            direction: null,
        }, {
            stopNo: 3001,
            routeNo: 85,
            direction: null,
        }, {
            stopNo: 2487,
            routeNo: 7,
            direction: null,
        }],
    },

    start: function() {
        Log.info("Starting module: " + this.name);

        if (this.config.debug) {
            Log.info("Sending Notif to Node Helper.");
        }

        if (this.config.refreshInterval < (1000*60)/4) { // refresh no quicker than 15s
            this.config.refreshInterval = (1000*60)/4;
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

        if (!this.stops) {
            wrapper.innerHTML = this.translate("NODATA");
            return wrapper;
        }

        for (var stop in this.stops) {
            var table = document.createElement("table");

            if (this.config.displayMode === "default") {
                var row = document.createElement("tr");
                var stopHeader = document.createElement("th");
                var scheduleHeader = document.createElement("th");
                var gpsHeader = document.createElement("th");

                scheduleHeader.innerHTML = "Schedule";
                gpsHeader.innerHTML = "GPS";
                stopHeader.innerHTML = this.stops[stop][0].StopLabel;

                row.appendChild(stopHeader);
                row.appendChild(scheduleHeader);
                row.appendChild(gpsHeader);


                table.appendChild(row);
                wrapper.appendChild(table);

                for (var trip in this.stops[stop]) {
                    var tripRow = document.createElement("tr");
                    var currentDeparture = this.stops[stop][trip];

                    var departure = document.createElement("td");

                    departure.innerHTML = currentDeparture.RouteNo + " - " + currentDeparture.TripDestination;

                    var scheduled = document.createElement("td");
                    var gps = document.createElement("td");


                    if (currentDeparture.AdjustmentAge == -1) { // No GPS adjusted time found
                        scheduled.innerHTML = moment().add(currentDeparture.AdjustedScheduleTime, 'minutes').format('hh:mm A');
                        gps.innerHTML = "--";
                    } else { // GPS adjusted time found
                        gps.innerHTML = moment().add(currentDeparture.AdjustedScheduleTime, 'minutes').format('hh:mm A');
                        scheduled.innerHTML = "--";
                    }

                    tripRow.appendChild(departure);
                    tripRow.appendChild(scheduled);
                    tripRow.appendChild(gps);
                    table.appendChild(tripRow);
                }
                wrapper.appendChild(table);
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
    processData: function(stopArr) {
        if (!stopArr) {
            Log.error(this.name + ": Could not parse bus times.");
            return;
        }

        if (this.config.debug) {
            Log.info(this.name + ": Processing bus data.");
        }

        this.stops = [];
        var departures = [];

        for (var stop in stopArr) {
            if (!Array.isArray(stopArr[stop].Route.RouteDirection)) {
                for (var trip in stopArr[stop].Route.RouteDirection.Trips.Trip) {
                    departures.push({
                        StopNo: stopArr[stop].StopNo,
                        StopLabel: stopArr[stop].StopLabel,
                        RouteNo: stopArr[stop].Route.RouteDirection.RouteNo,
                        TripDestination: stopArr[stop].Route.RouteDirection.Trips.Trip[trip].TripDestination,
                        AdjustedScheduleTime: stopArr[stop].Route.RouteDirection.Trips.Trip[trip].AdjustedScheduleTime,
                        BusType: stopArr[stop].Route.RouteDirection.Trips.Trip[trip].BusType,
                        AdjustmentAge: stopArr[stop].Route.RouteDirection.Trips.Trip[trip].AdjustmentAge
                    });
                }
                this.stops.push(departures);
                departures = [];
            } else {
                if (this.config.busInfo[stop].direction === null || this.config.busInfo[stop].direction > 1 || this.config.busInfo[stop].direction < 0) {
                    Log.error("Please specify a direction");
                    Log.error(stopArr[stop].Route.RouteDirection[0].Direction + ": 0");
                    Log.error(stopArr[stop].Route.RouteDirection[1].Direction + ": 1");
                } else {
                    for (var trip in bus.Route.RouteDirection[this.config.busInfo[stop].direction].Trips.Trip) {
                        departures.push({
                            StopNo: stopArr[stop].StopNo,
                            StopLabel: stopArr[stop].StopLabel,
                            RouteNo: stopArr[stop].Route.RouteDirection[this.config.direction].RouteNo,
                            TripDestination: stopArr[stop].Route.RouteDirection[this.config.direction].Trips.Trip[trip].TripDestination,
                            AdjustedScheduleTime: stopArr[stop].Route.RouteDirection[this.config.direction].Trips.Trip[trip].AdjustedScheduleTime,
                            BusType: stopArr[stop].Route.RouteDirection[this.config.direction].Trips.Trip[trip].BusType,
                            AdjustmentAge: stopArr[stop].Route.RouteDirection[this.config.direction].Trips.Trip[trip].AdjustmentAge
                        });
                    }
                    this.stops.push(departures);
                    departures = [];
                }
            }
        }

        this.loaded = true;
        this.updateDom();
        Log.info(this.stops);
    },

    sortStops: function() {

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
