const helper = require('./helper.js');
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');

//display the profile info
const ProfileDisplay = (props) => (
    <div className="profileInfo">
        <p>{props.displayName}</p>
        <p>@{props.username}</p>
        {props.bio ? (
            <p className="bio">{props.bio}</p>
        ) : (
            <p className="bio empty">No bio set.</p>
        )}
        <p>Joined {new Date(props.createdDate).toLocaleDateString()}</p>
    </div>
);

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

    //after editing profile
    const handleSave = async (e) => {
        e.preventDefault();

        const res = await fetch('/editProfile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                displayName: profileData.displayName,
                bio: profileData.bio,
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
                    value={profileData.displayName}
                    onChange={(e) =>
                        setProfileData({ ...profileData, displayName: e.target.value })
                    }
                />

                <label>Bio</label>
                <textarea
                    value={profileData.bio}
                    onChange={(e) =>
                        setProfileData({ ...profileData, bio: e.target.value })
                    }
                />

                <button type="submit">Save</button>
                <button type="button" onClick={() => setEditing(false)}>Cancel</button>
            </form>
        );
    }

    //otherwise show default view profile
    return (
        <div>
            <ProfileDisplay {...profileData} />
            <button onClick={() => setEditing(true)}>Edit Profile</button>
        </div>
    );

};

const init = () => {
    const root = createRoot(document.getElementById('profile'));
    root.render(<ProfileApp />);
};

window.onload = init;