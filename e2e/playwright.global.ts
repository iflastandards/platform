import { startServers, stopServers } from '../scripts/dev-servers';
let servers;
export default async () => {
  servers = await startServers();
  return async () => await stopServers(servers);
};
