import '../styles/style.scss';
import check from '../asset/icons/Double-Tick.svg';
import checkBlue from '../asset/icons/Double-Tick-blue.svg';
import editIcon from '../asset/icons/edit.svg';
import deleteIcon from '../asset/icons/delete.svg';
import { clickChats, actionsMessage, dataProfile } from './interactividad-chat';
import axios from 'axios';
import { DateTime } from "luxon";

const URLMessages = 'http://localhost:3000/messages';
const URLUsers = 'http://localhost:3000/users';
const userLogin = JSON.parse(sessionStorage.getItem('login'));

const getMyMessages = async (user, search) =>{
    let response= [];
    let api1;
    let api2;
    if(search){
        api1=`${URLMessages}?idUser1=${user.id}&q=${search}`
        api2=`${URLMessages}?idUser2=${user.id}&q=${search}`
    }else {
        api1=`${URLMessages}?idUser1=${user.id}`
        api2=`${URLMessages}?idUser2=${user.id}`
    }
    const responseIdUser1 = await axios.get(api1);
    const responseIdUser2 = await axios.get(api2);
    const allMessages= response.concat(responseIdUser1.data, responseIdUser2.data);
    try{
        allMessages.sort((x, y) => DateTime.fromISO(y.conversation[y.conversation.length-1].date) - DateTime.fromISO(x.conversation[x.conversation.length-1].date));
    }catch{
        console.log('no se pudo organizar')
    }
    return allMessages
}

const getUsers = async (search) =>{
    let api;
    if(search){
        api=`${URLUsers}?${search}`
    } else{
        api=URLUsers
    }
    const response = await axios.get(api);
    return response.data;
}

export const getMessages = async (filter) =>{
    let api;
    if(filter){
        api=`${URLMessages}${filter}`
    } else{
        api=URLMessages
    }
    const response = await axios.get(api);
    return response.data;
}

const renderMessages = async (user, search) =>{
    //cargar usuarios
    const users= await getUsers();
    //cargar chats
    const messages=  await getMyMessages(user,search);
    // renderiza all chats
    const htmlChats= document.getElementById('chats');
    htmlChats.innerHTML='';

    messages.forEach(function(message, index) {
        const userId=message.idUser1 == user.id? message.idUser2: message.idUser1;
        const dataUser = users.find(user=> user.id === userId);
        if(index==0) renderMessage(dataUser, message, user);
        const lastMessage= message.conversation[message.conversation.length-1];
        if(lastMessage){
            htmlChats.innerHTML+= `
            <div class="${index==0 && !search?'chats__item select':'chats__item'}" data-id="${message.id}" data-userId="${dataUser.id}">
                <div class="chats__item__avatar">
                    <img src="${dataUser.url}" alt="user">
                </div>
                <div class="chats__item__info">
                    <h4>${dataUser.username}</h4>
                    <p>${lastMessage.message}</p>
                </div>
                <div class="chats__item__time">
                    <p>${DateTime.fromISO(lastMessage.date).toLocaleString({ weekday: 'long' })}</p>
                </div>
            </div>
        `
        }
    });
    clickChats();
    return messages
}

