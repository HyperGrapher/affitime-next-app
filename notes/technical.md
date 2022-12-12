### Find where user clicked the link

[NAX IPware - Best attempt to get client's IP address ](https://github.com/neekware/fullerstack/tree/main/libs/nax-ipware)

[I need to know where user came from node js](https://stackoverflow.com/q/55312249)

[How to determine a user's IP address in node](https://stackoverflow.com/q/8107856)

[Working steps with express and NGinx using 'trust proxy'](https://stackoverflow.com/a/63038010)

[Diger bir NGinx ve trust proxy ornegi](https://stackoverflow.com/a/53819302)


```js
req.headers["user-agent"];

request.socket.remoteAddress;
```

- req.connection has been deprecated since node@12.12.0. Using req.connection.remoteAddress to get the client IP might still work but is discouraged.
Luckily, req.socket.remoteAddress has been there since node@0.5.10 and is a perfect replacement: https://stackoverflow.com/a/65928931

- I found this solution req.header('Referer') this give to ma the previous page is this is best answer ?

- No, referer can be spoofed, and it's an optional field. it's a bad idea to use if –

- <b>req.connection.remoteAddress</b> Basically if the request is coming from localhost, ipAddress will be ::1 or other localhost IP address, but if it's not, it's going to look like a public IP address, like 173.194.79.101 (the IP of google.com)

- As @juand points out in the comments, the correct method to get the remote IP, if the server is behind a proxy, is request.headers['x-forwarded-for']

- When using express with Node.js:
  If you set `app.set('trust proxy', true)`, req.ip will return the real IP address even if behind proxy. https://stackoverflow.com/a/8107922

---
