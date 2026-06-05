import config from '../config';

const baseUrl = (type) => `${config.serverUrl}/api/custom/${type}`;

const handleResponse = async (response) => {
    if (!response.ok) {
        let message = `Request failed (${response.status})`;
        try {
            const data = await response.json();
            if (data?.error) message = data.error;
        } catch {
            // Ignore non-JSON error bodies and keep the default message.
        }
        throw new Error(message);
    }
    return response.json();
};

// Fetch all user-defined items of a given type (tones | models | languages).
export const fetchCustomItems = async (type) => {
    const response = await fetch(baseUrl(type));
    return handleResponse(response);
};

// Create a new item. Returns the created item (with server-assigned id).
export const createCustomItem = async (type, payload) => {
    const response = await fetch(baseUrl(type), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    return handleResponse(response);
};

// Delete an item by id.
export const deleteCustomItem = async (type, id) => {
    const response = await fetch(`${baseUrl(type)}/${encodeURIComponent(id)}`, {
        method: 'DELETE'
    });
    return handleResponse(response);
};
