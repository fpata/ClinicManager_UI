// Karma configuration file for Angular tests
// This configuration launches Microsoft Edge using the Chrome launcher
// by pointing CHROME_BIN to the Edge executable.

const fs = require('fs');
const path = require('path');

// Try common Edge install paths on Windows
const edgePaths = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe'
];

// Find Edge executable
let edgePath = null;
for (const p of edgePaths) {
  if (fs.existsSync(p)) {
    edgePath = p;
    break;
  }
}

// Set CHROME_BIN to Edge path if found
if (edgePath) {
  process.env.CHROME_BIN = edgePath;
}

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage')
    ],
    client: {
      jasmine: {},
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    jasmineHtmlReporter: {
      suppressAll: true // removes the duplicated traces
    },
    coverageReporter: {
      dir: path.join(__dirname, './coverage/clinicmanager-ui'),
      subdir: '.',
      reporters: [{ type: 'html' }, { type: 'text-summary' }]
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    // Define custom Edge launcher using Chrome base
    customLaunchers: {
      EdgeBrowser: {
        base: 'Chrome',
        flags: [
          '--no-sandbox',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ]
      }
    },
    // Use Edge (via Chrome launcher) for interactive runs
    browsers: ['EdgeBrowser'],
    singleRun: false,
    restartOnFileChange: true
  });
};
