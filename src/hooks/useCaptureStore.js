import { useCallback, useEffect, useMemo, useState } from 'react';
import { deleteCapture, listCaptures, makeCaptureId, saveCapture } from '../storage.js';

export function useCaptureStore(type, prefix) {
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      const records = await listCaptures(type);
      setItems(records);
      setSelectedId((current) => current || records[0]?.id || '');
      setError('');
    } catch (err) {
      setError(err.message || 'تعذر تحميل الملفات المحفوظة');
    }
  }, [type]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const selected = useMemo(
    () => items.find((item) => item.id === selectedId) || items[0] || null,
    [items, selectedId],
  );

  const addItem = useCallback(
    async ({ title, imageData, meta = {} }) => {
      setBusy(true);
      const record = {
        id: makeCaptureId(prefix),
        type,
        title,
        imageData,
        createdAt: new Date().toISOString(),
        meta,
      };

      try {
        await saveCapture(record);
        setItems((current) => [record, ...current]);
        setSelectedId(record.id);
        setError('');
        return record;
      } catch (err) {
        setError(err.message || 'تعذر حفظ السكان');
        return null;
      } finally {
        setBusy(false);
      }
    },
    [prefix, type],
  );

  const removeItem = useCallback(
    async (id) => {
      setBusy(true);
      try {
        await deleteCapture(id);
        setItems((current) => current.filter((item) => item.id !== id));
        setSelectedId((current) => {
          if (current !== id) return current;
          const next = items.find((item) => item.id !== id);
          return next?.id || '';
        });
        setError('');
      } catch (err) {
        setError(err.message || 'تعذر حذف العنصر');
      } finally {
        setBusy(false);
      }
    },
    [items],
  );

  return {
    items,
    selected,
    selectedId,
    setSelectedId,
    addItem,
    removeItem,
    refresh,
    busy,
    error,
  };
}
