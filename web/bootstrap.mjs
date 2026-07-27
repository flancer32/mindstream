import Container from '/vendor/teqfw-di/esm.js';

const container = new Container();
container.addNamespaceRoot('Mindstream_Web_', '/app/Web', '.mjs');
container.addNamespaceRoot('Mindstream_Shared_', '/app/Shared', '.mjs');

const app = await container.get('Mindstream_Web_App$');
app.start();
