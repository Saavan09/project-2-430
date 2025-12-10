const helper = require('./helper.js');
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');

//display the profile info
const ProfileDisplay = (props) => (
    <div className="card text-center mb-4">
        <div className="card-body">
            <img
                src={props.profilePic || '/assets/img/default_pfp.png'}
                alt="Profile Picture"
                className="rounded-circle img-fluid mb-3"
                style={{ width: '120px', height: '120px' }}
            />

            <h4 className="d-flex justify-content-center align-items-center gap-2">
                <span
                    className="usernameColored"
                    style={props.isPremium ? { '--username-color': props.usernameColor } : {}}
                >
                    {props.displayName}
                </span>
                {props.isPremium && (
                    <img
                        src="/assets/img/premium_icon.png"
                        alt="Premium User"
                        style={{ width: '1em', height: '1em' }}
                    />
                )}
            </h4>

            <p className="text-muted">@{props.username}</p>
            <p>{props.bio || <em>No bio set.</em>}</p>

            <div className="d-flex justify-content-center gap-4 mb-3">
                <span onClick={props.onFollowersClick} className="clickable">
                    <strong>{props.followersCount}</strong> Follower{props.followersCount !== 1 ? 's' : ''}
                </span>
                <span onClick={props.onFollowingClick} className="clickable">
                    <strong>{props.followingCount}</strong> Following
                </span>
            </div>

            <p className="text-muted">Joined {new Date(props.createdDate).toLocaleDateString()}</p>
        </div>
    </div>
);

//change password form
const ChangePasswordForm = ({ onCancel }) => {

    const handleChangePassword = async (e) => {
        e.preventDefault();

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
        <div className="container mt-4">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title text-center mb-3">Change Password</h5>
                            <form onSubmit={handleChangePassword}>
                                <div className="mb-3">
                                    <label className="form-label">Current Password</label>
                                    <input type="password" name="currentPass" className="form-control" required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">New Password</label>
                                    <input type="password" name="newPass" className="form-control" required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Retype New Password</label>
                                    <input type="password" name="newPass2" className="form-control" required />
                                </div>
                                <div className="d-flex justify-content-between">
                                    <button type="submit" className="btn btn-primary">Change Password</button>
                                    <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
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
            <div className="container mt-4">
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <div className="card">
                            <div className="card-body text-center">
                                <h5 className="card-title mb-3">Edit Profile</h5>
                                <form onSubmit={handleSave}>
                                    <img
                                        src={tempProfile.profilePicPreview || tempProfile.profilePic || '/assets/img/default_pfp.png'}
                                        alt="Profile Picture"
                                        className="rounded-circle img-fluid mb-3"
                                        style={{ width: '120px', height: '120px' }}
                                    />
                                    <div className="mb-3">
                                        <label className="form-label">Profile Picture</label>
                                        <input type="file" name="profilePic" className="form-control" accept="image/*" onChange={handleFileSelect} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Display Name</label>
                                        <input type="text" className="form-control" value={tempProfile.displayName} onChange={(e) => setTempProfile({ ...tempProfile, displayName: e.target.value })} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Bio</label>
                                        <textarea className="form-control" value={tempProfile.bio} onChange={(e) => setTempProfile({ ...tempProfile, bio: e.target.value })} />
                                    </div>
                                    {profileData.isPremium && (
                                        <div className="mb-3">
                                            <label className="form-label">Username Color</label>
                                            <input type="color" className="form-control form-control-color" value={tempProfile.usernameColor || '#000000'} onChange={(e) => setTempProfile({ ...tempProfile, usernameColor: e.target.value })} />
                                        </div>
                                    )}
                                    <div className="d-flex justify-content-between">
                                        <button type="submit" className="btn btn-primary">Save</button>
                                        <button type="button" className="btn btn-secondary" onClick={() => { setTempProfile(profileData); setEditing(false); }}>Cancel</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
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
        <div className="container mt-4">
            <ProfileDisplay
                {...profileData}
                onFollowersClick={() => openFollowModal('followers')}
                onFollowingClick={() => openFollowModal('following')}
            />
            <div className="d-flex justify-content-center gap-2 mb-4">
                <button className="btn btn-primary" onClick={() => { setTempProfile(profileData); setEditing(true); }}>Edit Profile</button>
                <button className="btn btn-secondary" onClick={() => setChangingPassword(true)}>Change Password</button>
            </div>

            {/* Followers/Following Modal */}
            {isModalOpen && (
                <div className="modal show d-block" tabIndex="-1" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{modalTitle}</h5>
                                <button type="button" className="btn-close" onClick={() => setIsModalOpen(false)}></button>
                            </div>
                            <div className="modal-body">
                                {modalUsers.map((user) => (
                                    <div key={user._id} className="d-flex align-items-center mb-2 gap-2">
                                        <img src={user.profilePic || '/assets/img/default_pfp.png'} alt="Profile Pic" className="rounded-circle" style={{ width: '40px', height: '40px' }} />
                                        <div>
                                            <span className="usernameColored" style={user.isPremium ? { '--username-color': user.usernameColor } : {}}>
                                                {user.displayName}
                                                {user.isPremium && (
                                                    <img src="/assets/img/premium_icon.png" alt="Premium" style={{ width: '1em', height: '1em', marginLeft: '2px' }} />
                                                )}
                                            </span>
                                            <br />
                                            <span className="text-muted">@{user.username}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Close</button>
                            </div>
                        </div>
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