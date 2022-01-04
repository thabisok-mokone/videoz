module.exports = {
    packagerConfig: {
        icon: "src/assets/icon"
    },
    makers: [{
            name: '@electron-forge/maker-squirrel',
            config: {
                name: "videoz"
            }
        },
        {
            name: '@electron-forge/maker-zip',
            platforms: [
                "darwin"
            ]
        },
        {
            name: '@electron-forge/maker-deb',
            config: {}
        },
        {
            name: "@electron-forge/maker-rpm",
            config: {}
        }
    ],
    plugins: [
        ["@electron-forge/plugin-webpack", {
            devContentSecurityPolicy: `script-src 'self' data:`,
            mainConfig: "./webpack.main.config.js",
            renderer: {
                config: "./webpack.renderer.config.js",
                entryPoints: [{
                    html: "./src/index.html",
                    js: "./src/renderer.js",
                    name: "main_window"
                }]
            }
        }]
    ]
}