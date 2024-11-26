import { useState, useCallback } from 'react';

const useDialogs = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
    const [isSavedOpen, setIsSavedOpen] = useState(false);
    const [isRequestLogOpen, setIsRequestLogOpen] = useState(false);
    const [isVoiceSettingsOpen, setIsVoiceSettingsOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [showSafetyWarning, setShowSafetyWarning] = useState(false);

    const openSidebar = useCallback(() => setIsSidebarOpen(true), []);
    const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);

    const openHistory = useCallback(() => setIsHistoryOpen(true), []);
    const closeHistory = useCallback(() => setIsHistoryOpen(false), []);

    const openInstructions = useCallback(() => setIsInstructionsOpen(true), []);
    const closeInstructions = useCallback(() => setIsInstructionsOpen(false), []);

    const openSaved = useCallback(() => setIsSavedOpen(true), []);
    const closeSaved = useCallback(() => setIsSavedOpen(false), []);

    const openRequestLog = useCallback(() => setIsRequestLogOpen(true), []);
    const closeRequestLog = useCallback(() => setIsRequestLogOpen(false), []);

    const openVoiceSettings = useCallback(() => setIsVoiceSettingsOpen(true), []);
    const closeVoiceSettings = useCallback(() => setIsVoiceSettingsOpen(false), []);

    const openSettings = useCallback(() => setIsSettingsOpen(true), []);
    const closeSettings = useCallback(() => setIsSettingsOpen(false), []);

    const openSafetyWarning = useCallback(() => setShowSafetyWarning(true), []);
    const closeSafetyWarning = useCallback(() => setShowSafetyWarning(false), []);

    // Function to close all dialogs
    const closeAllDialogs = useCallback(() => {
        setIsSidebarOpen(false);
        setIsHistoryOpen(false);
        setIsInstructionsOpen(false);
        setIsSavedOpen(false);
        setIsRequestLogOpen(false);
        setIsVoiceSettingsOpen(false);
        setIsSettingsOpen(false);
        setShowSafetyWarning(false);
    }, []);

    return {
        // Dialog states
        isSidebarOpen,
        isHistoryOpen,
        isInstructionsOpen,
        isSavedOpen,
        isRequestLogOpen,
        isVoiceSettingsOpen,
        isSettingsOpen,
        showSafetyWarning,

        // Open functions
        openSidebar,
        openHistory,
        openInstructions,
        openSaved,
        openRequestLog,
        openVoiceSettings,
        openSettings,
        openSafetyWarning,

        // Close functions
        closeSidebar,
        closeHistory,
        closeInstructions,
        closeSaved,
        closeRequestLog,
        closeVoiceSettings,
        closeSettings,
        closeSafetyWarning,

        // Utility functions
        closeAllDialogs
    };
};

export default useDialogs;
