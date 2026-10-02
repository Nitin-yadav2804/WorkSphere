import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import path from 'node:path';
import File from '../src/models/file.model.js';
import Workspace from '../src/models/workspace.model.js';
import Message from '../src/models/message.model.js';
import Activity from '../src/models/activity.model.js';
import { uploadToStorage, getLocalFilePath } from '../src/utils/storage.service.js';
import { deleteFile } from '../src/controllers/file.controller.js';
const userId='333333333333333333333333',workspaceId='111111111111111111111111';
function setup(t,key) {
 t.mock.method(File,'findById',async()=>({_id:'555555555555555555555555',workspace:workspaceId,uploadedBy:userId,storageKey:key,originalName:'test.txt'}));
 t.mock.method(Workspace,'findOne',async()=>({owner:userId,members:[{user:userId,role:'manager'}]}));
 t.mock.method(Workspace,'findById',()=>({select:async()=>({members:[]})}));
 t.mock.method(Message,'updateMany',async()=>({}));
 t.mock.method(Activity,'create',async value=>({...value,populate:async()=>{}}));
 return t.mock.method(File,'findByIdAndDelete',async()=>({}));
}
test('local file deletion removes bytes and metadata after authorization', {skip:process.env.STORAGE_PROVIDER==='r2'}, async t=>{
 const key=`test-${crypto.randomUUID()}/test.txt`;
 await uploadToStorage({key,body:Buffer.from('test'),contentType:'text/plain'});
 const filePath=getLocalFilePath(key);
 t.after(async()=>{await fs.unlink(filePath).catch(()=>{});await fs.rmdir(path.dirname(filePath)).catch(()=>{});});
 const remove=setup(t,key);let response;let error;
 await deleteFile({params:{fileId:'555555555555555555555555'},user:{userId}},{status:()=>({json:value=>{response=value;}})},e=>{error=e;});
 assert.equal(error,undefined);assert.equal(response.success,true);assert.equal(remove.mock.callCount(),1);
 await assert.rejects(fs.stat(filePath),{code:'ENOENT'});
});
test('storage deletion failure preserves file metadata for retry', {skip:process.env.STORAGE_PROVIDER==='r2'}, async t=>{
 const key=`test-${crypto.randomUUID()}`;const filePath=getLocalFilePath(key);
 await fs.mkdir(filePath,{recursive:true});t.after(()=>fs.rmdir(filePath));
 const remove=setup(t,key);let error;
 await deleteFile({params:{fileId:'555555555555555555555555'},user:{userId}}, {},e=>{error=e;});
 assert.ok(error);assert.equal(remove.mock.callCount(),0);
});
