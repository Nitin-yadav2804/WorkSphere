import File from '../models/file.model.js';
import Message from '../models/message.model.js';
import { deleteFromStorage } from './storage.service.js';
export async function deleteFiles(filter) {
  const files = await File.find(filter);
  for (const file of files) {
    await deleteFromStorage(file.storageKey);
    await File.deleteOne({
      _id: file._id
    });
    await Message.updateMany({
      attachments: file._id
    }, {
      $pull: {
        attachments: file._id
      }
    });
  }
}