const renderMessage = async (user,data, myUser) =>{
    //actualiza header data user
    const userInfo= document.getElementById('userInfo');
    userInfo.innerHTML='';
    userInfo.insertAdjacentHTML("beforeend",  `
        <div class="message__header__left__info__avatar">
            <img src="${user.url}" alt="user">
        </div>
        <div class="message__header__left__info__content" >
            <h4>${user.username}</h4>
            <p>${user.onLine?'EN LINEA':'DESCONECTADO'}</p>
        </div>
    `)
    //configura data buscador
    const messageWith= document.getElementById('message-with');
    messageWith.innerText=`Mensajes con ${user.username}`
    const searhConversation= document.getElementById('search__chat');
    searhConversation.dataset.id= data?data.id:'0'

    //configuraion input conversacion
    const inputConversation= document.getElementById('form');
    inputConversation.dataset.id= data?data.id:'0'
    inputConversation.dataset.idUser=user.id; 
    // renderiza conversación
    const htmlConversation= document.getElementById('conversation');
    htmlConversation.innerHTML='';
    let beforeDate='';
    if(data){
        data.conversation.forEach(function(messageItem) {
            if(beforeDate !== messageItem.date){
                beforeDate= messageItem.date;
                let day='';
                if(DateTime.local().toISODate() == messageItem.date){
                    day='Hoy';
                } else if(DateTime.local().minus({ days: 1 }).toISODate() == messageItem.date){
                    day='Ayer'
                } else if(DateTime.fromISO(messageItem.date).toISODate() > DateTime.local().minus({ days: 7 }).toISODate()){
                    day=DateTime.fromISO(messageItem.date).toLocaleString({ weekday: 'long' })
                } else {
                    day= DateTime.fromISO(messageItem.date).toFormat("MMMM dd, yyyy", { locale: "es" })
                }
                htmlConversation.innerHTML+= `
                    <div class="content__day">
                        <p>${day}</p>
                    </div>
                ` 
            }
            htmlConversation.innerHTML+= `
                <div class="${myUser.id == messageItem.sendBy?'content__sent content_message':'content__me content_message'}">
                    <div class="${myUser.id == messageItem.sendBy?'content__sent__actions hide content_actions':'content__me__actions hide content_actions'}">
                        ${ myUser.id == messageItem.sendBy ?
                            `
                                <img src="${editIcon}" alt="edit" data-id="${messageItem.id}" data-action="edit" data-conversation="${data.id}" id='edit${data.id}${messageItem.id}'>
                            `
                            :''
                        }
                        <img src="${deleteIcon}" alt="delete" data-id="${messageItem.id}" data-action="delete" data-conversation="${data.id}">
                    </div>
                    <div class="${myUser.id !== messageItem.sendBy?'content__message':'content__message content__chat__sent'}">
                        <input type="text" placeholder="Type a message" minlength="1" value="${messageItem.message}" id='inputMessage${data.id}${messageItem.id}' class="hide" >
                        <span id='message${data.id}${messageItem.id}'>${messageItem.message}</span>
                        <span class='content__message__time'>
                            ${DateTime.fromISO(messageItem.hour).toLocaleString({  hour: '2-digit', minute: '2-digit', hour12: true })}
                            ${myUser.id == messageItem.sendBy?`<img src="${messageItem.flag?checkBlue:check}" alt="check">` :''}
                        </span>
                    </div>
                </div>
            `
        });
        actionsMessage();
    }
}

const searchWordKeyboard= (classInput,classButton, idMessage)=>{
    const keyPress= (event) =>{
        if (event.key === "Enter") {
            event.preventDefault();
            document.getElementById(classButton).click();
        }else if(event.key == "Backspace" && !idMessage){
            renderMessages(userLogin);
        }
    }
    document.getElementById(classInput).addEventListener('keyup', keyPress);
    if(idMessage){
        deleteListener('keyup',classInput,keyPress)
    }
}
const searchUser= () =>{
    searchWordKeyboard('inputUser','seachUser')
    document.getElementById("seachUser").addEventListener('click', async ()=>{
        const valueSearch= document.getElementById('inputUser').value;
        // buscar chats and users
        if(valueSearch){
            const message= await renderMessages(userLogin,valueSearch)
            const userSearch = await getUsers(`username_like=${valueSearch}&id_ne=${userLogin.id}`);
            const htmlChats= document.getElementById('chats');
            if(userSearch.length>0 && message.length==0){
                userSearch.forEach(function(dataUser) {
                    htmlChats.innerHTML+= `
                        <div class="chats__item" data-userId="${dataUser.id}">
                            <div class="chats__item__avatar">
                                <img src="${dataUser.url}" alt="user">
                            </div>
                            <div class="chats__item__info">
                                <h4>${dataUser.username}</h4>
                            </div>
                        </div>
                    `
                });
            }else if(message.length==0) {
                htmlChats.innerHTML+= `
                <div class="chats__item">
                    <div class="chats__item__info">
                        <h4>Búsqueda sin resultados</h4>
                    </div>
                </div>
                `
            }
            
        }
    })
}

const deleteListener = (eventListener,classsListener,functionListener)=>{
    document.getElementById('close-search').addEventListener('click', ()=>{
        document.getElementById(classsListener).removeEventListener(eventListener, functionListener);  
    });
}


