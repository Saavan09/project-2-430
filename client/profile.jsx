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
        isOwner: true,//always true for now
    });

    useEffect(() => {
        const fetchProfile = async () => {
            const response = await fetch('/getProfile');
            const data = await response.json();
            setProfileData(data);
        };
        fetchProfile();
    }, []);

    return <ProfileDisplay {...profileData} />;
};

const init = () => {
    const root = createRoot(document.getElementById('profile'));
    root.render(<ProfileApp />);
};

window.onload = init;