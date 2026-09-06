import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'home' | 'erp' | 'ai'>('home');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0e17" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Text style={styles.logoBadge}>⚡</Text>
          <Text style={styles.headerTitle}>OmniFlow Mobile</Text>
        </View>
        <Text style={styles.statusBadge}>● API Live</Text>
      </View>

      {/* Content Area */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {currentTab === 'home' && (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardTag}>ENTERPRISE STACK</Text>
              <Text style={styles.cardTitle}>Mobile App Connected</Text>
              <Text style={styles.cardDesc}>
                React Native (Expo) client connected to OmniFlow NestJS Core API.
              </Text>
            </View>

            <Text style={styles.sectionHeading}>Quick Actions</Text>
            <View style={styles.actionGrid}>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionIcon}>📦</Text>
                <Text style={styles.actionText}>Inventory</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionIcon}>🧾</Text>
                <Text style={styles.actionText}>Invoices</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionIcon}>🤖</Text>
                <Text style={styles.actionText}>AI Assistant</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionIcon}>📊</Text>
                <Text style={styles.actionText}>Analytics</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {currentTab === 'erp' && (
          <View>
            <Text style={styles.sectionHeading}>ERP Live Metrics</Text>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Today's Sales</Text>
              <Text style={styles.metricValue}>৳ 48,200</Text>
              <Text style={styles.metricPositive}>+14% vs yesterday</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Pending Orders</Text>
              <Text style={styles.metricValue}>23 Orders</Text>
              <Text style={styles.metricNeutral}>Queue processing...</Text>
            </View>
          </View>
        )}

        {currentTab === 'ai' && (
          <View style={styles.card}>
            <Text style={styles.cardTag}>GOOGLE GEMINI AI</Text>
            <Text style={styles.cardTitle}>OmniFlow AI Companion</Text>
            <Text style={styles.cardDesc}>
              Ask business intelligence questions, draft customer SMS/emails, and query slow sales items.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          onPress={() => setCurrentTab('home')}
          style={[styles.tabItem, currentTab === 'home' && styles.tabActive]}
        >
          <Text style={styles.tabIcon}>🏠</Text>
          <Text style={[styles.tabLabel, currentTab === 'home' && styles.tabLabelActive]}>Shop</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setCurrentTab('erp')}
          style={[styles.tabItem, currentTab === 'erp' && styles.tabActive]}
        >
          <Text style={styles.tabIcon}>📊</Text>
          <Text style={[styles.tabLabel, currentTab === 'erp' && styles.tabLabelActive]}>ERP</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setCurrentTab('ai')}
          style={[styles.tabItem, currentTab === 'ai' && styles.tabActive]}
        >
          <Text style={styles.tabIcon}>✨</Text>
          <Text style={[styles.tabLabel, currentTab === 'ai' && styles.tabLabelActive]}>AI</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e17',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBadge: {
    fontSize: 18,
  },
  headerTitle: {
    color: '#f9fafb',
    fontSize: 18,
    fontWeight: '700',
  },
  statusBadge: {
    color: '#34d399',
    fontSize: 12,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 90,
  },
  card: {
    backgroundColor: 'rgba(17, 24, 39, 0.8)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 20,
    marginBottom: 24,
  },
  cardTag: {
    color: '#60a5fa',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 1,
  },
  cardTitle: {
    color: '#f9fafb',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  cardDesc: {
    color: '#9ca3af',
    fontSize: 13,
    lineHeight: 19,
  },
  sectionHeading: {
    color: '#f9fafb',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flexBasis: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  actionText: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '600',
  },
  metricCard: {
    backgroundColor: 'rgba(17, 24, 39, 0.8)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 18,
    marginBottom: 14,
  },
  metricLabel: {
    color: '#9ca3af',
    fontSize: 12,
  },
  metricValue: {
    color: '#f9fafb',
    fontSize: 22,
    fontWeight: '700',
    marginVertical: 4,
  },
  metricPositive: {
    color: '#34d399',
    fontSize: 12,
    fontWeight: '600',
  },
  metricNeutral: {
    color: '#60a5fa',
    fontSize: 12,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabActive: {
    opacity: 1,
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  tabLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: '#38bdf8',
  },
});
