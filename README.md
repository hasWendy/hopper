TUNE for Partners
======================

Build on NodeJS.


Development installation instructions:
---------------

#### Install Gulp
##### (if you don't have it yet)
* `npm install -g gulp`


#### Install deps
* `npm install`
* ensure /var/has/partnerapp/conf/config.json exist with correct values (Bug someone for a copy)
* /var/has/ho_ips.json -> contains the following
```
{
  "exact" : ["127.0.0.1"],
  "partial": ["127.0.0."]
}
```


Troubleshooting Production / Stage Server
-----------
If you are the lucky one who get the 'PagerDuty' role, and the production server is down or has some problem, we have this wiki page to help you trouble shoot the server

https://github.com/Adapp/partners_app/wiki/TUNE-Partner-Center-WiKi

Good luck and may the odds be ever in your favor.



Development
-----------
* run `gulp` in your terminal.  This will start up a node dev server that will autorefresh when the server updates.
Webpack is built into this process as well.

* To get authenticated into the app in dev mode, point your browser at http://localhost:8080/dev_login



Private npm registry
===================================
We utilize a private, internal npm registry to host internal dependent packages.

There is a web frontend to see available packages at http://sea1-sinopia01.sea1.office.priv:4873

You need to do nothing in order to consume from this repository. The `.npmrc` file will set everything up for you.

However, you can modify your global settings by running the following command.
```
npm set registry http://sea1-sinopia01.sea1.office.priv:4873
```

You can verify that you're configured to utlize the correct registry by checking `npm config ls`. It should contain
```
registry = "http://sea1-sinopia01.sea1.office.priv:4873/"
```
