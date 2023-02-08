import '../styles/style.scss';
import Swal from 'sweetalert2';
import axios from 'axios';
import { DateTime, Info } from "luxon";

// cambia imagen cuando url es valida
document.getElementById('url').addEventListener('input', function (evt) {
    const image= document.getElementById('profile');
    if(evt.currentTarget.value){
        image.src= evt.currentTarget.value
    }else{
        image.src= 'https://w7.pngwing.com/pngs/340/946/png-transparent-avatar-user-computer-icons-software-developer-avatar-child-face-heroes-thumbnail.png'
    }    
});

// valida el envio del registro
const URLUsers = 'https://sprint1p-server-production.up.railway.app/users';

document.getElementById('sentData').addEventListener('click', async (event)=>{
    event.preventDefault();
    const userName = document.getElementById('userName').value;
    const cellPhone = document.getElementById('cellPhone').value;
    const password = document.getElementById('password').value;
    const url = document.getElementById('url').value;
    const phrase= document.getElementById('phrase').value;

    const validate = isValidateField(userName,cellPhone,password,url,phrase);
    if(validate){
        // validar que el celular no exista
        const cellPhone = document.getElementById('cellPhone').value;
        const response = await axios.get(`${URLUsers}?cellphone=${cellPhone}`);
        if(response.data.length===0){
            //datos a enviar
            const dataSent={
                username : userName,
                cellphone : cellPhone,
                password : password,
                url : url,
                phrase: phrase,
                onLine: false,
                date: DateTime.local().ts
            }
            const responsePost = await axios.post(URLUsers, dataSent)
            Swal.fire(
                '',
                'El usuario fue creado exitosamente.',
                'success'
            ).then((result) => {
                if (result.isConfirmed) {
                    sessionStorage.setItem('login', JSON.stringify(responsePost.data));
                    location.pathname = '/chat.html';
                }
            });
        }else{
            alertError('El número de celular ingresado ya está registrado.');
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
const isValidateField = (userName,cellPhone,password,url,phrase) =>{
    let isValid = true;

    if(userName.length < 4 || password.length < 4 || phrase.length< 4 || url.length < 4){
        alertError('Valide que su nombre, contraseña, url ó su frase tenga minimo 4 caracteres');
        return false;
    }

    if(!isNaN(userName) ||  !isNaN(phrase)){
        alertError('Su nombre ó su frase no pueden ser números');
        return false;
    }
    const expresion = /^3[\d]{9}$/;
    if (isNaN(cellPhone) || !expresion.test(cellPhone)){
        alertError('Ingrese un número de celular valido');
        return false;
    }

    if(url){
        try {
            new URL(url);
        } catch (err) {
            alertError('Ingrese una url valida');
            return false;
        }
    }
    return isValid;
}