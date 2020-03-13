# HYBRIS_BI

## DEVELOPMENT ENVIRONMENT SETUP 

For local development/ testing xs apis hosted on https://ydevopsa60b97f07.hana.ondemand.com/ from localost

### installation
`npm install`

### config

create a config.json file with the following:

```
{
    "app":"HYBRIS_BI_DEV",
    "user":"some user",
    "password":"pass",
    "port":"8000" //optional default to 8000
}
```

### running 

`npm start`

Restrictions:
-app must be configured to allow basic access