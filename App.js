import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Picker, ScrollView } from "react-native";

export default function App() {
  const [email, setEmail] = useState("student@example.com");
  const [password, setPassword] = useState("password123");
  const [token, setToken] = useState(null);
  const [lang, setLang] = useState("en");
  const [textInput, setTextInput] = useState("");
  const [result, setResult] = useState("");

  // Replace this with your deployed backend URL after Render deployment
  const BACKEND_URL = "https://yourapp.onrender.com";

  const login = async () => {
    try {
      let formBody = `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
      const resp = await fetch(`${BACKEND_URL}/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formBody,
      });
      const data = await resp.json();
      if (data.access_token) setToken(data.access_token);
      else alert("Login failed");
    } catch (err) {
      alert(err.message);
    }
  };

  const detectText = async () => {
    if (!textInput.trim()) {
      alert("Please enter some text");
      return;
    }
    const formData = new FormData();
    formData.append("text", textInput);
    formData.append("lang", lang);

    const resp = await fetch(`${BACKEND_URL}/detect/text`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await resp.json();
    setResult(data.result);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {!token ? (
        <>
          <Text style={styles.header}>Login</Text>
          <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} />
          <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
          <Button title="Login" onPress={login} />
        </>
      ) : (
        <>
          <Text style={styles.header}>AI Content Detector</Text>

          <Text>Select Language:</Text>
          <Picker selectedValue={lang} onValueChange={setLang} style={styles.picker}>
            <Picker.Item label="English" value="en" />
            <Picker.Item label="Spanish" value="es" />
            <Picker.Item label="French" value="fr" />
            <Picker.Item label="Hindi" value="hi" />
          </Picker>

          <TextInput
            style={[styles.input, { height: 100 }]}
            multiline
            placeholder="Enter text to check for AI generation"
            value={textInput}
            onChangeText={setTextInput}
          />
          <Button title="Detect Text AI" onPress={detectText} />

          {result ? (
            <View style={styles.resultBox}>
              <Text style={{ fontWeight: "bold" }}>Result:</Text>
              <Text>{result}</Text>
            </View>
          ) : null}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: "center", padding: 20, backgroundColor: "#f0f0f0" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 5, padding: 10, marginVertical: 10, backgroundColor: "#fff" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  picker: { height: 50, width: "100%", marginVertical: 10 },
  resultBox: { marginTop: 20, padding: 15, backgroundColor: "#dff0d8", borderRadius: 5 },
});