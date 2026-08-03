import React from 'react';
import { FlatList, View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../../config/theme';

const InfiniteScrollList = ({
  data,
  renderItem,
  keyExtractor,
  onLoadMore,
  hasMore,
  loading = false,
  loadingMore = false,
  ListEmptyComponent,
  ListHeaderComponent,
  ListFooterComponent,
  refreshControl,
  numColumns,
  inverted,
  onScroll,
  scrollEventThrottle = 16,
  showsVerticalScrollIndicator = false,
  contentContainerStyle,
  style,
  ...props
}) => {
  const { theme } = useTheme();

  const handleLoadMore = () => {
    if (!loadingMore && hasMore && onLoadMore) {
      onLoadMore();
    }
  };

  const renderFooter = () => {
    if (!loadingMore) return ListFooterComponent || null;

    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#25D366" />
        <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
          Loading more...
        </Text>
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return ListEmptyComponent || null;
  };

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.3}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      ListHeaderComponent={ListHeaderComponent}
      refreshControl={refreshControl}
      numColumns={numColumns}
      inverted={inverted}
      onScroll={onScroll}
      scrollEventThrottle={scrollEventThrottle}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      contentContainerStyle={contentContainerStyle}
      style={style}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    gap: 8,
  },
  footerText: {
    fontSize: 13,
  },
});

export default InfiniteScrollList;
