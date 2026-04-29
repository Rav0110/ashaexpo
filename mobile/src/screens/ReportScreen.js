import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Share, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import { generateReport } from '../services/reportService';

export default function ReportScreen() {
  const [report, setReport] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadReport = useCallback(async () => {
    const r = await generateReport();
    setReport(r);
  }, []);

  useFocusEffect(useCallback(() => { loadReport(); }, [loadReport]));
  const onRefresh = async () => { setRefreshing(true); await loadReport(); setRefreshing(false); };

  const handleShare = async () => {
    if (!report) return;
    const text = `📊 Village Health Report\n\nTotal Patients: ${report.totalPatients}\nTotal Visits: ${report.totalVisits}\nANC Visits: ${report.ancVisits}\nChild Visits: ${report.childVisits}\nTB Follow-ups: ${report.tbFollowups}\nVaccinations Due: ${report.vaccinationsDue}\nVaccinations Given: ${report.vaccinationsGiven}\nHigh-Risk Alerts: ${report.highRiskAlerts}\nMedium-Risk Alerts: ${report.mediumRiskAlerts}`;
    try { await Share.share({ message: text, title: 'Village Health Report' }); } catch {}
  };

  if (!report) return <View style={s.container}><Text style={s.loading}>Loading report...</Text></View>;

  const rows = [
    { label: 'Total Patients / कुल मरीज़', value: report.totalPatients, icon: '👥' },
    { label: 'Total Visits / कुल विजिट', value: report.totalVisits, icon: '📋' },
    { label: 'ANC Visits / प्रसव पूर्व', value: report.ancVisits, icon: '🤰' },
    { label: 'Child Visits / बाल विजिट', value: report.childVisits, icon: '👶' },
    { label: 'TB Follow-ups / टीबी', value: report.tbFollowups, icon: '🫁' },
    { label: 'Vaccinations Due / टीका बाकी', value: report.vaccinationsDue, icon: '💉' },
    { label: 'Vaccinations Given / टीका दिया', value: report.vaccinationsGiven, icon: '✅' },
    { label: 'High-Risk Alerts', value: report.highRiskAlerts, icon: '🔴', color: colors.riskHigh },
    { label: 'Medium-Risk Alerts', value: report.mediumRiskAlerts, icon: '🟡', color: colors.riskMedium },
  ];

  return (
    <ScrollView style={s.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}>
      <Text style={s.title}>📊 Village Report</Text>
      <Text style={s.subtitle}>ग्राम स्वास्थ्य रिपोर्ट</Text>

      <View style={s.reportCard}>
        {rows.map((row, idx) => (
          <View key={idx} style={[s.row, idx < rows.length-1 && s.rowBorder]}>
            <Text style={s.rowIcon}>{row.icon}</Text>
            <Text style={s.rowLabel}>{row.label}</Text>
            <Text style={[s.rowValue, row.color && { color: row.color }]}>{row.value}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={s.shareBtn} onPress={handleShare}>
        <Text style={s.shareTxt}>📤 Share Report / रिपोर्ट शेयर करें</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:{flex:1,backgroundColor:colors.background},
  loading:{fontSize:16,textAlign:'center',marginTop:spacing.xl,color:colors.textSecondary},
  title:{fontSize:24,fontWeight:'700',color:colors.text,marginHorizontal:spacing.md,marginTop:spacing.lg},
  subtitle:{fontSize:16,color:colors.textSecondary,marginHorizontal:spacing.md,marginBottom:spacing.md},
  reportCard:{backgroundColor:colors.surface,margin:spacing.md,borderRadius:14,elevation:3,shadowColor:'#000',shadowOffset:{width:0,height:2},shadowOpacity:0.1,shadowRadius:4,overflow:'hidden'},
  row:{flexDirection:'row',alignItems:'center',padding:spacing.md},
  rowBorder:{borderBottomWidth:1,borderBottomColor:colors.divider},
  rowIcon:{fontSize:20,marginRight:12,width:28},
  rowLabel:{flex:1,fontSize:15,color:colors.text,fontWeight:'500'},
  rowValue:{fontSize:20,fontWeight:'700',color:colors.primary},
  shareBtn:{backgroundColor:colors.primary,marginHorizontal:spacing.md,marginVertical:spacing.lg,padding:spacing.md,borderRadius:12,alignItems:'center'},
  shareTxt:{color:colors.textLight,fontSize:17,fontWeight:'600'},
});
