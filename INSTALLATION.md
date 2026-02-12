# TurbOmics frontend

The frontend of TurbOmics has been developd using a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

1. Install the dependencies
```bash
npm install
```

2. Start the development server
```bash
npm run dev
```

3. Open the web application

Open [http://localhost:3000/TurboPutative](http://localhost:3000/TurboPutative) with your browser to see the web application.



## Build the application for production

1. Remove the previous build folder
```bash
rm -rf out
```

2. Build the application
```bash
npm run build
```

3. Copy the builded files into TurbOmics proyect

```bash
./copyToTurbOmicsServer.sh ${FOLDER_OF_FRONTEND}/turbomics-frontend/out ${FOLDER_OF_BACKEND}/TurbOmics/src/TurboOmicsIntegrator/App
```
<!--
./copyToTurbOmicsServer.sh /home/jmrodriguezc/turbomics-frontend/out /home/jmrodriguezc/TurbOmics/src/TurboOmicsIntegrator/App
-->
