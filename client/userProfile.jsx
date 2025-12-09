const helper = require('./helper.js');
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');

//same as personal account, but for another user
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

        <p>Joined {new Date(props.createdDate).toLocaleDateString()}</p>
    </div>
);

const UserProfileApp = () => {
    const [profileData, setProfileData] = useState(null);
    const [error, setError] = useState('');

    //get username from /user/:username
    const username = window.location.pathname.split('/').pop();

    useEffect(() => {
        const fetchUser = async () => {
            const response = await fetch(`/getUserProfile/${username}`);
            const data = await response.json();

            if (data.error) {
                setError("User not found.");
            } else {
                setProfileData(data);
            }
        };

        fetchUser();
    }, [username]);

    if (error) return <p className="errorText">{error}</p>;
    if (!profileData) return <p>Loading...</p>;

    return (
        <div>
            <ProfileDisplay {...profileData} />
        </div>
    );
};

const init = () => {
    const root = createRoot(document.getElementById('userProfile'));
    root.render(<UserProfileApp />);
};

window.onload = init;