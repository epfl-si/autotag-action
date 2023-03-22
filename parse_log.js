const fs = require('fs');

var BreakException = {};

// read logs
const logs = fs.readFileSync('git_log.txt', 'utf-8');

const tagRegex = /^\(tag: refs\/tags\/\d+\.\d+\.\d+\)/g;

var actions = [];
var tag;

try {
    logs.split(/\r?\n/).forEach((line) => {
        // logs are in format: <sha> <message>
        // find 1st space
        var idx = line.indexOf(' ');
        var message = line.substring(idx + 1);
        var found = message.match(tagRegex);
        //console.log('message: ', message);

        // tag found, extract it and stop processing
        if (found) {
            found = found[0];
            tag = found.replace('(tag: refs/tags/', '').replace(')', '');
            console.log('found tag: ', tag);
            throw BreakException;
        }

        // actions processing
        if (message.indexOf('#major') > -1) {
            actions.push('major');
        }
        else if (message.indexOf('#minor') > -1) {
            actions.push('minor');
        }
        else if (message.indexOf('#patch') > -1) {
            actions.push('patch');
        }
    });
} catch (e) {
  if (e !== BreakException) throw e;
}

// if an existing tag was found and there are some actions
if (tag && actions.length > 0) {
    // reverse actions
    actions = actions.reverse();
    console.log(actions);

    // split the last tag
    var semver = tag.split('.');

    actions.forEach((action) => {
        if (action == 'major') {
            semver[0]++;
            semver[1] = 0;
            semver[2] = 0;
        }
        else if (action == 'minor') {
            semver[1]++;
            semver[2] = 0;
        }
        else if (action == 'patch') {
            semver[2]++;
        }
    });

    var newtag = semver[0]+'.'+semver[1]+'.'+semver[2];

    console.log('newtag: ', newtag);

    // write command to execute file
    fs.writeFile('commands.txt', 'git tag '+newtag+';git push origin @@BRANCH --tags', err => {
        if (err) {
            console.error(err);
        }
    });

    fs.writeFile('newtag.txt', 'newtag='+newtag, err => {
        if (err) {
            console.error(err);
        }
    });
}
// default to 1.0.0
else if (actions.length > 0) {
    var newtag = '1.0.0';
    console.log('newtag: ', newtag);
    fs.writeFile('newtag.txt', 'newtag='+newtag, err => {
        if (err) {
            console.error(err);
        }
    });
}