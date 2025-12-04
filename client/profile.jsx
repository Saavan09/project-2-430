const helper = require('./helper.js');
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');

//display the profile info
const ProfileDisplay = (props) => (
    <div className="profileInfo">
        <p>
            {props.displayName}{' '}
            {props.isPremium && (
                <img src="/assets/img/premium_icon.png" alt="Premium User" className="premiumIcon"
                />
            )}
        </p>
        <p>@{props.username}</p>
        {props.bio ? (
            <p className="bio">{props.bio}</p>
        ) : (
            <p className="bio empty">No bio set.</p>
        )}
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
        isOwner: true,//always true for now
    });

    const [editing, setEditing] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [tempProfile, setTempProfile] = useState(profileData);

    //after editing profile
    const handleSave = async (e) => {
        e.preventDefault();

        const res = await fetch('/editProfile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                displayName: tempProfile.displayName,
                bio: tempProfile.bio,
            }),
        });

        const data = await res.json();
        if (data.success) {
            setProfileData(data.profile);
            setEditing(false);
        }
    };

    useEffect(() => {
        const fetchProfile = async () => {
            const response = await fetch('/getProfile');
            const data = await response.json();
            setProfileData(data);
            setTempProfile(data);
        };
        fetchProfile();
    }, []);

    //if user is currently editing, show edit profile view (form)
    if (editing) {
        return (
            <form className="editProfileForm" onSubmit={handleSave}>
                <label>Display Name</label>
                <input
                    type="text"
                    value={tempProfile.displayName}
                    onChange={(e) =>
                        setTempProfile({ ...tempProfile, displayName: e.target.value })
                    }
                />

                <label>Bio</label>
                <textarea
                    value={tempProfile.bio}
                    onChange={(e) =>
                        setTempProfile({ ...tempProfile, bio: e.target.value })
                    }
                />

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
            <ProfileDisplay {...profileData} />
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
        </div>
    );

};

const init = () => {
    const root = createRoot(document.getElementById('profile'));
    root.render(<ProfileApp />);
};

window.onload = init;