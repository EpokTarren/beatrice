# Beatrice

[typescript]: https://www.typescriptlang.org/
[next.js]: https://nextjs.org/
[react]: https://reactjs.org/

Beatrice is a file upload and URL shortening service written in [TypeScript] using [React] and with [Next.js] as the framework.

## Getting Started

[docker]: https://www.docker.com/get-started/
[node.js]: https://nodejs.org/
[yarn]: https://yarnpkg.com/getting-started/install
[postgresql]: https://www.postgresql.org/
[pgimg]: https://hub.docker.com/_/postgres

You need [Node.js]; [yarn]; and [Postgresql] to run this project locally, or [Docker] to run it in a containerized environment.

To start a [Postgresql] server see [this docker image][pgimg] or to run locally see the [Postgresql website][postgresql].

You will need a .env.local and it should look something like the below:

```env
DATABASE_URL=postgresql://user:password@host:port/db
NEXTAUTH_SECRET=YOUR_KEY_HERE
NEXTAUTH_URL=http://localhost:3000
DISCORD_CLIENT_ID=YOUR_APPLICATION_ID_HERE
DISCORD_CLIENT_SECRET=YOUR_APPLICATION_SECRET_HERE
GITHUB_CLIENT_ID=YOUR_APPLICATION_ID_HERE
GITHUB_CLIENT_SECRET=YOUR_APPLICATION_SECRET_HERE
BEATRICE_FILES_PORT=3001
BEATRICE_REDIRECT_PORT=3002
NEXT_PUBLIC_BEATRICE_FILES_URL=http://localhost:3001
NEXT_PUBLIC_BEATRICE_REDIRECT_URL=http://localhost:3002
NEXTAUTH_URL_INTERNAL=http://localhost:3000
BEATRICE_FILES_USER=tarren
ALLOW_SIGN_UP=TRUE
```

_Note: any changes to the env file require a restart._

_Note: for all configuration replace `http://localhost:3000` with your url for the server._

_Note: for all configuration replace `http://localhost:3001` with your url for the file only server ._

_Note: for all configuration replace `http://localhost:3002` with your url for the redirect server ._

`DATABASE_URL` needs to be URL encoded if you have any URL unsafe characters.

`ALLOW_SIGN_UP=FALSE` will disallow any new sign ups.

You can generate `NEXTAUTH_SECRET` using `openssl rand -base64 32`,
on Windows git ships with openssl, hence run `"C:\Program Files\Git\usr\bin\openssl.exe" rand -base64 32`.

`NEXTAUTH_URL_INTERNAL` should be set to `http://localhost:3000` if your site does not have access to `NEXTAUTH_URL` such as in Docker.
_Note: this should not be replaced with your canonical url unlike other instances of `http://localhost:3000`_

`BEATRICE_FILES_PORT` sets the port for the file only server

`BEATRICE_FILES_PORT` sets the port for the url only server, this is launched by the same command as the file only server

`BEATRICE_FILES_USER` sets a user, whose files will be served on the file only server at host/file.ext as well as host/user/file.ext. This also applies to shortened links with the redirect server.

[discord]: https://discord.com/
[developers/applications]: https://discord.com/developers/applications

For [Discord] oauth provider go to [developers/applications],
create a new application then get a client id and client secret.
Add a redirect to `http://localhost:3000/api/auth/callback/discord`.

[github]: https://github.com/
[github_oauth]: https://github.com/settings/developers

For [GitHub] oauth provider go to [Settings/Developer settings/OAuth Apps][github_oauth] on [GitHub] and register a new application.
Set your Authorization callback URL to `http://localhost:3000/api/auth/callback/github` and Homepage URL to `http://localhost:3000/`.

## Development

[http://localhost:3000]: http://localhost:3000

```bash
# clone the repo
git clone https://github.com/EpokTarren/beatrice.git

cd beatrice

# install dependencies
yarn install --frozen-lockfile

# you need DATABASE_URL url in your environment

# Unix
export "DATABASE_URL=postgresql://user:password@localhost:port/db"

# Windows
set "DATABASE_URL=postgresql://user:password@localhost:port/db"

yarn db:gen
yarn db:push

# generates license file
yarn deps

# run dev server that updates on code changes
yarn dev
```

Open [http://localhost:3000] with your browser to see the result.

## Installation

[nginx]: https://www.nginx.com/
[reverse proxy]: https://en.wikipedia.org/wiki/Reverse_proxy

The commands below will start the server at [http://localhost:3000], the file only server at http://localhost:3001, and the URL redirect server at http://localhost:3002, unless ports have been changed in the `.env.local` or using [Docker].
If you wish to serve this publicly use a [reverse proxy] such as [NGINX].

[article]: https://www.nginx.com/blog/using-free-ssltls-certificates-from-lets-encrypt-with-nginx/
[let’s encrypt]: https://letsencrypt.org/sv/
[cf nginx]: https://www.digitalocean.com/community/tutorials/how-to-host-a-website-using-cloudflare-and-nginx-on-ubuntu-20-04
[cloudflare]: https://www.cloudflare.com/

It is not recommended to do this without HTTPS see [this article][article] on how to get an SSL certificate using [Let’s Encrypt] or [this][cf nginx] for using [CloudFlare] with [NGINX].

_Note: it is recommended to only serve the full site on your local network, especially if sign-ups are on, you do not want strangers to use your server to host malicious or illegal content._
_Instead serve your files publicly using the file only server_

### Docker

This section requires [Docker] to be installed.

You should not set a `DATABASE_URL` in `.env.local` if using the below since this will be done for you, the database will not be exposed over the network.

If you want to make any changes to the docker image, make a copy of `docker-compose.yml` and make any edits,
replace `docker-compose.yml` with your new docker-compose files name in the instructions below.
If you have a [postgresql] server you wish to use, remove postgres block as well as the `depends_on` blocks from the other containers,
and set `DATABASE_URL` to your server.

```bash
git clone https://github.com/EpokTarren/beatrice.git

cd beatrice

docker-compose --file docker-compose.yml up -d --build

# initialize the database
docker exec -it beatrice-files /bin/sh
yarn prisma migrate deploy
exit

# to set or revoke a users admin rights run
docker exec -it beatrice-files /bin/sh
node set_admin.js # follow the instructions, re-run for multiple admins
exit

# if you don't want a file only server
docker pause beatrice-files

# if you make changes to your .env.local file simply restart
docker-compose restart
```

#### Updating

```bash
docker-compose --file docker-compose.yml up -d --build

# run database migrations
docker exec -it beatrice-files /bin/sh
# migrations
yarn prisma migrate deploy
exit
```

### Manual

This section requires [Node.js]; [yarn]; and a [Postgresql] server.

```bash
git clone https://github.com/EpokTarren/beatrice.git

cd beatrice

# install dependencies
yarn install --frozen-lockfile

yarn build:all

# you need DATABASE_URL url in your environment

# Unix
export "DATABASE_URL=postgresql://user:password@localhost:port/db"

# Windows
set "DATABASE_URL=postgresql://user:password@localhost:port/db"

yarn start

node files/build/files/server.js

# to set or revoke a users admin rights run
node set_admin.js
```
