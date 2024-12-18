import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Button } from "react-native";
import { Camera, CameraView } from "expo-camera";
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';
import { createHash, createVerify } from 'crypto';

global.Buffer = Buffer;
export default function App() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [ticketStatus, setTicketStatus] = useState<string | null>(null);
  
  const validate = async (ticketString: string) => {
    try {
      const ticket = JSON.parse(ticketString); // Input-String in JSON umwandeln
      const publicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAi5K+M4etlKc6dKVscYcnejZzesspG2kn9Zm0umE25N8VBYk4h1XuvuNKOjMJJkLEKVjswA947eEL0S4kWBg+kGbmOIoUpLVou7QQfUNj2PKNG/H56nV4CtLc+inD/XRX5odT2wAzP12L+Jv6k6onirVD/MZvfLVLiLlSMHkfEWf3n1UjhCVkj6qAl9+U4MFpiJ6mKa0dsjggAlalhc2OXM7yhtQT/IKT2flIhz1Y/J9QZqoKX+T7bWwiA8jSf/fVyRm+QQMd/jzeNb49QIrS1Nw1Peu7Q5F8iB0lCLK8oRrhfZlTNexdZJwK9cKv3SDjOBSLuvULUOkNvZp7DcOtEwIDAQAB
-----END PUBLIC KEY-----`
      const { ticketInfos, signature } = ticket;
  
      const ticketHash = crypto.createHash('sha256')
        .update(JSON.stringify(ticketInfos, Object.keys(ticketInfos).sort()))
        .digest();
  
      return crypto.verify(
        'sha256',
        ticketHash,
        { key: publicKey, padding: crypto.constants.RSA_PKCS1_PADDING },
        Buffer.from(signature, 'hex')
      );
    } catch {
      return false;
    }
  };

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleBarCodeScanned = ({
    type,
    data,
  }: {
    type: string;
    data: string;
  }) => {
    setScanned(true);
    console.log(`QR-Code erkannt: Typ ${type}, Inhalt: ${data}`);
    setShowCamera(false);

    validateTicket(data);
  };

  const openCamera = () => {
    setScanned(false);
    setShowCamera(true);
  };

  if (hasPermission === null) {
    return <Text style={styles.message}>Erfrage Kameraberechtigung...</Text>;
  }

  if (hasPermission === false) {
    return (
      <Text style={styles.message}>Kein Zugriff auf die Kamera erlaubt</Text>
    );
  }

  return (
    <View style={styles.container}>
      {showCamera ? (
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      ) : (
        <>
          <Text style={styles.title}>Ticket Checker</Text>
          {ticketStatus && <Text style={styles.message}>{ticketStatus}</Text>}
          <Button title="Kamera öffnen" onPress={openCamera} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  message: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
  },
});
