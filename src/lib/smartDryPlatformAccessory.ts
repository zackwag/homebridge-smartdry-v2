import { AccessoryPlugin, CharacteristicValue, Service } from 'homebridge';
import { SmartDryPlatform } from '../smartDryPlatform';
import { RequestedAccessory } from './requestedAccessory';
import { SmartDryConstants } from './smartDryConstants';
import { SmartDrySensor } from './smartDrySensor';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class SmartDryPlatformAccessory implements AccessoryPlugin {

  private informationService: Service;
  private hasGetError = false;
  private occupancyService: Service | undefined;
  private temperatureService: Service | undefined;
  private humidityService: Service | undefined;
  private leakService: Service | undefined;
  private isOccupied: boolean | undefined;
  private temperature: number | undefined;
  private humidity: number | undefined;
  private isWet: boolean | undefined;

  public name : string;

  constructor(
    private readonly platform: SmartDryPlatform,
    private readonly sensor: SmartDrySensor,
  ) {
    this.name = sensor.Name;

    // set accessory information
    this.informationService = new this.platform.Service.AccessoryInformation(this.name)
      .setCharacteristic(this.platform.Characteristic.Manufacturer, SmartDryConstants.INFORMATION_MANUFACTURER)
      .setCharacteristic(this.platform.Characteristic.Model, SmartDryConstants.INFORMATION_MODEL)
      .setCharacteristic(this.platform.Characteristic.SerialNumber, sensor.Id);

    if (sensor.RequestedAccessories.includes(RequestedAccessory.OCCUPANCY)) {
      this.registerOccupancyService();
    }

    if (sensor.RequestedAccessories.includes(RequestedAccessory.TEMPERATURE)) {
      this.registerTemperatureService();
    }

    if (sensor.RequestedAccessories.includes(RequestedAccessory.HUMIDITY)) {
      this.registerHumiditySensor();
    }

    if (sensor.RequestedAccessories.includes(RequestedAccessory.LEAK)) {
      this.registerLeakSensor();
    }
  }

  public async updateValues(): Promise<void> {

    await this.sensor.SmartDryService.getDeviceStates()
      .then(deviceStates => {
        if (deviceStates === undefined) {
          return;
        }

        const deviceState = deviceStates.find(d => d.name === this.sensor.Id);
        if (deviceState === undefined) {
          return;
        }

        this.updateOccupancy(this.isDryerRunning(deviceState.loadStart, deviceState.stDate));
        this.updateTemperature(deviceState.temperature);
        this.updateHumidity(deviceState.humidity);
        this.updateWetness(this.isLaundryWet(deviceState.humidity));
        this.hasGetError = false;
      }).catch(err => {
        this.platform.log.error(`Error -> Updating accessory=${this.name} err=${err}`);
        this.hasGetError = true;
      });
  }

  private async updateWetness(isWet: boolean): Promise<void> {

    if (this.leakService === undefined) {
      return;
    }

    if (isWet === this.isWet) {
      return;
    }

    this.isWet = isWet;
    this.leakService
      .getCharacteristic(this.platform.Characteristic.LeakDetected)
      .updateValue(this.isWet);
  }

  private async updateHumidity(humidity: number): Promise<void> {

    if (this.humidityService === undefined) {
      return;
    }

    if (humidity === this.humidity) {
      return;
    }

    this.humidity = humidity;
    this.humidityService
      .getCharacteristic(this.platform.Characteristic.CurrentRelativeHumidity)
      .updateValue(this.humidity);
  }

  private async updateTemperature(temperature: number): Promise<void> {

    if (this.temperatureService === undefined) {
      return;
    }

    if (temperature === this.temperature) {
      return;
    }

    this.temperature = temperature;
    this.temperatureService
      .getCharacteristic(this.platform.Characteristic.CurrentTemperature)
      .updateValue(this.temperature);
  }

  private async updateOccupancy(isOccupied: boolean): Promise<void> {

    if (this.occupancyService === undefined) {
      return;
    }

    if (isOccupied === this.isOccupied) {
      return;
    }

    this.isOccupied = isOccupied;
    this.occupancyService
      .getCharacteristic(this.platform.Characteristic.OccupancyDetected)
      .updateValue(this.isOccupied);
  }

  private async handleGetWetness(): Promise<CharacteristicValue> {

    if (this.isWet === undefined) {
      return SmartDryConstants.DEFAULT_BINARY_STATE;
    }

    this.platform.log.debug(`UI Get -> accessory=${this.name} wetness=${this.isWet}`);
    return this.isWet;
  }

  private async handleGetHumidity(): Promise<CharacteristicValue> {

    if (this.humidity === undefined) {
      return SmartDryConstants.DEFAULT_HUMIDITY;
    }

    this.platform.log.debug(`UI Get -> accessory=${this.name} humidity=${this.humidity}`);
    return this.humidity;
  }

  private async handleGetTemperature(): Promise<CharacteristicValue> {

    if (this.temperature === undefined) {
      return SmartDryConstants.DEFAULT_TEMPERATURE;
    }

    this.platform.log.debug(`UI Get -> accessory=${this.name} temperature=${this.temperature}`);
    return this.temperature;
  }

  private async handleGetOccupied(): Promise<CharacteristicValue> {

    if (this.isOccupied === undefined) {
      return SmartDryConstants.DEFAULT_BINARY_STATE;
    }

    this.platform.log.debug(`UI Get -> accessory=${this.name} occupied=${this.isOccupied}`);
    return this.isOccupied;
  }

  private registerLeakSensor(): void {

    this.leakService = new this.platform.Service.LeakSensor(`${this.name} Wetness`);
    this.leakService
      .getCharacteristic(this.platform.Characteristic.LeakDetected)
      .onGet(this.handleGetWetness.bind(this));
  }

  private async registerHumiditySensor(): Promise<void> {

    this.humidityService = new this.platform.Service.HumiditySensor(`${this.name} Humidity`);
    this.humidityService
      .getCharacteristic(this.platform.Characteristic.CurrentRelativeHumidity)
      .onGet(this.handleGetHumidity.bind(this));
  }

  private async registerTemperatureService(): Promise<void> {

    this.temperatureService = new this.platform.Service.TemperatureSensor(`${this.name} Temperature`);
    this.temperatureService
      .getCharacteristic(this.platform.Characteristic.CurrentTemperature)
      .onGet(this.handleGetTemperature.bind(this));
  }

  private async registerOccupancyService(): Promise<void> {

    this.occupancyService = new this.platform.Service.OccupancySensor(`${this.name} Occupancy`);
    this.occupancyService
      .getCharacteristic(this.platform.Characteristic.OccupancyDetected)
      .onGet(this.handleGetOccupied.bind(this));
  }

  private isDryerRunning(startTime: bigint, endTime: bigint): boolean {

    if (SmartDryConstants.DEFAULT_EPOCH_TIME === startTime || SmartDryConstants.DEFAULT_EPOCH_TIME === endTime) {
      return false;
    }

    if (endTime > startTime) {
      return false;
    }

    return true;
  }

  private isLaundryWet(humidity: number): boolean {
    return -1.03 * humidity + 100 <= SmartDryConstants.DRY_THRESHOLD;
  }

  getServices(): Service[] {

    const services = [this.informationService];

    if (this.occupancyService !== undefined) {
      services.push(this.occupancyService);
    }

    if (this.temperatureService !== undefined) {
      services.push(this.temperatureService);
    }

    if (this.humidityService !== undefined) {
      services.push(this.humidityService);
    }

    if (this.leakService !== undefined) {
      services.push(this.leakService);
    }

    return services;
  }
}
