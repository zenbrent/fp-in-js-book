require('coffee-script/register');
require('babel/register')({
    extensions: [".es6", ".es", ".jsx"],
    optional: ['es7.objectRestSpread', 'spec.undefinedToVoid']
});
require('./main');
