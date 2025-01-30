<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
 
## Run Project
- npm run start:dev <= Dev 

## Installed Libs:
- npm i --save @nestjs/config
- npm i --save @nestjs/typeorm typeorm
- npm i --save pg
- npm i bcrypt
- npm i --save-dev @types/bcrypt
- npm i argon2
- npm i --save class-validator class-transformer
- npm i --save @nestjs/mapped-types
- npm i cookie-parser
- npm i -D @types/cookie-parser
- npm i --save @nestjs/passport passport passport-local
- npm i -D @types/passport-local
- npm i @nestjs/jwt passport-jwt
- npm i -D @types/passport-jwt
- npm i passport-google-oauth20
- npm i -D @types/passport-google-oauth20
- npm i --save @nestjs-modules/mailer nodemailer
- npm i --save-dev @types/nodemailer
- npm i --save handlebars
- npm install @nestjs-modules/mailer handlebars
- npm install uuid
- npm install @types/uuid
- npm i qrcode otplib
- npm i --save-dev @types/qrcode
- npm install @nestjs/throttler

## App Features
- Logowanie za pomocą Emaila i Hasła
- Logowanie za pomocą konta Google
- Autoryzacja i autentykacja za pomocą PassportJS, JWT oraz RefreshTokena
- Weryfikacja adresu email
- Możliwość 2FA z wykorzystaniem Google Authenticatora
- Możliwość resetowania hasła
- Ograniczenie do 3 nie udanych prób logowania, po niej następuje Timeout na 15 min
- SessionID oraz tokeny z krótkim czasem, do weryfikacji wiadomości Email oraz weryfikacji 2FA
- Hashowanie hasła, Refresh Tokena oraz JWT w bazie danych
- Ograniczenie ilośc zapytań/na minutę
- API Key

