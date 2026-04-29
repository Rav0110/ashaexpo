import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import FormInput from '../components/FormInput';
import FormSelect from '../components/FormSelect';
import { CONDITION_TYPE_OPTIONS, SEX_OPTIONS } from '../constants/visitTypes';
import { DEFAULT_ASHA_ID, DEFAULT_VILLAGE, SYNC_PRIORITY } from '../constants/appConfig';
import { insertPatient } from '../database/patientRepository';
import { enqueue } from '../database/syncQueueRepository';
import { generateId } from '../utils/idGenerator';
import { nowISO } from '../utils/dateUtils';
import { isOnline } from '../services/connectivityService';
import { processQueue } from '../services/syncManager';

export default function AddPatientScreen({ navigation }) {
  const [form, setForm] = useState({
    name: '',
    age: '',
    sex: 'female',
    village: DEFAULT_VILLAGE,
    phone: '',
    condition_type: '',
  });
  const [saving, setSaving] = useState(false);

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    // Validation
    if (!form.name.trim()) {
      Alert.alert('Required', 'Please enter patient name / मरीज़ का नाम डालें');
      return;
    }
    if (!form.age || isNaN(Number(form.age))) {
      Alert.alert('Required', 'Please enter valid age / उम्र डालें');
      return;
    }
    if (!form.condition_type) {
      Alert.alert('Required', 'Please select condition type / स्थिति चुनें');
      return;
    }

    setSaving(true);
    try {
      const patientId = generateId();
      const createdAt = nowISO();

      const patient = {
        id: patientId,
        name: form.name.trim(),
        age: parseInt(form.age, 10),
        sex: form.sex,
        village: form.village.trim(),
        phone: form.phone.trim(),
        asha_id: DEFAULT_ASHA_ID,
        condition_type: form.condition_type,
        created_at: createdAt,
      };

      // Save to SQLite
      await insertPatient(patient);

      // Queue for sync (priority 3 — lowest)
      await enqueue('patient', patientId, SYNC_PRIORITY.PATIENT, {
        ...patient,
        sync_status: undefined, // don't sync the sync_status field
      });

      // Trigger sync if online
      if (isOnline()) {
        processQueue();
      }

      Alert.alert(
        '✅ Patient Saved / मरीज़ जोड़ा गया',
        `${patient.name} has been registered successfully.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      console.error('Failed to save patient:', err);
      Alert.alert('Error', 'Failed to save patient. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Register Patient</Text>
      <Text style={styles.subtitle}>मरीज़ का पंजीकरण</Text>

      <View style={styles.form}>
        <FormInput
          label="Patient Name / मरीज़ का नाम *"
          value={form.name}
          onChangeText={(v) => updateField('name', v)}
          placeholder="e.g. Sunita Devi"
        />

        <FormInput
          label="Age / उम्र *"
          value={form.age}
          onChangeText={(v) => updateField('age', v)}
          placeholder="e.g. 25"
          keyboardType="numeric"
        />

        <FormSelect
          label="Sex / लिंग"
          options={SEX_OPTIONS}
          value={form.sex}
          onChange={(v) => updateField('sex', v)}
        />

        <FormInput
          label="Village / गाँव"
          value={form.village}
          onChangeText={(v) => updateField('village', v)}
          placeholder="e.g. Rampur"
        />

        <FormInput
          label="Phone / फ़ोन"
          value={form.phone}
          onChangeText={(v) => updateField('phone', v)}
          placeholder="e.g. 9876543210"
          keyboardType="phone-pad"
        />

        <FormSelect
          label="Condition Type / स्थिति *"
          options={CONDITION_TYPE_OPTIONS}
          value={form.condition_type}
          onChange={(v) => updateField('condition_type', v)}
        />

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          <Text style={styles.saveText}>
            {saving ? 'Saving...' : '💾 Save Patient / मरीज़ सेव करें'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  form: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  saveButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveText: {
    color: colors.textLight,
    fontSize: 17,
    fontWeight: '600',
  },
});
