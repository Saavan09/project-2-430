const helper = require('./helper.js');
const React = require('react');
const { createRoot } = require('react-dom/client');

const handleLogin = (e) => {
    e.preventDefault();

    const username = e.target.querySelector('#user').value;
    const pass = e.target.querySelector('#pass').value;

    if (!username || !pass) {
        helper.handleError('Username or password is empty!');
        return false;
    }

    helper.sendPost(e.target.action, { username, pass });
    return false;
}

const handleSignup = (e) => {
    e.preventDefault();

    const username = e.target.querySelector('#user').value;
    const pass = e.target.querySelector('#pass').value;
    const pass2 = e.target.querySelector('#pass2').value;

    if (!username || !pass || !pass2) {
        helper.handleError('All fields are required!');
        return false;
    }

    if (pass !== pass2) {
        helper.handleError('Passwords do not match!');
        return false;
    }

    helper.sendPost(e.target.action, { username, pass, pass2 });

    return false;
}

const LoginWindow = (props) => {
    return (
        <form
            id="loginForm"
            name="loginForm"
            onSubmit={handleLogin}
            action="/login"
            method="POST"
            className="card p-4 shadow mx-auto mt-5"
            style={{ maxWidth: '400px' }}
        >
            <h3 className="mb-3 text-center">Log In</h3>

            <div className="mb-3">
                <label htmlFor="user" className="form-label">Username</label>
                <input id="user" type="text" name="username" placeholder="Username" className="form-control" />
            </div>

            <div className="mb-3">
                <label htmlFor="pass" className="form-label">Password</label>
                <input id="pass" type="password" name="pass" placeholder="Password" className="form-control" />
            </div>

            <button type="submit" className="btn btn-primary w-100">Log In</button>
        </form>
    );
};

const SignupWindow = (props) => {
    return (
        <form
            id="signupForm"
            name="signupForm"
            onSubmit={handleSignup}
            action="/signup"
            method="POST"
            className="card p-4 shadow mx-auto mt-5"
            style={{ maxWidth: '400px' }}
        >
            <h3 className="mb-3 text-center">Sign Up</h3>

            <div className="mb-3">
                <label htmlFor="user" className="form-label">Username</label>
                <input id="user" type="text" name="username" placeholder="Username" className="form-control" />
            </div>

            <div className="mb-3">
                <label htmlFor="pass" className="form-label">Password</label>
                <input id="pass" type="password" name="pass" placeholder="Password" className="form-control" />
            </div>

            <div className="mb-3">
                <label htmlFor="pass2" className="form-label">Retype Password</label>
                <input id="pass2" type="password" name="pass2" placeholder="Retype Password" className="form-control" />
            </div>

            <button type="submit" className="btn btn-success w-100">Sign Up</button>
        </form>
    );
};

const init = () => {
    const loginButton = document.getElementById('loginButton');
    const signupButton = document.getElementById('signupButton');

    const root = createRoot(document.getElementById('content'));

    loginButton.addEventListener('click', (e) => {
        e.preventDefault();
        root.render(<LoginWindow />);
        return false;
    });

    signupButton.addEventListener('click', (e) => {
        e.preventDefault();
        root.render(<SignupWindow />);
        return false;
    });

    root.render(<LoginWindow />);
};

window.onload = init;