import React from 'react';
import { ScrollView, ScrollViewProps, RefreshControl } from 'react-native';
import { useThemeColor } from '../hooks';

interface Props extends ScrollViewProps {
  refreshing: boolean;
  onRefresh: () => void;
}

export const RefreshableScrollView: React.FC<Props> = ({ refreshing, onRefresh, children, ...props }) => {
  const primaryColor = useThemeColor({}, 'primary');

  return (
    <ScrollView
      {...props}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[primaryColor]} // Android
          tintColor={primaryColor} // iOS
        />
      }
    >
      {children}
    </ScrollView>
  );
};
