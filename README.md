# MMM-OCTranspo

`MMM-OCTranspo` is a module for the [MagicMirror](https://github.com/MichMich/MagicMirror) smart mirror project. It uses the OC Transpo API to display real-time estimated arrivals for specific OC Transpo stop and route numbers.

## Setup

### Clone Repository and Install Dependencies
1. `MagicMirror$ cd modules`
2. `modules$ git clone https://github.com/jagodin/MMM-OCTranspo`
3. `cd MMM-OCTranspo`
4. `npm install`

### Add the module to your MagicMirror `modules` array

```
{
  module: 'modules/MMM-OCTranspo',
  position: 'lower_third'
}
```

## Configuration

Obtain your OC Transpo API keys from [here](https://octranspo-new.3scale.net/signup).

```
defaults: {
  appID: 'YOUR_APP_ID',
  apiID: 'YOUR_API_ID',
  refreshInterval: (1000 * 60) / 8, 
  timeFormat: 'HH:mm',
  debug: true,
  stopNo: 3002,
  routeNo: 61,
  displayMode: 'default',

  busInfo: [
    {
        stopNo: 7659,
        routeNo: 1,
        direction: null
    }
  ]
}
```
