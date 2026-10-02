import { useEffect, useState } from 'react';
import api from '../services/api';
import { getSocket } from '../services/socket';
export default function useNotifications() {
  const [unread, setUnread] = useState(0);
  useEffect(() => {
    let active = true;
    const refresh = () => api.get('/notifications').then(({
      data
    }) => {
      if (active) setUnread(data.unread);
    }).catch(() => {});
    const socket = getSocket();
    refresh();
    for (const event of ['connect', 'notification:created', 'notification:read']) socket?.on(event, refresh);
    return () => {
      active = false;
      for (const event of ['connect', 'notification:created', 'notification:read']) socket?.off(event, refresh);
    };
  }, []);
  return unread;
}
