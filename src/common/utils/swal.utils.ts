// src/utils/swal.ts
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
    },
  } as SweetAlertOptions);
};

export const showConfirm = async (
  title: string,
  text: string,
  confirmText = 'Yes',
  cancelText = 'Cancel',
  color?: string,
) => {
  const result = await Swal.fire({
    ...defaultConfig,
    icon: 'warning',
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: color,
    cancelButtonColor: '#6B7280',
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      ensureZIndex();
    },
  } as SweetAlertOptions);

  return result.isConfirmed;
};

export const showLoading = (title = 'Loading...') => {
  Swal.fire({
    title,
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      ensureZIndex();
      Swal.showLoading();
    },
  } as SweetAlertOptions);
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
