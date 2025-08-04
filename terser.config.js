module.exports = {
     compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn']
     },
     mangle: true,
     output: {
          comments: false
     }
};
