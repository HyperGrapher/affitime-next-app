/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";

const usePersistedState = (key: string, defaultValue: Record<string, unknown> | string) => {
    const [persistedState, setPersistedState] = useState(() => {
        const value = localStorage.getItem(key)
        return value ? JSON.parse(value) : defaultValue
    });

    useEffect(() => {

        localStorage.setItem(key, JSON.stringify(persistedState))

    }, [persistedState]);

    return [persistedState, setPersistedState];
};

export default usePersistedState;