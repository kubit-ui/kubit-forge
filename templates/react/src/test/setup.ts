import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import { vi } from 'vitest';

// Mock scheduler module before React loads
vi.mock('scheduler', () => ({
  unstable_scheduleCallback: (
    _priorityLevel: number,
    callback: () => void,
    _options?: { delay?: number }
  ) => {
    const id = setTimeout(callback, 0);
    return { id };
  },
  unstable_cancelCallback: (task: { id: number }) => {
    clearTimeout(task.id);
  },
  unstable_shouldYield: () => false,
  unstable_requestPaint: () => {},
  unstable_now: () => Date.now(),
  unstable_getCurrentPriorityLevel: () => 3,
  unstable_ImmediatePriority: 1,
  unstable_UserBlockingPriority: 2,
  unstable_NormalPriority: 3,
  unstable_LowPriority: 4,
  unstable_IdlePriority: 5,
}));

// Polyfills for jsdom environment
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder as any;
}

if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (obj: any) => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj);
    if (obj instanceof Array) return obj.map((item) => global.structuredClone(item));
    if (obj instanceof Object) {
      const clonedObj: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          clonedObj[key] = global.structuredClone(obj[key]);
        }
      }
      return clonedObj;
    }
    return obj;
  };
}

// Add IS_REACT_ACT_ENVIRONMENT for React 18 testing
(global as any).IS_REACT_ACT_ENVIRONMENT = true;
