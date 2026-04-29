import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import { countPending, countPendingAlerts, countFailed } from '../database/syncQueueRepository';
import { getLastSyncTime, manualSync } from '../services/syncManager';
import { isOnline } from '../services/connectivityService';
import { formatDateTime } from '../utils/dateUtils';

export default function PendingSyncScreen() {
  const [pending, setPending] = useState(0);
  const [pendingAlerts, setPendingAlerts] = useState(0);
  const [failed, setFailed] = useState(0);
  const [lastSync, setLastSync] = useState(null);
  const [online, setOnline] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const [p, pa, f, ls] = await Promise.all([
      countPending(), countPendingAlerts(), countFailed(), getLastSyncTime()
    ]);
    setPending(p); setPendingAlerts(pa); setFailed(f); setLastSync(ls);
    setOnline(isOnline());
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handleSync = async () => {
    setSyncing(true); setMessage('');
    const result = await manualSync();
    setMessage(result.message);
    await loadData();
    setSyncing(false);
  };

  const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

  return (
    <ScrollView style={st.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}>
      <Text style={st.title}>Pending Sync / सिंक स्थिति</Text>

      <View style={[st.connBanner, online ? st.onBanner : st.offBanner]}>
        <Text style={st.connText}>{online ? '🟢 Online — Ready to sync' : '🔴 No internet. Records are safely saved offline.'}</Text>
      </View>

      <View style={st.grid}>
        <View style={st.card}><Text style={st.cardNum}>{pending}</Text><Text style={st.cardLabel}>Pending{'\n'}बाकी</Text></View>
        <View style={[st.card, pendingAlerts>0 && st.alertCard]}><Text style={[st.cardNum, pendingAlerts>0 && {color:colors.riskHigh}]}>{pendingAlerts}</Text><Text style={st.cardLabel}>Alerts{'\n'}अलर्ट</Text></View>
        <View style={[st.card, failed>0 && st.failCard]}><Text style={[st.cardNum, failed>0 && {color:colors.error}]}>{failed}</Text><Text style={st.cardLabel}>Failed{'\n'}विफल</Text></View>
      </View>

      <View style={st.syncInfo}>
        <Text style={st.syncLabel}>Last Sync / अंतिम सिंक:</Text>
        <Text style={st.syncTime}>{lastSync ? formatDateTime(lastSync) : 'Never'}</Text>
      </View>

      <TouchableOpacity style={[st.syncBtn, syncing && {opacity:0.6}]} onPress={handleSync} disabled={syncing}>
        <Text style={st.syncBtnText}>{syncing ? '⏳ Syncing...' : '🔄 Sync Now / अभी सिंक करें'}</Text>
      </TouchableOpacity>

      {message ? <View style={st.msgBox}><Text style={st.msgText}>{message}</Text></View> : null}
    </ScrollView>
  );
}

const st = StyleSheet.create({
  container:{flex:1,backgroundColor:colors.background},
  title:{fontSize:24,fontWeight:'700',color:colors.text,margin:spacing.md},
  connBanner:{margin:spacing.md,padding:spacing.md,borderRadius:10},
  onBanner:{backgroundColor:'#E8F5E9'},
  offBanner:{backgroundColor:'#FFF3E0'},
  connText:{fontSize:15,fontWeight:'500',color:colors.text},
  grid:{flexDirection:'row',paddingHorizontal:spacing.md,gap:10},
  card:{flex:1,backgroundColor:colors.surface,borderRadius:12,padding:spacing.md,alignItems:'center',elevation:2,shadowColor:'#000',shadowOffset:{width:0,height:1},shadowOpacity:0.1,shadowRadius:3},
  alertCard:{borderWidth:1.5,borderColor:colors.riskHigh},
  failCard:{borderWidth:1.5,borderColor:colors.error},
  cardNum:{fontSize:32,fontWeight:'700',color:colors.primary},
  cardLabel:{fontSize:12,color:colors.textSecondary,textAlign:'center',marginTop:4},
  syncInfo:{margin:spacing.md,padding:spacing.md,backgroundColor:colors.surface,borderRadius:10},
  syncLabel:{fontSize:14,color:colors.textSecondary},
  syncTime:{fontSize:16,fontWeight:'600',color:colors.text,marginTop:4},
  syncBtn:{backgroundColor:colors.primary,marginHorizontal:spacing.md,padding:spacing.md,borderRadius:12,alignItems:'center'},
  syncBtnText:{color:colors.textLight,fontSize:17,fontWeight:'600'},
  msgBox:{margin:spacing.md,padding:spacing.md,backgroundColor:colors.info+'15',borderRadius:10},
  msgText:{fontSize:14,color:colors.info,fontWeight:'500'},
});