export const searchChat= async (idMessage) =>{
    const htmlResultSearch= document.getElementById('result-search');
    htmlResultSearch.innerHTML=''
    searchWordKeyboard('inputSearchChat','seachChat', idMessage);
    const searchMessage = async (idMessage)=>{
        const valueSearchChat= document.getElementById('inputSearchChat').value;
        const result= await getMessages(`?id=${idMessage}&q=${valueSearchChat}`)
        htmlResultSearch.innerHTML=''
        if(result.length>0){
            const messagesChat= result[0].conversation.filter(text=> text.message.indexOf(valueSearchChat)>-1);
            messagesChat.forEach(function(dataMessage) {
                htmlResultSearch.innerHTML+=`
                    <div class="result__search">
                        <p class="result__search__date">${DateTime.fromISO(dataMessage.date).toLocaleString(DateTime.DATE_SHORT)}</p>
                        <div class="result__search__message">
                            <img src="${check}" alt="check">
                            <p>${dataMessage.message}</p>
                        </div>
                    </div>
                `
            })
        } else {
            htmlResultSearch.innerHTML+= `
                <div class="result__search">
                    <h4>Búsqueda sin resultados</h4>
                </div>
            `
        }
    }
    document.getElementById("seachChat").addEventListener('click', () => searchMessage(idMessage))
    deleteListener('click','seachChat', () => searchMessage(idMessage))

}

export const getDataMessage = async (idMessageClick, userId) => {
    const user = await getUsers(`id=${userId}`);
    let message;
    if(idMessageClick){
        const datos = await getMessages(`?id=${idMessageClick}`);
        message= datos[0]
    } else {
        const myMessages=  await getMyMessages(userLogin);
        message =  myMessages.filter(el=> el.idUser1==userId || el.idUser2==userId)[0];
    }
    const seeMessages= message.conversation.filter(el=> el.sendBy!=parseInt(userLogin.id) && el.flag==false)
    if(seeMessages.length>0){
        seeMessages.forEach(item=>{
            item.flag=true
            const index = message.conversation.findIndex(el => el.id == item.id)
            if(index>-1){
                message.conversation.splice(index,1,item)
            }
        })
        await axios.patch(`${URLMessages}/${message.id}`, {
            conversation :message.conversation
        })
    }
    renderMessage(user[0],message,userLogin)
}

//edicion  mensaje
export const sendData= async (idConversation,idMessage,text) =>{
    const dataMessages = await getMessages(`?id=${idConversation}`);
    const messageObject= dataMessages[0].conversation.filter(el=> el.id==idMessage)[0]
    const index = dataMessages[0].conversation.findIndex(el => el.id == messageObject.id)
    if(index>-1){
        if(text){
            messageObject.message= text
            dataMessages[0].conversation.splice(index,1,messageObject)
        }else{
            dataMessages[0].conversation.splice(index,1)
        }
    }
    await axios.patch(`${URLMessages}/${idConversation}`, {
        conversation :dataMessages[0].conversation
    })
    document.getElementById(`inputMessage${idConversation}${idMessage}`).classList.add('hide')
    renderMessages(userLogin)
}

if(userLogin){
    dataProfile()
    //cambia estado online
    document.addEventListener("DOMContentLoaded", async () => {
        await axios.patch(`${URLUsers}/${userLogin.id}`, {
            onLine: true
        })
    });

    //cambia foto usuario login
    document.getElementById('user-login').src= userLogin.url;
    //renderiza chats con usuarios
    renderMessages(userLogin);
    // busqueda usuario y chats
    searchUser();
    // envio mensaje
    document.getElementById('form').addEventListener('submit', async (event)=>{
        event.preventDefault();
        const input = document.getElementById('sendMessage');
        const idCoversation= parseInt(event.target.dataset.id);
        if(idCoversation > 0){
            const dataMenssages = await getMessages(`?id=${idCoversation}`);
            const newObject ={
                "id": dataMenssages[0].conversation.length+1,
                "sendBy": userLogin.id,
                "date": DateTime.now().toISODate(),
                "hour": DateTime.now().toISOTime(),
                "message": input.value,
                "flag": false
            }
            dataMenssages[0].conversation.push(newObject)
            await axios.patch(`${URLMessages}/${idCoversation}`, {
                conversation :dataMenssages[0].conversation
            })
            input.value = "";
            document.getElementById('chats').click()
            renderMessages(userLogin)
        }else{
            const newObject ={
                "idUser1": userLogin.id,
                "idUser2": parseInt(event.target.dataset.idUser),
                "conversation": [
                    {
                        "id": 1,
                        "sendBy": userLogin.id,
                        "date": DateTime.now().toISODate(),
                        "hour": DateTime.now().toISOTime(),
                        "message": input.value,
                        "flag": false    
                    }
                ]
            }
            await axios.post(`${URLMessages}`, newObject)
            input.value = "";
            document.getElementById('chats').click()
            renderMessages(userLogin)
        }
    })
    
} else{
    location.pathname = '/index.html';
}
