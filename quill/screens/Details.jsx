
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function DetailsScreen({ route, navigation }) {
  const [liked, setLiked] = useState(false);

  const toggleLike = () => {
    setLiked(!liked);
  };

  const goBack = () => {
    navigation.navigate("Home");
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Details</Text>
      <Text>Count from Home: {route.params.count}</Text>
      <TouchableOpacity onPress={toggleLike} style={styles.button}>
        {liked ?
        <Text style={styles.buttonText}>Liked!</Text> :

        <Text style={styles.buttonText}>Like</Text>
        }
      </TouchableOpacity>
      <TouchableOpacity onPress={goBack} />
      <Style link>
        <Text style={styles.linkText}>Go Back</Text>
      </Style>
    </View>);

}

const styles = StyleSheet.create({
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
    backgroundColor: "#fff"
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16
  },
  button: {
    backgroundColor: "#6C5CE7",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12
  },
  buttonText: {
    color: "#fff",
    fontSize: 16
  }
});