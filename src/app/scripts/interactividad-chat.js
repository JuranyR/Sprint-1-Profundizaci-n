import axios from 'axios';
import { getDataMessage, searchChat, sendData } from './chat'
import Swal from 'sweetalert2';

const userLogin = JSON.parse(sessionStorage.getItem('login'));
const URLUsers = 'http://localhost:3000/users/';

//abre o cierra perfil
const profile= document.getElementById('edit-profile');
document.getElementById('open-profile').addEventListener('click', ()=>{
    profile.classList.add("show");
});

document.getElementById('close-profile').addEventListener('click', ()=>{
    profile.classList.remove("show");
});

//abre o cierra buscador
const search= document.getElementById('search__chat');
document.getElementById('open-search').addEventListener('click', ()=>{
    searchChat(search.dataset.id)
    search.classList.add("show");
});

document.getElementById('close-search').addEventListener('click', ()=>{
    search.classList.remove("show");
});

//cambiar foto de perfil
const saveButton = document.getElementById('save-profile');
const imgProfile = document.getElementById('url-profile');
const inputUrl = document.getElementById('input-url');
export const dataProfile= ()=>{

    inputUrl.value = userLogin.url;
    document.getElementById('img-profile').addEventListener('click', () => {
        if (imgProfile.classList.contains('edit__info__hide')) {
            imgProfile.classList.remove('edit__info__hide');
        } else {
            imgProfile.classList.add('edit__info__hide');
        }
        disabledSave()
    });
    
    //cambiar nombre perfil
    const nameProfile = document.getElementById('input-name');
    nameProfile.value = userLogin.username;
    document.getElementById('edit-name').addEventListener('click', () => {
        nameProfile.disabled = !nameProfile.disabled;
        disabledSave()
    });

    //deshabilitar guardado perfil
    const disabledSave= () =>{
        if(!nameProfile.disabled || !imgProfile.classList.contains('edit__info__hide')){
            saveButton.disabled = false 
        }else {
            saveButton.disabled = true 
        }
    }
    //actualizar datos perfil
    saveButton.addEventListener('click', async()=>{
        const newObject ={
            url: inputUrl.value,
            username: nameProfile.value
        }
        const { data }= await axios.patch(URLUsers + userLogin.id, newObject)
        Swal.fire(
            '',
            'Tus datos se han actualizados satisfactoriamente.',
            'success'
        ).then((result) => {
            if (result.isConfirmed) {
                nameProfile.disabled = !nameProfile.disabled;
                imgProfile.classList.add('edit__info__hide');
                disabledSave();
                sessionStorage.setItem('login', JSON.stringify(data));
                document.getElementById('user-login').src= data.url;
            }
        });
    })
}

//comportamiento chats mobile
export const clickChats= () =>{
    // cargar mensaje o abrir mobile
    const loadMessage = async (e) => {
        const chatItem= e.target.closest('.chats__item');
        const element = document.querySelectorAll('.select')[0].classList.remove('select')
        
        if(chatItem){
            chatItem.classList.add('select')
            document.getElementById('chat').style.display='unset';
            document.getElementById('chat').classList.add("chat-mobile");
            await getDataMessage(chatItem.dataset.id, chatItem.dataset.userid)
        }
    };

    document.getElementById('chats').addEventListener('click', loadMessage) 

    document.getElementById('seachUser').addEventListener('click', ()=>{
        document.getElementById('chats').removeEventListener('click', loadMessage) 
    });

    // cerrar chat mobile
    document.getElementById('close-chat').addEventListener('click', ()=>{
        document.getElementById('chat').style.display='';
        document.getElementById('chat').classList.remove("chat-mobile");
    });
}

// comportamiento action message
export const actionsMessage = ()=>{
    let elementActions;
    const openActions = (e)=>{
        if(elementActions){
            elementActions.firstElementChild.classList.add("hide")
        }
        if(e.target.closest('.content_message').firstElementChild.classList.contains('hide')){
            e.target.closest('.content_message').firstElementChild.classList.remove("hide")
            elementActions= e.target.closest('.content_message')
        }
        editMessage();
    }
    document.getElementById('conversation').addEventListener('click', openActions) 
    document.getElementById('chats').addEventListener('click', ()=>{
        document.getElementById('conversation').removeEventListener('click', openActions) 
    });
}

// editar mensaje
let elementInput;
let elementMessage;
let lastActions
const editMessage= () =>{
    if(lastActions && lastActions.classList.contains('hide') && elementInput){
        elementInput.classList.add("hide")
        elementMessage.classList.remove("hide")
    }
    const editClick = (event)=>{
        // editar conversación
        const idConversation= event.target.dataset.conversation;
        const idMessage = event.target.dataset.id;

        if(idMessage && event.target.dataset.action =='edit' && idConversation){
            const clickInput = async (event) =>{
                if (event.key === "Enter") {
                    event.preventDefault();
                    sendData(idConversation,idMessage, document.getElementById(`inputMessage${idConversation}${idMessage}`).value);
                }
            }
            if(document.getElementById(`inputMessage${idConversation}${idMessage}`).classList.contains('hide')){
                document.getElementById(`inputMessage${idConversation}${idMessage}`).classList.remove('hide')
                document.getElementById(`message${idConversation}${idMessage}`).classList.add('hide')
                elementInput= document.getElementById(`inputMessage${idConversation}${idMessage}`);
                elementMessage= document.getElementById(`message${idConversation}${idMessage}`)
            }else{
                document.getElementById(`inputMessage${idConversation}${idMessage}`).classList.add('hide')
                document.getElementById(`message${idConversation}${idMessage}`).classList.remove('hide')
            }
            
            document.getElementById(`inputMessage${idConversation}${idMessage}`).addEventListener('keyup',clickInput)
            
            document.getElementById(`edit${idConversation}${idMessage}`).addEventListener('click', ()=>{
                document.getElementById(`inputMessage${idConversation}${idMessage}`).removeEventListener('keyup',clickInput)
            });
        }
        if(idMessage && event.target.dataset.action =='delete' && idConversation){
            Swal.fire({
                icon: 'warning',
                text: 'Está seguro de eliminar el mensaje?',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Si, eliminarlo!'
            }).then((result) => {
                if (result.isConfirmed) {
                    sendData(idConversation,idMessage,'')
                }
            });

        }

    }
    const edit = document.querySelectorAll('.content_actions:not(.hide)');
    edit.forEach((el)=>{   
        lastActions=el     
        el.addEventListener('click', editClick)
        document.getElementById('conversation').addEventListener('click', ()=>{
            el.removeEventListener('click', editClick) 
        });
    })
}
