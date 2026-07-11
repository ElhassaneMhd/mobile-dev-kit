import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

interface MathFormulaProps {
  formula: string;
  fontSize?: number;
  textColor?: string;
}

export function MathFormula({ formula, fontSize = 16, textColor = '#1F2937' }: MathFormulaProps) {
  const [height, setHeight] = React.useState(80);
  const [loaded, setLoaded] = React.useState(false);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" integrity="sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV" crossorigin="anonymous">
        <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js" integrity="sha384-XjKyOOlGwcjNTAIQHIpgOno0Hl1YQqzUOEleOLALmuqehneUG+vnGctmUb0ZY0l8" crossorigin="anonymous"></script>
        <style>
          * {
            margin: 0;
            padding: 0;
            -webkit-text-size-adjust: none;
          }
          html, body {
            width: 100%;
            height: 100%;
            overflow: hidden;
            background: transparent;
          }
          body {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 4px;
          }
          #math {
            font-size: ${fontSize}px;
            color: ${textColor};
            text-align: center;
            width: 100%;
          }
          .katex {
            font-size: inherit !important;
            color: inherit !important;
          }
          .katex-display {
            margin: 0 !important;
          }
        </style>
      </head>
      <body>
        <div id="math">Loading...</div>
        <script>
          (function() {
            function render() {
              try {
                if (typeof katex === 'undefined') {
                  setTimeout(render, 100);
                  return;
                }

                const formula = ${JSON.stringify(formula)};
                const mathElement = document.getElementById('math');

                katex.render(formula, mathElement, {
                  throwOnError: false,
                  displayMode: true,
                  strict: false,
                  trust: true
                });

                setTimeout(function() {
                  const height = Math.max(mathElement.offsetHeight, 40);
                  window.ReactNativeWebView && window.ReactNativeWebView.postMessage(
                    JSON.stringify({ height: height + 16 })
                  );
                }, 100);
              } catch (error) {
                document.getElementById('math').textContent = 'Error: ' + error.message;
              }
            }

            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', render);
            } else {
              render();
            }
          })();
        </script>
      </body>
    </html>
  `;

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.height && data.height > 0) {
        setHeight(data.height);
        setLoaded(true);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  return (
    <View style={[styles.container, { height, minHeight: 60 }]}>
      <WebView
        source={{ html }}
        style={styles.webview}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        onMessage={handleMessage}
        onLoadEnd={() => setLoaded(true)}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        androidLayerType="hardware"
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
        mixedContentMode="always"
        cacheEnabled={false}
        incognito={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  webview: {
    backgroundColor: 'transparent',
    flex: 1,
  },
});
