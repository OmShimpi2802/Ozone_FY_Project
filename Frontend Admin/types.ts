
export interface Permissions {
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

export type PermissionKey = keyof Permissions;

export interface ConfigResponse {
  permissions: Permissions;
  config_version: number;
  last_updated: string;
}

export enum RequestStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
