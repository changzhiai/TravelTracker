module.exports = {
    apps: [
        {
            name: 'travel-tracker',
            script: 'npm',
            args: 'run start',
            env: {
                NODE_ENV: 'production',
                PORT: 3001,
            },
        },
    ],
};
