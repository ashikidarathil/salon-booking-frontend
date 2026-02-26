import Swal from 'sweetalert2';
import type { SweetAlertOptions } from 'sweetalert2';

const defaultConfig: SweetAlertOptions = {
  toast: false,
  position: 'center',
  showConfirmButton: true,
  timerProgressBar: true,
  background: '#fff',
  color: '#333',
  customClass: {
    popup: 'rounded-lg shadow-xl',
    title: 'text-xl font-bold',
    htmlContainer: 'text-base',
    confirmButton: 'px-6 py-3 text-base font-medium rounded-lg',
  },
  allowOutsideClick: () => !Swal.isLoading(),
};

// Helper to fix aria-hidden accessibility issue with modals
const removeAriaHiddenFromRoot = () => {
  const root = document.getElementById('root');
  if (root) {
    root.removeAttribute('aria-hidden');
  }
};

export const showSuccess = (title: string, text?: string, timer = 3000, color?: string) => {
  return Swal.fire({
    ...defaultConfig,
    icon: 'success',
    title: title || 'Success!',
    text,
    timer: timer > 0 ? timer : undefined,
    timerProgressBar: timer > 0,
    showConfirmButton: timer === 0,
    confirmButtonColor: color,
    didOpen: () => {
      ensureZIndex();
      removeAriaHiddenFromRoot();
    },
  } as SweetAlertOptions);
};

export const showError = (title: string, text?: string, color?: string) => {
  return Swal.fire({
    ...defaultConfig,
    icon: 'error',
    title: title || 'Error!',
    text: text || 'Something went wrong',
    confirmButtonText: 'OK',
    confirmButtonColor: color,
    didOpen: () => {
      ensureZIndex();
      removeAriaHiddenFromRoot();
    },
  } as SweetAlertOptions);
};

export const showApiError = (error: unknown, defaultTitle = 'Error') => {
  let message = 'An unexpected error occurred';

  if (error && typeof error === 'object') {
    // Handle Axios error structure
    const axiosError = error as { response?: { data?: { message?: string } }; message?: string };
    message = axiosError.response?.data?.message || axiosError.message || message;
  } else if (typeof error === 'string') {
    message = error;
  }

  return showError(defaultTitle, message);
};

export const showConfirm = async (
  title: string,
  text: string,
  confirmButtonText = 'Yes',
  cancelButtonText = 'Cancel',
  confirmButtonColor?: string,
): Promise<boolean> => {
  const result = await Swal.fire({
    ...defaultConfig,
    icon: 'warning',
    title,
    text,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    confirmButtonColor: confirmButtonColor || '#10b981',
    cancelButtonColor: '#6b7280',
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      ensureZIndex();
      removeAriaHiddenFromRoot();
    },
  } as SweetAlertOptions);

  return result.isConfirmed;
};

export const showBlockConfirm = async (
  title = 'Block Slot?',
  text = 'Please provide a reason for blocking this slot.',
): Promise<string | null> => {
  const result = await Swal.fire({
    ...defaultConfig,
    icon: 'warning',
    title,
    text,
    input: 'textarea',
    inputPlaceholder: 'e.g. Personal emergency, Branch maintenance...',
    inputAttributes: {
      'aria-label': 'Reason for blocking',
    },
    showCancelButton: true,
    confirmButtonText: 'Block Slot',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#ef4444', // Red-500
    cancelButtonColor: '#6b7280',
    allowOutsideClick: false,
    preConfirm: (value) => {
      if (!value || !value.trim()) {
        Swal.showValidationMessage('Reason is required to block a slot');
      }
      return value;
    },
    didOpen: () => {
      ensureZIndex();
      removeAriaHiddenFromRoot();
    },
  } as SweetAlertOptions);

  return result.isConfirmed ? result.value : null;
};

export const showUnblockConfirm = async (
  title = 'Unblock Slot?',
  text = 'Are you sure you want to unblock this slot and make it available for booking?',
): Promise<boolean> => {
  return showConfirm(title, text, 'Yes, Unblock', 'Cancel', '#10b981'); // Emerald-500
};

export const showCancellationConfirm = async (
  title = 'Cancel Booking?',
  text = 'Are you sure you want to cancel this booking? Please provide a reason.',
): Promise<string | null> => {
  const result = await Swal.fire({
    ...defaultConfig,
    icon: 'warning',
    title,
    text,
    input: 'textarea',
    inputPlaceholder: 'Reason for cancellation...',
    showCancelButton: true,
    confirmButtonText: 'Yes, cancel it!',
    cancelButtonText: 'No, keep it',
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    preConfirm: (value) => {
      if (!value || !value.trim()) {
        Swal.showValidationMessage('Reason is required');
      }
      return value;
    },
    didOpen: () => {
      ensureZIndex();
      removeAriaHiddenFromRoot();
    },
  } as SweetAlertOptions);

  return result.isConfirmed ? result.value : null;
};

export const showLoading = (title: string) => {
  return Swal.fire({
    title,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    willOpen: () => {
      Swal.showLoading();
    },
    didOpen: () => {
      ensureZIndex();
      removeAriaHiddenFromRoot();
    },
  });
};

export const closeLoading = () => {
  Swal.close();
};

export const showToast = (
  icon: 'success' | 'error' | 'info' | 'warning',
  title: string,
  color?: string,
) => {
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon,
    title,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    iconColor: color,
  } as SweetAlertOptions);
};

const ensureZIndex = () => {
  requestAnimationFrame(() => {
    const swalContainer = document.querySelector('.swal2-container') as HTMLElement;
    const swalPopup = document.querySelector('.swal2-popup') as HTMLElement;
    const swalBackdrop = document.querySelector('.swal2-backdrop-show') as HTMLElement;

    if (swalContainer) {
      swalContainer.style.setProperty('z-index', '10000', 'important');
    }
    if (swalPopup) {
      swalPopup.style.setProperty('z-index', '10001', 'important');
    }
    if (swalBackdrop) {
      swalBackdrop.style.setProperty('z-index', '9999', 'important');
    }
  });
};
