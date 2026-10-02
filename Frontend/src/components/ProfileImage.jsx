import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '../services/api';
import { getErrorMessage } from '../utils/errors';
function ImageView({
  kind = 'user',
  id,
  name = '',
  editable = false,
  size = 'h-12 w-12'
}) {
  const [url, setUrl] = useState(''),
    [version, setVersion] = useState(0),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!id) return;
    let active = true,
      objectUrl;
    api.get(`/images/${kind}/${id}/image`, {
      responseType: 'blob'
    }).then(async response => {
      const data = response.data;
      if (data.type.includes('json')) {
        const json = JSON.parse(await data.text());
        if (active) setUrl(json.url);
      } else {
        objectUrl = URL.createObjectURL(data);
        if (active) setUrl(objectUrl);else URL.revokeObjectURL(objectUrl);
      }
    }).catch(() => {});
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [kind, id, version]);
  const upload = async e => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return toast.error('Choose an image under 2 MB');
    setBusy(true);
    try {
      const body = new FormData();
      body.append('file', file);
      await api.post(`/images/${kind}/${id}/image`, body);
      setUrl('');
      setVersion(v => v + 1);
      toast.success('Image updated');
    } catch (e) {
      toast.error(getErrorMessage(e, 'Unable to update image'));
    } finally {
      setBusy(false);
    }
  };
  const remove = async () => {
    setBusy(true);
    try {
      await api.delete(`/images/${kind}/${id}/image`);
      setUrl('');
      setVersion(v => v + 1);
    } catch (e) {
      toast.error(getErrorMessage(e, 'Unable to remove image'));
    } finally {
      setBusy(false);
    }
  };
  return <div className="flex items-center gap-3">{url ? <img src={url} alt={name} onError={() => setUrl('')} className={`${size} shrink-0 rounded-xl object-cover`} /> : <span className={`${size} flex shrink-0 items-center justify-center rounded-xl bg-blue-100 font-bold text-blue-600`}>{name.charAt(0).toUpperCase() || 'W'}</span>}{editable && <div className="text-xs text-blue-600"><label className="cursor-pointer">{busy ? 'Updating...' : kind === 'user' ? 'Change profile picture' : 'Change workspace logo'}<input type="file" accept="image/png,image/jpeg,image/webp" onChange={upload} disabled={busy || !id} className="sr-only" /></label>{url && <button type="button" onClick={remove} disabled={busy} className="ml-3 text-red-600">Remove</button>}<p className="mt-1 text-slate-400">PNG, JPEG or WebP · Up to 2 MB</p></div>}</div>;
}
export default function ProfileImage(props) {
  return <ImageView key={`${props.kind}:${props.id}`} {...props} />;
}
