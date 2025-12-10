const helper = require('./helper.js');
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');

//display the profile info
const ProfileDisplay = (props) => (
    <div className="profileInfo">
        <img
            src={props.profilePic || '/assets/img/default_pfp.png'}
            alt="Profile Picture"
            className="profilePic"
        />

        <p
            className="usernameColored"
            style={props.isPremium ? { '--username-color': props.usernameColor } : {}}
        >
            {props.displayName}{' '}
            {props.isPremium && (
                <img
                    src="/assets/img/premium_icon.png"
                    alt="Premium User"
                    className="premiumIcon"
                />
            )}
        </p>
        <p>@{props.username}</p>
        {props.bio ? (
            <p className="bio">{props.bio}</p>
        ) : (
            <p className="bio empty">No bio set.</p>
        )}

        <div className="followStats">
            <p onClick={props.onFollowersClick} className="clickable">
                {props.followersCount} follower{props.followersCount !== 1 ? 's' : ''}
            </p>
            <p onClick={props.onFollowingClick} className="clickable">
                {props.followingCount} following
            </p>
        </div>

        <p>Joined {new Date(props.createdDate).toLocaleDateString()}</p>
    </div>
);

//change password form
const ChangePasswordForm = ({ onCancel }) => {

    const handleChangePassword = async (e) => {
        e.preventDefault();
        helper.hideError();

        const currentPass = e.target.currentPass.value;
        const newPass = e.target.newPass.value;
        const newPass2 = e.target.newPass2.value;

        if (!currentPass || !newPass || !newPass2) {
            helper.handleError("All fields are required!");
            return;
        }

        if (newPass !== newPass2) {
            helper.handleError("New passwords do not match!");
            return;
        }

        if (currentPass === newPass) {
            helper.handleError("New password cannot be the same as your old password!");
            return;
        }

        const res = await fetch('/changePassword', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPass, newPass })
        });

        const data = await res.json();

        if (data.success) {
            helper.handleError("Password changed successfully!");
            onCancel();
        }
    };

    return (
        <form className="changePasswordForm" onSubmit={handleChangePassword}>
            <label>Current Password</label>
            <input type="password" name="currentPass" required />

            <label>New Password</label>
            <input type="password" name="newPass" required />

            <label>Retype New Password</label>
            <input type="password" name="newPass2" required />

            <button type="submit">Change Password</button>
            <button type="button" onClick={onCancel}>Cancel</button>
        </form>
    );
};

