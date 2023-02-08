import '../styles/style.scss';
import Swal from 'sweetalert2';
import axios from 'axios';

// valida el envio de inicio de sesión
const URLUsers = 'https://sprint1p-server-production.up.railway.app/users';

document.getElementById('signin').addEventListener('click', async (event)=>{
    event.preventDefault();

    const cellPhone = document.getElementById('cellPhone').value;
    const password = document.getElementById('password').value;

    const validate = isValidateField(cellPhone, password);
    if(validate){
        // validar que el celular exista
        const response = await axios.get(`${URLUsers}?cellphone=${cellPhone}`);
        if (response.data.length > 0 && password !== response.data[0].password){
            alertError('La contraseña ingresada es incorrecta');
        } else if(response.data.length > 0 && password == response.data[0].password){
            //datos correctos
            Swal.fire(
                '',
                `Bienvenido <b>${response.data[0].username}</b>`,
                'success'
            ).then((result) => {
                if (result.isConfirmed) {
                    sessionStorage.setItem('login', JSON.stringify(response.data[0]));
                    location.pathname = '/chat.html';
                }
            });
        }else{
            alertError('El número ingresado no existe.');
        }
    }
});

// construye error diamico
const alertError = (text) =>{
    Swal.fire(
        '',
        text,
        'error'
    )
}

// valida que los datos se llenaron correctamnete
const isValidateField = (cellPhone, password) =>{
    let isValid = true;

    if(cellPhone.length === 0){
        alertError('Falta ingresar número de celular');
        return false;
    }

    if(password.length === 0){
        alertError('Falta ingresar contraseña');
        return false;
    }

    const expresion = /^3[\d]{9}$/;
    if (isNaN(cellPhone) || !expresion.test(cellPhone)){
        alertError('Ingrese un número de celular valido');
        return false;
    }

    return isValid;
}