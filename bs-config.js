module.exports = {
  proxy: 'http://localhost:8000',
  files: [
    'test',
    'dist',
    'demo',
    'analysis.json'
  ],
  snippetOptions: {
    blacklist: [
      '**/demo/iframe.html'
    ]
  }
};
