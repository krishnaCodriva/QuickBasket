import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ThemedText } from '../ThemedText';
import { Colors } from '../../constants';
import { useThemeColor } from '../../hooks';
import { spacing, radius, typography } from '../../core/constants/theme';

export type TagItem = { id: string; label: string };

type Props = {
  tags: TagItem[];
  selectedTagId: string;
  onSelectTag: (id: string) => void;
};

const QuickFilters = ({ tags, selectedTagId, onSelectTag }: Props) => {
  const primaryColor = useThemeColor({}, 'primary');
  const bgColor = useThemeColor({ light: Colors.light.white, dark: Colors.dark.primaryBackground }, 'primaryBackground' as any);
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {tags.map((tag) => {
          const isSelected = tag.id === selectedTagId;
          return (
            <TouchableOpacity
              key={tag.id}
              style={[
                styles.tag,
                {
                  backgroundColor: isSelected ? primaryColor : bgColor,
                  borderColor: primaryColor,
                },
              ]}
              onPress={() => onSelectTag(tag.id)}
            >
              <ThemedText
                style={[
                  styles.tagText,
                  { color: isSelected ? Colors.light.white : primaryColor },
                ]}
              >
                {tag.label}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  tag: {
    paddingHorizontal: spacing.smd,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    marginRight: spacing.smd,
  },
  tagText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semiBold,
  },
});

export default React.memo(QuickFilters);
