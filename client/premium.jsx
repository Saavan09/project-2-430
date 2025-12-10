import './tailwind.css';

const helper = require('./helper.js');
const React = require('react');
const { createRoot } = require('react-dom/client');
const { useState, useEffect } = React;

//fetch the current user's premium status
const fetchPremiumStatus = async () => {
    try {
        const res = await fetch('/getProfile');
        const data = await res.json();
        return data.isPremium || false; //default false if missing
    } catch (err) {
        console.error(err);
        return false;
    }
};

//toggle premium state on the server (shows different page depending on if user is premium or not)
const togglePremium = async (makePremium) => {
    try {
        const endpoint = makePremium ? '/upgradePremium' : '/downgradePremium';
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });
        const data = await res.json();

        if (!data.success) {
            helper.handleError(data.error || 'Something went wrong.');
            return false;
        }

        helper.handleError(data.message || (makePremium ? 'Congrats, you are now a premium user!' : 'Your subscription has been canceled.'));
        return true;
    } catch (err) {
        helper.handleError('Error updating account!');
        return false;
    }
};

const PremiumPage = () => {
    const [isPremium, setIsPremium] = useState(false);

    useEffect(() => {
        const init = async () => {
            const status = await fetchPremiumStatus();
            setIsPremium(status);
        };
        init();
    }, []);

    //non-premium user
    if (!isPremium) {
        return (
            <div className="getPremium">
                <h1>Your Account, Made Premium</h1>
                <p>Welcome to the next level of linking up with friends! Make your account premium to enjoy several exclusive perks:</p>
                <ul>
                    <li>No ads clogging up your view</li>
                    <li>A shiny premium badge on your profile</li>
                    <li>Extra customization for username colors</li>
                </ul>
                <p>Upgrade your account today for only $4.99 monthly!</p>

                <button
                    className="premiumBtn"
                    onClick={async () => {
                        const success = await togglePremium(true);
                        if (success) setIsPremium(true);
                    }}
                >
                    Click to Pay
                </button>
            </div>
        );
    }

    //premium user
    return (
        <div className="getPremium">
            <h1>Your Account, Forever Premium</h1>
            <p>Thanks for supporting us! You currently have access to all the following exclusive premium perks:</p>
            <ul>
                <li>No ads clogging up your view</li>
                <li>A shiny premium badge on your profile</li>
                <li>Extra customization for username colors</li>
            </ul>

            <p>Stay updated on more upcoming perks for premium users! Your subscription will automatically renew every month for $4.99.</p>

            <button
                className="premiumBtn"
                onClick={async () => {
                    const success = await togglePremium(false);
                    if (success) setIsPremium(false);
                }}
            >
                Cancel My Subscription
            </button>
        </div>
    );
};

const init = () => {
    const root = createRoot(document.getElementById('premium'));
    root.render(<PremiumPage />);
};

window.onload = init;