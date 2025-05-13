# Welcome the shrymp chat project

## Summary
This project is a simple end to end encrypted chat app for the moment only available on the web

The project is currently build to be self hosted and here's the version that I host : http://localhost:5173

## How to dev 

If you want to work and contribute to the project, here a list of things you have to do

### Requierements
- Docker
- Make 

### Start the dev server
In order to start the dev server (front, back, and db) run this command at the root of the project:
```bash
make dev
```
If you wanna check the types 
```bash
make types
```

If you wanna check ESlint
```bash
make lint
```

## How to build 
To run the production server, you have to run this command:
```bash
pnpm prod 
```

