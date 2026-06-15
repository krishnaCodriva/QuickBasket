import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ThemedText } from '../ThemedText';
import { Colors } from '../../constants';
import { useThemeColor } from '../../hooks';
import { spacing, radius, typography } from '../../core/constants/theme';

export type TagItem = { id: string; name: string };

type Props = {
  tags: TagItem[];
  onSelectTag: (tagId: string | null) => void;
  selectedTag: string | null;
};

const QuickFilters = ({ tags, selectedTag, onSelectTag }: Props) => {
  console.log("tsgs is : ", tags)
  const primaryColor = useThemeColor({}, 'primary');
  const bgColor = useThemeColor({ light: Colors.light.white, dark: Colors.dark.primaryBackground }, 'primaryBackground' as any);
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {(Array.isArray(tags) ? tags : []).map((tag) => {
          const isSelected = tag.id === selectedTag;
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
              onPress={() => onSelectTag(isSelected ? null : tag.id)}
            >
              <ThemedText
                style={[
                  styles.tagText,
                  { color: isSelected ? Colors.light.white : primaryColor },
                ]}
              >
                {tag.name}
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
