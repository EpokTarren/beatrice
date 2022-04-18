# Beatrice

[typescript]: https://www.typescriptlang.org/
[next.js]: https://nextjs.org/
[react]: https://reactjs.org/

Beatrice is a file upload service written in [TypeScript] using [React] and with [Next.js] as the backend framework.

## Getting Started

[docker]: https://www.docker.com/get-started/
[node.js]: https://nodejs.org/
[yarn]: https://yarnpkg.com/getting-started/install
[postgresql]: https://www.postgresql.org/
[pgimg]: https://hub.docker.com/_/postgres

You need [Node.js]; [yarn]; and [Postgresql] to run this project locally, or [Docker] to run it in a containerized enviorment.

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
BEATRICE_FILES_USER=tarren
ALLOW_SIGN_UP=TRUE
```

_Note: any changes to the env file require a restart._

_Note: for all the below replace `http://localhost:3000` with your desired url if in production._

`DATABASE_URL` needs to be URL encoded if you have any URL insafe characters.

`ALLOW_SIGN_UP=FALSE` will disallow any new sign ups.

You can generate `NEXTAUTH_SECRET` using `openssl rand -base64 32`,
on Windows git ships with openssl, hence run `"C:\Program Files\Git\usr\bin\openssl.exe" rand -base64 32`.

[discord]: https://discord.com/
[developers/applications]: https://discord.com/developers/applications

For [Discord] oauth provider go to [developers/applications],
create a new application then get a client id and client secret.
Add a redirect to `http://localhost:3000/api/auth/callback/discord`.

[github]: https://github.com/
[github_oauth]: https://github.com/settings/developers

For [GitHub] oauth provider go to [Settings/Developer settings/OAuth Apps][github_oauth] on [GitHub] and register a new application.
Set your Authorization callback URL to `http://localhost:3000/api/auth/callback/github` and Homepage URL to `http://localhost:3000/`.

### Development

[http://localhost:3000]: http://localhost:3000

```bash
# clone the repo
git clone https://github.com/EpokTarren/beatrice.git

cd beatrice

# install dependecies
yarn install --frozen-lockfile

# you need DATABASE_URL url in your enviorment

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

### Installation

[nginx]: https://www.nginx.com/
[revese proxy]: https://en.wikipedia.org/wiki/Reverse_proxy

The commands below will start a server at [http://localhost:3000], if you wish to serve this publicly use a [revese proxy] such as [NGINX].

[article]: https://www.nginx.com/blog/using-free-ssltls-certificates-from-lets-encrypt-with-nginx/
[let’s encrypt]: https://letsencrypt.org/sv/
[cf nginx]: https://www.digitalocean.com/community/tutorials/how-to-host-a-website-using-cloudflare-and-nginx-on-ubuntu-20-04
[cloudflare]: https://www.cloudflare.com/

It is however not recommended to do this without HTTPS see [this article][article] on how to get an SSL certificate using [Let’s Encrypt] or [this][cf nginx] for using [CloudFlare] with [NGINX].

To serve to whole site at `domain.tld` over HTTP do:

_Note: it is recommended to only serve the full site locally, especially if signups are on, you do not want strangers to use your server to host maliocious or illegal content._

To host only the files at `media.domain.tld` you can put the file only server behind a reverse proxy.

```bash
# set BEATRICE_FILES_PORT to choose a port for FILES server
# to serve a users files at host/file instead of host/user/file
# set BEATRICE_FILES_USER
yarn files
```

#### Docker

This section requires [Docker] to be installed.

```bash
git clone https://github.com/EpokTarren/beatrice.git

cd beatrice

# build and run the main container on port 3000
docker build -t beatrice .
docker run -p 3000:3000 --env-file .env.local -d --name beatrice beatrice

# build and run the file server container on port 3001
docker build -f ./files/Dockerfile -t beatrice-files .
docker run -p 3001:3001 --env-file .env.local -d --name beatrice-files beatrice-files

# to set or revoke a users admin rights run
docker exec -it beatrice-files /bin/sh
node set_admin.js # follow the instructions, re-run for multiple admins
exit # finally exit
```

#### Manual

This section requires [Node.js]; [yarn]; and a [Postgresql] server.

```bash
git clone https://github.com/EpokTarren/beatrice.git

cd beatrice

# install dependecies
yarn install --frozen-lockfile

yarn build:all

# you need DATABASE_URL url in your enviorment

# Unix
export "DATABASE_URL=postgresql://user:password@localhost:port/db"

# Windows
set "DATABASE_URL=postgresql://user:password@localhost:port/db"

yarn start

node files/build/files/server.js

# to set or revoke a users admin rights run
node set_admin.js
```
