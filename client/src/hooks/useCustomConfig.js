import { useState, useEffect, useCallback } from 'react';
import {
    fetchCustomItems,
    createCustomItem,
    deleteCustomItem
} from '../services/customConfigService';

// Manages a user-defined config collection stored on the server (Firestore).
// type is one of: 'tones' | 'models' | 'languages'.
const useCustomConfig = (type) => {
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const data = await fetchCustomItems(type);
            setItems(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || `Failed to load custom ${type}`);
        } finally {
            setIsLoading(false);
        }
    }, [type]);

    useEffect(() => {
        load();
    }, [load]);

    const addItem = useCallback(async (payload) => {
        setError('');
        const created = await createCustomItem(type, payload);
        setItems((prev) => [...prev, created]);
        return created;
    }, [type]);

    const removeItem = useCallback(async (id) => {
        setError('');
        await deleteCustomItem(type, id);
        setItems((prev) => prev.filter((item) => item.id !== id));
    }, [type]);

    return { items, isLoading, error, reload: load, addItem, removeItem };
};

export default useCustomConfig;
