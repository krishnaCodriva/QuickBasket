import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ThemedText } from '../ThemedText';
import { Colors } from '../../constants';
import { useThemeColor } from '../../hooks';

type TagItem = { id: string; name: string; slug: string };

type Props = {
  tags: TagItem[];
  selectedTag: string | null;
  onSelectTag: (tagId: string | null) => void;
};

const QuickFilters = ({ tags, selectedTag, onSelectTag }: Props) => {

  console.log("tsgs is : ", tags)
  const primaryColor = useThemeColor({}, 'primary');
  const bgColor = useThemeColor({ light: Colors.light.white, dark: Colors.dark.primaryBackground }, 'primaryBackground' as any);
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {tags.map((tag) => {
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
    marginBottom: 24,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 50,
    borderWidth: 1,
    marginRight: 10,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default React.memo(QuickFilters);
