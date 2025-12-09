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

        <div className="followStats">
            <p>{props.followersCount} follower{props.followersCount !== 1 ? 's' : ''}</p>
            <p>{props.followingCount} following</p>
        </div>


        <p>Joined {new Date(props.createdDate).toLocaleDateString()}</p>

        {props.onFollowToggle && (
            <button onClick={props.onFollowToggle}>
                {props.isFollowing ? 'Unfollow' : 'Follow'}
            </button>
        )}
    </div>
);

const UserProfileApp = () => {
    const [profileData, setProfileData] = useState(null);
    const [error, setError] = useState('');
    const [isFollowing, setIsFollowing] = useState(false);

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

            const currentUserRes = await fetch('/getCurrentUser');
            const currentUserData = await currentUserRes.json();
            if (currentUserData.following) {
                setIsFollowing(currentUserData.following.includes(data._id));
            }
        };

        fetchUser();
    }, [username]);

    //change button depending on if you are already following the user or not
    const handleFollowToggle = async () => {
        if (!profileData) return;

        const endpoint = isFollowing ? '/unfollow' : '/follow';

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: profileData.username }),
            });
            const data = await res.json();
            if (data.success) {
                setIsFollowing(!isFollowing);
            } else {
                console.error(data.error);
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div>
            <ProfileDisplay
                {...profileData}
                onFollowToggle={handleFollowToggle}
                isFollowing={isFollowing}
            />
        </div>
    );
};

const init = () => {
    const root = createRoot(document.getElementById('userProfile'));
    root.render(<UserProfileApp />);
};

window.onload = init;