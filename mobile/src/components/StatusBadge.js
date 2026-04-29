import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../styles/colors';
import { SYNC_STATUS } from '../constants/appConfig';

const STATUS_CONFIG = {
  [SYNC_STATUS.OFFLINE]: { color: colors.statusOffline, label: 'Saved Offline' },
  [SYNC_STATUS.RISK_CHECKED]: { color: colors.statusRiskChecked, label: 'Risk Checked' },
  [SYNC_STATUS.ALERT_QUEUED]: { color: colors.statusAlertQueued, label: 'Alert Queued' },
  [SYNC_STATUS.SYNCED]: { color: colors.statusSynced, label: 'Synced' },
  [SYNC_STATUS.FAILED]: { color: colors.statusFailed, label: 'Sync Failed' },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG[SYNC_STATUS.OFFLINE];
  return (
    <View style={[styles.badge, { backgroundColor: config.color + '20' }]}>
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
});
