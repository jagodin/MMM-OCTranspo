# Simple wrapper for OC Transpo API

## About

This is an extremely simple wrapper for OC Transpo's API. Supports v1.2 of the API.

## Usage
```javascript
// Require the module
var Octranspo = require('octranspo');

// Initialize
var octranspo = new Octranspo({
    appID: 'your-app-id',
    apiKey: 'your-api-key'
});

// Retrieve the route summary for a stop 
octranspo.getRouteSummaryForStop('3011', function(err, result) {
    console.log(result);
});

// Retrieve the next 3 trips for route at a stop
octranspo.getNextTripsForStop('97', '3011', function(err, result) {
    console.log(result);
});

// Retrieve the next 3 trips for all routes at a stop
octranspo.getNextTripsForStopAllRoutes('3011', function(err, result) {
    console.log(result);
});

