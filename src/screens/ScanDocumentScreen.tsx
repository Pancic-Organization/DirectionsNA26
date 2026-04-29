import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CreateStackParamList, DraftOrderLine } from '../types';
import ActionButton from '../components/ActionButton';
import CurrencyDisplay from '../components/CurrencyDisplay';
import { colors, fontSize, fontWeight, spacing, borderRadius, shadows } from '../theme';

type Nav = NativeStackNavigationProp<CreateStackParamList, 'ScanDocument'>;

export default function ScanDocumentScreen() {
  const navigation = useNavigation<Nav>();
  const [scanning, setScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);

  // Mock extracted data
  const mockExtractedData = {
    vendorName: 'Contoso Ltd.',
    vendorNumber: 'V-10000',
    invoiceNumber: 'INV-2026-0042',
    invoiceDate: '2026-04-15',
    lines: [
      {
        tempId: 'scan_1',
        itemId: '',
        itemNumber: '1000',
        description: 'Office Desk - Standing',
        quantity: 5,
        directUnitCost: 450.0,
        discountPercent: 0,
        unitOfMeasureCode: 'PCS',
        lineType: 'Item' as const,
      },
      {
        tempId: 'scan_2',
        itemId: '',
        itemNumber: '1100',
        description: 'Ergonomic Chair',
        quantity: 10,
        directUnitCost: 320.0,
        discountPercent: 5,
        unitOfMeasureCode: 'PCS',
        lineType: 'Item' as const,
      },
      {
        tempId: 'scan_3',
        itemId: '',
        itemNumber: '1200',
        description: 'Monitor Arm Mount',
        quantity: 15,
        directUnitCost: 85.0,
        discountPercent: 0,
        unitOfMeasureCode: 'PCS',
        lineType: 'Item' as const,
      },
    ] as DraftOrderLine[],
    totalAmount: 5537.5,
  };

  const handleScan = () => {
    setScanning(true);
    setScanComplete(false);
    // Simulate scanning delay
    setTimeout(() => {
      setScanning(false);
      setScanComplete(true);
    }, 3000);
  };

  const handleCreateOrder = () => {
    navigation.navigate('CreateOrder', {
      prefillData: {
        vendorId: '',
        vendorNumber: mockExtractedData.vendorNumber,
        vendorName: mockExtractedData.vendorName,
        orderDate: new Date().toISOString().split('T')[0],
        requestedReceiptDate: '',
        notes: `Created from scanned invoice ${mockExtractedData.invoiceNumber}`,
        lines: mockExtractedData.lines,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan Document</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* AI Banner */}
        <View style={styles.banner}>
          <MaterialCommunityIcons name="robot-outline" size={24} color={colors.primary} />
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>AI Document Extraction — Coming Soon</Text>
            <Text style={styles.bannerDesc}>
              Azure Document Intelligence will automatically extract vendor info, line items,
              quantities, and costs from scanned purchase invoices.
            </Text>
          </View>
        </View>

        {/* Scan Action */}
        {!scanning && !scanComplete && (
          <View style={styles.scanArea}>
            <View style={styles.scanPlaceholder}>
              <MaterialCommunityIcons
                name="file-document-scan-outline"
                size={80}
                color={colors.textTertiary}
              />
              <Text style={styles.scanLabel}>
                Tap below to simulate scanning a purchase invoice
              </Text>
            </View>
            <View style={styles.scanButtons}>
              <ActionButton
                title="Take Photo"
                onPress={handleScan}
                icon={<MaterialCommunityIcons name="camera" size={20} color={colors.white} />}
                style={{ flex: 1, marginRight: spacing.sm }}
              />
              <ActionButton
                title="Choose File"
                onPress={handleScan}
                variant="outline"
                icon={<MaterialCommunityIcons name="file-upload" size={20} color={colors.primary} />}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        )}

        {/* Scanning Animation */}
        {scanning && (
          <View style={styles.scanningArea}>
            <View style={styles.scanningDoc}>
              <MaterialCommunityIcons name="file-document-outline" size={60} color={colors.primary} />
              <View style={styles.scanLine} />
            </View>
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.lg }} />
            <Text style={styles.scanningText}>Analyzing document...</Text>
            <Text style={styles.scanningSubtext}>
              Extracting vendor, items, and amounts
            </Text>
          </View>
        )}

        {/* Scan Results */}
        {scanComplete && (
          <View style={styles.results}>
            <View style={styles.successBanner}>
              <MaterialCommunityIcons name="check-circle" size={24} color={colors.success} />
              <Text style={styles.successText}>Document analyzed successfully!</Text>
            </View>

            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>Vendor</Text>
              <Text style={styles.resultValue}>{mockExtractedData.vendorName}</Text>
            </View>

            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>Invoice Number</Text>
              <Text style={styles.resultValue}>{mockExtractedData.invoiceNumber}</Text>
            </View>

            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>Invoice Date</Text>
              <Text style={styles.resultValue}>{mockExtractedData.invoiceDate}</Text>
            </View>

            <Text style={styles.sectionTitle}>
              Extracted Line Items ({mockExtractedData.lines.length})
            </Text>
            {mockExtractedData.lines.map((line, i) => (
              <View key={i} style={styles.lineCard}>
                <View style={styles.lineRow}>
                  <Text style={styles.lineDesc}>{line.description}</Text>
                  <CurrencyDisplay
                    amount={line.quantity * line.directUnitCost * (1 - line.discountPercent / 100)}
                    size="sm"
                  />
                </View>
                <Text style={styles.lineDetail}>
                  {line.quantity} × ${line.directUnitCost.toFixed(2)}
                  {line.discountPercent > 0 ? ` (${line.discountPercent}% disc.)` : ''}
                </Text>
              </View>
            ))}

            <View style={styles.totalCard}>
              <Text style={styles.totalLabel}>Estimated Total</Text>
              <CurrencyDisplay amount={mockExtractedData.totalAmount} size="lg" color={colors.primary} />
            </View>

            <ActionButton
              title="Create Order from Scan"
              onPress={handleCreateOrder}
              icon={<MaterialCommunityIcons name="plus-circle" size={20} color={colors.white} />}
              style={{ marginTop: spacing.lg }}
            />
            <ActionButton
              title="Scan Another"
              onPress={() => {
                setScanComplete(false);
              }}
              variant="outline"
              style={{ marginTop: spacing.sm }}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  banner: {
    flexDirection: 'row',
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  bannerText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  bannerTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  bannerDesc: {
    fontSize: fontSize.sm,
    color: colors.primaryDark,
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  scanArea: {
    alignItems: 'center',
  },
  scanPlaceholder: {
    width: '100%',
    height: 250,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginBottom: spacing.lg,
  },
  scanLabel: {
    fontSize: fontSize.md,
    color: colors.textTertiary,
    marginTop: spacing.md,
    textAlign: 'center',
    paddingHorizontal: spacing.xxl,
  },
  scanButtons: {
    flexDirection: 'row',
    width: '100%',
  },
  scanningArea: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  scanningDoc: {
    width: 120,
    height: 160,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.primary,
    opacity: 0.5,
    top: '50%',
  },
  scanningText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginTop: spacing.lg,
  },
  scanningSubtext: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  results: {},
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  successText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.success,
    marginLeft: spacing.sm,
  },
  resultCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  resultLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  resultValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  lineCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  lineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lineDesc: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginRight: spacing.sm,
  },
  lineDetail: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  totalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginTop: spacing.md,
    ...shadows.md,
  },
  totalLabel: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
});
