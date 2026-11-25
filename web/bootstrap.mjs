import Container from '/vendor/teqfw-di/Container.mjs';

const container = new Container({
  namespaces: [
    { prefix: 'Mindstream_Web_', target: '/app/Web', defaultExt: '.mjs' },
    { prefix: 'Mindstream_Shared_', target: '/app/Shared', defaultExt: '.mjs' },
  ],
});

const app = await container.get('Mindstream_Web_App$');
app.start();
