import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import { getAllPatients, searchPatients, filterPatientsByCondition } from '../database/patientRepository';
import { getPatientRiskMap } from '../database/visitRepository';
import PatientCard from '../components/PatientCard';
import EmptyState from '../components/EmptyState';
import { CONDITION_TYPE_OPTIONS } from '../constants/visitTypes';

const RISK_ORDER = { high: 0, medium: 1, none: 2 };

export default function PatientListScreen({ navigation }) {
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [riskMap, setRiskMap] = useState({});

  const loadPatients = useCallback(async () => {
    try {
      let result;
      if (searchQuery.trim()) {
        result = await searchPatients(searchQuery.trim());
      } else if (selectedFilter) {
        result = await filterPatientsByCondition(selectedFilter);
      } else {
        result = await getAllPatients();
      }

      // Load risk data for all patients
      const map = await getPatientRiskMap();
      setRiskMap(map);

      // Sort by risk: high → medium → none → no visits
      result.sort((a, b) => {
        const aRisk = map[a.id]?.risk_level || 'none';
        const bRisk = map[b.id]?.risk_level || 'none';
        const aOrder = RISK_ORDER[aRisk] ?? 3;
        const bOrder = RISK_ORDER[bRisk] ?? 3;
        if (aOrder !== bOrder) return aOrder - bOrder;
        // Secondary: newest patient first
        return (b.created_at || '').localeCompare(a.created_at || '');
      });

      setPatients(result);
    } catch (err) {
      console.error('Failed to load patients:', err);
    }
  }, [searchQuery, selectedFilter]);

  useFocusEffect(
    useCallback(() => {
      loadPatients();
    }, [loadPatients])
  );

  const handleFilterPress = (conditionValue) => {
    if (selectedFilter === conditionValue) {
      setSelectedFilter(null);
    } else {
      setSelectedFilter(conditionValue);
      setSearchQuery('');
    }
  };

  // Count by risk
  const highCount = patients.filter(p => riskMap[p.id]?.risk_level === 'high').length;
  const medCount = patients.filter(p => riskMap[p.id]?.risk_level === 'medium').length;

  return (
    <View style={styles.container}>
      {/* Risk summary strip */}
      {(highCount > 0 || medCount > 0) && (
        <View style={styles.riskStrip}>
          {highCount > 0 && (
            <View style={styles.riskChip}>
              <Text style={styles.riskChipDot}>🔴</Text>
              <Text style={[styles.riskChipText, { color: colors.riskHigh }]}>{highCount} High Risk</Text>
            </View>
          )}
          {medCount > 0 && (
            <View style={styles.riskChip}>
              <Text style={styles.riskChipDot}>🟡</Text>
              <Text style={[styles.riskChipText, { color: colors.riskMedium }]}>{medCount} Medium Risk</Text>
            </View>
          )}
          <Text style={styles.riskChipHint}>Sorted by priority</Text>
        </View>
      )}

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Search by name or village..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            setSelectedFilter(null);
          }}
        />
      </View>

      {/* Filter pills */}
      <View style={styles.filterRow}>
        {CONDITION_TYPE_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.filterPill, selectedFilter === opt.value && styles.filterPillActive]}
            onPress={() => handleFilterPress(opt.value)}
          >
            <Text style={[styles.filterText, selectedFilter === opt.value && styles.filterTextActive]}>
              {opt.label.split(' (')[0]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Patient list */}
      <FlatList
        data={patients}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <PatientCard
            patient={item}
            riskInfo={riskMap[item.id]}
            onPress={() => navigation.navigate('PatientDetail', { patientId: item.id })}
          />
        )}
        contentContainerStyle={patients.length === 0 ? styles.emptyContainer : styles.listContent}
        ListEmptyComponent={
          <EmptyState
            icon="👥"
            title="No patients found"
            message="Add a new patient to get started"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  riskStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    backgroundColor: '#FFF8E1',
    borderBottomWidth: 1,
    borderBottomColor: '#FFE082',
    gap: 12,
  },
  riskChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  riskChipDot: {
    fontSize: 10,
  },
  riskChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  riskChipHint: {
    fontSize: 11,
    color: colors.textMuted,
    marginLeft: 'auto',
    fontStyle: 'italic',
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  searchInput: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterPillActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '15',
  },
  filterText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  emptyContainer: {
    flex: 1,
  },
});
