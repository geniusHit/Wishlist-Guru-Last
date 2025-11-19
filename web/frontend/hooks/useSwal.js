import React from 'react'
import Swal from 'sweetalert2';

const useSwal = () => {
    const timerAlertSwal = (data) => {
        Swal.fire({
            icon: data.icon,
            text: data.textMessage,
            timer: 1500
        });
    }

    const showButtonSwal = (data) => {
        Swal.fire({
            icon: data.icon,
            text: data.text,
            showConfirmButton: data.showConfirmButton,
        });
    }


    return {
        timerAlertSwal: timerAlertSwal,
        showButtonSwal: showButtonSwal
    }
}

export default useSwal