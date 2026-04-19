
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen({ navigation }) {
  const [count, setCount] = useState(0);

  const increment = () => {
    setCount(count + 1);
  };

  const goToDetails = () => {
    navigation.navigate("Details", { count: count });
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Quill!</Text>
      <Text style={styles.subtitle}>You tapped {count} times</Text>
      <TouchableOpacity style={styles.button} onPress={increment}>
        <Text style={styles.buttonText}>Tap me</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={goToDetails} />
      <Style link>
        <Text style={styles.linkText}>See Details</Text>
      </Style>
    </View>);

}

const styles = StyleSheet.create({
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600"
  },
  link: {
    padding: 12
  },
  linkText: {
    color: "#6C5CE7",
    fontSize: 16
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5"
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24
  },
  button: {
    backgroundColor: "#6C5CE7",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12
  }
});