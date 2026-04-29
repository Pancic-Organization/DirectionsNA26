import React, { useState } from 'react';
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../theme';

interface SearchableListProps<T> {
  data: T[];
  keyExtractor: (item: T) => string;
  renderItem: (item: T) => React.ReactElement;
  onSelect: (item: T) => void;
  searchPlaceholder?: string;
  filterFn: (item: T, query: string) => boolean;
  loading?: boolean;
  emptyMessage?: string;
}

export default function SearchableList<T>({
  data,
  keyExtractor,
  renderItem,
  onSelect,
  searchPlaceholder = 'Search...',
  filterFn,
  loading = false,
  emptyMessage = 'No results found',
}: SearchableListProps<T>) {
  const [query, setQuery] = useState('');

  const filtered = query ? data.filter((item) => filterFn(item, query)) : data;

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <MaterialCommunityIcons name="magnify" size={20} color={colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder={searchPlaceholder}
          placeholderTextColor={colors.textTertiary}
        />
        {query ? (
          <TouchableOpacity onPress={() => setQuery('')}>
            <MaterialCommunityIcons name="close-circle" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        ) : null}
      </View>
      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color={colors.primary} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={keyExtractor}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => onSelect(item)}>
              {renderItem(item)}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>{emptyMessage}</Text>
          }
          keyboardShouldPersistTaps="handled"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    fontSize: fontSize.md,
    color: colors.text,
  },
  loader: {
    marginTop: spacing.xxxl,
  },
  empty: {
    textAlign: 'center',
    color: colors.textTertiary,
    fontSize: fontSize.md,
    marginTop: spacing.xxxl,
  },
});
