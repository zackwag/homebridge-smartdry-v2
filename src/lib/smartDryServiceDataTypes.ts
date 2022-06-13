export interface SmartDryApiResponse {

    name: string; // ID of the sensor
    loadStart: bigint; // Start time in epoch milliseconds
    stDate: bigint; // End time in epoch milliseconds
    temperature: number; // Temperature of sensor
    humidity: number; // Humidity of sensor
}
