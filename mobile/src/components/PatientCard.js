import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import StatusBadge from './StatusBadge';
import RiskBadge from './RiskBadge';
import { capitalize } from '../utils/formatters';

export default function PatientCard({ patient, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {patient.name ? patient.name.charAt(0).toUpperCase() : '?'}
          </Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{patient.name}</Text>
          <Text style={styles.details}>
            {patient.age} yrs • {capitalize(patient.sex)} • {patient.village}
          </Text>
          <Text style={styles.condition}>
            {capitalize(patient.condition_type)}
          </Text>
        </View>
      </View>
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
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
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
  footer: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});
