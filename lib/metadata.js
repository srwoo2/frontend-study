'use strict';

const devices = {
  'dummy-light-001': {
    deviceId: 'dummy-light-001',
    name: 'Living Room Light',
    label: '거실 전등 (Dummy)',
    components: [{ id: 'main', capabilities: ['switch', 'switchLevel'] }],
    status: {
      switch: { value: 'on' },
      switchLevel: { value: 80 }
    }
  },
  'dummy-light-002': {
    deviceId: 'dummy-light-002',
    name: 'Bedroom Light',
    label: '침실 전등 (Dummy)',
    components: [{ id: 'main', capabilities: ['switch'] }],
    status: {
      switch: { value: 'off' }
    }
  },
  'dummy-sensor-001': {
    deviceId: 'dummy-sensor-001',
    name: 'Motion Sensor',
    label: '모션 센서 (Dummy)',
    components: [{ id: 'main', capabilities: ['motionSensor', 'battery'] }],
    status: {
      motion: { value: 'inactive' },
      battery: { value: 100 }
    }
  }
};

const user = {
  login: 'Guest User',
  id: '12345',
  email: 'guest@example.com'
};

module.exports = { devices, user };
