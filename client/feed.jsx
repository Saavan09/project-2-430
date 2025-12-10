import './tailwind.css';

const helper = require('./helper.js');
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');

//handles form submission when creating a new post
const handlePost = (e, onPostAdded) => {
    e.preventDefault();
    helper.hideError();

    const content = e.target.querySelector('#postContent').value;
    const isPublic = e.target.querySelector('#postPublic').checked;

    if (!content) {
        helper.handleError('Content is required!');
        return false;
    }

    helper.sendPost(e.target.action, { content, isPublic }, onPostAdded);
    e.target.reset();
    return false;
};

const PostForm = (props) => {
    const onSubmitHandler = (e) => {
        handlePost(e, props.triggerReload);
    };

    return (
        <form
            id="postForm"
            onSubmit={onSubmitHandler}
            action="/post"
            method="POST"
            className="postForm"
        >
            <textarea
                id="postContent"
                name="content"
                placeholder="What's happening?"
                rows="3"
                required
            />
            <label>
                <input id="postPublic" type="checkbox" name="isPublic" defaultChecked />
                Public
            </label>
            <input className="postSubmit" type="submit" value="Post" />
        </form>
    );
};

//all possible fake ads
const allAds = [
    '/assets/img/ad_1.png',
    '/assets/img/ad_2.png',
    '/assets/img/ad_3.png',
    '/assets/img/ad_4.png',
];

//get random ads to show on the page
const getRandomAds = (count = 2) => {
    const shuffled = allAds.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

//feed list of posts visible to user
//rerenders list anytime smth happens 
const FeedList = (props) => {
    const [posts, setPosts] = useState([]);
    const [ads, setAds] = useState([]);
    const [isPremium, setIsPremium] = useState(false);
    const [currentUsername, setCurrentUsername] = useState('');

    useEffect(() => {
        const loadPosts = async () => {
            const userRes = await fetch('/getCurrentUser');
            const userData = await userRes.json();
            setIsPremium(userData.isPremium);
            setCurrentUsername(userData.username);

            const filter = window.currentFeedFilter || 'all';
            const response = await fetch(`/getPosts?filter=${filter}`);

            const data = await response.json();
            setPosts(data.posts);
            //if user isn't premium, display ads
            if (!userData.isPremium) {
                setAds(getRandomAds());
            }
        };
        loadPosts();
    }, [props.reloadFeed]);

    if (posts.length === 0) {
        return <div className="feedList"><h3>No posts yet!</h3></div>;
    }

    const postNodes = posts.map((post) => {
        const profileLink = post.author.username === currentUsername
            ? '/profile' //your own posts go to your editable profile
            : `/user/${post.author.username}`;//all other posts go to their user profile
        return (
            <div key={post._id} className="post">
                <div className="postHeader">
                    <img
                        src={post.author.profilePic || '/assets/img/default_pfp.png'}
                        alt="post profile pic"
                        className="postProfilePic"
                    />{' '}
                    <strong>
                        <span
                            className="usernameColored"
                            style={post.author.isPremium ? { '--username-color': post.author.usernameColor } : {}}
                        >
                            <a
                                href={profileLink}
                                className="usernameLink"
                            >
                                {post.author.displayName}{' '}
                            </a>
                            {' '}
                        </span>
                        {post.author.isPremium && (
                            <img
                                src="/assets/img/premium_icon.png"
                                alt="Verified"
                                className="premiumIcon"
                            />
                        )} {' '}
                        <a
                            href={profileLink}
                            className="usernameLink"
                        >
                            @{post.author.username}
                        </a>
                    </strong> ·{' '}
                    <small>{new Date(post.createdDate).toLocaleString()}</small> ·{' '}
                    <em>{post.isPublic ? 'Public' : 'Private'}</em>
                </div>
                <div className="postContent">{post.content}</div>
                {post.author.username === currentUsername && (
                    <button
                        className="deletePostBtn"
                        onClick={() => {
                            helper.sendDelete(`/post/${post._id}`, () => {
                                props.triggerReload(); //refresh feed after delete
                            });
                        }}
                    >
                        Delete
                    </button>
                )}
            </div>
        );
    });

    return (
        <div className="feedList">
            {postNodes}

            {!isPremium && ads.map((ad) => (
                <div className="ad">
                    <img src={ad} alt="ad" />
                </div>
            ))}
        </div>
    );
};

//boots up react and attaches event listeners
const init = () => {
    const root = createRoot(document.getElementById('app'));
    let reloadFeed = false;

    const renderFeed = () => {
        root.render(
            <>
                <div className="feedFilters">
                    <button onClick={() => { window.currentFeedFilter = 'all'; reloadFeed = !reloadFeed; renderFeed(); }}>
                        All Posts
                    </button>
                    <button onClick={() => { window.currentFeedFilter = 'following'; reloadFeed = !reloadFeed; renderFeed(); }}>
                        Following
                    </button>
                </div>

                <PostForm triggerReload={() => { reloadFeed = !reloadFeed; renderFeed(); }} />
                <FeedList
                    reloadFeed={reloadFeed}
                    triggerReload={() => { reloadFeed = !reloadFeed; renderFeed(); }}
                />

            </>
        );
    };

    renderFeed();
};

window.onload = init;