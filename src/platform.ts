import { DeviceTypes, BooleanState } from 'matterbridge';

import { Matterbridge, MatterbridgeDevice, MatterbridgeAccessoryPlatform, MatterHistory } from 'matterbridge';
import { AnsiLogger } from 'node-ansi-logger';

export class EveDoorPlatform extends MatterbridgeAccessoryPlatform {
  door: MatterbridgeDevice | undefined;
  history: MatterHistory | undefined;
  interval: NodeJS.Timeout | undefined;

  constructor(matterbridge: Matterbridge, log: AnsiLogger) {
    super(matterbridge, log);
  }

  override async onStart(reason?: string) {
    this.log.info('onStart called with reason:', reason ?? 'none');

    this.history = new MatterHistory(this.log, 'Eve door', { filePath: this.matterbridge.matterbridgeDirectory });

    this.door = new MatterbridgeDevice(DeviceTypes.CONTACT_SENSOR);
    this.door.createDefaultIdentifyClusterServer();
    this.door.createDefaultBasicInformationClusterServer('Eve door', '0x88030475', 4874, 'Eve Systems', 77, 'Eve Door 20EBN9901', 1144, '1.2.8');
    this.door.createDefaultBooleanStateClusterServer(true);

    this.door.createDefaultPowerSourceReplaceableBatteryClusterServer(75);
    this.door.createDefaultPowerSourceConfigurationClusterServer(1);

    // Add the EveHistory cluster to the device as last cluster!
    this.door.createDoorEveHistoryClusterServer(this.history, this.log);
    this.history.autoPilot(this.door);

    await this.registerDevice(this.door);

    this.door.addCommandHandler('identify', async ({ request: { identifyTime } }) => {
      this.log.warn(`Command identify called identifyTime:${identifyTime}`);
      this.history?.logHistory(false);
    });
  }

  override async onConfigure() {
    this.log.info('onConfigure called');

    this.interval = setInterval(
      () => {
        if (!this.door || !this.history) return;
        let contact = this.door.getClusterServerById(BooleanState.Cluster.id)?.getStateValueAttribute();
        contact = !contact;
        this.door.getClusterServerById(BooleanState.Cluster.id)?.setStateValueAttribute(contact);
        this.door.getClusterServerById(BooleanState.Cluster.id)?.triggerStateChangeEvent({ stateValue: contact });
        if (contact === false) this.history.addToTimesOpened();
        this.history.setLastEvent();
        this.history.addEntry({ time: this.history.now(), contact: contact === true ? 0 : 1 });
        this.log.info(`Set contact to ${contact}`);
      },
      60 * 1000 + 100,
    );
  }

  override async onShutdown(reason?: string) {
    this.log.info('onShutdown called with reason:', reason ?? 'none');
    await this.history?.close();
    clearInterval(this.interval);
  }
}
