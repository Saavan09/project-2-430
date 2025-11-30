const helper = require('./helper.js');
const React = require('react');
const { useState } = React;
const { createRoot } = require('react-dom/client');

const handleChangePassword = (e) => {
    e.preventDefault();
    helper.hideError();

    const currentPass = e.target.querySelector('#currentPass').value;
    const newPass = e.target.querySelector('#newPass').value;
    const newPass2 = e.target.querySelector('#newPass2').value;

    if (!currentPass || !newPass || !newPass2) {
        helper.handleError('All fields are required!');
        return false;
    }

    if (newPass !== newPass2) {
        helper.handleError('New passwords do not match!');
        return false;
    }

    helper.sendPost('/changePassword', { currentPass, newPass }, (result) => {
        if (result.success) {
            e.target.reset();
        }
    });

    return false;
};

const ChangePasswordForm = () => (
    <form
        id="changePasswordForm"
        onSubmit={handleChangePassword}
        className="changePasswordForm"
    >
        <label htmlFor="currentPass">Current Password:</label>
        <input id="currentPass" type="password" name="currentPass" placeholder="Current password" required />

        <label htmlFor="newPass">New Password:</label>
        <input id="newPass" type="password" name="newPass" placeholder="New password" required />

        <label htmlFor="newPass2">Retype New Password:</label>
        <input id="newPass2" type="password" name="newPass2" placeholder="Retype new password" required />

        <input className="changePasswordSubmit" type="submit" value="Change Password" />
    </form>
);

module.exports = { ChangePasswordForm, initChangePassword };
