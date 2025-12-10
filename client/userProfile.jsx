const helper = require('./helper.js');
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');

//same as personal account, but for another user
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

            {props.onFollowToggle && (
                <button className="btn btn-primary" onClick={props.onFollowToggle}>
                    {props.isFollowing ? 'Unfollow' : 'Follow'}
                </button>
            )}
        </div>
    </div>
);

const UserProfileApp = () => {
    const [profileData, setProfileData] = useState(null);
    const [error, setError] = useState('');
    const [isFollowing, setIsFollowing] = useState(false);

    //for followers/following popup modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalUsers, setModalUsers] = useState([]);

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
                //update local
                setProfileData(prev => ({
                    ...prev,
                    followersCount: isFollowing
                        ? prev.followersCount - 1
                        : prev.followersCount + 1
                }));
            } else {
                console.error(data.error);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const openFollowModal = async (type) => {
        try {
            const res = await fetch(`/user/${username}/${type}`);
            const data = await res.json();
            setModalUsers(data[type]); //'followers' or 'following'
            setModalTitle(type.charAt(0).toUpperCase() + type.slice(1));
            setIsModalOpen(true);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="container mt-4">
            {profileData ? (
                <ProfileDisplay
                    {...profileData}
                    onFollowToggle={handleFollowToggle}
                    isFollowing={isFollowing}
                    onFollowersClick={() => openFollowModal('followers')}
                    onFollowingClick={() => openFollowModal('following')}
                />
            ) : (
                <p>Loading profile...</p>
            )}

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
                                        <img
                                            src={user.profilePic || '/assets/img/default_pfp.png'}
                                            alt="Profile Pic"
                                            className="rounded-circle"
                                            style={{ width: '40px', height: '40px' }}
                                        />
                                        <div>
                                            <span
                                                className="usernameColored"
                                                style={user.isPremium ? { '--username-color': user.usernameColor } : {}}
                                            >
                                                {user.displayName}
                                                {user.isPremium && (
                                                    <img
                                                        src="/assets/img/premium_icon.png"
                                                        alt="Premium"
                                                        style={{ width: '1em', height: '1em', marginLeft: '2px' }}
                                                    />
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
    const root = createRoot(document.getElementById('userProfile'));
    root.render(<UserProfileApp />);
};

window.onload = init;