import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { NodeSSH } from 'node-ssh';

/**
 * CONFIGSYNC BACKEND
 * This server manages the config.json file
 * and syncs it to AWS EC2 automatically.
 */

const app = express();
const PORT = 8889;

// Fix for ES module __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Local config file path
const CONFIG_FILE = path.join(__dirname, 'config.json');

// ======================
// EC2 CONFIGURATION
// ======================

const ssh = new NodeSSH();

const EC2_HOST = "18.209.6.119";   // 🔴 Replace this
const EC2_USER = "ubuntu";
const EC2_KEY_PATH = path.join(__dirname, "Ozone_Otel_Keypair.pem");
const EC2_REMOTE_PATH = "/var/www/html/config.json";

// ======================
// MIDDLEWARE
// ======================

app.use(cors() as any);
app.use(express.json());

// ======================
// INTERFACES
// ======================

interface Permissions {
  copy: boolean;
  paste: boolean;
  screenshot: boolean;
  file_download: boolean;
  print: boolean;
  usb: boolean;
  git_clone: boolean;
  log_events: boolean;
  kill_switch: boolean;
  internet: boolean;
}

interface ConfigData {
  permissions: Permissions;
  config_version: number;
  last_updated: string;
}

// ======================
// DEFAULT CONFIG
// ======================

const DEFAULT_CONFIG: ConfigData = {
  permissions: {
    copy: false,
    paste: true,
    screenshot: false,
    file_download: false,
    print: true,
    usb: true,
    git_clone: false,
    log_events: true,
    kill_switch: false,
    internet: true
  },
  config_version: 1,
  last_updated: new Date().toISOString()
};

// ======================
// FILE OPERATIONS
// ======================

const readConfigFromDisk = (): ConfigData => {
  try {
    if (!fs.existsSync(CONFIG_FILE)) {
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2));
      return DEFAULT_CONFIG;
    }
    const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('[PolicyManager] Error reading config:', err);
    return DEFAULT_CONFIG;
  }
};

const writeConfigToDisk = (data: ConfigData): boolean => {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error('[PolicyManager] Error writing config:', err);
    return false;
  }
};

// ======================
// EC2 UPLOAD FUNCTION
// ======================

const uploadConfigToEC2 = async (): Promise<boolean> => {
  try {
    const privateKey = fs.readFileSync(EC2_KEY_PATH, 'utf8');

    await ssh.connect({
      host: EC2_HOST,
      username: EC2_USER,
      privateKey: privateKey
    });

    await ssh.putFile(CONFIG_FILE, EC2_REMOTE_PATH);

    console.log('[Sync] Config successfully pushed to EC2.');

    ssh.dispose();
    return true;
  } catch (err) {
    console.error('[Sync] EC2 upload failed:', err);
    return false;
  }
};

// ======================
// API ENDPOINTS
// ======================

// Fetch current config
app.get('/api/config', (req: express.Request, res: express.Response) => {
  const config = readConfigFromDisk();
  res.json(config);
});

// Update config
app.post('/api/update-config', async (req: express.Request, res: express.Response) => {
  const { permissions, config_version } = req.body;

  if (!permissions) {
    return res.status(400).json({ message: 'Permissions payload is missing.' });
  }

  const current = readConfigFromDisk();

  const updatedConfig: ConfigData = {
    permissions,
    config_version: (config_version || current.config_version) + 1,
    last_updated: new Date().toISOString()
  };

  if (!writeConfigToDisk(updatedConfig)) {
    return res.status(500).json({ message: 'Failed to write config locally.' });
  }

  console.log(`[Sync] Local config updated to version ${updatedConfig.config_version}`);

  const uploadSuccess = await uploadConfigToEC2();

  if (!uploadSuccess) {
    return res.status(500).json({ message: 'Config updated locally but failed to sync to EC2.' });
  }

  res.json(updatedConfig);
});

// ======================
// START SERVER
// ======================

app.listen(PORT, () => {
  console.log('====================================');
  console.log(`ConfigSync Backend: http://localhost:${PORT}`);
  console.log(`Config File Path: ${CONFIG_FILE}`);
  console.log('====================================');
});