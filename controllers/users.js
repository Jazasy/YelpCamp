const express = require("express");
const User = require("../models/user");

module.exports.renderRegister = (req, res) => {
    res.render("users/register");
}

module.exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ username, email });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash("success", "Wellcome to YelpCamp!");
            res.redirect("/campgrounds");
        })
    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/register");
    }
}

module.exports.renderLogin = (req, res) => {
    res.render("users/login");
}

module.exports.login = async (req, res) => {
    req.flash("success", "Wellcome back!");
    const redirectUrl = res.locals.returnTo || "/campgrounds";
    // delete req.session.returnTo;     We dont need it anymore because passport.authenticate clears the session
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res) => {
    req.logOut(err => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You logged out, Goodbye!");
        res.redirect("/campgrounds");
    });
}