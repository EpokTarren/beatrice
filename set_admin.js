const { createInterface } = require('readline');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

console.log('Press `ctrl+c` to exit.');

let user;

console.log('What user would you like to modify?');

createInterface({
	input: process.stdin,
	output: process.stdout,
	terminal: false,
}).on('line', async (line) => {
	if (user) {
		if (!user.admin)
			if (line[0].toLowerCase() === 'y')
				await prisma.user
					.update({ where: { id: user.id }, data: { admin: true } })
					.then(() => console.log(user.username, 'has been made an administrator'))
					.catch((err) => {
						console.log('An error occured: ', err);
						process.exit(1);
					});
			else console.log(user.username, 'has not been made an administrator');
		else if (line[0].toLowerCase() === 'y')
			await prisma.user
				.update({ where: { id: user.id }, data: { admin: true } })
				.then(() => console.log(user.username, 'is no longer an administrator'))
				.catch((err) => {
					console.log('An error occured: ', err);
					process.exit(1);
				});
		else console.log(user.username, 'is still an administrator');

		process.exit(0);
	} else {
		user = await prisma.user.findUnique({ where: { username: line.toLowerCase() } });
		if (user) {
			console.log('id:', user.id);

			if (!user.admin)
				console.log('Would you like to make', user.username, 'an administrator [Y/N]');
			else console.log('Would you revoke the administrator rights of', user.username, ' [Y/N]');
		} else {
			console.log('Could not find user:', line);
			console.log('What user would you like to modify?');
		}
	}
});
