import { useState, useEffect } from 'react';

/**
 * Custom hook to handle form draft auto-saving to localStorage and recovery.
 *
 * @param {string} key - The localStorage key name.
 * @param {boolean} isEnabled - Whether draft checking and auto-saving is enabled (e.g. form is open and in create mode).
 * @param {object} fields - The current state values of the form fields to watch.
 * @param {function} restoreCallback - Callback triggered when the user confirms draft recovery, passing the parsed draft data.
 */
export function useFormDraft(key, isEnabled, fields, restoreCallback) {
  const [isRestoreDraftOpen, setIsRestoreDraftOpen] = useState(false);
  const [tempDraft, setTempDraft] = useState(null);
  const [hasCheckedDraft, setHasCheckedDraft] = useState(false);

  // Effect to detect saved draft on open
  useEffect(() => {
    if (isEnabled) {
      const savedDraft = localStorage.getItem(key);
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          setTempDraft(parsed);
          setIsRestoreDraftOpen(true);
          setHasCheckedDraft(false); // Disable auto-saving initially to prevent overwrite
        } catch (e) {
          console.error(`Gagal membaca draf ${key}:`, e);
          localStorage.removeItem(key);
          setHasCheckedDraft(true);
        }
      } else {
        setHasCheckedDraft(true);
      }
    } else {
      setHasCheckedDraft(false);
      setTempDraft(null);
      setIsRestoreDraftOpen(false);
    }
  }, [isEnabled, key]);

  // Effect to automatically save draft on field changes
  useEffect(() => {
    if (isEnabled && hasCheckedDraft) {
      // Check if there is any input content to save (ignore empty or default status/access states)
      const hasContent = Object.entries(fields).some(([k, val]) => {
        if (k === 'formStatus' && val === 'Aktif') return false;
        if (k === 'formAccess') {
          return Object.values(val).some(v => v === true);
        }
        return val !== '' && val !== null && val !== undefined;
      });

      if (hasContent) {
        localStorage.setItem(key, JSON.stringify(fields));
      } else {
        localStorage.removeItem(key);
      }
    }
  }, [isEnabled, hasCheckedDraft, key, JSON.stringify(fields)]);

  const handleRestoreDraft = () => {
    if (tempDraft && restoreCallback) {
      restoreCallback(tempDraft);
    }
    setIsRestoreDraftOpen(false);
    setTempDraft(null);
    setHasCheckedDraft(true);
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem(key);
    setIsRestoreDraftOpen(false);
    setTempDraft(null);
    setHasCheckedDraft(true);
  };

  const clearDraft = () => {
    localStorage.removeItem(key);
  };

  return {
    isRestoreDraftOpen,
    handleRestoreDraft,
    handleDiscardDraft,
    clearDraft
  };
}
