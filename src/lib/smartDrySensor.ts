import { Logger } from 'homebridge';
import { RequestedAccessory } from './requestedAccessory';
import { SensorConfig, SmartDryConfig } from './smartDryConfigDataTypes';
import { SmartDryConstants } from './smartDryConstants';
import { SmartDryService } from './smartDryService';

export class SmartDrySensor {

  public SmartDryService: SmartDryService;

  private constructor(
        public Name: string,
        public Id: string,
        public RequestedAccessories: RequestedAccessory[],
        private log: Logger,
  ) {
    this.SmartDryService = new SmartDryService(this.Id, this.log);
  }

  static create(log: Logger, config: SmartDryConfig): SmartDrySensor | undefined {

    if (config.id === undefined) {
      return undefined;
    }

    if (config.name === undefined) {
      return undefined;
    }

    const id = config.id;
    const name = config.name;
    const requestedAccessories = this.buildRequestedAccessories(config);

    return new SmartDrySensor(name, id, requestedAccessories, log);
  }

  private static buildRequestedAccessories(config: SmartDryConfig): RequestedAccessory[] {

    const requestedAccessories: RequestedAccessory[] = [];

    const occupancySensor = this.getRequestedSensor(RequestedAccessory.OCCUPANCY, config.occupancySensor);
    if (occupancySensor !== undefined) {
      requestedAccessories.push(occupancySensor);
    }

    const temperatureSensor = this.getRequestedSensor(RequestedAccessory.TEMPERATURE, config.temperatureSensor);
    if (temperatureSensor !== undefined) {
      requestedAccessories.push(temperatureSensor);
    }

    const humiditySensor = this.getRequestedSensor(RequestedAccessory.HUMIDITY, config.humiditySensor);
    if (humiditySensor !== undefined) {
      requestedAccessories.push(humiditySensor);
    }

    const leakSensor = this.getRequestedSensor(RequestedAccessory.LEAK, config.leakSensor);
    if (leakSensor !== undefined) {
      requestedAccessories.push(leakSensor);
    }

    return requestedAccessories;
  }

  private static getRequestedSensor(defaultAccessory: RequestedAccessory, sensorConfig?: SensorConfig): RequestedAccessory | undefined {

    // If not configured add sensor
    if (sensorConfig === undefined) {
      return defaultAccessory;
    }

    if (!this.getBooleanValue(sensorConfig.isEnabled)) {
      return undefined;
    }

    return defaultAccessory;
  }

  private static getBooleanValue(configBooleanValue?: boolean) {

    if (configBooleanValue === undefined) {
      return SmartDryConstants.DEFAULT_BOOLEAN_CONFIG_VALUE;
    }

    return configBooleanValue;
  }
}
