import mqtt from 'mqtt';
import { DeviceTypes, BooleanState, PlatformConfig, Matterbridge, MatterbridgeDevice, MatterbridgeAccessoryPlatform, powerSource } from 'matterbridge';
import { AnsiLogger } from 'matterbridge/logger';

const brokerUrl = 'mqtt://192.168.1.118';
const topic = 'esp32sensor/gate1';

export class EveDoorPlatform extends MatterbridgeAccessoryPlatform {
  door: MatterbridgeDevice | undefined;

  client: mqtt.MqttClient | undefined;

  constructor(matterbridge: Matterbridge, log: AnsiLogger, config: PlatformConfig) {
    super(matterbridge, log, config);
    this.log.info('Initializing platform:', this.config.name);
    this.client = undefined;
  }

  override async onStart(reason?: string) {
    this.log.info('onStart called with reason:', reason ?? 'none');

    this.door = new MatterbridgeDevice(DeviceTypes.CONTACT_SENSOR);
    this.door.createDefaultIdentifyClusterServer();
    this.door.createDefaultBasicInformationClusterServer('Garage Gate', '0x88030476', 4874, 'Cat Systems', 77, 'Garage Gate 20EBN9901', 1144, '1.2.8');
    this.door.createDefaultBooleanStateClusterServer(true);

    this.door.addDeviceType(powerSource);
    this.door.createDefaultPowerSourceReplaceableBatteryClusterServer(75);

    await this.registerDevice(this.door);

    this.door.addCommandHandler('identify', async ({ request: { identifyTime } }) => {
      this.log.warn(`Command identify called identifyTime:${identifyTime}`);
    });
  }

  override async onConfigure() {
    this.log.info('onConfigure called');

    // Connect to the MQTT broker
    this.client = mqtt.connect(brokerUrl);

    if (this.client === undefined || this.client === null) {
      this.log.error('Mqtt connect failed');
      return;
    }

    // Handle connection events
    this.client.on('connect', () => {
      this.log.info(`Connected to MQTT broker at ${brokerUrl}`);

      if (this.client === undefined || this.client === null) {
        this.log.error('Mqtt no client connection');
        return;
      }

      // Subscribe to the topic
      this.client.subscribe(topic, (err: Error | null) => {
        if (err) {
          this.log.error(`Failed to subscribe to ${topic}:`, err);
        } else {
          this.log.info(`Subscribed to ${topic}`);
        }
      });

      // Handle incoming messages
      this.client.on('message', (topic: string, message: Buffer) => {
        if (!this.door) return;
        let contact = false;
        this.log.info(`Mqtt message received: ${message.toString()}`);
        if (message.toString().startsWith('close')) {
          contact = true;
        }
        this.door.getClusterServerById(BooleanState.Cluster.id)?.setStateValueAttribute(contact);
        this.door.getClusterServerById(BooleanState.Cluster.id)?.triggerStateChangeEvent({ stateValue: contact });
        this.log.info(`Set contact to ${contact}`);
      });

      // Handle errors
      this.client.on('error', (err: Error) => {
        this.log.error('Mqtt error:', err);
      });

      // Handle disconnection
      this.client.on('close', () => {
        this.log.info('Disconnected from mqtt broker');
      });
    });
  }

  override async onShutdown(reason?: string) {
    this.log.info('onShutdown called with reason:', reason ?? 'none');
    // await this.history?.close();
    await this.client?.endAsync();
    if (this.config.unregisterOnShutdown === true) await this.unregisterAllDevices();
  }
}
