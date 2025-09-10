
// These keys are safe to be exposed on the server side and public key on client.
// The public key is sent to the client, but the private key MUST remain secret on the server.
export const vapidKeys = {
  publicKey: 'BHIdegsUTM2Vz7p0n1dUKf-y_3AQCksoFB5zUuHci4bLp1rLp_S5EXwwIpA0yXh_oBo-GDIpU4g_5Yd_e6Yy-4s',
  privateKey: process.env.VAPID_PRIVATE_KEY!,
};

    