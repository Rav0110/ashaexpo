import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import { getAllPatients, searchPatients, filterPatientsByCondition } from '../database/patientRepository';
import PatientCard from '../components/PatientCard';
import EmptyState from '../components/EmptyState';
import { CONDITION_TYPE_OPTIONS } from '../constants/visitTypes';

export default function PatientListScreen({ navigation }) {
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState(null);

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

  return (
    <View style={styles.container}>
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
