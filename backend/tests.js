// TEMPORARY PROTECTED ROUTE - REMOVE LATER!
app.get('/api/protected', protect, (req, res) => {
    res.json({
        message: 'You accessed a protected route!',
        user: req.user // This will contain user data from the token
    });
});

// TEMPORARY ROLE-SPECIFIC ROUTE - REMOVE LATER!
app.get('/api/admin-only', protect, authorize('System Administrator'), (req, res) => {
    res.json({
        message: 'Welcome, System Administrator!',
        user: req.user
    });
});

// TEMPORARY MULTI-ROLE ROUTE - REMOVE LATER!
app.get('/api/owner-or-admin', protect, authorize(['Store Owner', 'System Administrator']), (req, res) => {
    res.json({
        message: 'Welcome, Store Owner or System Administrator!',
        user: req.user
    });
});

