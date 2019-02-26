const fs = require('fs');

const config = {
	hosts: process.env.HOSTS.split(','),
	forwardTo: process.env.FORWARD_TO
};


if (!config.hosts || config.hosts.length === 0 || !config.forwardTo) {
	console.error('configuration error: ' + JSON.stringify(config, null, 4));
	process.exit(1);
}
if (!config.cert) config.cert = config.hosts[0];


function setHostList (next) {
	fs.writeFile(__dirname + '/config/host_list', config.hosts.join('\n'), 'utf8', err => {
		if (err) throw err;
		next();
	});
}


function setAliasList (next) {
	var aliases = {};
	config.hosts.forEach (host => {
		aliases['@' + host] = {
			action: 'alias',
			to: config.forwardTo
		}
	});
	fs.writeFile(__dirname + '/config/aliases', JSON.stringify(aliases, null, 4), 'utf8', err => {
		if (err) throw err;
		next();
	});
}


function configureSmtpForward (next) {
	fs.writeFile(__dirname + '/config/smtp_forward.ini', [
		'enable_outbound=false'
	].join('\n'), 'utf8', err => {
		if (err) throw err;
		next();
	});
}


// function configureTLS (next) {
// 	fs.readFile(__dirname + '/config/tls.ini', 'utf8', (err, data) => {
// 		if (err) throw err;
// 		fs.writeFile(__dirname + '/config/tls.ini', [
// 			'key=tls_key.pen',
// 			'cert=tls_cert.pem',
// 			data
// 		].join('\n'), 'utf8', err => {
// 			if (err) throw err;
// 			next();
// 		});
// 	});
// }


const functions = [
	setHostList,
	setAliasList,
	configureSmtpForward
];
function next () {
	if (functions.length > 0) {
		functions.shift()(next);
	} else {
		console.log('setup.js done;');
	}
}
next();
