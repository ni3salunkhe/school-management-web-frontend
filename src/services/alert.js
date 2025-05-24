import Swal from "sweetalert2";

const showAlert={
    confirmBox:async(title)=>{
        const result = await Swal.fire({
                        title: title,
                        icon: 'question',
                        showCancelButton: true,
                        showDenyButton: true,
                        confirmButtonText: 'जतन करा',
                        denyButtonText: 'जतन करा आणि पुढे चला',
                        cancelButtonText: 'रद्द करा'
                    });
        return result;
    }
    ,
    sweetAlert:async(title,message,icon)=>{
        const result = await Swal.fire({
            title: title,
            text: message,
            icon: icon,
            draggable: true
        });
        return result;
    }
}
export default showAlert;