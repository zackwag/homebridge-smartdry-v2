import { Logger, PlatformConfig } from 'homebridge';
import { SmartDryPlatform } from '../smartDryPlatform';
import { SmartDryConfig } from './smartDryConfigDataTypes';
import { SmartDryConstants } from './smartDryConstants';
import { SmartDrySensor } from './smartDrySensor';

export class UserSettings {

  private constructor(
        public PlatformName: string,
        public SmartDrySensors: SmartDrySensor[],
        public PollingMilliSeconds: number,
  ) { }

  static create(platform: SmartDryPlatform): UserSettings {

    const config = platform.config;
    const platformName = UserSettings.buildPlatformName(config);
    const smartDrySensors = UserSettings.buildSmartDrySensors(platform.log, config);
    const pollingMilliseconds = UserSettings.buildPollingMilliSeconds(config);
    return new UserSettings(platformName, smartDrySensors, pollingMilliseconds);
  }

  private static buildPollingMilliSeconds(config: PlatformConfig): number {

    // If the user has not specified a polling interval, default to 30s
    const pollingSeconds = config.pollingSeconds ?? SmartDryConstants.DEFAULT_POLLING_SECONDS;
    return pollingSeconds * 1000;
  }

  private static buildPlatformName(config: PlatformConfig): string {

    // If the user has not specified a platform name, default to Homebridge SmartDry
    return config.name ?? SmartDryConstants.DEFAULT_PLATFORM_NAME;
  }

  private static buildSmartDrySensors(log: Logger, config: PlatformConfig): SmartDrySensor[] {

    // If the user has not specified configs, default to empty array
    if (config.sensors === undefined || config.sensors.length === 0) {
      return [];
    }

    return config.sensors
      .map((smartDryConfig: SmartDryConfig) => SmartDrySensor.create(log, smartDryConfig))
      .filter((smartDrySensor: SmartDrySensor) => smartDrySensor !== undefined);
  }
}