//main component, handles fetching and rendering profile
const ProfileApp = () => {
    const [profileData, setProfileData] = useState({
        username: '',
        bio: '',
        displayName: '',
        createdDate: '',
    });

    const [editing, setEditing] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [tempProfile, setTempProfile] = useState(profileData);
    const [selectedFile, setSelectedFile] = useState(null);

    //for followers/following popup modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalUsers, setModalUsers] = useState([]);


    //selecting a pfp
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onload = () => {
                setTempProfile(prev => ({
                    ...prev,
                    profilePicPreview: reader.result,//preview
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    //after editing profile
    const handleSave = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('displayName', tempProfile.displayName);
        formData.append('bio', tempProfile.bio);

        //only append username color if premium (otherwise won't have username color)
        if (profileData.isPremium) {
            formData.append('usernameColor', tempProfile.usernameColor);
        }

        //only append profilePic if user selected a new one
        if (selectedFile) {
            formData.append('profilePic', selectedFile);
        }

        const res = await fetch('/editProfile', {
            method: 'POST',
            body: formData,
        });

        const data = await res.json();
        if (data.success) {
            setProfileData(data.profile);
            setTempProfile(data.profile);
            setSelectedFile(null);
            setEditing(false);
        }
    };

    const openFollowModal = async (type) => {
        try {
            const res = await fetch(`/user/${profileData.username}/${type}`);
            const data = await res.json();
            setModalUsers(data[type]); // followers or following
            setModalTitle(type.charAt(0).toUpperCase() + type.slice(1));
            setIsModalOpen(true);
        } catch (err) {
            console.error(err);
        }
    };


    useEffect(() => {
        const fetchProfile = async () => {
            const response = await fetch('/getProfile');
            const data = await response.json();
            setProfileData(data);
            setTempProfile(data);

            const followersRes = await fetch(`/user/${data.username}/followers`);
            const followersData = await followersRes.json();
            const followingRes = await fetch(`/user/${data.username}/following`);
            const followingData = await followingRes.json();

            setProfileData(prev => ({
                ...prev,
                followersCount: followersData.followers.length,
                followingCount: followingData.following.length,
            }));
        };
        fetchProfile();
    }, []);

    //if user is currently editing, show edit profile view (form)
    if (editing) {
        return (
            <form className="editProfileForm" onSubmit={handleSave}>
                <img
                    src={
                        tempProfile.profilePicPreview ||
                        tempProfile.profilePic ||
                        '/assets/img/default_pfp.png'
                    }
                    alt="Profile Picture"
                    className="profilePic"
                />

                <br /><br />

                <label>Profile Picture</label>

                <br />

                <input type="file" name="profilePic" accept="image/*" onChange={handleFileSelect} />

                <br />

                <label>Display Name</label><br />
                <input
                    type="text"
                    value={tempProfile.displayName}
                    onChange={(e) =>
                        setTempProfile({ ...tempProfile, displayName: e.target.value })
                    }
                />

                <br />

                <label>Bio</label><br />
                <textarea
                    value={tempProfile.bio}
                    onChange={(e) =>
                        setTempProfile({ ...tempProfile, bio: e.target.value })
                    }
                />

                <br />

                {profileData.isPremium && (
                    <>
                        <label>Username Color (premium only!)</label><br />
                        <input
                            type="color"
                            value={tempProfile.usernameColor || '#000000'}
                            onChange={(e) =>
                                setTempProfile({ ...tempProfile, usernameColor: e.target.value })
                            }
                            name="usernameColor"
                        />
                    </>
                )}

                <br />

                <button type="submit">Save</button>
                <button type="button"
                    onClick={() => {
                        setTempProfile(profileData); //discard unsaved edits
                        setEditing(false);
                    }}
                >Cancel</button>
            </form>
        );
    }

    //if changing password
    // if changing password
    if (changingPassword) {
        return (
            <ChangePasswordForm onCancel={() => setChangingPassword(false)} />
        );
    }


    //otherwise show default view profile
    return (
        <div>
            <ProfileDisplay
                {...profileData}
                onFollowersClick={() => openFollowModal('followers')}
                onFollowingClick={() => openFollowModal('following')}
            />
            <button
                onClick={() => {
                    setTempProfile(profileData); //load current values into temp form
                    setEditing(true);
                }}
            >Edit Profile</button>

            <button
                onClick={() => setChangingPassword(true)}
            >
                Change Password
            </button>

            {isModalOpen && (
                <div className="modalOverlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modalContent" onClick={(e) => e.stopPropagation()}>
                        <h3>{modalTitle}</h3>
                        <div className="modalUserList">
                            {modalUsers.map((user) => (
                                <div key={user._id} className="modalUser">
                                    <img
                                        src={user.profilePic || '/assets/img/default_pfp.png'}
                                        alt="Profile Pic"
                                        className="postProfilePic"
                                    />{' '}
                                    <span
                                        className="usernameColored"
                                        style={user.isPremium ? { '--username-color': user.usernameColor } : {}}
                                    >
                                        {user.displayName}{' '}
                                        {user.isPremium && (
                                            <img
                                                src="/assets/img/premium_icon.png"
                                                alt="Premium"
                                                className="premiumIcon"
                                            />
                                        )}
                                    </span>
                                    <span className="username">@{user.username}</span>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setIsModalOpen(false)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );

};

const init = () => {
    const root = createRoot(document.getElementById('profile'));
    root.render(<ProfileApp />);
};

window.onload = init;