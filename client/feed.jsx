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

const PostForm = (props) => (
    <form
        id="postForm"
        onSubmit={(e) => handlePost(e, props.triggerReload)}
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

//feed list of posts visible to user
//rerenders list anytime smth happens 
const FeedList = (props) => {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const loadPosts = async () => {
            const response = await fetch('/getPosts');
            const data = await response.json();
            setPosts(data.posts);
        };
        loadPosts();
    }, [props.reloadFeed]);

    if (posts.length === 0) {
        return <div className="feedList"><h3>No posts yet!</h3></div>;
    }

    const postNodes = posts.map((post) => (
        <div key={post._id} className="post">
            <div className="postHeader">
                <strong>
                    {post.author.displayName || ''}
                    {post.author.isPremium && (
                        <img
                            src="/assets/img/premium_icon.png"
                            alt="Verified"
                            className="premiumIcon"
                        />
                    )} {' '}
                    @{post.author.username}
                </strong> ·{' '}
                <small>{new Date(post.createdDate).toLocaleString()}</small> ·{' '}
                <em>{post.isPublic ? 'Public' : 'Private'}</em>
            </div>
            <div className="postContent">{post.content}</div>
        </div>
    ));

    return (
        <div className="feedList">
            {postNodes}
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
                <PostForm triggerReload={() => { reloadFeed = !reloadFeed; renderFeed(); }} />
                <FeedList reloadFeed={reloadFeed} />
            </>
        );
    };

    renderFeed();
};

window.onload = init;