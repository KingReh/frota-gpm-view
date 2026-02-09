import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Web Push VAPID helpers
async function generateVapidAuthHeader(
  audience: string,
  subject: string,
  privateKeyBase64: string,
  publicKeyBase64: string
): Promise<{ authorization: string; cryptoKey: string }> {
  const encoder = new TextEncoder();

  // JWT header
  const header = { typ: "JWT", alg: "ES256" };
  const now = Math.floor(Date.now() / 1000);
  const payload = { aud: audience, exp: now + 12 * 3600, sub: subject };

  const headerB64 = base64UrlEncode(encoder.encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // Import private key
  const privateKeyBytes = base64UrlDecode(privateKeyBase64);
  const key = await crypto.subtle.importKey(
    "pkcs8",
    convertRawKeyToPKCS8(privateKeyBytes),
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    key,
    encoder.encode(unsignedToken)
  );

  const sig = convertDERToRaw(new Uint8Array(signature));
  const token = `${unsignedToken}.${base64UrlEncode(sig)}`;

  return {
    authorization: `vapid t=${token}, k=${publicKeyBase64}`,
    cryptoKey: `p256ecdsa=${publicKeyBase64}`,
  };
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(str: string): Uint8Array {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function convertRawKeyToPKCS8(rawKey: Uint8Array): ArrayBuffer {
  // PKCS8 wrapper for EC P-256 private key
  const pkcs8Header = new Uint8Array([
    0x30, 0x81, 0x87, 0x02, 0x01, 0x00, 0x30, 0x13, 0x06, 0x07, 0x2a, 0x86,
    0x48, 0xce, 0x3d, 0x02, 0x01, 0x06, 0x08, 0x2a, 0x86, 0x48, 0xce, 0x3d,
    0x03, 0x01, 0x07, 0x04, 0x6d, 0x30, 0x6b, 0x02, 0x01, 0x01, 0x04, 0x20,
  ]);
  const pkcs8Footer = new Uint8Array([
    0xa1, 0x44, 0x03, 0x42, 0x00,
  ]);

  // If raw key is 32 bytes, it's just the private scalar
  if (rawKey.length === 32) {
    // We need the public key too, but we'll derive it
    const result = new Uint8Array(pkcs8Header.length + 32 + pkcs8Footer.length + 65);
    result.set(pkcs8Header);
    result.set(rawKey, pkcs8Header.length);
    // Without public key part - try simpler PKCS8
    const simplePkcs8 = new Uint8Array([
      0x30, 0x41, 0x02, 0x01, 0x00, 0x30, 0x13, 0x06, 0x07, 0x2a, 0x86,
      0x48, 0xce, 0x3d, 0x02, 0x01, 0x06, 0x08, 0x2a, 0x86, 0x48, 0xce,
      0x3d, 0x03, 0x01, 0x07, 0x04, 0x27, 0x30, 0x25, 0x02, 0x01, 0x01,
      0x04, 0x20,
    ]);
    const pkcs8 = new Uint8Array(simplePkcs8.length + 32);
    pkcs8.set(simplePkcs8);
    pkcs8.set(rawKey, simplePkcs8.length);
    return pkcs8.buffer;
  }

  return rawKey.buffer;
}

function convertDERToRaw(der: Uint8Array): Uint8Array {
  // ECDSA signature: DER to raw (r || s, each 32 bytes)
  // If already 64 bytes, return as-is
  if (der.length === 64) return der;

  const raw = new Uint8Array(64);
  let offset = 2; // skip SEQUENCE tag and length
  // R
  const rLen = der[offset + 1];
  offset += 2;
  const rStart = rLen > 32 ? offset + (rLen - 32) : offset;
  const rDest = rLen < 32 ? 32 - rLen : 0;
  raw.set(der.slice(rStart, offset + rLen), rDest);
  offset += rLen;
  // S
  const sLen = der[offset + 1];
  offset += 2;
  const sStart = sLen > 32 ? offset + (sLen - 32) : offset;
  const sDest = sLen < 32 ? 64 - sLen : 32;
  raw.set(der.slice(sStart, offset + sLen), sDest);

  return raw;
}

// Encrypt push payload using Web Push encryption (aes128gcm)
async function encryptPayload(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: string
): Promise<{ encrypted: Uint8Array; salt: Uint8Array; localPublicKey: Uint8Array }> {
  const encoder = new TextEncoder();

  // Generate local ECDH key pair
  const localKeyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"]
  );

  const localPublicKeyRaw = new Uint8Array(
    await crypto.subtle.exportKey("raw", localKeyPair.publicKey)
  );

  // Import subscriber's public key
  const subscriberPubKeyBytes = base64UrlDecode(subscription.keys.p256dh);
  const subscriberPubKey = await crypto.subtle.importKey(
    "raw",
    subscriberPubKeyBytes,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    []
  );

  // ECDH shared secret
  const sharedSecretBits = await crypto.subtle.deriveBits(
    { name: "ECDH", public: subscriberPubKey },
    localKeyPair.privateKey,
    256
  );
  const sharedSecret = new Uint8Array(sharedSecretBits);

  // Auth secret
  const authSecret = base64UrlDecode(subscription.keys.auth);

  // Salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // HKDF-based key derivation (RFC 8291)
  const ikmInfo = encoder.encode("WebPush: info\0");
  const ikmInfoFull = new Uint8Array(ikmInfo.length + subscriberPubKeyBytes.length + localPublicKeyRaw.length);
  ikmInfoFull.set(ikmInfo);
  ikmInfoFull.set(subscriberPubKeyBytes, ikmInfo.length);
  ikmInfoFull.set(localPublicKeyRaw, ikmInfo.length + subscriberPubKeyBytes.length);

  // PRK = HKDF-Extract(auth_secret, shared_secret)
  const prkKey = await crypto.subtle.importKey("raw", authSecret, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const prk = new Uint8Array(await crypto.subtle.sign("HMAC", prkKey, sharedSecret));

  // IKM = HKDF-Expand(PRK, info, 32)
  const ikm = await hkdfExpand(prk, ikmInfoFull, 32);

  // Content encryption key: HKDF(salt, IKM, "Content-Encoding: aes128gcm\0", 16)
  const cekInfo = encoder.encode("Content-Encoding: aes128gcm\0");
  const cekPrk = await hkdfExtract(salt, ikm);
  const cek = await hkdfExpand(cekPrk, cekInfo, 16);

  // Nonce: HKDF(salt, IKM, "Content-Encoding: nonce\0", 12)
  const nonceInfo = encoder.encode("Content-Encoding: nonce\0");
  const nonce = await hkdfExpand(cekPrk, nonceInfo, 12);

  // Encrypt with AES-128-GCM
  const payloadBytes = encoder.encode(payload);
  // Add padding delimiter
  const padded = new Uint8Array(payloadBytes.length + 1);
  padded.set(payloadBytes);
  padded[payloadBytes.length] = 2; // padding delimiter

  const aesKey = await crypto.subtle.importKey("raw", cek, { name: "AES-GCM" }, false, ["encrypt"]);
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: nonce, tagLength: 128 },
    aesKey,
    padded
  );

  // Build aes128gcm payload: salt(16) + rs(4) + idlen(1) + keyid(65) + encrypted
  const rs = 4096;
  const rsBytes = new Uint8Array(4);
  new DataView(rsBytes.buffer).setUint32(0, rs);

  const header = new Uint8Array(16 + 4 + 1 + localPublicKeyRaw.length);
  header.set(salt);
  header.set(rsBytes, 16);
  header[20] = localPublicKeyRaw.length;
  header.set(localPublicKeyRaw, 21);

  const encBytes = new Uint8Array(encryptedBuffer);
  const result = new Uint8Array(header.length + encBytes.length);
  result.set(header);
  result.set(encBytes, header.length);

  return { encrypted: result, salt, localPublicKey: localPublicKeyRaw };
}

async function hkdfExtract(salt: Uint8Array, ikm: Uint8Array): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", salt, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, ikm));
}

