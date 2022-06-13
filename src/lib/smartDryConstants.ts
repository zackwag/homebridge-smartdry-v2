import axios, { AxiosInstance } from 'axios';
import https from 'https';

export class SmartDryConstants {

  // Numbers
  static readonly DRY_THRESHOLD = 83; // Threshold with which to consider dry

  // Strings
  static readonly API_ENDPOINT = 'https://qn54iu63v9.execute-api.us-east-1.amazonaws.com/prod/RDSQuery';
  static readonly INFORMATION_MANUFACTURER = 'Smart Dry';
  static readonly INFORMATION_MODEL = 'v1';
  static readonly SERVICE_TYPE_CONTACT_SENSOR = 'contactSensor';
  static readonly SERVICE_TYPE_SWITCH = 'switch';
  static readonly TYPE_SMART_DRY_API_RESPONSE = 'SmartDryApiResponse';

  // Defaults
  static readonly DEFAULT_BINARY_STATE = false;
  static readonly DEFAULT_BOOLEAN_CONFIG_VALUE = true;
  static readonly DEFAULT_EPOCH_TIME = BigInt(0);
  static readonly DEFAULT_HUMIDITY = 0;
  static readonly DEFAULT_PLATFORM_NAME = 'Homebridge SmartDry v2';
  static readonly DEFAULT_POLLING_SECONDS = 30;
  static readonly DEFAULT_RETRY_OPTIONS = { delay: 100, maxTry: 5 };
  static readonly DEFAULT_TEMPERATURE = 0;

  static createHttpsClient(): AxiosInstance {

    return axios.create({
      baseURL: this.API_ENDPOINT,
      httpsAgent: new https.Agent({
        keepAlive: true, //keepAlive pools and reuses TCP connections, so it's faster
      }),
    });
  }
}
