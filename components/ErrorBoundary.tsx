import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import Constants from 'expo-constants';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// Check if we're in development mode
const isDevelopment = __DEV__;

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    console.error('🚨 [ERROR BOUNDARY] Caught error:', error);
    console.error('📍 [ERROR BOUNDARY] Error info:', errorInfo);

    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });

    // TODO: Log to error reporting service (Sentry, Bugsnag, etc.)
    // Example:
    // if (!isDevelopment) {
    //   Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
    // }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    // In React Native, we can use expo-updates to reload
    // For now, just reset the error state
    this.handleReset();
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo } = this.state;

      // PRODUCTION MODE: Show friendly error message
      if (!isDevelopment) {
        return (
          <View style={styles.container}>
            <View style={styles.contentContainer}>
              {/* Friendly Icon */}
              <View style={styles.iconContainer}>
                <Ionicons name="alert-circle" size={80} color="#EF4444" />
              </View>

              {/* Friendly Message */}
              <Text style={styles.title}>Oups, quelque chose s'est mal passé</Text>
              <Text style={styles.message}>
                Nous avons rencontré un problème inattendu. Ne vous inquiétez pas, vos données sont en sécurité.
              </Text>

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.primaryButton} onPress={this.handleReload} activeOpacity={0.8}>
                  <Ionicons name="refresh" size={20} color="#FFFFFF" />
                  <Text style={styles.primaryButtonText}>Réessayer</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryButton} onPress={this.handleReset} activeOpacity={0.8}>
                  <Text style={styles.secondaryButtonText}>Revenir en arrière</Text>
                </TouchableOpacity>
              </View>

              {/* Support Info */}
              <Text style={styles.supportText}>
                Si le problème persiste, veuillez contacter le support technique.
              </Text>
            </View>
          </View>
        );
      }

      // DEVELOPMENT MODE: Show detailed error information
      return (
        <View style={styles.container}>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            {/* Dev Header */}
            <View style={[styles.devHeader, { backgroundColor: '#EF4444' }]}>
              <Ionicons name="bug" size={24} color="#FFFFFF" />
              <Text style={styles.devHeaderText}>Development Error</Text>
            </View>

            {/* Error Title */}
            <View style={styles.devSection}>
              <Text style={styles.devSectionTitle}>❌ Error Message:</Text>
              <View style={styles.devCodeBlock}>
                <Text style={styles.devErrorText}>{error?.toString()}</Text>
              </View>
            </View>

            {/* Component Stack */}
            {errorInfo && (
              <View style={styles.devSection}>
                <Text style={styles.devSectionTitle}>📍 Component Stack:</Text>
                <View style={styles.devCodeBlock}>
                  <Text style={styles.devStackText}>{errorInfo.componentStack}</Text>
                </View>
              </View>
            )}

            {/* Error Stack (if available) */}
            {error?.stack && (
              <View style={styles.devSection}>
                <Text style={styles.devSectionTitle}>🔍 Stack Trace:</Text>
                <View style={styles.devCodeBlock}>
                  <Text style={styles.devStackText}>{error.stack}</Text>
                </View>
              </View>
            )}

            {/* App Info */}
            <View style={styles.devSection}>
              <Text style={styles.devSectionTitle}>ℹ️ App Info:</Text>
              <View style={styles.devCodeBlock}>
                <Text style={styles.devInfoText}>Version: {Constants.expoConfig?.version || 'N/A'}</Text>
                <Text style={styles.devInfoText}>Environment: {isDevelopment ? 'Development' : 'Production'}</Text>
                <Text style={styles.devInfoText}>Platform: {Constants.platform?.ios ? 'iOS' : 'Android'}</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.devButtonContainer}>
              <TouchableOpacity style={styles.devPrimaryButton} onPress={this.handleReset} activeOpacity={0.8}>
                <Ionicons name="refresh" size={18} color="#FFFFFF" />
                <Text style={styles.devPrimaryButtonText}>Reset Error</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.devSecondaryButton}
                onPress={() => console.log('Full error:', { error, errorInfo })}
                activeOpacity={0.8}
              >
                <Ionicons name="terminal" size={18} color="#3B82F6" />
                <Text style={styles.devSecondaryButtonText}>Log to Console</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  // Common Styles
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },

  // Production Styles
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: wp(6),
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: wp(4),
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: wp(6),
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: wp(4),
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#6B7280',
    fontSize: wp(4),
    fontWeight: '600',
  },
  supportText: {
    fontSize: wp(3.5),
    color: '#9CA3AF',
    textAlign: 'center',
  },

  // Development Styles
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  devHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  devHeaderText: {
    color: '#FFFFFF',
    fontSize: wp(4.5),
    fontWeight: 'bold',
  },
  devSection: {
    marginBottom: 16,
  },
  devSectionTitle: {
    fontSize: wp(4),
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  devCodeBlock: {
    backgroundColor: '#1F2937',
    padding: 12,
    borderRadius: 8,
  },
  devErrorText: {
    color: '#FCA5A5',
    fontSize: wp(3.5),
    fontFamily: 'monospace',
  },
  devStackText: {
    color: '#D1D5DB',
    fontSize: wp(3),
    fontFamily: 'monospace',
    lineHeight: wp(4.5),
  },
  devInfoText: {
    color: '#93C5FD',
    fontSize: wp(3.5),
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  devButtonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  devPrimaryButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  devPrimaryButtonText: {
    color: '#FFFFFF',
    fontSize: wp(3.5),
    fontWeight: '600',
  },
  devSecondaryButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  devSecondaryButtonText: {
    color: '#3B82F6',
    fontSize: wp(3.5),
    fontWeight: '600',
  },
});

export default ErrorBoundary;
