import { API } from 'homebridge';
import { PLATFORM_NAME } from './settings';
import { SmartDryPlatform } from './smartDryPlatform';

/**
 * This method registers the platform with Homebridge
 */
export = (api: API) => {
  api.registerPlatform(PLATFORM_NAME, SmartDryPlatform);
};