async function hkdfExpand(prk: Uint8Array, info: Uint8Array, length: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", prk, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const input = new Uint8Array(info.length + 1);
  input.set(info);
  input[info.length] = 1;
  const output = new Uint8Array(await crypto.subtle.sign("HMAC", key, input));
  return output.slice(0, length);
}

async function sendPushToSubscription(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<Response> {
  const url = new URL(subscription.endpoint);
  const audience = `${url.protocol}//${url.host}`;

  const vapidHeaders = await generateVapidAuthHeader(
    audience,
    "mailto:noreply@frotagpm.app",
    vapidPrivateKey,
    vapidPublicKey
  );

  const { encrypted } = await encryptPayload(subscription, payload);

  return fetch(subscription.endpoint, {
    method: "POST",
    headers: {
      Authorization: vapidHeaders.authorization,
      "Crypto-Key": vapidHeaders.cryptoKey,
      "Content-Type": "application/octet-stream",
      "Content-Encoding": "aes128gcm",
      TTL: "86400",
      Urgency: "high",
    },
    body: encrypted,
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate the request is from an authorized source (DB trigger via pg_net sends the anon key)
    const authHeader = req.headers.get("Authorization");
    const expectedAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!authHeader || !expectedAnonKey || authHeader !== `Bearer ${expectedAnonKey}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY")!;
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY")!;

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Fetch all push subscriptions
    const { data: subscriptions, error: fetchError } = await supabase
      .from("push_subscriptions")
      .select("*");

    if (fetchError) {
      console.error("Error fetching subscriptions:", fetchError);
      return new Response(JSON.stringify({ error: "Failed to fetch subscriptions" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log("No subscriptions found");
      return new Response(JSON.stringify({ message: "No subscriptions" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = JSON.stringify({
      title: "Aviso",
      body: "Saldo de combustível atualizado pela GPM!",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
    });

    let successCount = 0;
    let failCount = 0;
    const expiredEndpoints: string[] = [];

    // Send push to each subscription
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          const response = await sendPushToSubscription(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            payload,
            vapidPublicKey,
            vapidPrivateKey
          );

          if (response.status === 201 || response.status === 200) {
            successCount++;
            // Update last_used_at
            await supabase
              .from("push_subscriptions")
              .update({ last_used_at: new Date().toISOString() })
              .eq("endpoint", sub.endpoint);
          } else if (response.status === 404 || response.status === 410) {
            // Subscription expired - mark for removal
            expiredEndpoints.push(sub.endpoint);
            failCount++;
          } else {
            const body = await response.text();
            console.error(`Push failed for ${sub.endpoint}: ${response.status} - ${body}`);
            failCount++;
          }
        } catch (err) {
          console.error(`Error sending push to ${sub.endpoint}:`, err);
          failCount++;
        }
      })
    );

    // Remove expired subscriptions
    if (expiredEndpoints.length > 0) {
      await supabase
        .from("push_subscriptions")
        .delete()
        .in("endpoint", expiredEndpoints);
      console.log(`Removed ${expiredEndpoints.length} expired subscriptions`);
    }

    // Log result (update existing pending log)
    await supabase
      .from("push_notifications_log")
      .update({
        status: "sent",
        affected_rows: successCount,
      })
      .eq("status", "pending")
      .order("triggered_at", { ascending: false })
      .limit(1);

    console.log(`Push sent: ${successCount} success, ${failCount} failed, ${expiredEndpoints.length} expired`);

    return new Response(
      JSON.stringify({
        success: true,
        sent: successCount,
        failed: failCount,
        expired: expiredEndpoints.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
