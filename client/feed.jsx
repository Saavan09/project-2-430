const helper = require('./helper.js');
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');

//handles form submission when creating a new post
const handlePost = (e, onPostAdded) => {
    e.preventDefault();

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
            className="mb-4"
        >
            <div className="card">
                <div className="card-body">
                    <textarea
                        id="postContent"
                        name="content"
                        placeholder="What's happening?"
                        rows="3"
                        required
                        className="form-control mb-2"
                    />
                    <div className="form-check mb-2">
                        <input id="postPublic" type="checkbox" name="isPublic" defaultChecked className="form-check-input" />
                        <label htmlFor="postPublic" className="form-check-label">Public</label>
                    </div>
                    <button type="submit" className="btn btn-primary">Post</button>
                </div>
            </div>
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
const getRandomAds = (count = 3) => {
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
            <div key={post._id} className="card mb-3">
                <div className="card-body">
                    <div className="d-flex align-items-center mb-2">
                        <img
                            src={post.author.profilePic || '/assets/img/default_pfp.png'}
                            alt="post profile pic"
                            className="rounded-circle me-2"
                            style={{ width: '50px', height: '50px' }}
                        />
                        <div>
                            <strong>
                                <a
                                    href={profileLink}
                                    className="text-decoration-none"
                                    style={{ color: post.author.isPremium ? post.author.usernameColor : '#000000' }}
                                >
                                    {post.author.displayName}
                                </a>

                                {post.author.isPremium && (
                                    <img src="/assets/img/premium_icon.png" alt="Verified" style={{ width: '1em', height: '1em', marginLeft: '2px' }} />
                                )}{' '}
                                <a href={profileLink} className="text-decoration-none text-muted">
                                    @{post.author.username}
                                </a>
                            </strong>
                            <div>
                                <small className="text-muted">{new Date(post.createdDate).toLocaleString()} · <em>{post.isPublic ? 'Public' : 'Private'}</em></small>
                            </div>
                        </div>
                    </div>
                    <p className="card-text">{post.content}</p>
                    {post.author.username === currentUsername && (
                        <button
                            className="btn btn-danger btn-sm"
                            onClick={() => {
                                helper.sendDelete(`/post/${post._id}`, () => {
                                    props.triggerReload();
                                });
                            }}
                        >
                            Delete
                        </button>
                    )}
                </div>
            </div>
        );
    });

    return (
        <div className="row">
            <div className={isPremium ? "col-12" : "col-lg-8"}>
                {postNodes}
            </div>

            {!isPremium && ads.length > 0 && (
                <div className="col-lg-4">
                    {ads.map((ad, idx) => (
                        <div key={idx} className="card mb-3">
                            <img src={ad} className="card-img-top" alt="ad" />
                        </div>
                    ))}
                </div>
            )}
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
                <div className="container mt-4">
                    <div className="d-flex justify-content-center mb-3 gap-2">
                        <button
                            className={window.currentFeedFilter === 'following'
                                ? 'btn btn-outline-primary'
                                : 'btn btn-primary'}
                            onClick={() => { window.currentFeedFilter = 'all'; reloadFeed = !reloadFeed; renderFeed(); }}>All Posts</button>
                        <button
                            className={window.currentFeedFilter === 'following' ? "btn btn-primary" : "btn btn-outline-primary"}
                            onClick={() => { window.currentFeedFilter = 'following'; reloadFeed = !reloadFeed; renderFeed(); }}>Following</button>
                    </div>

                    <PostForm triggerReload={() => { reloadFeed = !reloadFeed; renderFeed(); }} />
                    <FeedList
                        reloadFeed={reloadFeed}
                        triggerReload={() => { reloadFeed = !reloadFeed; renderFeed(); }}
                    />
                </div>

            </>
        );
    };

    renderFeed();
};

window.onload = init;