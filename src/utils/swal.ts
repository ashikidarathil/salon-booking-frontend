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
};

export const showSuccess = (title: string, text?: string, timer = 3000, color?: string) => {
  return Swal.fire({
    ...defaultConfig,
    icon: 'success',
    title,
    text,
    timer: timer > 0 ? timer : undefined,
    timerProgressBar: timer > 0,
    showConfirmButton: timer === 0,
    confirmButtonColor: color,
  } as SweetAlertOptions);
};

export const showError = (title: string, text?: string, color?: string) => {
  return Swal.fire({
    ...defaultConfig,
    icon: 'error',
    title: title || 'Something went wrong!',
    text,
    confirmButtonText: 'OK',
    confirmButtonColor: color,
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
    cancelButtonColor: '#6B7280', // gray
  } as SweetAlertOptions);

  return result.isConfirmed;
};

export const showLoading = (title = 'Loading...') => {
  Swal.fire({
    title,
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
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
