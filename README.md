# homebridge-smartdry

## What This Plugin Is
This is a plugin for [homebridge](https://github.com/homebridge/homebridge). It provides sensor data from the [SmartDry Sensor](https://www.connectedlifelabs.com/meetsmartdry).

## How the Plugin Works
SmartDry data is stored in AWS RDS. This API periodically queries the database for information pertaining to your sensor and then updates
virtual sensors with the data.

The `Occupancy Sensor` will stay `Occupied` as long as the sensor is running. The minimum amount of time is 15 minutes. To automate an
action (such as sending a notification), you can put an action on when the sensor stops detecting occupancy.

The `Leak Sensor` will show if the clothes are truly dry. This runs external to the load time. So it is theoretically possible for the
SmartDry sensor to not be "running" but the clothes are still wet. **NOTE** The `Leak Sensor` uses Critical Alerts in modern versions of the
Home app. Please be careful when using it or you could generate scary notifications.

## Installation

Before installing this plugin, you should install Homebridge using the [official instructions](https://github.com/homebridge/homebridge/wiki).

### Install via Homebridge Config UI X
1. Search for `Homebridge SmartDry v2` on the Plugins tab of [Config UI X](https://www.npmjs.com/package/homebridge-config-ui-x).
2. Install the `Homebridge SmartDry v2` plugin and use the form to enter your configuration.

### Manual Installation
2. Install this plug-in using: `npm install -g homebridge-smartdry-v2`
3. Update your configuration file. See example `config.json` snippet below.
## Manual Configuration
### Platform Schema

| Field | Required | Data Type | Description                   | Default Value |
| ------| :------: | :--------: | ----------------------------- | :----------: |
| **platform** | *Yes* | string | Must always be set to `HomebridgeSmartDryV2`.| N/A |
| **name** | *Yes* | string | Set the platform name for display in the Homebridge logs. | `Homebridge SmartDry v2` |
| **sensors** | *Yes* | sensor[] | An array of configurations for SmartDry sensors. | N/A |
| **pollingSeconds**| No | number | Time in seconds for how often to ping the clock. | `30` (30000 milliseconds) |

#### Sensor Schema

| Field | Required | Data Type | Description                   | Default Value |
| ------| :------: | :-------: | ----------------------------- | :-----------: |
| **name** | *Yes* | string | The name of the SmartDry Sensor. It will be used as a prefix for all of the accessories it exposes. | N/A |
| **ip** | *Yes* | string | ID of the SmartDry sensor. | N/A |
| **occupancySensor** | *Yes* | sensorConfig | Settings for virtual occupancy sensor. | N/A |
| **temperatureSensor** | *Yes* | sensorConfig | Settings for virtual temperature sensor. | N/A |
| **humiditySensor** | *Yes* | sensorConfig | Settings for the virtual humidity sensor. | N/A |
| **leakSensor** | *Yes* | sensorConfig | Settings for the virtual leak sensor. | N/A |

##### SensorConfig Schema

| Field | Required | Data Type | Description                   | Default Value |
| ------| :------: | :-------: | ----------------------------- | :-----------: |
| **isEnabled** | No | boolean | Determines whether or not to expose the sensor. | `true` |

### Config Examples

#### Simplest Configuration

This configuration will expose all items and use the default polling interval with the least work.

```json
{
  "name": "Homebridge SmartDry v2",
  "sensors": [
    {
      "name": "Laundry Room Dryer",
      "id": "[INSERT_ID_HERE]"
    }
  ],
  "platform": "HomebridgeSmartDryV2"
}
```

#### Most Verbose Configuration

This configuration will expose all items with default values, but is very verbose. It is presented here to help visualize the JSON structure.


```json
{
  "name": "Homebridge SmartDry v2",
  "sensors": [
    {
      "name": "Laundry Room Dryer",
      "id": "[INSERT_ID_HERE]",
      "occupancySensor": {
        "isEnabled": true
      },
      "temperatureSensor": {
        "isEnabled": true
      },
      "humiditySensor": {
        "isEnabled": true
      },
      "leakSensor": {
        "isEnabled": true
      }
    }
  ],
  "platform": "HomebridgeSmartDryV2"
}
```
## Future Plans
- Better error handling. I am a Java developer by trade and am still learning Typescript :).

## Recognition
Thanks to:

* [homebridge](https://github.com/homebridge/homebridge-plugin-template) - For creating a great template to get started with.
* [ablyler](https://github.com/ablyler/homebridge-smartdry) - For creating an original SmartDry plugin.
* [doublebishop](https://community.home-assistant.io/t/clothes-dryer-automations/149017/76) - For simplifying the "wetness" algorithm.
