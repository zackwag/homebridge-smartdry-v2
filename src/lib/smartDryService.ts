import { AxiosInstance } from 'axios';
import { Logger } from 'homebridge';
import { retryAsync } from 'ts-retry';
import { SmartDryConstants } from './smartDryConstants';
import { SmartDryApiResponse } from './smartDryServiceDataTypes';

export class SmartDryService {

  private readonly httpsClient: AxiosInstance;

  public constructor(
        public Id: string,
        private log: Logger,
  ) {
    this.httpsClient = SmartDryConstants.createHttpsClient();
  }

  public getDeviceStates() : Promise<SmartDryApiResponse[]> {
    return this.getData(SmartDryConstants.TYPE_SMART_DRY_API_RESPONSE);
  }

  private buildQueryParam(): string {
    return new URLSearchParams({ Id: this.Id, Write: '0', SQLString: 'select * from DryerballList' }).toString();
  }

  private async getData<T>(type: string): Promise<T> {

    return retryAsync(() => this.httpsClient
      .get(`?${this.buildQueryParam()}`)
      .then(res => res.data), SmartDryConstants.DEFAULT_RETRY_OPTIONS)
      .then(data => {
        if (data !== undefined) {
          this.log.debug(`HTTP Get -> type=${type} id=${this.Id} data=${JSON.stringify(data)}`);
        }
        return data;
      });
  }
}
