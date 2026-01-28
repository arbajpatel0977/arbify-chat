import React, { useContext, useEffect, useState } from 'react'
import './ProfileUpdate.css'
import assets from '../../assets/assets'
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import axios from 'axios';
import { AppContext } from '../../context/AppContext';

const ProfileUpdate = () => {
    const navigate = useNavigate();

    const [image, setImage] = useState(false);
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [uid, setUid] = useState("");
    const [prevImage, setPrevImage] = useState("")
    const { setUserdata } = useContext(AppContext);

    const profileUpdate = async (event) => {
        event.preventDefault();
        try {

            if (!prevImage && image) {
                toast.error("upload Profile Picture")
            }
            const docRef = doc(db, "users", uid);
            if (image) {
                const formData = new FormData();

                formData.append('images', image);

                const { data } = await axios.post('http://localhost:4000/api/product/add', formData);
                console.log("Image upload response:", data.imageUrl);

                if (!data.imageUrl) {
                    toast.error("Failed to upload image. Please try again.");
                    return;
                }

                setPrevImage(data.imageUrl);
                await updateDoc(docRef, {
                    avatar: data.imageUrl,
                    bio: bio,
                    name: name
                })
                toast.success("Profile updated successfully!");
            } else {
                await updateDoc(docRef, {
                    bio: bio,
                    name: name
                })
                toast.success("Profile updated successfully!");
            }
            const snap = await getDoc(docRef);
            setUserdata(snap.data());
            navigate('/chat');


        } catch (error) {
            console.log("Error in profile update:", error);
            toast.error("Error updating profile. Please try again.",error.message);
        }
    }

    useEffect(() => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUid(user.uid);
                const docref = doc(db, "users", user.uid);
                const docSnap = await getDoc(docref);
                if (docSnap.data().name) {
                    setName(docSnap.data().name)
                }
                if (docSnap.data().bio) {
                    setBio(docSnap.data().bio)
                }
                if (docSnap.data().avatar) {
                    setPrevImage(docSnap.data().avatar)
                }
            } else {
                navigate('/');
            }
        })
    }, [])

    return (
        <div className='profile'>
            <div className="profile-container">
                <form onSubmit={profileUpdate}>
                    <h3>Profile Details</h3>
                    <label htmlFor="avatar">
                        <input onChange={(e) => setImage(e.target.files[0])} type="file" id='avatar' accept='.png, .jpg ,.jpeg' hidden />
                        <img src={image ? URL.createObjectURL(image) : prevImage ? prevImage : assets.avatar_icon} alt="" />
                        upload profile image
                    </label>
                    <input onChange={(event) => setName(event.target.value)} value={name} type="text" placeholder='Your Name' required />
                    <textarea onChange={(e) => setBio(e.target.value)} value={bio} placeholder='write profile bio' required></textarea>
                    <button type='submit'>Save</button>
                </form>
                <img className='profile-pic' src={image ? URL.createObjectURL(image) : prevImage ? prevImage : assets.logo} alt="" />
            </div>
        </div>
    )
}


export default ProfileUpdate
