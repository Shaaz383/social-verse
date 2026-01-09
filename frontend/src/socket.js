import { io } from 'socket.io-client';
import api from './api';

let socket;
let socketInitPromise;

function getSocketUrl() {
  return (
    import.meta.env.VITE_SOCKET_SERVER_URL ||
    import.meta.env.VITE_API_URL ||
    'https://social-verse.onrender.com'
  );
}

export async function getSocket() {
  if (socket && socket.connected) return socket;
  if (socketInitPromise) return socketInitPromise;

  socketInitPromise = (async () => {
    const { data } = await api.get('/dm/socket-token');
    socket = io(getSocketUrl(), {
      transports: ['websocket'],
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      auth: { token: data.token },
    });
    return socket;
  })();

  return socketInitPromise;
}

export function resetSocket() {
  socketInitPromise = undefined;
  if (socket) {
    socket.disconnect();
    socket = undefined;
  }
}

