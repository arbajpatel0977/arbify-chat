import React, { useContext, useEffect, useState } from 'react'
import './ChatBox.css'
import assets from '../../assets/assets'
import { AppContext } from '../../context/AppContext';
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { toast } from 'react-toastify';
import axios from 'axios';

const ChatBox = () => {
    const { userData, chatUser, messagesId, messages, setMessages, chatVisible, setChatVisible, } = useContext(AppContext);

    const [input, setInput] = useState("");


    const sendMessage = async () => {
        try {
            if (input && messagesId) {
                await updateDoc(doc(db, "messages", messagesId), {
                    messages: arrayUnion({
                        sId: userData.id,
                        text: input,
                        createdAt: new Date()
                    })
                })
                const userIds = [chatUser.rId, userData.id];

                userIds.forEach(async (id) => {
                    const userChatRef = doc(db, "chats", id);
                    const userChatsSnapShot = await getDoc(userChatRef);
                    if (userChatsSnapShot.exists()) {
                        const userChatData = userChatsSnapShot.data();
                        const chatIndex = userChatData.chatData.findIndex((c) => c.messageId === messagesId);
                        if (chatIndex !== -1) {
                            userChatData.chatData[chatIndex].lastMessage = input.slice(0, 30);
                            userChatData.chatData[chatIndex].updateAt = Date.now();
                            if (userChatData.chatData[chatIndex].rId === userData.id) {
                                userChatData.chatData[chatIndex].messageSeen = false;
                            }
                            await updateDoc(userChatRef, {
                                chatData: userChatData.chatData
                            })
                        }
                    }
                })
            }
        } catch (error) {
            console.log("error while sending message", error);
            toast.error(error.message);
        }
        setInput("");
    }

    const sendImage = async (e) => {
        try {

            const formData = new FormData();
            const image = e.target.files[0];
            formData.append('images', image);

            const { data } = await axios.post('http://localhost:4000/api/product/add', formData);
            console.log("Image upload response:", data.imageUrl);
            const fileUrl = data.imageUrl;
            if (fileUrl && messagesId) {
                await updateDoc(doc(db, "messages", messagesId), {
                    messages: arrayUnion({
                        sId: userData.id,
                        image: fileUrl,
                        createdAt: new Date()
                    })
                })

                const userIds = [chatUser.rId, userData.id];

                userIds.forEach(async (id) => {
                    const userChatRef = doc(db, "chats", id);
                    const userChatsSnapShot = await getDoc(userChatRef);
                    if (userChatsSnapShot.exists()) {
                        const userChatData = userChatsSnapShot.data();
                        const chatIndex = userChatData.chatData.findIndex((c) => c.messageId === messagesId);
                        if (chatIndex !== -1) {
                            userChatData.chatData[chatIndex].lastMessage = "Image";
                            userChatData.chatData[chatIndex].updateAt = Date.now();
                            if (userChatData.chatData[chatIndex].rId === userData.id) {
                                userChatData.chatData[chatIndex].messageSeen = false;
                            }
                            await updateDoc(userChatRef, {
                                chatData: userChatData.chatData
                            })
                        }
                    }
                })


            }

        } catch (error) {
            toast.error("Failed to send image. Please try again.", error.message);
            console.log("Error in sending image:", error);
        }
    }

    useEffect(() => {
        if (messagesId) {
            const unSub = onSnapshot(doc(db, "messages", messagesId), (res) => {
                setMessages(res.data().messages.reverse());
                console.log(res.data().messages.reverse());
            });
            return () => { unSub(); }
        }

    }, [messagesId])

    return chatUser ? (
        <div className={`chat-box ${chatVisible ? '' : 'hidden'}`}>
            <div className="chat-user" onClick={() => setChatVisible(false)}>
                <img src={chatUser.userData.avatar} alt="" />
                <p>{chatUser.userData.name} {Date.now() - chatUser.userData.lastSeen <= 70000 ? <img src={assets.green_dot} className='dot' alt="" /> : null}</p>
                <img src={assets.help_icon} alt="" className='help' />
                <img src={assets.arrow_icon} alt="" className='arrow' onClick={() => setChatVisible(false)} />
            </div>
            <div className="chat-message">
                {
                    messages.map((msg, index) => (
                        <div key={index} className={msg.sId === userData.id ? 's-msg' : 'r-msg'}>
                            {
                                msg["image"]
                                    ? <img src={msg.image} alt="" className='msg-img' />
                                    : <p className="msg">{msg.text}</p>
                            }

                            <div>
                                <img src={msg.sId === userData.id ? userData.avatar : chatUser.userData.avatar} alt="" />
                                <p>{new Date(msg.createdAt?.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                        </div>

                    ))
                }



            </div>



            <div className="chat-input">
                <input onChange={(e) => setInput(e.target.value)} value={input} type="text" placeholder='Senad A Message' />
                <input onChange={sendImage} type="file" id='image' accept='image/png, image/jpeg' hidden />
                <label htmlFor="image">
                    <img src={assets.gallery_icon} alt="" />
                </label>
                <img onClick={sendMessage} src={assets.send_button} alt="" />
            </div>
        </div>
    )
        : <div className={`chat-welcome ${chatVisible ? '' : 'hidden'}`}>
            <img src={assets.logo} alt="" />
            <p>chat Any Time Any Where</p>
        </div>
}

export default ChatBox