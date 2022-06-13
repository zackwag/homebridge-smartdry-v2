import { AccessoryPlugin, API, Characteristic, Logger, PlatformConfig, Service, StaticPlatformPlugin } from 'homebridge';
import { SmartDryPlatformAccessory } from './lib/smartDryPlatformAccessory';
import { UserSettings } from './lib/userSettings';

export class SmartDryPlatform implements StaticPlatformPlugin {

  private readonly smartDryPlatformAccessories: SmartDryPlatformAccessory[] = [];
  private readonly userSettings: UserSettings;

  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.userSettings = UserSettings.create(this);

    if (this.userSettings.SmartDrySensors.length === 0) {
      this.log.error('No Smart Dry sensors specified. Platform is not loading.');
      return;
    }

    this.buildAccessories();

    this.log.debug(`Platform ${this.userSettings.PlatformName} -> Initialized`);
  }

  async accessories(callback: (foundAccessories: AccessoryPlugin[]) => void): Promise<void> {
    callback(this.smartDryPlatformAccessories);
  }

  private buildAccessories() {

    for (const smartDrySensorConfig of this.userSettings.SmartDrySensors) {
      const accessory = new SmartDryPlatformAccessory(this, smartDrySensorConfig);

      this.log.debug(`Including -> accessory=${accessory.name}`);

      this.smartDryPlatformAccessories.push(accessory);
    }

    this.log.debug(`Polling -> pollingInterval=${this.userSettings.PollingMilliSeconds}ms`);

    // Poll for status changes outside of HomeKit
    this.pollAccessories()
      .then(() => {
        setInterval(() => this.pollAccessories(), this.userSettings.PollingMilliSeconds);
      });
  }

  private async pollAccessories(): Promise<void> {

    await this.smartDryPlatformAccessories.reduce(async (previousPromise, nextAccessory) => {
      await previousPromise;
      return nextAccessory.updateValues()
        .then(() => this.log.debug(`Polled -> accessory=${nextAccessory.name}`));
    }, Promise.resolve());
  }
}
