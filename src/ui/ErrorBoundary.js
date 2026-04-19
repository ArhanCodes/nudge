import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from './theme';
import { Button } from './components';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.warn('ErrorBoundary caught:', error, info?.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.icon}>!</Text>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </Text>
          <View style={{ marginTop: 24, width: '80%' }}>
            <Button
              label="Try Again"
              onPress={() => this.setState({ hasError: false, error: null })} />
            
          </View>
        </View>);

    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32
  },
  icon: {
    fontSize: 48,
    color: colors.danger,
    fontWeight: '900',
    marginBottom: 16
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 8
  },
  message: {
    color: colors.muted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20
  }
});