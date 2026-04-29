import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import { countPatients } from '../database/patientRepository';
import { countVisitsToday } from '../database/visitRepository';
import { countPending, countPendingAlerts } from '../database/syncQueueRepository';
import { isOnline } from '../services/connectivityService';
import { APP_NAME } from '../constants/appConfig';

export default function HomeScreen({ navigation }) {
  const [stats, setStats] = useState({
    totalPatients: 0,
    visitsToday: 0,
    pendingSync: 0,
    pendingAlerts: 0,
  });
  const [online, setOnline] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      const [totalPatients, visitsToday, pendingSync, pendingAlerts] = await Promise.all([
        countPatients(),
        countVisitsToday(),
        countPending(),
        countPendingAlerts(),
      ]);
      setStats({ totalPatients, visitsToday, pendingSync, pendingAlerts });
      setOnline(isOnline());
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  const actions = [
    { title: '➕ Add Patient\nमरीज़ जोड़ें', screen: 'AddPatient', color: colors.primary },
    { title: '📋 Add Visit\nविजिट जोड़ें', screen: 'AddVisit', color: '#1976D2' },
    { title: '👥 Patients\nमरीज़ देखें', screen: 'PatientList', color: '#7B1FA2' },
    { title: '🔄 Pending Sync\nसिंक स्थिति', screen: 'PendingSync', color: '#F57C00' },
    { title: '📊 Reports\nरिपोर्ट', screen: 'Report', color: '#00796B' },
  ];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appName}>{APP_NAME}</Text>
        <Text style={styles.subtitle}>ग्राम स्वास्थ्य सहायक</Text>
        <View style={[styles.connectionBadge, online ? styles.onlineBadge : styles.offlineBadge]}>
          <View style={[styles.connectionDot, { backgroundColor: online ? colors.success : colors.textMuted }]} />
          <Text style={[styles.connectionText, { color: online ? colors.success : colors.textMuted }]}>
            {online ? 'Online' : 'Offline'}
          </Text>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalPatients}</Text>
          <Text style={styles.statLabel}>Patients{'\n'}मरीज़</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.visitsToday}</Text>
          <Text style={styles.statLabel}>Today's Visits{'\n'}आज की विजिट</Text>
        </View>
        <View style={[styles.statCard, stats.pendingSync > 0 && styles.pendingCard]}>
          <Text style={[styles.statNumber, stats.pendingSync > 0 && { color: colors.warning }]}>
            {stats.pendingSync}
          </Text>
          <Text style={styles.statLabel}>Pending Sync{'\n'}सिंक बाकी</Text>
        </View>
      </View>

      {/* Alert banner */}
      {stats.pendingAlerts > 0 && (
        <View style={styles.alertBanner}>
          <Text style={styles.alertText}>
            🔴 {stats.pendingAlerts} high-risk alert{stats.pendingAlerts > 1 ? 's' : ''} pending sync
          </Text>
        </View>
      )}

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        {actions.map((action, idx) => (
          <TouchableOpacity
            key={idx}
            style={[styles.actionButton, { backgroundColor: action.color }]}
            onPress={() => navigation.navigate(action.screen)}
            activeOpacity={0.8}
          >
            <Text style={styles.actionText}>{action.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  appName: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textLight,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight + 'CC',
    marginTop: 2,
  },
  connectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  onlineBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  offlineBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  connectionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    marginTop: -spacing.md,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pendingCard: {
    borderWidth: 1.5,
    borderColor: colors.warning,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  alertBanner: {
    backgroundColor: colors.riskHigh + '15',
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: colors.riskHigh,
  },
  alertText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.riskHigh,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    gap: 10,
    paddingBottom: spacing.xl,
  },
  actionButton: {
    width: '47%',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
  },
});
