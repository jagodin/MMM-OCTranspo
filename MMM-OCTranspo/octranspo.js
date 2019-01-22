Module.register("octranspo",{

    defaults: {
        appID: "some appID",
        apiID: "some apiID",
        refreshInterval: (1000*60)/2, // refresh every 30s
        timeFormat: "HH:mm",
        debug: false

        // TODO: Color/Format Defaults
    },

    getScripts: function() {
        return ["moment.js"];
    },

    getStyles: function() {
        return ["octranspo.css"];
    },

    getTranslations: function() {
        return {
            en: "translations/en.json",
            fr: "translations/fr.json"
        }
    },

    // Start module
    start: function() {
        Log.info("Starting module: " + this.name);

        // Set locale
        moment.locale(config.language);
    },

    // Disable refreshing
    suspend: function() {

    },

    // Enable interval refreshing
    resume: function() {

    },

    getDom: function () {
        var wrapper = document.createElement("div");

        var table = document.createElement("table");
    },

    processData: function(data) {

    },

    requestData: function () {
        this.loaded = false;
        this.updateDom();

        this.sendSocketNotification('GETDATA', this.config);
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "RESPONSE") {
            this.loaded = true;
            this.processData(payload);
        }
    }

});