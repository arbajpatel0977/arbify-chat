import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { createContext, useEffect, useState } from "react";
import { auth, db } from "../config/firebase";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();

const AppContextProvider = (props) => {


    const navigate = useNavigate();
    const [userData, setUserdata] = useState(null);
    const [chatData, setChatData] = useState(null);
    const [messagesId, setMessagesId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [chatUser, setChatUser] = useState(null);
    const [chatVisible, setChatVisible] = useState(false);

    const loadUserData = async (uid) => {
        try {
            const userref = doc(db, 'users', uid);
            const usersSnap = await getDoc(userref);
            const userData = usersSnap.data();
            setUserdata(userData)
            if (userData && userData.avatar && userData.name) {
                navigate('/chat')
            }
            else {
                navigate('/profile')
            }
            await updateDoc(userref, {
                lastSeen: Date.now()
            })
            setInterval(async () => {
                if (auth.chatUser) {
                    await updateDoc(userref, {
                        lastSeen: Date.now()
                    })
                }
            }, 6000)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        if (userData) {
            const chatRef = doc(db, 'chats', userData.id);
            const unSub = onSnapshot(chatRef, async (res) => {
                const chatItems = res.data().chatData
                const tempData = [];
                for (const item of chatItems) {
                    const userRef = doc(db, 'users', item.rId);
                    const userSnap = await getDoc(userRef);
                    const userData = userSnap.data();
                    tempData.push({
                        ...item,
                        userData
                    })
                }
                setChatData(tempData.sort((a, b) => b.updatedAt - a.updatedAt));
            })
            return () => {
                unSub();
            }
        }
    }, [userData])

    const value = {
        chatData, setChatData,
        userData, setUserdata, loadUserData,
        messagesId, setMessagesId,
        messages, setMessages,
        chatUser, setChatUser,
        chatVisible, setChatVisible
    }
    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}
export default AppContextProvider
