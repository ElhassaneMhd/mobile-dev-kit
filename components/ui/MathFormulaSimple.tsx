import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MathFormulaSimpleProps {
  formula: string;
  fontSize?: number;
  textColor?: string;
}

interface FormulaPart {
  text: string;
  isSubscript?: boolean;
}

// Parse LaTeX formula into parts with subscripts
function parseFormula(latex: string): FormulaPart[] {
  const parts: FormulaPart[] = [];

  // Replace math symbols first
  let processed = latex
    .replace(/\\times/g, '×')
    .replace(/\\div/g, '÷')
    .replace(/\\sum_{([^}]+)}/g, '∑ᵢ')
    .replace(/\\sum/g, '∑')
    .replace(/\\therefore/g, '∴')
    .replace(/\\quad/g, '  ')
    .replace(/\\boxed\{([^}]+)\}/g, '⟦ $1 ⟧')
    .replace(/\\/g, '');

  // Parse subscripts
  const regex = /([^_]+)(?:_{([^}]+)})?/g;
  let match;

  while ((match = regex.exec(processed)) !== null) {
    const [, mainText, subscript] = match;

    if (mainText && mainText.trim()) {
      parts.push({ text: mainText });
    }

    if (subscript) {
      parts.push({ text: subscript, isSubscript: true });
    }
  }

  return parts.length > 0 ? parts : [{ text: processed }];
}

export function MathFormulaSimple({ formula, fontSize = 16, textColor = '#1F2937' }: MathFormulaSimpleProps) {
  const parts = parseFormula(formula);

  return (
    <View style={styles.container}>
      <Text style={[styles.text, { fontSize, color: textColor }]}>
        {parts.map((part, index) => (
          <Text
            key={index}
            style={part.isSubscript ? {
              fontSize: fontSize * 0.65,
              lineHeight: fontSize * 0.65,
              position: 'relative',
              top: fontSize * 0.15,
            } : undefined}
          >
            {part.text}
          </Text>
        ))}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  text: {
    fontFamily: 'monospace',
    textAlign: 'center',
    lineHeight: 32,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
