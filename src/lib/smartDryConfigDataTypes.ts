export interface SmartDryConfig {

    name?: string;
    id?: string;
    occupancySensor?: SensorConfig;
    temperatureSensor?: SensorConfig;
    humiditySensor?: SensorConfig;
    leakSensor?: SensorConfig;
}

export interface SensorConfig {
    isEnabled?: boolean;
}
