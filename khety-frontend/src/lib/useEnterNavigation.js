import { useCallback, useRef } from "react";

function useEnterNavigation(fieldOrder = []) {
  const fieldRefs = useRef({});

  const registerField = useCallback((fieldName) => (element) => {
    if (element) {
      fieldRefs.current[fieldName] = element;
      return;
    }

    delete fieldRefs.current[fieldName];
  }, []);

  const focusNextField = useCallback((fieldName) => {
    const currentIndex = fieldOrder.indexOf(fieldName);

    for (let index = currentIndex + 1; index < fieldOrder.length; index += 1) {
      const nextField = fieldRefs.current[fieldOrder[index]];
      if (nextField && !nextField.disabled) {
        nextField.focus();
        return true;
      }
    }

    return false;
  }, [fieldOrder]);

  const handleEnter = useCallback(
    (fieldName, onLastField) => (event) => {
      if (event.key !== "Enter" || event.shiftKey || event.nativeEvent?.isComposing) {
        return;
      }

      if (event.target.tagName === "TEXTAREA") {
        return;
      }

      event.preventDefault();

      if (!focusNextField(fieldName) && typeof onLastField === "function") {
        onLastField();
      }
    },
    [focusNextField]
  );

  return {
    registerField,
    handleEnter
  };
}

export default useEnterNavigation;
