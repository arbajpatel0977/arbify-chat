import React, { useContext, useEffect, useState } from 'react'
import './LeftSideBar.css'
import assets from '../../assets/assets'
import { useNavigate } from 'react-router-dom';
import { arrayUnion, collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';



const LeftSideBar = () => {

    const navigate = useNavigate();
    const { userData, chatData, messagesId, setMessagesId, chatUser, setChatUser, chatVisible, setChatVisible } = useContext(AppContext);
    const [user, setUser] = useState(null);
    const [showSearch, setShowSearch] = useState(false);

    const inputHandler = async (e) => {
        try {
            const input = e.target.value;
            if (input) {
                setShowSearch(true);
                // Handle the input value as needed
                const userRef = collection(db, 'users');
                const q = query(userRef, where('username', "==", input.toLowerCase()));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty && querySnapshot.docs[0].data().id !== userData.id) {
                    let userExites = false;
                    chatData.map((user) => {
                        if (user.rId === querySnapshot.docs[0].data().id) {
                            userExites = true;
                        }
                    })
                    if (!userExites) {
                        setUser(querySnapshot.docs[0].data());

                    }
                } else {
                    setUser(null);
                }
            } else {
                setShowSearch(false);
            }

        } catch (error) {

            console.log(error)
        }
    }

    const addChat = async () => {
        const messagesRef = collection(db, 'messages');
        const chatRef = collection(db, 'chats');
        try {
            const newMessageRef = doc(messagesRef);

            await setDoc(newMessageRef, {
                createAt: serverTimestamp(),
                messages: []
            })

            await updateDoc(doc(chatRef, user.id), {
                chatData: arrayUnion({
                    messageId: newMessageRef.id,
                    lastMessage: "",
                    rId: userData.id,
                    updateAt: Date.now(),
                    messageSeen: true
                })
            }

            );

            await updateDoc(doc(chatRef, userData.id), {
                chatData: arrayUnion({
                    messageId: newMessageRef.id,
                    lastMessage: "",
                    rId: user.id,
                    updateAt: Date.now(),
                    messageSeen: true
                })
            });

            const uSnap = await getDoc(doc(db, 'users', user.id));
            const uData = uSnap.data();
            setChat({
                messageId: newMessageRef.id,
                lastMessage: "",
                rId: user.id,
                userData: uData,
                updateAt: Date.now(),
                messageSeen: true
            })

            setShowSearch(false);
            setChatVisible(true);

        } catch (error) {
            toast.error("Error in creating chat", error.message);
            console.log(error)
        }
    }


    const setChat = async (item) => {
        try {
            setMessagesId(item.messageId);
            setChatUser(item);
            const userChatRef = doc(db, "chats", userData.id);
            const userChatsSnapShot = await getDoc(userChatRef);
            const userChatsData = userChatsSnapShot.data();
            const chatIndex = userChatsData.chatData.findIndex((c) => c.messageId === item.messageId);
            userChatsData.chatData[chatIndex].messageSeen = true;
            await updateDoc(userChatRef, {
                chatData: userChatsData.chatData
            })
            setChatVisible(true);
        } catch (error) {
            toast.error("Error in setting chat", error.message);
            console.log(error)
        }
    }

    useEffect(() => {

        const updateChatUserData = async () => {
            if (chatUser) {
                const userRef = doc(db, 'users', chatUser.userData.id);
                const userSnap = await getDoc(userRef);
                const userData = userSnap.data();
                setChatUser(prev => ({ ...prev, userData: userData }));
            }
        }
        updateChatUserData();
    }, [chatData])

    return (
        <div className={`ls ${chatVisible ? 'hidden' : ''}`}>
            <div className="ls-top">
                <div className="ls-nav">
                    <img src={assets.logo} className='logo' alt="" />
                    <div className="menu">
                        <img src={assets.menu_icon} alt="" />
                        <div className="sub-menu">
                            <p onClick={() => navigate('/profile')}>Edit Profile</p>
                            <hr />
                            <p onClick={() => navigate('/')}>Logout</p>
                        </div>
                    </div>
                </div>
                <div className="ls-search">
                    <img src={assets.search_icon} alt="" />
                    <input onChange={inputHandler} type="text" placeholder='Search Here..' />
                </div>
            </div>
            <div className="ls-list">
                {showSearch && user
                    ? <div onClick={addChat} className='friends add-user'>
                        {<img src={user.avatar} alt="" />}
                        <p>{user.name}</p>
                    </div>
                    :
                    chatData.map((item, index) => (
                        <div onClick={() => setChat(item)} key={index} className={`friends ${item.messageSeen || item.messageId === messagesId ? '' : 'border'}`}>
                            {<img src={item.userData.avatar} alt="" />}
                            <div>
                                <p>{item.userData.name}</p>
                                <span>{item.lastMessage}</span>
                            </div>
                        </div>
                    ))
                }

            </div>
        </div>
    )
}

export default LeftSideBar