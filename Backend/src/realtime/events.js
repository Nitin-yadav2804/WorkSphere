import { EventEmitter } from 'node:events';
export const events = new EventEmitter();
export const publish = (room, event, data) => events.emit('publish', {
  room,
  event,
  data
});
