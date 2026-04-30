import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import StatusBadge from './StatusBadge';
import { capitalize } from '../utils/formatters';

const RISK_STYLES = {
  high:   { bg: colors.riskHigh + '15', border: colors.riskHigh, text: colors.riskHigh, label: '🔴 HIGH RISK', cardBorder: colors.riskHigh },
  medium: { bg: colors.riskMedium + '15', border: colors.riskMedium, text: colors.riskMedium, label: '🟡 MEDIUM', cardBorder: colors.riskMedium },
  none:   null,
};

export default function PatientCard({ patient, riskInfo, onPress }) {
  const riskLevel = riskInfo?.risk_level || 'none';
  const riskStyle = RISK_STYLES[riskLevel];
  const isHighRisk = riskLevel === 'high';

  // Parse risk flags for display
  let riskFlags = [];
  if (riskInfo?.risk_flags) {
    try { riskFlags = JSON.parse(riskInfo.risk_flags); } catch { /* ignore */ }
  }

  // Check if last visit was today
  const lastVisitToday = riskInfo?.last_visit_date?.startsWith(new Date().toISOString().split('T')[0]);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        riskStyle && { borderLeftWidth: 4, borderLeftColor: riskStyle.cardBorder },
        isHighRisk && styles.cardHighRisk,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={[
          styles.avatar,
          riskStyle && { backgroundColor: riskStyle.bg }
        ]}>
          <Text style={[
            styles.avatarText,
            riskStyle && { color: riskStyle.text }
          ]}>
            {patient.name ? patient.name.charAt(0).toUpperCase() : '?'}
          </Text>
        </View>
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{patient.name}</Text>
            {lastVisitToday && (
              <View style={styles.visitedTodayBadge}>
                <Text style={styles.visitedTodayText}>✓ Visited Today</Text>
              </View>
            )}
          </View>
          <Text style={styles.details}>
            {patient.age} yrs • {capitalize(patient.sex)} • {patient.village}
          </Text>
          <Text style={styles.condition}>
            {capitalize(patient.condition_type)}
          </Text>
        </View>
      </View>

      {/* Risk Badge + Flags */}
      {riskStyle && (
        <View style={styles.riskRow}>
          <View style={[styles.riskBadge, { backgroundColor: riskStyle.bg, borderColor: riskStyle.border }]}>
            <Text style={[styles.riskBadgeText, { color: riskStyle.text }]}>{riskStyle.label}</Text>
          </View>
          {riskFlags.length > 0 && (
            <Text style={styles.riskFlagsText} numberOfLines={1}>
              {riskFlags.map(f => f.replace(/_/g, ' ')).join(', ')}
            </Text>
          )}
        </View>
      )}

      <View style={styles.footer}>
        <StatusBadge status={patient.sync_status} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardHighRisk: {
    backgroundColor: '#FFF5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  visitedTodayBadge: {
    backgroundColor: colors.success + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  visitedTodayText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.success,
  },
  details: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  condition: {
    fontSize: 13,
    color: colors.primary,
    marginTop: 2,
    fontWeight: '500',
  },
  riskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  riskBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  riskFlagsText: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
    fontStyle: 'italic',
  },
  footer: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});
