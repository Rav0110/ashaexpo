import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../styles/colors';
import { RISK_LEVEL } from '../constants/riskThresholds';

const RISK_CONFIG = {
  [RISK_LEVEL.HIGH]: { color: colors.riskHigh, label: 'HIGH RISK', emoji: '🔴' },
  [RISK_LEVEL.MEDIUM]: { color: colors.riskMedium, label: 'MEDIUM RISK', emoji: '🟡' },
  [RISK_LEVEL.NONE]: { color: colors.riskNone, label: 'LOW RISK', emoji: '🟢' },
};

export default function RiskBadge({ riskLevel, compact }) {
  const config = RISK_CONFIG[riskLevel] || RISK_CONFIG[RISK_LEVEL.NONE];

  if (compact) {
    return (
      <View style={[styles.compactBadge, { backgroundColor: config.color + '20' }]}>
        <Text style={[styles.compactText, { color: config.color }]}>{config.label}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.badge, { backgroundColor: config.color + '15', borderColor: config.color }]}>
      <Text style={styles.emoji}>{config.emoji}</Text>
      <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    alignSelf: 'flex-start',
  },
  emoji: {
    fontSize: 16,
    marginRight: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  compactBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  compactText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
