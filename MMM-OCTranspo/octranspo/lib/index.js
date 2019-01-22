var octranspoUrl = 'https://api.octranspo1.com';
var apiVer = '/v1.2';

var routeSummary = '/GetRouteSummaryForStop';
var nextTrips = '/GetNextTripsForStop';
var nextTripsAllRoutes = '/GetNextTripsForStopAllRoutes';

var routeSummaryResult = 'GetRouteSummaryForStopResult';
var nextTripsResult = 'GetNextTripsForStopResult';
var nextTripsAllRoutesResult = 'GetRouteSummaryForStopResult';

var errorBadStop = '10';
var errorBadRoute = '11';
var errorStopNotOnRoute = '12';

var request = require('request');

var Octranspo = module.exports = function(options) {
    this.options = options || {};
}

Octranspo.prototype.getRouteSummaryForStop = function(stopNo, callback) {
    var data = {
        appID: this.options.appID,
        apiKey: this.options.apiKey,
        stopNo: stopNo,
        format: 'json'
    };
    
    getData(routeSummary, routeSummaryResult, data, callback);
}

Octranspo.prototype.getNextTripsForStop = function(routeNo, stopNo, callback) {
    var data = {
        appID: this.options.appID,
        apiKey: this.options.apiKey,
        routeNo: routeNo,
        stopNo: stopNo,
        format: 'json'
    };
    
    getData(nextTrips, nextTripsResult, data, callback);
}

Octranspo.prototype.getNextTripsForStopAllRoutes = function(stopNo, callback) {
    var data = {
        appID: this.options.appID,
        apiKey: this.options.apiKey,
        stopNo: stopNo,
        format: 'json'
    };
    
    getData(nextTripsAllRoutes, nextTripsAllRoutesResult, data, callback);
}

function getData(resource, resultName, data, callback) {
    request.post(buildUrl(resource), function(error, response, body) {
        if(error) {
            callback(error);
        } else {
            try {
                
                var result = JSON.parse(body);
                if(resultName) {
                    result = result[resultName];
                }
                
                if(result.Error) {
                    callback(getErrorMsg(result.Error));
                } else {
                    callback(error, result);
                }
            } catch(e) {
                callback("Failed to parse response", body);
            }
        }
    }).form(data);
}

function getErrorMsg(code) {
    if(code === errorBadStop) {
        return 'Invalid stop number';
    } else if(code === errorBadRoute) {
        return 'Invalid route number';
    } else if(code === errorStopNotOnRoute) {
        return 'Stop does not service route';
    }
    return 'Unknown Error (' + code + ')';
}
    
function buildUrl(resource) {
    return octranspoUrl + apiVer + resource;
}